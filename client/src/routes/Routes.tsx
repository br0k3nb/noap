import {BrowserRouter, Navigate, Route, Routes, Outlet, RouteProps} from "react-router-dom";
import SignInForm from "../screens/SignIn/SignInForm";
import SignUpForm from "../screens/SignUp/SignUpForm";
import Activities from "../screens/Activities/Activities";
import Page404 from "../screens/404 Page/Page404";
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
        <Route path="https://noap-typescript.vercel.app/" element={<SignInForm/>} />

        {/* <Route element={<IsSignedIn/>}> */}
          {/* <Route path="/sign-in" element={<SignInForm/>}/> */}
        {/* </Route> */}

        {/* <Route  element={<PrivateRoutes/>}> */}
          <Route path="https://noap-typescript.vercel.app/activities" element={<Activities />} />
        {/* </Route> */}

        <Route path="/sign-up" element={<SignUpForm />} />

        {/* <Route path="/*" element={<Page404 />} /> */}
      </Routes>
    </BrowserRouter>
  );
};


