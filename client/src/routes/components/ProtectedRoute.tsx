import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute () {
    const auth = useAuth();
    
    return (
      <>
        {auth?.isLoggedIn() && !auth?.isLoading 
            ? ( <Outlet /> ) 
            : ( <Navigate to="/" /> )
        }
      </>
    );
  };