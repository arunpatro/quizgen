from flask import Flask, request, jsonify
from dotenv import dotenv_values
import tiktoken
import fitz  # PyMuPDF
import dspy
import pydantic
import random


app = Flask(__name__)
app.config["OPENAI_API_KEY"] = dotenv_values(".env")["OPENAI_API_KEY"]
MAX_TOKENS = 3000
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
disallowed_special = set(encoding.special_tokens_set) - {"<|endoftext|>"}


def extract_text_from_pdf(pdf):
    doc = fitz.open(stream=pdf.read(), filetype="pdf")
    text = ""
    lengths = []
    for page in doc:
        text += page.get_text()
        lengths.append(len(text))
    return text, lengths


@app.route("/api/processPdf", methods=["POST"])
def process_pdf():
    if "pdf" not in request.files:
        return "No pdf file uploaded.", 400

    pdf = request.files["pdf"]
    if pdf.mimetype != "application/pdf":
        return "Not a pdf file.", 400

    full_text, text_lengths = extract_text_from_pdf(pdf)
    if len(full_text) == 0:
        return "Problem parsing pdf.", 400

    tokens = encoding.encode(full_text, disallowed_special=disallowed_special)
    n_tokens = len(tokens)
    if n_tokens > MAX_TOKENS:
        # TEMP: use deterministic sampling to utilise dspy cache and save on API costs
        # randomly sample MAX_TOKENS from mid 75% of text
        # sample_start = random.randint(n_tokens // 8, n_tokens - n_tokens // 8)
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

    def serialize(self):
        return {
            "question": self.question,
            "options": self.options,
            "correct_option": self.correct_option,
        }


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
            mcq = self.generate_mcq(
                question=q, context=document, config=dict(temperature=0.8)
            )
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


turbo = dspy.OpenAI(model="gpt-4-0125-preview", api_key=app.config["OPENAI_API_KEY"])
dspy.settings.configure(lm=turbo)
quiz_generator = QuizGen()


@app.route("/api/generateQuiz", methods=["POST"])
def generate_quiz():
    if "passage" not in request.form:
        return "No passage provided to generate quiz from.", 400

    quiz = quiz_generator(request.form["passage"])
    # need to jsonify as older versions of Flask don't support auto list serialization
    return jsonify([item.serialize() for item in quiz.items])
