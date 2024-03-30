import type { Component } from 'solid-js';

import { PATHS } from '@src/constants';
import styles from './Auth.module.css';

export const MIN_PASSWORD_LENGTH = 8;

const Register: Component = () => {
  return (
    <form class={styles.authForm} onSubmit={submitHandler}>
      <input placeholder="Username *" type="text" name="username" required />
      <input placeholder="E-Mail *" type="email" name="email" required />
      <input
        placeholder="Password *"
        type="password"
        name="password"
        required
        minlength={MIN_PASSWORD_LENGTH}
      />
      <div>
        <label for="user-type">I am a: </label>
        <select id="user-type" name="userType" required>
          <option value="">- *</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="employee">Employee</option>
          <option value="academic">Academic</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button class={styles.submitButton} type="submit">
        Register
      </button>
      <p>
        Already have an account? <a href={PATHS.LOGIN}>Sign in</a>
      </p>
    </form>
  );
};

async function submitHandler(ev: Event) {
  ev.preventDefault();
  const formData = new FormData(ev.target as HTMLFormElement);
  try {
    const response = await fetch('/api/registerUser', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      // handle registration error
    }
    const result = await response.json();
    // store user in app context
  } catch (error) {
    console.error('Error:', error);
  }
}

export default Register;
