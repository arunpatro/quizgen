import type { ParentComponent } from 'solid-js';

import { Show, createEffect, lazy, useContext } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import { PATHS } from './constants';
import { AuthProvider, AuthContext } from './context';
import Header from './components/Header';

const QuizGen = lazy(() => import('./pages/QuizGen'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ConfirmEmail = lazy(() => import('./pages/auth/ConfirmEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute: ParentComponent = (props) => {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
};

const AuthRoute: ParentComponent = (props) => {
  return <>{props.children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* PROTECTED ROUTES */}
        <Route path={PATHS.ROOT} component={ProtectedRoute}>
          <Route path={PATHS.ROOT} component={QuizGen} />
        </Route>

        {/* AUTH ROUTES */}
        <Route path={PATHS.ROOT} component={AuthRoute}>
          <Route path={PATHS.LOGIN} component={Login} />
          <Route path={PATHS.REGISTER} component={Register} />
          <Route path={PATHS.CONFIRM_EMAIL} component={ConfirmEmail} />
        </Route>

        <Route path="*404" component={NotFound} />
      </Router>
    </AuthProvider>
  );
}
