import type { Component } from 'solid-js';

import { createSignal } from 'solid-js';
import { API } from '@src/constants';
import commonStyles from './Common.module.css';
import styles from './LinkQuiz.module.css';

const [linkInvalid, setLinkInvalid] = createSignal(false);

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
      {linkInvalid() ? (
        <p class={styles.linkError}>
          Not a recognised YouTube or arXiv link. Please check its validity or try a different URL.
        </p>
      ) : null}
    </>
  );
};

async function processLinkHandler(ev: Event) {
  ev.preventDefault();
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
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

function isValidLink(link: string | null): boolean {
  if (!link) return false;

  try {
    const url = new URL(link);
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    const isYoutube = !!url.href.match(ytReg);
    const isArxiv = url.hostname == 'arxiv.org'; // NOTE: revisit validity check
    return isYoutube || isArxiv;
  } catch (_) {
    return false;
  }
}

export default LinkQuiz;
