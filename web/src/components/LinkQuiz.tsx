import type { Component } from 'solid-js';

import { createSignal, Show } from 'solid-js';
import { API } from '@src/constants';
import commonStyles from './Common.module.css';
import styles from './LinkQuiz.module.css';
import Quiz from './Quiz'; // Import the Quiz component
import type { QuizData } from './Quiz';

interface LinkData {
  text: string;
  max_tokens: number;
  total_tokens: number;
}

const [linkInvalid, setLinkInvalid] = createSignal(false);
const [linkData, setLinkData] = createSignal<LinkData | null>(null);
const [quizData, setQuizData] = createSignal<QuizData>([]);
const [quizProcessing, setQuizProcessing] = createSignal(false);

const LinkQuiz: Component = (_) => {
  return (
    <>
      <div class={commonStyles.warningMessage}>
        Currently only <b>youtube.com</b> and <b>arxiv.org</b> links are supported.
      </div>
      <form class={styles.linkInput} onSubmit={processLinkHandler}>
        <input
          class={linkInvalid() ? styles.invalidLink : ''}
          name="link"
          type="text"
          autocomplete="off"
          placeholder="Enter link here..."
          required
        />
        <button type="submit">Process</button>
      </form>
      <Show when={linkInvalid()}>
        <p class={styles.linkError}>
          Not a recognised YouTube or arXiv link. Please check its validity or try a different URL.
        </p>
      </Show>
      <Show when={linkData() != null}>
        <details class={styles.linkText}>
          <summary>View extracted text</summary>
          {linkData()!.text}
        </details>
        {/* Add button to generate the quiz after displaying the text */}
        <Show when={quizData().length === 0 && !quizProcessing()}>
          <button onClick={generateQuiz} class={styles.generateQuizButton}>
            Generate Quiz
          </button>
        </Show>
      </Show>
      {/* Display the quiz component when quiz data is available */}
      <Show when={quizData().length > 0}>
        <Quiz items={quizData()} setQuizData={setQuizData} />
      </Show>
    </>
  );
};

async function processLinkHandler(ev: Event) {
  ev.preventDefault();
  setLinkData(null);
  setQuizData([]); // Reset quiz data when processing a new link
  const formData = new FormData(ev.target as HTMLFormElement);
  const link = formData.get('link') as string;
  if (!isValidLink(link)) {
    setLinkInvalid(true);
    return;
  }
  setLinkInvalid(false);
  try {
    const response = await fetch(API.processLink, { method: 'POST', body: formData });
    if (!response.ok) {
      return Promise.reject(response);
    }
    const result = await response.json();
    setLinkData(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to handle quiz generation
async function generateQuiz() {
  if (!linkData()) return; // Ensure there is text data to generate the quiz
  setQuizProcessing(true);

  const formData = new FormData();
  formData.append('passage', linkData()!.text);

  try {
    const response = await fetch(API.generateQuiz, {
      method: 'POST',
      body: formData, // Using FormData instead of JSON
      // headers not needed as FormData sets Content-Type to 'multipart/form-data' automatically
    });
    if (!response.ok) {
      const errorText = await response.text(); // To read the response text which might include why the request failed
      console.error('Server responded with:', errorText);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    const quizResult = await response.json();
    setQuizData(quizResult);
  } catch (error) {
    console.error('Error:', error);
    // Optionally display this error in the UI
  } finally {
    setQuizProcessing(false);
  }
}

function isValidLink(link: string | null): boolean {
  if (!link) return false;

  try {
    const url = new URL(link);
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    const isYoutube = !!url.href.match(ytReg);
    const axvReg = /\/(?:abs|pdf|ps|src|tb)\/(?:hep-th\/)?((\d+\.\d+)|\d+)/;
    const isArxiv = url.hostname == 'arxiv.org' && !!url.pathname.match(axvReg);
    return isYoutube || isArxiv;
  } catch (_) {
    return false;
  }
}

export default LinkQuiz;
