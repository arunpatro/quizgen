import type { Component } from 'solid-js';

import { createSignal, Show, createEffect } from 'solid-js';
import { demo1 } from './demo-data';
import styles from './App.module.css';
import uploadIconUrl from '@assets/upload-icon.svg';

const [file, setFile] = createSignal<File | null>(null);
const [viewDemo, setViewDemo] = createSignal(false);

const App: Component = () => {
  let fileInput!: HTMLInputElement;
  createEffect(() => {
    if (file() !== null) {
      setViewDemo(false);
    }
  });

  return (
    <>
      <h1>Live Quiz Generator</h1>
      <p>
        This interactive tool allows you to generate quizzes from PDF documents. Support for other
        data formats (images, videos, web links) will come in the future.
      </p>
      <p>
        Try a demo quiz to see how it works, or upload a file to generate your own (no data will be
        sent to the server).
      </p>
      <div class={styles.demoOptions}>
        <button
          class={styles.tryDemo}
          onClick={() => {
            setFile(null);
            setViewDemo(true);
          }}
        >
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
              <span class={styles.fileDropText}>Drag and drop file here</span>
              <span class={styles.fileSizeLimit}>Limit 20MB per file &bull; PDF</span>
            </div>
            <button onClick={() => fileInput.click()}>Browse files</button>
          </label>
          <Show when={file() !== null}>
            <p>{file()!.name}</p>
          </Show>
        </section>
      </div>
      <Show when={viewDemo()}>
        {demo1.map((q, idx) => (
          <>
            <fieldset class={styles.mcFieldset}>
              <label class={styles.mcQuestion}>{q.question}</label>
              {q.options.map((opt) => (
                <div class={styles.mcOption}>
                  <input type="radio" id={opt.text} value={opt.text} name={idx.toString()} />
                  <label for={opt.text}>{opt.text}</label>
                </div>
              ))}
            </fieldset>
          </>
        ))}
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
    // Use DataTransferItemList interface to access the file(s)
    const item = ev.dataTransfer!.items[0];
    // If dropped item isn't a file, reject it
    if (item.kind === 'file') {
      const file = item.getAsFile();
      setFile(file);
    }
  } else {
    // Use DataTransfer interface to access the file(s)
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
