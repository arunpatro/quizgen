import type { RouteLoadFuncArgs } from '@solidjs/router';

import { lazy, useContext } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import { PATHS } from './constants';
import { AuthProvider, AuthContext } from './context';

const QuizDemo = lazy(() => import('./pages/QuizDemo'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ConfirmEmail = lazy(() => import('./pages/auth/ConfirmEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));

function protectedRoute({ intent }: RouteLoadFuncArgs) {
  const { authCtx } = useContext(AuthContext);
  if (intent !== 'preload') {
    const navigate = useNavigate();
    if (authCtx.user == null) {
      navigate(PATHS.LOGIN, { replace: true });
    } else if (!authCtx.user?.emailVerified) {
      navigate(PATHS.CONFIRM_EMAIL, { replace: true });
    }
  }
}
function authRoute({ intent }: RouteLoadFuncArgs) {
  const { authCtx } = useContext(AuthContext);
  if (authCtx.user != null && intent != 'preload') {
    const navigate = useNavigate();
    if (authCtx.user.emailVerified) {
      navigate(PATHS.HOME, { replace: true });
    } else {
      navigate(PATHS.CONFIRM_EMAIL, { replace: true });
    }
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* PROTECTED ROUTES */}
        <Route path={PATHS.HOME} component={QuizDemo} load={protectedRoute} />

        {/* AUTH ROUTES */}
        <Route path={PATHS.LOGIN} component={Login} load={authRoute} />
        <Route path={PATHS.REGISTER} component={Register} load={authRoute} />
        <Route path={PATHS.CONFIRM_EMAIL} component={ConfirmEmail} load={authRoute} />

        <Route path="*404" component={NotFound} />
      </Router>
    </AuthProvider>
  );
}
