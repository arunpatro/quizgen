import { createEffect, createSignal, on } from 'solid-js';
import styles from './Quiz.module.css';

export interface QuizItem {
  question: string;
  options: [{ id: number; text: string }];
  correct_option: number;
}

interface QuizProps {
  items: [QuizItem];
}

const [showSolutions, setShowSolutions] = createSignal(false);

const Quiz = (props: QuizProps) => {
  createEffect(
    on(
      () => props.items,
      (_) => setShowSolutions(false)
    )
  );
  return (
    <div class={styles.quiz}>
      <button class={styles.quizAnswersButton} onClick={() => setShowSolutions(!showSolutions())}>
        {showSolutions() ? 'hide answers' : 'show answers'}
      </button>
      {props.items.map((q, idx) => (
        <fieldset class={styles.mcFieldset}>
          <label class={styles.mcQuestion}>{q.question}</label>
          {q.options.map((opt) => (
            <div
              class={`${styles.mcOption} ${
                opt.id == q.correct_option && showSolutions() ? styles.mcAnswer : ''
              }`}
            >
              <input type="radio" id={`q${idx}_${opt.id}`} value={opt.text} name={idx.toString()} />
              <label for={`q${idx}_${opt.id}`}>{opt.text}</label>
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  );
};

export default Quiz;
