import styles from './Spinner.module.css';

interface Props {
  text: string;
}
const Spinner = (props: Props) => {
  return (
    <div class={styles.loadingMessage}>
      <div class={styles.spinner}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>{' '}
      {props.text}
    </div>
  );
};

export default Spinner;
