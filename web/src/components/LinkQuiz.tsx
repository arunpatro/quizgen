import type { Component } from 'solid-js';

import { createSignal, Show } from 'solid-js';
import { API } from '@src/constants';
import commonStyles from './Common.module.css';
import styles from './LinkQuiz.module.css';

interface LinkData {
  text: string;
  max_tokens: number;
  total_tokens: number;
}

const [linkInvalid, setLinkInvalid] = createSignal(false);
const [linkData, setLinkData] = createSignal<LinkData | null>(null);

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
      </Show>
    </>
  );
};

async function processLinkHandler(ev: Event) {
  ev.preventDefault();
  setLinkData(null);
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

function isValidLink(link: string | null): boolean {
  if (!link) return false;

  try {
    const url = new URL(link);
    // https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    const isYoutube = !!url.href.match(ytReg);
    // https://info.arxiv.org/help/arxiv_identifier_for_services.html
    const axvReg = /\/(?:abs|pdf|ps|src|tb)\/(?:hep-th\/)?((\d+\.\d+)|\d+)/;
    const isArxiv = url.hostname == 'arxiv.org' && !!url.pathname.match(axvReg);
    return isYoutube || isArxiv;
  } catch (_) {
    return false;
  }
}

export default LinkQuiz;
