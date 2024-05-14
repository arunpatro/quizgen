import type { ParentComponent } from 'solid-js';

import { Show, createEffect, lazy, useContext } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import { PATHS } from './constants';
import { AuthProvider, AuthContext } from './context';
import Header from './components/Header';

const QuizGen = lazy(() => import('./pages/QuizGen'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute: ParentComponent = (props) => {
  // const { authCtx } = useContext(AuthContext);
  // const navigate = useNavigate();
  // createEffect(() => {
  //   if (authCtx.user == null) {
  //     navigate(PATHS.LOGIN, { replace: true });
  //   } else if (!authCtx.user?.emailVerified) {
  //     navigate(PATHS.CONFIRM_EMAIL, { replace: true });
  //   }
  // });

  return (
    <>
      {/* <Show when={authCtx.user != null}> */}
        <Header />
      {/* </Show> */}
      {props.children}
    </>
  );
};

const AuthRoute: ParentComponent = (props) => {
  // const { authCtx } = useContext(AuthContext);
  // const navigate = useNavigate();
  // createEffect(() => {
  //   if (authCtx.user != null) {
  //     if (authCtx.user.emailVerified) {
  //       navigate(PATHS.ROOT, { replace: true });
  //     } else {
  //       navigate(PATHS.CONFIRM_EMAIL, { replace: true });
  //     }
  //   }
  // });
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
          {/* <Route path={PATHS.LOGIN} component={Login} /> */}
          {/* <Route path={PATHS.REGISTER} component={Register} /> */}
          {/* <Route path={PATHS.CONFIRM_EMAIL} component={ConfirmEmail} /> */}
        </Route>

        <Route path="*404" component={NotFound} />
      </Router>
    </AuthProvider>
  );
}
