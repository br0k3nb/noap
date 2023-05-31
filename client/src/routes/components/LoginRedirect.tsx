import { Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import SignIn from "../../screens/SignIn";

export default function LoginRedirect () {
    const auth = useAuth();
    const token = JSON.parse(localStorage.getItem("user_token") || "{}");

    return (
        <>
            {auth.isLoggedIn() && !auth.isLoading 
                ? ( <Navigate to={`/notes/${token._id}/page/1`} /> ) 
                : ( <SignIn /> )
            }
        </>
    );
};