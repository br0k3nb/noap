import RoutesApp from "./routes/Routes";
import { createContext, useState, Dispatch, SetStateAction } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { GoogleOAuthProvider } from '@react-oauth/google';

import "./App.css";

type Theme = {
  setTheme: Dispatch<SetStateAction<string>>;
  theme: string;
}

export const ThemeContext = createContext<Theme | null>(null);

const queryClient = new QueryClient();

export default function App() {
  const { VITE_VERCEL_GOOGLE_CLIENT_ID } = import.meta.env; //vite env variables

  const getTheme = window.localStorage.getItem('theme');

  const defaultValue = getTheme !== null ? getTheme : 'dark'

  const [theme, setTheme] = useState(defaultValue);

  return (
    <GoogleOAuthProvider clientId={VITE_VERCEL_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <RoutesApp />
        </ThemeContext.Provider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
};