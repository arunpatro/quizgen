import type { Component } from 'solid-js';

import { useContext } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { AuthContext } from '@src/context';
import { PATHS, USER_TYPES, API } from '@src/constants';
import styles from './Auth.module.css';

export const MIN_PASSWORD_LENGTH = 8;

const Register: Component = () => {
  const navigate = useNavigate();
  const { setAuthCtx } = useContext(AuthContext);

  async function submitHandler(ev: Event) {
    ev.preventDefault();
    const formData = new FormData(ev.target as HTMLFormElement);
    try {
      const response = await fetch(API.registerUser, {
        method: 'POST',
        body: formData,
      });
      // TODO: decide on response contract for errors
      if (!response.ok) {
        // handle registration error
        response.json().then((err) => console.log(err.detail));
      } else {
        const result = await response.json();
        // store user in auth context
        setAuthCtx((s) => ({ ...s, user: result.user }));
        // navigate to email confirmation page
        navigate(PATHS.CONFIRM_EMAIL);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
          {Object.entries(USER_TYPES).map(([type, displayText]) => (
            <option value={type}>{displayText}</option>
          ))}
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

export default Register;
