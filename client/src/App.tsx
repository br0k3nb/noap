import RoutesApp from "./routes/Routes";
import React, {createContext, useState} from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const ThemeContext = createContext({});

const queryClient = new QueryClient();

export default function App () {

  const getTheme = window.localStorage.getItem('theme');
 
  const defaultValue = getTheme !== null ? getTheme : 'dark'

  const [theme, setTheme] = useState(defaultValue);

  return (
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={{theme, setTheme}}>
          <RoutesApp />
        </ThemeContext.Provider>
      </QueryClientProvider>
  )
};