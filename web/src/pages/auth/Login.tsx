import type { Component } from 'solid-js';

import { useContext } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { AuthContext } from '@src/context';
import { PATHS, API } from '@src/constants';
import styles from './Auth.module.css';

const Login: Component = () => {
  const navigate = useNavigate();
  const { setAuthCtx } = useContext(AuthContext);

  async function submitHandler(ev: Event) {
    ev.preventDefault();
    const formData = new FormData(ev.target as HTMLFormElement);
    try {
      const response = await fetch(API.loginUser, {
        method: 'POST',
        body: formData,
      });
      // TODO: decide on response contract for errors
      if (!response.ok) {
        // handle login error
        response.json().then((err) => console.log(err.detail));
      } else {
        const result = await response.json();
        if (result.error && result.error == 'confirm_email') {
          navigate(PATHS.CONFIRM_EMAIL);
        } else {
          // store user in auth context
          setAuthCtx((s) => ({ ...s, user: result.user }));
          // navigate to home
          navigate(PATHS.HOME);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <form class={styles.authForm} onSubmit={submitHandler}>
      <input placeholder="E-Mail *" type="email" name="email" required />
      <input placeholder="Password *" type="password" name="password" required />
      <button class={styles.submitButton} type="submit">
        Login
      </button>
      <p>
        Don't have an account? <a href={PATHS.REGISTER}>Register</a>
      </p>
    </form>
  );
};

export default Login;
