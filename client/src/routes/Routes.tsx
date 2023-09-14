import { useState } from 'react';

import {
  Route,
  Routes,
  BrowserRouter
} from "react-router-dom";

import SignUp from "../screens/SignUp";
import LoginHelp from "../screens/LoginHelp";
import Home from "../screens/Home/index";
import Page404 from "../screens/Page404";

import AuthProvider from "../context/AuthCtx";
import LoginRedirect from "./components/LoginRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDataContext from '../context/UserDataContext';

const default_user_data_value = { 
  _id: "", 
  name: "", 
  settings: { noteTextExpanded: false }, 
  TFAEnabled: true, 
  theme: '' 
};

export default function RoutesApp() {
  const [userData, setUserData] = useState(default_user_data_value);

  return (
    <BrowserRouter>
      <UserDataContext
        userData={ userData }
        //@ts-ignore
        setUserData={ setUserData }
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginRedirect />} />

            <Route
              path="/notes/page/:page"
              element={<ProtectedRoute />}
            >
              <Route index element={<Home />} />
            </Route>

            <Route path="/help" element={<LoginHelp />} />

            <Route path="/sign-up" element={<SignUp />} />

            <Route path="/*" element={<Page404 />} />
          </Routes>
        </AuthProvider>
      </UserDataContext>
    </BrowserRouter>
  );
}