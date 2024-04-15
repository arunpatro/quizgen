import { Component, useContext } from 'solid-js';
import { AuthContext } from '@src/context';
import { API } from '@src/constants';
import styles from './Header.module.css';

const Header: Component = (_) => {
  const { setAuthCtx } = useContext(AuthContext);
  async function logoutHandler() {
    setAuthCtx({ user: null, session: null });
    await fetch(API.logoutUser, { method: 'POST' });
  }
  return (
    <header class={styles.header}>
      <button class={styles.logoutButton} onClick={logoutHandler}>
        logout
      </button>
    </header>
  );
};

export default Header;
