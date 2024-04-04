from typing import Annotated, Union
from fastapi import FastAPI, UploadFile, HTTPException, Form, Response, Cookie
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from dotenv import dotenv_values
import tiktoken
import fitz  # PyMuPDF
import dspy
import pydantic
import random


app = FastAPI()
OPENAI_API_KEY = dotenv_values(".env")["OPENAI_API_KEY"]
SUPABASE_API_URL = dotenv_values(".env")["SUPABASE_API_URL"]
SUPABASE_API_KEY = dotenv_values(".env")["SUPABASE_API_KEY"]
supabase: Client = create_client(SUPABASE_API_URL, SUPABASE_API_KEY)
MAX_TOKENS = 3000
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
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


class QuizItem(pydantic.BaseModel):
    question: str
    options: list[dict]
    correct_option: int


class Quiz(pydantic.BaseModel):
    items: list[QuizItem]


class QuizQuestions(dspy.Signature):
    """I want to create a quiz from some provided text. This will be used to test my understanding of the subject objetively. Generate 5 meaningful questions based on the provided text."""

    document = dspy.InputField()

    question_1 = dspy.OutputField(desc="often between 5 and 15 words")
    question_2 = dspy.OutputField(desc="often between 5 and 15 words")
    question_3 = dspy.OutputField(desc="often between 5 and 15 words")
    question_4 = dspy.OutputField(desc="often between 5 and 15 words")
    question_5 = dspy.OutputField(desc="often between 5 and 15 words")


class SingleMCQ(dspy.Signature):
    """Generate one correct answer and three incorrect answers for the provided question, from the given document."""

    context = dspy.InputField()
    question = dspy.InputField()
    correct = dspy.OutputField(desc="the correct answer, often between 1 and 10 words")
    incorrect_1 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_2 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_3 = dspy.OutputField(desc="often between 1 and 10 words")


class QuizGen(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate_questions = dspy.Predict(QuizQuestions)
        self.generate_mcq = dspy.Predict(SingleMCQ)

    def forward(self, document) -> Quiz:
        questions = self.generate_questions(document=document)
        print(questions)
        quiz_items = []
        for _, q in questions.items():
            mcq = self.generate_mcq(question=q, context=document)
            options = [
                mcq["correct"],
                mcq["incorrect_1"],
                mcq["incorrect_2"],
                mcq["incorrect_3"],
            ]
            # add ids and shuffle to avoid bias
            ids = list(range(1, len(options) + 1))
            random.shuffle(ids)
            options = [
                {"id": opt_id, "text": opt} for (opt_id, opt) in zip(ids, options)
            ]
            random.shuffle(options)
            quiz_items.append(
                QuizItem(question=q, options=options, correct_option=ids[0])
            )
        return Quiz(items=quiz_items)


turbo = dspy.OpenAI(model="gpt-4", api_key=OPENAI_API_KEY)
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


@app.post("/api/registerUser")
def register_user(
    username: Annotated[str, Form()],
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    userType: Annotated[str, Form()],
):
    # TODO: validate sign up form input
    res = supabase.auth.sign_up(
        {
            "email": email,
            "password": password,
            "options": {
                "data": {"username": username, "user_type": userType},
            },
        }
    )
    # TODO: handle errors / empty user data
    response = {
        "user": {
            "id": res.user.id,
            "email": res.user.email,
            "username": res.user.user_metadata.get("username"),
            "userType": res.user.user_metadata.get("user_type"),
            "emailVerified": res.user.email_confirmed_at != None,
            "createdAt": res.user.created_at,
        }
    }
    return response


@app.post("/api/loginUser")
def login_user(
    email: Annotated[str, Form()], password: Annotated[str, Form()], response: Response
):
    try:
        res = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        response.set_cookie(
            key="access_token",
            value=res.session.access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            expires=res.session.expires_at,
        )
        jsonResp = {
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "username": res.user.user_metadata.get("username"),
                "userType": res.user.user_metadata.get("user_type"),
                "emailVerified": res.user.email_confirmed_at != None,
                "createdAt": res.user.created_at,
            },
            "session": {
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "expires_at": res.session.expires_at,
            },
        }
        return jsonResp

    # FIXME: need more robust error handling
    except AuthApiError as e:
        if e.message == "Email not confirmed":
            return {"error": "confirm_email"}
        else:
            raise HTTPException(status_code=400, detail=e.message)


@app.get("/api/fetchUser")
def fetch_user(access_token: Annotated[Union[str, None], Cookie()]):
    try:
        res = supabase.auth.get_user(access_token)
        response = {
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "username": res.user.user_metadata.get("username"),
                "userType": res.user.user_metadata.get("user_type"),
                "emailVerified": res.user.email_confirmed_at != None,
                "createdAt": res.user.created_at,
            }
        }
        return response

    # FIXME: need more robust error handling
    except AuthApiError as e:
        if "token is expired" in e.message:
            return {"user": None}
        else:
            raise HTTPException(status_code=400, detail=e.message)
