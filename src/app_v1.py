import streamlit as st
import fitz  # PyMuPDF
import pydantic
import dspy
import random
import json


turbo = dspy.OpenAI(model='gpt-4')
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
    
class GenerateQuestions(dspy.Signature):
    """I want to create a quiz from the provided text, that will be used to test my understanding of the subject objetively. Generate 5 meaningful questions based on the provided text."""

    passage = dspy.InputField()
    question_1 = dspy.OutputField(desc="often between 5 and 15 words")
    question_2 = dspy.OutputField(desc="often between 5 and 15 words")
    question_3 = dspy.OutputField(desc="often between 5 and 15 words")
    question_4 = dspy.OutputField(desc="often between 5 and 15 words")
    question_5 = dspy.OutputField(desc="often between 5 and 15 words")
    
generate_questions = dspy.Predict(GenerateQuestions)

class SingleMCQ(dspy.Signature):
    """Generate the correct answer and three incorrect answers."""

    question = dspy.InputField()
    context = dspy.InputField()
    correct = dspy.OutputField(desc="the correct answer, often between 1 and 10 words")
    incorrect_1 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_2 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_3 = dspy.OutputField(desc="often between 1 and 10 words")
    
generate_mcq = dspy.Predict(SingleMCQ)
    

def generate_quiz(passage: str) -> list[QuizQuestion]:
    questions = generate_questions(passage=passage)
    quiz = []
    for _, q in questions.items():
        mcq = generate_mcq(question=q, context=passage)
        quiz.append(QuizQuestion(question=q, correct=mcq["correct"], incorrect_1=mcq["incorrect_1"], incorrect_2=mcq["incorrect_2"], incorrect_3=mcq["incorrect_3"]))
    return quiz

# Initialize or update session state for quiz
def initialize_quiz(questions=None):
    if questions is not None:
        st.session_state.questions = questions
        st.session_state.user_answers = {i: "" for i in range(len(questions))}
        # Initialize edit fields to avoid KeyError
        for i, question in enumerate(questions):
            st.session_state[f"edit_question_{i}"] = question.question
            st.session_state[f"edit_correct_{i}"] = question.correct
            st.session_state[f"edit_incorrect_1_{i}"] = question.incorrect_1
            st.session_state[f"edit_incorrect_2_{i}"] = question.incorrect_2
            st.session_state[f"edit_incorrect_3_{i}"] = question.incorrect_3
    elif 'questions' not in st.session_state:
        st.session_state.questions = []
        st.session_state.user_answers = {}
        

def render_questions():
    for i, question in enumerate(st.session_state.questions):
        if f"options_{i}" not in st.session_state:
            options = [question.correct, question.incorrect_1, question.incorrect_2, question.incorrect_3]
            random.shuffle(options)  # Shuffle options to avoid bias
            st.session_state[f"options_{i}"] = options
        st.session_state.user_answers[i] = st.radio(f"{i+1}. {question.question}", st.session_state[f"options_{i}"], key=f"question_{i}")

def render_editable_questions():
    for i, question in enumerate(st.session_state.questions):
        # Editable question text
        edited_question = st.text_input(f"Question {i+1}", value=question.question, key=f"edit_question_{i}")
        st.session_state.questions[i].question = edited_question

        # Editable answer options, including correct and incorrect answers
        for attr in ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']:
            edited_answer = st.text_input(f"{attr.replace('_', ' ').capitalize()} for question {i+1}", value=getattr(question, attr), key=f"edit_{attr}_{i}")
            setattr(st.session_state.questions[i], attr, edited_answer)

def render_quiz_or_editable():
    if st.session_state.edit_mode:
        # Render editable fields for questions and answers
        render_editable_questions()
    else:
        # Render questions as radio buttons for answering
        render_questions()

def update_questions_from_edits():
    for i, question in enumerate(st.session_state.questions):
        question.question = st.session_state[f"edit_question_{i}"]
        question.correct = st.session_state[f"edit_correct_{i}"]
        question.incorrect_1 = st.session_state[f"edit_incorrect_1_{i}"]
        question.incorrect_2 = st.session_state[f"edit_incorrect_2_{i}"]
        question.incorrect_3 = st.session_state[f"edit_incorrect_3_{i}"]


def export_quiz():
    # Serialize the quiz questions to JSON
    quiz_data = [question.dict() for question in st.session_state.questions]  # Assuming QuizQuestion has a dict() method
    quiz_json = json.dumps(quiz_data, indent=4)
    return quiz_json

def download_quiz_button():
    quiz_json = export_quiz()
    # Disable button when in edit mode
    st.download_button(label="Export Quiz as JSON",
                       data=quiz_json,
                       file_name="quiz_export.json",
                       mime="application/json",
                       disabled=st.session_state.get('edit_mode', False))

def grade_quiz():
    correct_count = 0
    for i, question in enumerate(st.session_state.questions):
        if st.session_state.user_answers[i] == question.correct:
            correct_count += 1
    st.write(f"You got {correct_count} out of {len(st.session_state.questions)} questions right.")

st.title("qa-bot")
uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
if uploaded_file is not None:
    with st.spinner("Extracting text from PDF..."):
        full_text = extract_text_from_pdf(uploaded_file)
        text = full_text[:10000]  # Limit text to manageable size for GPT

    if st.button("Generate Questions"):
        with st.spinner("Generating questions..."):
            questions = generate_quiz(text)
            if questions:
                initialize_quiz(questions)
                st.session_state.edit_mode = False  # Start in preview mode after generating
            else:
                st.warning("No questions were generated. Please try again with a different document.")

# Always show the download button, but disable it in edit mode
if 'questions' in st.session_state and st.session_state.questions:
    download_quiz_button()  # Moved outside the condition to always show

# Toggle between edit and preview mode only if questions exist
if 'questions' in st.session_state and st.session_state.questions:
    if 'edit_mode' not in st.session_state:
        st.session_state.edit_mode = False

    button_label = "Edit" if not st.session_state.edit_mode else "Preview"
    if st.button(button_label):
        if st.session_state.edit_mode:  # If currently in edit mode, update questions before switching
            update_questions_from_edits()
        st.session_state.edit_mode = not st.session_state.edit_mode
    
    # Conditional rendering based on mode
    render_quiz_or_editable()
    if not st.session_state.edit_mode and st.button("Grade"):
        grade_quiz()
