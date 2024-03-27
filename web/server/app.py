from typing import Annotated
from fastapi import FastAPI, UploadFile, HTTPException, Form
from dotenv import dotenv_values
import tiktoken
import fitz  # PyMuPDF
import dspy
import pydantic
import random


app = FastAPI()
OPENAI_API_KEY = dotenv_values(".env")["OPENAI_API_KEY"]
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
