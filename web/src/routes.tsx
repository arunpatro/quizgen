import { lazy } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { PATHS } from './constants';

const QuizDemo = lazy(() => import('./pages/QuizDemo'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ConfirmEmail = lazy(() => import('./pages/auth/ConfirmEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Router>
      <Route path={PATHS.HOME} component={QuizDemo} />
      <Route path={PATHS.LOGIN} component={Login} />
      <Route path={PATHS.REGISTER} component={Register} />
      <Route path={PATHS.CONFIRM_EMAIL} component={ConfirmEmail} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
}
