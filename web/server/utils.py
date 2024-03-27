import requests
import PyPDF2
from pytube import YouTube
import os
from openai import OpenAI

from percache import Cache

cache = Cache(".cache")


# this can be improved to handle smarter transcription
# like speaker isolation, time stamping, etc for referencing.
@cache
def transcribe_audio(file_path: str) -> str:
    """
    Transcribe audio file using OpenAI's Whisper model.
    """
    client = OpenAI()
    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", file=audio_file
        )

    return transcription.text


def process_url(url: str) -> str:
    """
    Download content from a URL and extract text from it.
    Supported URLs: arxiv.org, youtube.com, youtu.be
    """
    if "arxiv.org" in url:
        # Download arxiv paper
        arxiv_id = url.split("/")[-1]
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

        if not os.path.exists(f"{arxiv_id}.pdf"):
            response = requests.get(pdf_url)
            with open(f"{arxiv_id}.pdf", "wb") as f:
                f.write(response.content)

        # Extract text from PDF
        with open(f"{arxiv_id}.pdf", "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

        return text

    elif "youtube.com" in url or "youtu.be" in url:
        # Download YouTube video
        yt = YouTube(url)
        video_id = yt.video_id
        if not os.path.exists(f"{video_id}.mp3"):
            video = yt.streams.filter(only_audio=True).first()
            video.download(filename=f"{video_id}.mp3")

        # Transcribe audio using OpenAI's Whisper
        text = transcribe_audio(f"{video_id}.mp3")
        return text
    else:
        raise ValueError(
            "Unsupported URL. Only arxiv and YouTube links are currently supported."
        )
