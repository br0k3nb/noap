import { Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import SignIn from "../../screens/SignIn";
import GlobalLoader from "../../components/GlobalLoader";

export default function LoginRedirect() {
  const auth = useAuth();

  // Wait only for the boot-time session check. Gating on the general
  // `isLoading` flag unmounts the sign-in form on every submit (it flips
  // during sign-in attempts too), wiping typed credentials on failure.
  if (auth.isVerifying) return <GlobalLoader />;

  return <> {auth.userIsLoggedIn ? <Navigate to={`/notes/page/1`} /> : <SignIn />} </>
}
