import axios from 'axios';
import { useEffect } from 'react'
import useAuth from '../hooks/useAuth';

// const api = axios.create({ baseURL: `http://localhost:3002/` });

// const api = axios.create({ baseURL: `https://noap-backend.onrender.com/` });

const api = axios.create({ baseURL: `https://noap-backend.vercel.app/` });

const AxiosInterceptor = ({ children }: { children: JSX.Element }) => {
    const auth = useAuth();

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(config => {
            const token = localStorage.getItem('@NOAP:SYSTEM') || "{}";
            if (token) config.headers.Authorization = `Bearer ${token}`;
        
            return config;
        });
        
        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                const errorStatus = error?.response?.status;
                const errorMessage = error?.response?.data?.message as string

                if ((errorStatus >= 500 && errorStatus <= 599)){
                    //(500 - 599) = Server error responses
                    return Promise.reject({ message: "Server error, please try again or later" });
                } 
        
                if(error?.code === "ERR_NETWORK") {
                    return Promise.reject({ message: "Connection to server failed, please verify your internet connection" });
                }

                if((typeof errorMessage === "string" && error.code !== "ECONNABORTED") && 
                    (errorMessage.startsWith("Authentication") ||
                    errorMessage.startsWith("Access") ||
                    errorMessage.startsWith("Session"))
                ) {
                    auth.signOut();
                }

                return Promise.reject(error?.response?.data);
            },
        );

        return () => (
            api.interceptors.request.eject(requestInterceptor),
            api.interceptors.response.eject(responseInterceptor)
        )

    }, [])

    return children;
}


export default api;
export { AxiosInterceptor }