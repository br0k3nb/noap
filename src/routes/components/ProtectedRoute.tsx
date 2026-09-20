import { Outlet, Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import GlobalLoader from "../../components/GlobalLoader";

export default function ProtectedRoute() {
  const auth = useAuth();

  // Wait for the initial session verification: redirecting before it
  // finishes bounces freshly-refreshed users to the login screen.
  if (auth.isLoading) return <GlobalLoader />;

  return <> {auth.userIsLoggedIn ? <Outlet /> : <Navigate to={`/`} />} </>
}
