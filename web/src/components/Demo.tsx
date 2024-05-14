import type { Component } from 'solid-js';
import type { QuizData } from './Quiz';

import { createEffect, createSignal } from 'solid-js';
import demos from '@src/demo-data';
import Quiz from './Quiz';
import styles from './Demo.module.css';

const [activeDemoIdx, setActiveDemoIdx] = createSignal<number>(0);
const [quizData, setQuizData] = createSignal<QuizData>(demos[0].data);

const Demo: Component = (_) => {
  createEffect(() => setQuizData(demos[activeDemoIdx()].data));
  return (
    <>
      <div class={styles.pdfPreviewHeader}>
        <button
          disabled={activeDemoIdx() < 1}
          class={styles.demoPrevNext}
          onClick={() => setActiveDemoIdx((prev) => Math.max(prev - 1, 0))}
        >
          &larr; prev
        </button>
        <h3>{demos[activeDemoIdx()].title}</h3>
        <button
          disabled={activeDemoIdx()! >= demos.length - 1}
          class={styles.demoPrevNext}
          onClick={() => setActiveDemoIdx((prev) => Math.min(prev + 1, demos.length - 1))}
        >
          next &rarr;
        </button>
      </div>
      <div class={styles.quizView}>
        {demos[activeDemoIdx()].url ? (
          <object
            class={styles.pdfObject}
            width="100%"
            type="application/pdf"
            data={demos[activeDemoIdx()].url}
          />
        ) : null}
        <Quiz items={quizData()} setQuizData={setQuizData} />
      </div>
    </>
  );
};

export default Demo;
