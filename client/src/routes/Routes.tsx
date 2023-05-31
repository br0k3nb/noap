import {
  Route,
  Routes,
  BrowserRouter
} from "react-router-dom";

import SignUp from "../screens/SignUp";
import LoginHelp from "../screens/LoginHelp";
import Home from "../screens/Home/index";
import Page404 from "../screens/Page404";

import AuthProvider from "../context/authCtx";
import LoginRedirect from "./components/LoginRedirect";
import ProtectedRoute from "./components/ProtectedRoute";

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRedirect />} />

          <Route
            path={`/notes/:author/page/:page`}
            element={<ProtectedRoute />}
          >
            <Route index element={<Home />} />
          </Route>

          <Route path="/help" element={<LoginHelp />} />

          <Route path="/sign-up" element={<SignUp />} />

          <Route path="/*" element={<Page404 />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}