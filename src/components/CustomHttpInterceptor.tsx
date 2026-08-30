import axios from 'axios';
import { useEffect } from 'react'
import useAuth from '../hooks/useAuth';

const getApiUrl = () => {
  // Allow easy local testing via .env:
  //   VITE_API_URL=http://localhost:3002  (or http://0.0.0.0:3002 / http://127.0.0.1:3002)
  // Also supports legacy VITE_BACKEND_URL
  // Note: backend binds to 0.0.0.0:3002, but browsers should use localhost/127.0.0.1, not 0.0.0.0
  const envUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BACKEND_URL)?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  // Sensible defaults: localhost in dev (backend listens on 0.0.0.0:3002), vercel in production
  if (import.meta.env.DEV) {
    return 'http://localhost:3002';
  }
  return 'https://noap-backend.vercel.app';
};

const API_URL = getApiUrl();

// Optional dev log to confirm which backend is used
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`[noap] API baseURL → ${API_URL}`);
}

const api = axios.create({ baseURL: API_URL });

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
