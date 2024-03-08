import streamlit as st
import fitz  # PyMuPDF
from openai import OpenAI  # Assuming you have an OpenAI library for API access
import re

# Assuming 'client' is an instance of some OpenAI API client class.
# You'd need to initialize this with your API key or through your preferred authentication method.
client = OpenAI()


def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def generate_questions(
    text, model="gpt-3.5-turbo", temperature=0.7, max_tokens=None, n=1
):
    question_pattern = re.compile(r"\d+\..*?\?")
    response = client.chat.completions.create(
        model=model,  # Update model as necessary
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": f"Generate 10 questions based on the following text: {text}",
            },
        ],
        temperature=temperature,
        max_tokens=max_tokens,
        n=n,
    )

    outputs = []
    for choice in response.choices:
        text = choice.message.content
        questions = question_pattern.findall(text)
        outputs.extend(questions)
    return outputs


st.title("qa-bot")

uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
if uploaded_file is not None:
    with st.spinner("Extracting text from PDF..."):
        text = extract_text_from_pdf(uploaded_file)
        text = text[:10000]  # Limit text to manageable size for GPT

    if st.button("Generate Questions"):
        with st.spinner("Generating questions..."):
            questions = generate_questions(text)
            if questions:
                st.subheader("Generated Questions:")
                for question in questions:
                    st.write(question)
            else:
                st.write("No questions were generated.")
