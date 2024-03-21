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
      // multi-choice option
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
        <button
          type="button"
          class={styles.quizToggle}
          onClick={() => {
            setMode(QuizMode.VIEW);
            // reset quiz data to revert any dom ordering changes
            props.setQuizData(props.items);
          }}
        >
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
            <div
              id={`q${idx}_${opt.id}`}
              class={`${styles.mcOption} ${styles.row}`}
              draggable="true"
              onMouseDown={mouseDownHandler}
              onMouseUp={mouseUpHandler}
              onDragEnd={mcoDragEndHandler}
              onDragOver={mcoDragOverHandler}
              onDragEnter={mcoDragEnterHandler}
            >
              <img src={dragIconUrl} class={styles.mcoDragIcon} draggable="false" />
              <input
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

// implements dragging functionality for reordering mc options
let draggedRow: HTMLElement | null = null;
// need to use mouse events for initiating drag to not break
// child input field drag behaviour (text selection)
function mouseDownHandler(this: HTMLElement, ev: MouseEvent) {
  const el = ev.target as HTMLElement;
  if (el.classList.contains(styles.mcoDragIcon)) {
    draggedRow = this;
    this.classList.add(styles.js_McoDragging);
  } else if (el.tagName === 'INPUT') {
    this.draggable = false;
  }
}
function mouseUpHandler(this: HTMLElement) {
  if (!this.draggable) {
    this.draggable = true;
  }
}
function mcoDragEndHandler(ev: DragEvent) {
  const row = ev.target as HTMLElement;
  draggedRow = null;
  row.classList.remove(styles.js_McoDragging);
}
function mcoDragOverHandler(ev: DragEvent) {
  ev.preventDefault();
}
function mcoDragEnterHandler(ev: DragEvent) {
  ev.preventDefault();
  const row = ev.target as HTMLElement;
  if (draggedRow && draggedRow !== row && isSameMcGroup(draggedRow.id, row.id)) {
    const rect = row.getBoundingClientRect();
    const nextSibling =
      ev.clientY - rect.top > (rect.bottom - rect.top) / 2 ? row.nextSibling : row;
    // @ts-ignore
    this.parentNode.insertBefore(draggedRow, nextSibling);
  }
}
function isSameMcGroup(draggedId: string, currentId: string) {
  const group = draggedId.split('_')[0];
  return currentId.startsWith(group + '_');
}

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
