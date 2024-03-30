import type { Component } from 'solid-js';

import { MIN_PASSWORD_LENGTH } from './Register';
import { PATHS } from '@src/constants';
import styles from './Auth.module.css';

const Login: Component = () => {
  return (
    <form class={styles.authForm} onSubmit={submitHandler}>
      <input placeholder="E-Mail *" type="email" name="email" required />
      <input
        placeholder="Password *"
        type="password"
        name="password"
        minlength={MIN_PASSWORD_LENGTH}
        required
      />
      <button class={styles.submitButton} type="submit">
        Login
      </button>
      <p>
        Don't have an account? <a href={PATHS.REGISTER}>Register</a>
      </p>
    </form>
  );
};

async function submitHandler(ev: Event) {
  ev.preventDefault();
  const formData = new FormData(ev.target as HTMLFormElement);
  try {
    const response = await fetch('/api/loginUser', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      // handle login error
    }
    const result = await response.json();
    // store user in app context
  } catch (error) {
    console.error('Error:', error);
  }
}

export default Login;
