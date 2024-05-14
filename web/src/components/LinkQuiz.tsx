import type { Component } from 'solid-js';
import type { QuizData } from './Quiz';

import { createSignal, Match, Show, Switch } from 'solid-js';
import { API } from '@src/constants';
import Quiz from './Quiz';
import Spinner from './Spinner';
import commonStyles from './Common.module.css';
import styles from './LinkQuiz.module.css';

const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
const arxReg = /https?:\/\/arxiv\.org\/(?:abs|pdf|ps|src|tb)\/(?:hep-th\/)?((\d+\.\d+)|\d+)/;

interface LinkData {
  text: string;
  max_tokens: number;
  total_tokens: number;
  link_type: 'youtube' | 'arxiv';
  embed_link: string;
}

const [linkInvalid, setLinkInvalid] = createSignal(false);
const [linkData, setLinkData] = createSignal<LinkData | null>(null);
const [linkProcessing, setLinkProcessing] = createSignal(false);
const [quizData, setQuizData] = createSignal<QuizData>([]);
const [quizProcessing, setQuizProcessing] = createSignal(false);

const LinkQuiz: Component = (_) => {
  return (
    <>
      <div class={styles.contentMargin}>
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
            readOnly={linkProcessing()}
          />
          <button type="submit" disabled={linkProcessing()}>
            {linkProcessing() ? 'Processing...' : 'Process'}
          </button>
        </form>
        <Show when={linkInvalid()}>
          <p class={styles.linkError}>
            Not a recognised YouTube or arXiv link. Please check its validity or try a different
            URL.
          </p>
        </Show>
        <Show when={linkData() != null && quizData().length == 0}>
          <Show
            when={!quizProcessing()}
            fallback={<Spinner text="Generating... this may take several seconds..." />}
          >
            <details class={styles.linkText}>
              <summary>View extracted text</summary>
              {linkData()!.text}
            </details>
            <button
              onClick={generateQuiz}
              class={commonStyles.generateQuizButton}
              disabled={quizProcessing()}
            >
              Generate quiz
            </button>
          </Show>
        </Show>
      </div>
      <Show when={linkData() != null && quizData().length > 0}>
        <div class={commonStyles.quizView}>
          <div class={styles.linkView}>
            <Switch>
              <Match when={linkData()!.link_type == 'arxiv'}>
                <object type="application/pdf" data={linkData()!.embed_link} />
              </Match>
              <Match when={linkData()!.link_type == 'youtube'}>
                <iframe id="ytplayer" height="360" src={linkData()!.embed_link}></iframe>
              </Match>
            </Switch>
            <details class={styles.linkText}>
              <summary>View extracted text</summary>
              {linkData()!.text}
            </details>
          </div>
          <Quiz items={quizData()} setQuizData={setQuizData} />
        </div>
      </Show>
    </>
  );
};

async function processLinkHandler(ev: Event) {
  ev.preventDefault();
  setLinkProcessing(true);
  setLinkData(null);
  setQuizData([]); // Reset quiz data when processing a new link
  const formData = new FormData(ev.target as HTMLFormElement);
  const link = formData.get('link') as string;
  if (!isValidLink(link)) {
    setLinkInvalid(true);
    setLinkProcessing(false);
    return;
  }
  setLinkInvalid(false);
  // Sanitizes malformed protocol format in link string
  formData.set('link', new URL(link).href);
  try {
    const response = await fetch(API.processLink, { method: 'POST', body: formData });
    if (!response.ok) {
      return Promise.reject(response);
    }
    const result = await response.json();
    setLinkData(result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLinkProcessing(false);
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
      body: formData,
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

function isValidLink(link: string): boolean {
  if (!link) return false;

  try {
    const url = new URL(link);
    const isYoutube = !!url.href.match(ytReg);
    const isArxiv = !!url.href.match(arxReg);
    return isYoutube || isArxiv;
  } catch (_) {
    return false;
  }
}

export default LinkQuiz;
