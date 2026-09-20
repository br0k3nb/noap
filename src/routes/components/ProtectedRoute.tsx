import { Outlet, Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import GlobalLoader from "../../components/GlobalLoader";

export default function ProtectedRoute() {
  const auth = useAuth();

  // Wait only for the boot-time session check: redirecting before it
  // finishes bounces freshly-refreshed users to the login screen. Other
  // loading states (sign-in, re-verify) must not unmount the page.
  if (auth.isVerifying) return <GlobalLoader />;

  return <> {auth.userIsLoggedIn ? <Outlet /> : <Navigate to={`/`} />} </>
}
