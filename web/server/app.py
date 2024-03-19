from flask import Flask, request
import tiktoken
import fitz  # PyMuPDF


app = Flask(__name__)
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
        return "No pdf file uploaded", 400

    pdf = request.files["pdf"]
    if pdf.mimetype != "application/pdf":
        return "Not a pdf file", 400

    full_text, text_lengths = extract_text_from_pdf(pdf)
    tokens = encoding.encode(full_text, disallowed_special=disallowed_special)
    n_tokens = len(tokens)
    if n_tokens > MAX_TOKENS:
        text = encoding.decode(tokens[:MAX_TOKENS])
        max_page = next(
            (i + 1 for i, length in enumerate(text_lengths) if length > len(text)),
            len(text_lengths),
        )
    else:
        text = full_text
        max_page = len(text_lengths)

    response = {
        "total_pages": len(text_lengths),
        "processed_pages": max_page,
        "text": text,
        "max_tokens": MAX_TOKENS,
        "total_tokens": n_tokens,
    }

    return response
