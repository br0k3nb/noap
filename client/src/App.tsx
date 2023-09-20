import RoutesApp from "./routes/Routes";
import { QueryClient, QueryClientProvider } from "react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';

import "./index.css";

const queryClient = new QueryClient();

export default function App() {
  const { VITE_VERCEL_GOOGLE_CLIENT_ID } = import.meta.env; //vite env variables

  return (
    <GoogleOAuthProvider clientId={VITE_VERCEL_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <RoutesApp />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
};