import { Route, Routes, BrowserRouter } from "react-router-dom";

import SignUp from "../screens/SignUp";
import LoginHelp from "../screens/LoginHelp";
import Home from "../screens/Home/index";
import Page404 from "../screens/Page404";

import useAuth from '../hooks/useAuth';

import AuthProvider from "../context/AuthCtx";
import GlobalLoader from '../components/GlobalLoader';
import LoginRedirect from "./components/LoginRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDataContext from '../context/UserDataContext';
import SelectedNoteContext from "../context/SelectedNoteCtx";
import NoteSettingsContext from "../context/NoteSettingsCtx";
import PreventUpdatePageFromUrlContext from "../context/PreventPageUpdateCtx";
import { AxiosInterceptor } from "../components/CustomHttpInterceptor";

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <UserDataContext>
        <AuthProvider>
          <CustomRoutes />
        </AuthProvider>
      </UserDataContext>
    </BrowserRouter>
  );
}

export function CustomRoutes() {
  return (
    <AxiosInterceptor>
      <Routes>
        <Route path="/" element={ <LoginRedirect /> } />
        <Route
          path="/notes/page/:page"
          element={<ProtectedRoute />}
        >
          {/* All branches share one layout element type so switching between
              page / note / search views preserves the Home subtree (state,
              queries, editor) instead of remounting the entire page. Only the
              notes query refetches, scoped to its container. */}
          <Route index element={ <NotesLayout /> } />
          <Route path='note/:noteId' element={ <NotesLayout /> } />
          <Route path='search/:search' element={ <NotesLayout /> } />
        </Route>
        <Route path="/help" element={ <LoginHelp /> } />
        <Route path="/sign-up" element={ <SignUp /> } />
        <Route path="/*" element={ <Page404 /> } />
      </Routes>
    </AxiosInterceptor>
  )
}

function NotesLayout() {
  const auth = useAuth();

  if (auth.isLoading) return <GlobalLoader />;

  return (
    <NoteSettingsContext>
      <SelectedNoteContext>
        <PreventUpdatePageFromUrlContext>
          <Home />
        </PreventUpdatePageFromUrlContext>
      </SelectedNoteContext>
    </NoteSettingsContext>
  );
}