from typing import Tuple
import requests
import fitz
from pytube import YouTube, extract
from pytube.exceptions import VideoUnavailable
import re
from openai import OpenAI
from urllib.parse import urlparse
from percache import Cache
from dotenv import dotenv_values
from pydub import AudioSegment


cache = Cache(".cache")
OPENAI_API_KEY = dotenv_values(".env")["OPENAI_API_KEY"]
client = OpenAI(api_key=OPENAI_API_KEY)


# this can be improved to handle smarter transcription
# like speaker isolation, time stamping, etc for referencing.
@cache
def transcribe_audio(file_path: str) -> str:
    """
    Transcribe audio file using OpenAI's Whisper model.
    """
    # truncate audio to 6-minute sample
    five_minutes = 6 * 60 * 1000  # pydub works in milliseconds
    mp4_audio = AudioSegment.from_file(file_path, format="mp4")
    truncated = mp4_audio[:five_minutes]
    truncated.export(file_path, format="mp4")

    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", file=audio_file
        )

    return transcription.text


def process_url(url: str) -> Tuple[str, str, str]:
    """
    Download content from a URL and extract text from it.
    Supported URLs: arxiv.org, youtube.com, youtu.be
    """
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    path = parsed_url.path

    if "arxiv.org" in domain:
        # https://info.arxiv.org/help/arxiv_identifier_for_services.html
        regex = re.compile(r"\/(?:abs|pdf|ps|src|tb)\/(?:hep-th\/)?((\d+\.\d+)|\d+)")
        match = regex.match(path)
        if not match:
            raise ValueError(
                "Invalid arXiv link. Please ensure the URL is a valid arXiv document."
            )
        # Extract text from PDF
        arxiv_id = match.group(1)
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        response = requests.get(pdf_url, stream=True)
        try:
            doc = fitz.open(stream=response.raw.read(), filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()

            return text, "arxiv", pdf_url
        except fitz.FileDataError:
            raise ValueError("Not a recognised arXiv document.")

    elif "youtube.com" in domain or "youtu.be" in domain:
        try:
            yt = YouTube(parsed_url.geturl())
        except VideoUnavailable:
            raise ValueError(
                "Invalid YouTube link. Please ensure the URL is a valid YouTube video."
            )
        else:
            video_id = extract.video_id(parsed_url.geturl())
            vid_fpath = f"{video_id}.mp4"
            video = yt.streams.filter(only_audio=True, file_extension="mp4").first()
            video.download(filename=vid_fpath, skip_existing=True)

        # Transcribe audio using OpenAI's Whisper
        text = transcribe_audio(vid_fpath)
        return text, "youtube", f"https://www.youtube.com/embed/{video_id}"
    else:
        raise ValueError(
            "Unsupported URL. Only arxiv and YouTube links are currently supported."
        )
