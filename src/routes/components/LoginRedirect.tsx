import { Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import SignIn from "../../screens/SignIn";

export default function LoginRedirect() {
  const auth = useAuth();

  return <> {auth.userIsLoggedIn ? <Navigate to={`/notes/page/1`} /> : <SignIn />} </>
}
