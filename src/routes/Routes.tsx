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
  const auth = useAuth();

  return (
    <AxiosInterceptor>
      <Routes>
        <Route path="/" element={ <LoginRedirect /> } />
        <Route
          path="/notes/page/:page"
          element={<ProtectedRoute />}
        >
          <Route index element={ auth.isLoading ? <GlobalLoader/> : <Home /> } />
          <Route 
            path='note/:noteId' 
            element={ 
              auth.isLoading ? <GlobalLoader/> : (
                <NoteSettingsContext>
                  <SelectedNoteContext>
                    <Home /> 
                  </SelectedNoteContext>
                </NoteSettingsContext>
              )
            }
          />
          <Route 
            path='search/:search' 
            element={
              auth.isLoading ? <GlobalLoader/> : (
                <NoteSettingsContext>
                  <SelectedNoteContext>
                    <Home /> 
                  </SelectedNoteContext>
                </NoteSettingsContext>
              )
            }
          />
        </Route>

        <Route path="/help" element={ <LoginHelp /> } />
        <Route path="/sign-up" element={ <SignUp /> } />
        <Route path="/*" element={ <Page404 /> } />
      </Routes>
    </AxiosInterceptor>
  )
}