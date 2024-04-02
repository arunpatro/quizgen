import type { ParentProps } from 'solid-js';
import type { SetStoreFunction } from 'solid-js/store';

import { createContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { USER_TYPES } from './constants';

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
  return (
    <AuthContext.Provider value={{ authCtx, setAuthCtx }}>{props.children}</AuthContext.Provider>
  );
};
