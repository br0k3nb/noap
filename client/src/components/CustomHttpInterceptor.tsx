import axios from 'axios';
import { ReactNode, useEffect } from 'react'
import useAuth from '../hooks/useAuth';

const api = axios.create({ baseURL: ` http://localhost:3001/` });

// const api = axios.create({ baseURL: `https://noap-api.vercel.app/` });

const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();

    useEffect(() => {

        const requestInterceptor = api.interceptors.request.use(async config => {
            const token = localStorage.getItem('@NOAP:SYSTEM') || "{}";
            if (token) config.headers.Authorization = `Bearer ${token}`;
        
            return config;
        });
        
        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                const errorStatus = error?.response?.status;
            
                if ((errorStatus >= 500 && errorStatus <= 599)){
                    //(500 - 599) = Server error responses
                    return Promise.reject({ message: "Server error, please try again or later" });
                } 
        
                if(error?.code === "ERR_NETWORK") {
                    return Promise.reject({ message: "Connection to server failed, please verify your internet connection" });
                }

                auth.signOut();

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