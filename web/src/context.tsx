import type { ParentProps } from 'solid-js';
import type { SetStoreFunction } from 'solid-js/store';

import { createContext, createEffect, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { USER_TYPES, API } from './constants';

type UserType = keyof typeof USER_TYPES;
interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  userType: UserType;
  createdAt: string;
}
interface AuthStore {
  user: null | User;
  session: null;
}
export type AuthCtxSetter = SetStoreFunction<AuthStore>;
export interface AuthProvider {
  authCtx: AuthStore;
  setAuthCtx: AuthCtxSetter;
}
export const AuthContext = createContext<AuthProvider>({
  authCtx: { user: null, session: null },
  setAuthCtx: () => {},
});
export const AuthProvider = (props: ParentProps) => {
  const [authCtx, setAuthCtx] = createStore<AuthStore>({ user: null, session: null });
  onMount(async () => {
    const response = await fetch(API.fetchUser);
    const result = await response.json();
    createEffect(() => setAuthCtx('user', result.user));
  });

  return (
    <AuthContext.Provider value={{ authCtx, setAuthCtx }}>{props.children}</AuthContext.Provider>
  );
};
