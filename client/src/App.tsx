import RoutesApp from "./routes/Routes";
import { createContext, useState, Dispatch, SetStateAction } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css";

type Theme = {
  setTheme: Dispatch<SetStateAction<string>>;
  theme: string;
}

export const ThemeContext = createContext<Theme | null>(null);

const queryClient = new QueryClient();

export default function App() {

  const getTheme = window.localStorage.getItem('theme');

  const defaultValue = getTheme !== null ? getTheme : 'dark'

  const [theme, setTheme] = useState(defaultValue);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <RoutesApp />
      </ThemeContext.Provider>
    </QueryClientProvider>
  )
};