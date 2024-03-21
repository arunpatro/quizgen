import type { Component } from 'solid-js';
import type { QuizItem } from './components/Quiz';

import { createSignal, Show, createEffect } from 'solid-js';
import { demo1 } from './demo-data';
import styles from './App.module.css';
import uploadIconUrl from '@assets/upload-icon.svg';
import xIconUrl from '@assets/x-icon.svg';
import Spinner from './components/Spinner';
import Quiz from './components/Quiz';

const MAX_FILE_MB = 50;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;

interface PdfData {
  total_pages: number;
  processed_pages: { start: number; end: number };
  text: string;
  max_tokens: number;
  total_tokens: number;
}

// file upload state
const [file, setFile] = createSignal<File | null>(null);
const [fileTooLarge, setFileTooLarge] = createSignal(false);
// pdf processing state
const [pdfData, setPdfData] = createSignal<PdfData | null>(null);
const [pdfProcessing, setPdfProcessing] = createSignal(false);
const [pdfError, setPdfError] = createSignal(false);
// demo state
const [viewDemo, setViewDemo] = createSignal(false);
// quiz data state
const [quizData, setQuizData] = createSignal<QuizItem[] | null>(null);
const [quizProcessing, setQuizProcessing] = createSignal(false);
const [quizError, setQuizError] = createSignal(false);

const App: Component = () => {
  let fileInput!: HTMLInputElement;
  createEffect(() => {
    const f = file();
    if (f !== null) {
      if (f!.size > MAX_FILE_SIZE) {
        setFileTooLarge(true);
        setFile(null);
      } else {
        setFileTooLarge(false);
      }
      // reset demo, pdf and quiz states upon file change
      setViewDemo(false);
      setPdfData(null);
      setPdfError(false);
      setQuizData(null);
      setQuizError(false);
    }
  });
  // process pdf (extract text) if file uploaded
  createEffect(() => {
    const f = file();
    if (f !== null && f!.size <= MAX_FILE_SIZE) {
      setPdfProcessing(true);
      processPdfHandler(f)
        .then((data) => setPdfData(data))
        .then(() => setPdfProcessing(false))
        .catch(() => {
          setPdfProcessing(false);
          setPdfError(true);
        });
    }
  });
  // reset file & pdf state if viewing demo quiz
  createEffect(() => {
    if (viewDemo()) {
      setFile(null);
      setFileTooLarge(false);
      setPdfData(null);
      setQuizData(demo1 as [QuizItem]);
    }
  });

  return (
    <>
      <h1>Live Quiz Generator</h1>
      <p>
        This interactive tool allows you to generate quizzes from PDF documents. Support for other
        data formats (images, videos, web links) will come in the future.
      </p>
      <p>Try a demo quiz to see how it works, or upload a file to generate your own.</p>
      <div class={styles.demoOptions}>
        <button class={styles.tryDemo} onClick={() => setViewDemo(true)}>
          Try demo quiz
        </button>
        <span class={styles.optionsDivider}>or</span>
        <section class={styles.fileUploadDiv}>
          <h6>Choose a PDF file</h6>
          <label
            id="file-upload-box"
            for="file-upload"
            class={styles.fileUpload}
            onDrop={dropHandler}
            onDragOver={dragOverHandler}
          >
            <input
              ref={fileInput}
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={uploadHandler}
            ></input>
            <img class={styles.fileUploadIcon} src={uploadIconUrl} width={40} />
            <div>
              <p class={styles.fileDropText}>Drag and drop file here</p>
              <span class={styles.fileSizeLimit}>
                Limit {`${MAX_FILE_MB}MB`} per file &bull; PDF
              </span>
            </div>
            <button onClick={() => fileInput.click()}>Browse files</button>
          </label>
          <Show when={file() !== null}>
            <div class={styles.fileInfo}>
              {file()!.name}{' '}
              <span class={styles.fileSizeLimit}>
                <Show
                  when={file()!.size > 1e5}
                  fallback={
                    <>
                      {(file()!.size / 1e3).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                      KB
                    </>
                  }
                >
                  {(file()!.size / 1e6).toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                  MB
                </Show>
              </span>
              <img
                class={styles.xIcon}
                src={xIconUrl}
                onClick={() => {
                  // reset all file, pdf and quiz states
                  setFile(null);
                  setPdfData(null);
                  setPdfError(false);
                  setQuizData(null);
                  setQuizError(false);
                }}
              />
            </div>
          </Show>
        </section>
      </div>
      <Show when={fileTooLarge()}>
        <div class={styles.errorMessage}>
          Max file size limit exceeded. Please select a smaller file.
        </div>
      </Show>
      <Show when={pdfError()}>
        <div class={styles.errorMessage}>Error parsing PDF file, please try another.</div>
      </Show>
      <Show when={pdfProcessing()}>
        <Spinner text="Extracting text from PDF..." />
      </Show>
      <Show when={pdfData() != null && quizData() == null}>
        <Show when={pdfData()!.total_tokens > pdfData()!.max_tokens}>
          <div class={styles.warningMessage}>
            Text is too long ({pdfData()!.total_tokens} tokens). Truncated to a{' '}
            {pdfData()!.max_tokens}-token sample.
          </div>
        </Show>
        <p class={`${styles.pdfSuccess}${quizProcessing() ? ` ${styles.disabled}` : ''}`}>
          PDF text successfully parsed. Pages considered:{' '}
          {`p.${pdfData()!.processed_pages.start}~p.${pdfData()!.processed_pages.end} out of ${
            pdfData()!.total_pages
          } total`}
          .
        </p>
        <Show when={!quizProcessing()} fallback={<Spinner text="Generating..." />}>
          <button
            class={styles.generateQuizButton}
            onClick={() => {
              setQuizProcessing(true);
              setQuizError(false);
              generateQuizHandler(pdfData()!.text)
                .then((data) => setQuizData(data))
                .then(() => setQuizProcessing(false))
                .catch(() => {
                  setQuizProcessing(false);
                  setQuizError(true);
                });
            }}
            disabled={quizProcessing()}
          >
            Generate questions
          </button>
        </Show>
        <Show when={quizError()}>
          <div class={styles.errorMessage}>
            Sorry but the quiz cannot be generated right now. Please try again later or{' '}
            <a href="emailto:quizgen@robertshin.com">contact us</a> for support.
          </div>
        </Show>
      </Show>
      <Show when={quizData() != null}>
        <Quiz items={quizData()!} />
      </Show>
    </>
  );
};

async function processPdfHandler(f: File) {
  const formData = new FormData();
  formData.append('pdf', f);

  try {
    const response = await fetch('/api/processPdf', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      return Promise.reject(response);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function generateQuizHandler(passage: string) {
  const formData = new FormData();
  formData.append('passage', passage);

  try {
    const response = await fetch('/api/generateQuiz', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      return Promise.reject(response);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

function uploadHandler(ev: Event) {
  const file = (ev.target as HTMLInputElement).files![0];
  setFile(file);
}

function dropHandler(ev: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer!.items) {
    // Use DataTransferItemList interface to access the file
    const item = ev.dataTransfer!.items[0];
    // If dropped item isn't a file, reject it
    if (item.kind === 'file') {
      const file = item.getAsFile();
      setFile(file);
    }
  } else {
    // Use DataTransfer interface to access the file
    const file = ev.dataTransfer!.files[0];
    setFile(file);
  }
}
function dragOverHandler(ev: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  ev.dataTransfer!.dropEffect = 'copy';
}

export default App;
