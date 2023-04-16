import {BrowserRouter, Navigate, Route, Routes, Outlet, RouteProps} from "react-router-dom";
import SignInForm from "../screens/SignInForm";
import SignUpForm from "../screens/SignUpForm";
import LoginHelp from "../screens/LoginHelp";
import Home from "../screens/Home/index";
import Page404 from "../screens/Page404";
// import isUserAuth from "./userAuth";

// const PrivateRoutes = () => {
//   const getUser = isUserAuth();
  
//   console.log(getUser);

//   return (
//     <Outlet/> : <Navigate to='/sign-in'/>  
//   )
// }

// const IsSignedIn = () => {
//   const getUser = isUserAuth();

//   console.log(getUser);

//   return (
//     getUser ? <Navigate to='/activities'/> : <Outlet/>  
//   )
// }

export default function RoutesApp () {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInForm/>} />

        {/* <Route element={<IsSignedIn/>}> */}
          {/* <Route path="/sign-in" element={<SignInForm/>}/> */}
        {/* </Route> */}

        <Route path="/help" element={<LoginHelp/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
};


