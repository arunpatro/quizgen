from typing import Annotated, Union
from fastapi import FastAPI, UploadFile, HTTPException, Form, Response, Cookie
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from dotenv import dotenv_values
import tiktoken
import fitz  # PyMuPDF
import dspy
from quizgen import QuizGen, QuizItem
import random
from utils import process_url


app = FastAPI()
OPENAI_API_KEY = dotenv_values(".env")["OPENAI_API_KEY"]
# SUPABASE_API_URL = dotenv_values(".env")["SUPABASE_API_URL"]
# SUPABASE_API_KEY = dotenv_values(".env")["SUPABASE_API_KEY"]
# supabase: Client = create_client(SUPABASE_API_URL, SUPABASE_API_KEY)
MAX_TOKENS = 50000
encoding = tiktoken.encoding_for_model("gpt-4o-2024-05-13")
disallowed_special = set(encoding.special_tokens_set) - {"<|endoftext|>"}

async def extract_text_from_pdf(pdf: UploadFile):
    doc = fitz.open(stream=await pdf.read(), filetype="pdf")
    text = ""
    lengths = []
    for page in doc:
        text += page.get_text()
        lengths.append(len(text))
    return text, lengths


@app.post("/api/processPdf")
async def process_pdf(pdf: UploadFile):
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Not a pdf file.")

    full_text, text_lengths = await extract_text_from_pdf(pdf)
    if len(full_text) == 0:
        raise HTTPException(status_code=400, detail="Problem parsing pdf.")

    tokens = encoding.encode(full_text, disallowed_special=disallowed_special)
    n_tokens = len(tokens)
    if n_tokens > MAX_TOKENS:
        # TEMP: fixed sampling of source to utilise dspy cache and save on API costs
        sample_start = n_tokens // 3
        text = encoding.decode(tokens[sample_start : sample_start + MAX_TOKENS])
        skip_length = full_text.find(text)
        start_page = next(
            (i + 1 for i, length in enumerate(text_lengths) if length > skip_length),
            len(text_lengths),
        )
        end_page = next(
            (
                i + 1
                for i, length in enumerate(text_lengths)
                if length > skip_length + len(text)
            ),
            len(text_lengths),
        )
    else:
        text = full_text
        start_page = 1
        end_page = len(text_lengths)

    response = {
        "total_pages": len(text_lengths),
        "processed_pages": {"start": start_page, "end": end_page},
        "text": text,
        "max_tokens": MAX_TOKENS,
        "total_tokens": n_tokens,
    }

    return response


turbo = dspy.OpenAI(model="gpt-4o-2024-05-13", api_key=OPENAI_API_KEY)
dspy.settings.configure(lm=turbo, log_openai_usage=True)
quiz_generator = QuizGen()


@app.post("/api/generateQuiz")
def generate_quiz(passage: Annotated[str, Form()]) -> list[QuizItem]:
    if not passage:
        raise HTTPException(
            status_code=400, detail="No passage provided to generate quiz from."
        )

    quiz = quiz_generator(passage)
    return quiz.items

@app.post("/api/processLink")
def process_link(link: Annotated[str, Form()]):
    try:
        full_text = process_url(link)
        if len(full_text) == 0:
            raise HTTPException(status_code=400, detail="Problem parsing link.")

        tokens = encoding.encode(full_text, disallowed_special=disallowed_special)
        n_tokens = len(tokens)
        print(f"Total tokens in resource: {n_tokens}")
        if n_tokens > MAX_TOKENS:
            # TEMP: truncate text to save on API costs
            sample_start = n_tokens // 3
            text = encoding.decode(tokens[sample_start : sample_start + MAX_TOKENS])
        else:
            text = full_text

        response = {
            "text": text,
            "max_tokens": MAX_TOKENS,
            "total_tokens": n_tokens,
        }
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))