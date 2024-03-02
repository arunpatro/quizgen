import streamlit as st
import fitz  # PyMuPDF
import pydantic
import dspy
import random

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
        mcq = generate_mcq(question=q, context=text)
        quiz.append(QuizQuestion(question=q, correct=mcq["correct"], incorrect_1=mcq["incorrect_1"], incorrect_2=mcq["incorrect_2"], incorrect_3=mcq["incorrect_3"]))
    return quiz

# Initialize or update session state for quiz
def initialize_quiz(questions=None):
    if questions is not None:
        # Shuffle answers for each question
        for question in questions:
            answers = [question.correct, question.incorrect_1, question.incorrect_2, question.incorrect_3]
            # random.shuffle(answers)
            question = QuizQuestion(question=question.question, correct=answers[0], incorrect_1=answers[1], incorrect_2=answers[2], incorrect_3=answers[3])
        
        # Store questions in session state and reset other states
        st.session_state.questions = questions
        st.session_state.user_answers = {i: "" for i in range(len(questions))}
    elif 'questions' not in st.session_state:
        # Initialize state if not yet set
        st.session_state.questions = []
        st.session_state.user_answers = {}
        

# Render questions and collect answers
def render_questions():
    for i, question in enumerate(st.session_state.questions):
        options = [question.correct, question.incorrect_1, question.incorrect_2, question.incorrect_3]
        st.session_state.user_answers[i] = st.radio(f"{i+1}. {question.question}", options, key=f"question_{i}")

def display_grade_button(questions: list[QuizQuestion]):
    if st.button("Grade"):
        # This will trigger grading without needing an on_click parameter
        # The actual grading logic is moved outside the button check
        st.session_state['grade'] = True

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
            initialize_quiz(questions)
else:
    # Initialize without questions to setup session state structure
    initialize_quiz()

if st.session_state.questions:
    st.subheader("Generated Questions:")
    render_questions()
    if st.button("Grade"):
        grade_quiz()