import streamlit as st
import fitz  # PyMuPDF
import pydantic
import dspy
import random
import json
import tiktoken
import enum

turbo = dspy.OpenAI(model="gpt-4")
dspy.settings.configure(lm=turbo)


def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


class QuizQuestion(pydantic.BaseModel):
    question: str
    correct: str
    incorrect_1: str
    incorrect_2: str
    incorrect_3: str


class QuizMode(enum.Enum):
    preview = "preview"
    edit = "edit"


class Quiz(pydantic.BaseModel):
    items: list[QuizQuestion]
    mode: QuizMode = QuizMode.preview


class GenerateQuestions(dspy.Signature):
    """I want to create a quiz from the provided text, that will be used to test my understanding of the subject objetively. Generate 5 meaningful questions based on the provided text."""

    passage = dspy.InputField()
    question_1 = dspy.OutputField(desc="often between 5 and 15 words")
    question_2 = dspy.OutputField(desc="often between 5 and 15 words")
    question_3 = dspy.OutputField(desc="often between 5 and 15 words")
    question_4 = dspy.OutputField(desc="often between 5 and 15 words")
    question_5 = dspy.OutputField(desc="often between 5 and 15 words")


class SingleMCQ(dspy.Signature):
    """Generate the correct answer and three incorrect answers."""

    question = dspy.InputField()
    context = dspy.InputField()
    correct = dspy.OutputField(desc="the correct answer, often between 1 and 10 words")
    incorrect_1 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_2 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_3 = dspy.OutputField(desc="often between 1 and 10 words")


generate_questions = dspy.Predict(GenerateQuestions)
generate_mcq = dspy.Predict(SingleMCQ)


def generate_quiz(passage: str) -> Quiz:
    questions = generate_questions(passage=passage)
    quiz_items = []
    for _, q in questions.items():
        mcq = generate_mcq(question=q, context=passage)
        quiz_items.append(
            QuizQuestion(
                question=q,
                correct=f'[C] {mcq["correct"]}',
                incorrect_1=mcq["incorrect_1"],
                incorrect_2=mcq["incorrect_2"],
                incorrect_3=mcq["incorrect_3"],
            )
        )
    return Quiz(items=quiz_items)


def render_quiz():
    if "quiz" in st.session_state:
        # this runs initially to setup or shuffle options only once
        if "options_dict" not in st.session_state:
            options_dict = {}
            for i, question in enumerate(st.session_state.quiz.items):
                options = [
                    question.correct,
                    question.incorrect_1,
                    question.incorrect_2,
                    question.incorrect_3,
                ]
                random.shuffle(options)  # Shuffle options to avoid bias
                options_dict[i] = options
            st.session_state.options_dict = options_dict

        # this runs every time the page is refreshed to render the quiz without reshuffling
        if "user_answers_dict" not in st.session_state:
            st.session_state.user_answers_dict = {}
        for i, question in enumerate(st.session_state.quiz.items):
            st.session_state.user_answers_dict[i] = st.radio(
                f"{i+1}. {question.question}",
                st.session_state.options_dict[i],
                index=None,
                key=f"question_{i}",
            )


def render_quiz_editable():
    for i, question in enumerate(st.session_state.quiz.items):
        edited_question = st.text_input(
            f"Question {i+1}", value=question.question, key=f"edit_question_{i}"
        )
        st.session_state.quiz.items[i].question = edited_question

        for attr in ["correct", "incorrect_1", "incorrect_2", "incorrect_3"]:
            edited_answer = st.text_input(
                f"{attr.replace('_', ' ').capitalize()} for question {i+1}",
                value=getattr(question, attr),
                key=f"edit_{attr}_{i}",
            )
            setattr(st.session_state.quiz.items[i], attr, edited_answer)


def render_quiz_or_editable():
    if st.session_state.quiz.mode.value == QuizMode.edit.value:
        render_quiz_editable()
    else:
        render_quiz()


def export_quiz():
    # Serialize the quiz questions to JSON
    quiz_data = [question.model_dump() for question in st.session_state.quiz.items]
    quiz_json = json.dumps(quiz_data, indent=4)
    return quiz_json


def download_quiz_button():
    st.download_button(
        label="Export Quiz as JSON",
        data=export_quiz(),
        file_name="quiz_export.json",
        mime="application/json",
        disabled=st.session_state.quiz.mode.value == QuizMode.edit.value,
    )


def preview_or_edit_button():
    current_mode = st.session_state.quiz.mode.value
    button_label = (
        "Edit Quiz" if current_mode == QuizMode.preview.value else "Preview Quiz"
    )
    _button = st.button(button_label)
    if _button:
        new_mode = (
            QuizMode.edit
            if current_mode == QuizMode.preview.value
            else QuizMode.preview
        )
        st.session_state.quiz.mode = new_mode  # Directly assign the enum value
        st.rerun()


def grade_quiz():
    grade = st.button(
        "Grade", disabled=st.session_state.quiz.mode.value == QuizMode.edit.value
    )
    if grade:
        correct_count = 0
        for i, question in enumerate(st.session_state.quiz.items):
            if st.session_state.user_answers_dict[i] == question.correct:
                correct_count += 1
        st.write(
            f"You got {correct_count} out of {len(st.session_state.quiz.items)} questions right."
        )


######## main stuff
MAX_TOKENS = 3000
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
disallowed_special = set(encoding.special_tokens_set) - {"<|endoftext|>"}


st.title("qa-bot")
uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
if uploaded_file is not None and st.session_state.get("quiz") is None:
    with st.spinner("Extracting text from PDF..."):
        full_text = extract_text_from_pdf(uploaded_file)
        tokens = encoding.encode(full_text, disallowed_special=disallowed_special)
        n_tokens = len(tokens)
        if n_tokens > MAX_TOKENS:
            st.warning(
                f"Text is too long ({n_tokens} tokens). Truncating to {MAX_TOKENS} tokens."
            )
            text = encoding.decode(tokens[:MAX_TOKENS])
        st.write(
            f"Parsed PDF. Tokens considered: {(MAX_TOKENS if n_tokens > MAX_TOKENS else n_tokens)}/{n_tokens}"
        )

    if st.button("Generate Questions"):
        with st.spinner("Generating questions..."):
            quiz = generate_quiz(text)
            if quiz:
                st.session_state.quiz = quiz
                # render_quiz()
            else:
                st.warning(
                    "No questions were generated. Please try again with a different document."
                )


if "quiz" in st.session_state:
    download_quiz_button()
    preview_or_edit_button()
    grade_quiz()
    render_quiz_or_editable()
