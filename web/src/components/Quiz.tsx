import { Show, createEffect, createSignal, on } from 'solid-js';
import styles from './Quiz.module.css';

export interface QuizItem {
  question: string;
  options: [{ id: number; text: string }];
  correct_option: number;
}

interface QuizGrade {
  correct: number[];
  numAnswered: number;
}

interface QuizProps {
  items: QuizItem[];
}

const [showSolutions, setShowSolutions] = createSignal(false);
const [quizGrade, setQuizGrade] = createSignal<QuizGrade | null>(null);

const Quiz = (props: QuizProps) => {
  let jsonExportUrl = () => {
    const jsonStr = JSON.stringify(props.items);
    const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
    return URL.createObjectURL(jsonBlob);
  };
  // reset solutions flag on quiz change
  createEffect(
    on(
      () => props.items,
      (_) => {
        setShowSolutions(false);
        setQuizGrade(null);
      }
    )
  );
  return (
    <form id="quiz" class={styles.quiz}>
      <button
        type="button"
        class={styles.quizAnswersButton}
        onClick={() => setShowSolutions(!showSolutions())}
      >
        {showSolutions() ? 'hide answers' : 'show all answers'}
      </button>
      {props.items.map((q, idx) => (
        <fieldset class={styles.mcFieldset}>
          <label class={styles.mcQuestion}>
            <Show when={quizGrade() != null} fallback={q.question}>
              {q.question}{' '}
              {quizGrade()!.correct.includes(idx) ? (
                <span class={styles.positive}>correct</span>
              ) : (
                <span class={styles.negative}>incorrect</span>
              )}
            </Show>
          </label>
          {q.options.map((opt) => (
            <div
              class={`${styles.mcOption} ${
                opt.id == q.correct_option &&
                (showSolutions() || quizGrade()?.correct.includes(idx))
                  ? styles.mcAnswer
                  : ''
              }`}
            >
              <input type="radio" id={`q${idx}_${opt.id}`} value={opt.text} name={idx.toString()} />
              <label for={`q${idx}_${opt.id}`}>{opt.text}</label>
            </div>
          ))}
        </fieldset>
      ))}
      <div class={styles.quizActions}>
        <button
          type="button"
          class={styles.quizActionButton}
          onClick={gradeQuizHandler(props.items)}
        >
          Grade solutions
        </button>
        <button type="button" class={styles.quizActionButton} onClick={resetQuizHandler}>
          Reset
        </button>
        <a
          class={styles.quizActionButton}
          href={jsonExportUrl()}
          download="quiz.json"
          target="_blank"
        >
          Export quiz to JSON
        </a>

        <a class={styles.backToTopLink} href="#quiz">
          back to top &uarr;
        </a>
      </div>
      <Show when={quizGrade() != null}>
        <p>
          You got <b>{quizGrade()!.correct.length}</b> out of <b>{props.items.length}</b> (
          <span
            class={
              quizGrade()!.correct.length / props.items.length > 0.6
                ? styles.positive
                : styles.negative
            }
          >
            {((100 * quizGrade()!.correct.length) / props.items.length).toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
            %
          </span>
          ) correct. ({props.items.length - quizGrade()!.numAnswered} unanswered)
        </p>
      </Show>
    </form>
  );
};

function resetQuizHandler(ev: Event) {
  const el = ev.target as HTMLButtonElement;
  const form = el!.closest('#quiz') as HTMLFormElement;
  form.reset();
  setQuizGrade(null);
}

function gradeQuizHandler(quizItems: QuizItem[]) {
  return function (ev: Event) {
    const el = ev.target as HTMLButtonElement;
    const form = el!.closest('#quiz') as HTMLFormElement;

    let numAnswered = 0;
    const correct = [];
    if (form) {
      const formData = new FormData(form);
      numAnswered = Array.from(formData.keys()).length;

      for (const [key, value] of formData.entries()) {
        const qIdx = parseInt(key);
        const q = quizItems[qIdx];
        const answer = q.options.find((opt) => opt.id == q.correct_option);
        if (answer?.text == value) correct.push(qIdx);
      }
    }

    setQuizGrade({ correct, numAnswered });
  };
}

export default Quiz;
