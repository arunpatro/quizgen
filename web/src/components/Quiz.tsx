import type { Setter } from 'solid-js';
import { Show, createEffect, createSignal, on } from 'solid-js';
import styles from './Quiz.module.css';
import dragIconUrl from '@assets/drag-indicator.svg';

export type QuizData = QuizItem[];
interface QuizItem {
  question: string;
  options: { id: number; text: string }[];
  correct_option: number;
}
interface QuizGrade {
  correct: number[];
  numAnswered: number;
}
interface QuizProps {
  items: QuizItem[];
  setQuizData: Setter<QuizData | null>;
}
enum QuizMode {
  VIEW,
  EDIT,
}

const [mode, setMode] = createSignal<QuizMode>(QuizMode.VIEW);

const Quiz = (props: QuizProps) => {
  return (
    <Show when={mode() == QuizMode.EDIT} fallback={<ViewQuiz {...props} />}>
      <EditQuiz {...props} />
    </Show>
  );
};

const EditQuiz = (props: QuizProps) => {
  const [solutions, setSolutions] = createSignal<number[]>([]);
  createEffect(
    on(
      () => props.items,
      () => setSolutions(props.items.map((q) => q.correct_option))
    )
  );

  function saveEditHandler(ev: Event) {
    ev.preventDefault();
    const formData = new FormData(ev.target as HTMLFormElement);
    const questions: QuizData = [];
    for (const [key, value] of formData.entries()) {
      const split = key.split('_');
      // option
      if (split.length > 1) {
        const q = questions[questions.length - 1];
        const optId = parseInt(split[1]);
        q.options.push({ id: optId, text: value as string });
      } else {
        questions.push({
          question: value as string,
          options: [],
          correct_option: solutions()[questions.length],
        });
      }
    }
    props.setQuizData(questions);
    setMode(QuizMode.VIEW);
  }

  return (
    <form id="quiz-edit" class={styles.quiz} onSubmit={saveEditHandler}>
      <div class={`${styles.quizToggles} ${styles.edit}`}>
        <button type="button" class={styles.quizToggle} onClick={() => setMode(QuizMode.VIEW)}>
          cancel
        </button>
        <button class={styles.quizToggle} type="submit">
          save
        </button>
      </div>
      {props.items.map((q, idx) => (
        <fieldset class={styles.mcFieldset}>
          <div class={styles.mcqEdit}>
            <label for={`q${idx}`}>Q{idx + 1}: </label>
            <input
              id={`q${idx}`}
              name={`q${idx}`}
              class={styles.mcqEditInput}
              type="text"
              required
              value={q.question}
            />
          </div>
          {q.options.map((opt) => (
            <div class={`${styles.mcOption} ${styles.row}`}>
              {/* <img src={dragIconUrl} class={styles.mcoDragIcon} /> */}
              <input
                id={`q${idx}_${opt.id}`}
                class={styles.mcqEditInput}
                type="text"
                required
                name={`q${idx}_${opt.id}`}
                value={opt.text}
              />
              <Show
                when={opt.id != solutions()[idx]}
                fallback={<span class={styles.mcsText}>Solution</span>}
              >
                <button
                  class={styles.mcsButton}
                  type="button"
                  onClick={() => {
                    solutions()[idx] = opt.id;
                    setSolutions([...solutions()]);
                  }}
                >
                  Mark as solution
                </button>
              </Show>
            </div>
          ))}
        </fieldset>
      ))}
    </form>
  );
};

const [showSolutions, setShowSolutions] = createSignal(false);
const [quizGrade, setQuizGrade] = createSignal<QuizGrade | null>(null);

const ViewQuiz = (props: QuizProps) => {
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
    <form id="quiz-view" class={styles.quiz}>
      <div class={styles.quizToggles}>
        <button type="button" class={styles.quizToggle} onClick={() => setMode(QuizMode.EDIT)}>
          edit quiz
        </button>
        <button
          type="button"
          class={styles.quizToggle}
          onClick={() => setShowSolutions(!showSolutions())}
        >
          {showSolutions() ? 'hide answers' : 'show all answers'}
        </button>
      </div>
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
        <button
          type="reset"
          class={styles.quizActionButton}
          onClick={() => {
            setQuizGrade(null);
            setShowSolutions(false);
          }}
        >
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

        <a class={styles.backToTopLink} href="#quiz-view">
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

function gradeQuizHandler(quizItems: QuizItem[]) {
  return function (ev: Event) {
    const el = ev.target as HTMLButtonElement;
    const form = el!.closest('#quiz-view') as HTMLFormElement;

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
