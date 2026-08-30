/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_VERCEL_GOOGLE_CLIENT_ID: string;
    /** Primary API URL override (e.g. http://0.0.0.0:3002 for local testing) */
    readonly VITE_API_URL?: string;
    /** Legacy alias for VITE_API_URL */
    readonly VITE_BACKEND_URL?: string;
}