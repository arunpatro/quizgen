import type { Component } from 'solid-js';

import { createSignal, Switch, Match } from 'solid-js';
import Demo from '@src/components/Demo';
import FileQuiz from '@src/components/FileQuiz';
import LinkQuiz from '@src/components/LinkQuiz';
import styles from './QuizGen.module.css';

type SourceType = 'demo' | 'link' | 'file';

// selected tab state
const [selectedTab, setSelectedTab] = createSignal<SourceType>('demo');

const QuizGen: Component = () => {
  return (
    <>
      <h1>Live Quiz Generator</h1>
      <p>
        This interactive tool allows you to generate quizzes for YouTube videos, arXiv links, and
        PDF documents.
      </p>
      <p>
        Explore the demo to see how it works, or generate your own via the upload and link tabs.
      </p>
      <menu class={styles.tabMenu}>
        <li
          class={selectedTab() == 'demo' ? styles.selected : ''}
          onClick={() => setSelectedTab('demo')}
        >
          Demo
        </li>
        <li
          class={selectedTab() == 'file' ? styles.selected : ''}
          onClick={() => setSelectedTab('file')}
        >
          PDF upload
        </li>
        <li
          class={selectedTab() == 'link' ? styles.selected : ''}
          onClick={() => setSelectedTab('link')}
        >
          Web link
        </li>
      </menu>
      <Switch>
        <Match when={selectedTab() == 'demo'}>
          <Demo />
        </Match>
        <Match when={selectedTab() == 'file'}>
          <FileQuiz />
        </Match>
        <Match when={selectedTab() == 'link'}>
          <LinkQuiz />
        </Match>
      </Switch>
    </>
  );
};

export default QuizGen;
