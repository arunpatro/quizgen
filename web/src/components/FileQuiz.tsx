import type { Component } from 'solid-js';
import type { QuizData } from './Quiz';

import { Show, Switch, Match, createSignal, createEffect } from 'solid-js';
import { API } from '@src/constants';
import uploadIconUrl from '@assets/upload-icon.svg';
import xIconUrl from '@assets/x-icon.svg';
import Quiz from './Quiz';
import Spinner from './Spinner';
import commonStyles from './Common.module.css';
import styles from './FileQuiz.module.css';

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
// quiz data state
const [quizData, setQuizData] = createSignal<QuizData>([]);
const [quizProcessing, setQuizProcessing] = createSignal(false);
const [quizError, setQuizError] = createSignal(false);

const MAX_FILE_MB = 50;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;

const FileQuiz: Component = (_) => {
  createEffect(() => {
    const f = file();
    if (f !== null) {
      if (f!.size > MAX_FILE_SIZE) {
        setFileTooLarge(true);
        setFile(null);
      } else {
        setFileTooLarge(false);
      }
    }
    // reset pdf and quiz states upon file change
    setPdfData(null);
    setPdfError(false);
    setQuizData([]);
    setQuizError(false);
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

  return (
    <>
      <div class={styles.contentMargin}>
        <FileUpload />
        <Switch>
          <Match when={fileTooLarge()}>
            <div class={commonStyles.errorMessage}>
              Max file size limit exceeded. Please select a smaller file.
            </div>
          </Match>
          <Match when={pdfProcessing()}>
            <Spinner text="Extracting text from PDF..." />
          </Match>
          <Match when={pdfError()}>
            <div class={commonStyles.errorMessage}>Error parsing PDF file, please try another.</div>
          </Match>
          <Match when={pdfData() != null && quizData().length == 0}>
            <Show when={pdfData()!.total_tokens > pdfData()!.max_tokens}>
              <div class={commonStyles.warningMessage}>
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
            <Show
              when={!quizProcessing()}
              fallback={<Spinner text="Generating... this may take several seconds..." />}
            >
              <button
                class={commonStyles.generateQuizButton}
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
                Generate quiz
              </button>
            </Show>
            <Show when={quizError()}>
              <div class={commonStyles.errorMessage}>
                Sorry but the quiz cannot be generated right now. Please try again later or{' '}
                <a href="emailto:support@creia.ai">contact us</a> for support.
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
      <Show when={file() != null && quizData().length > 0}>
        <div class={commonStyles.quizView}>
          <object
            type="application/pdf"
            data={URL.createObjectURL(file()!) + `#page=${pdfData()!.processed_pages.start}`}
          />
          <Quiz items={quizData()} setQuizData={setQuizData} />
        </div>
      </Show>
    </>
  );
};

async function processPdfHandler(f: File) {
  const formData = new FormData();
  formData.append('pdf', f);

  try {
    const response = await fetch(API.processPdf, {
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
    const response = await fetch(API.generateQuiz, {
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

const FileUpload: Component = (_) => {
  let fileInput!: HTMLInputElement;
  return (
    <>
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
          <span class={styles.fileSizeLimit}>Limit {`${MAX_FILE_MB}MB`} per file &bull; PDF</span>
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
          <img class={styles.xIcon} src={xIconUrl} onClick={() => setFile(null)} />
        </div>
      </Show>
    </>
  );
};

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

export default FileQuiz;
