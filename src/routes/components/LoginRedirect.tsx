import { Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import SignIn from "../../screens/SignIn";
import GlobalLoader from "../../components/GlobalLoader";

export default function LoginRedirect() {
  const auth = useAuth();

  // Same reason as ProtectedRoute: don't flash the sign-in form while the
  // stored session is still being verified after a refresh.
  if (auth.isLoading) return <GlobalLoader />;

  return <> {auth.userIsLoggedIn ? <Navigate to={`/notes/page/1`} /> : <SignIn />} </>
}
