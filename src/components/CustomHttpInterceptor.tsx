import axios from 'axios';
import { useEffect, useRef } from 'react'
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
let apiOrigin = "";
try {
  apiOrigin = new URL(API_URL).origin;
} catch {
  apiOrigin = "";
}

// Optional dev log to confirm which backend is used
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`[noap] API baseURL → ${API_URL}`);
}

// Session auth travels in the HttpOnly `noap_session` cookie, so every
// backend request must include credentials. No Authorization header is ever
// attached: there is no token in JavaScript to send (and nothing to leak to
// third parties). External calls must use a bare axios instance instead.
const api = axios.create({ baseURL: API_URL, withCredentials: true });

/**
 * Auth/recovery endpoints that manage the session lifecycle themselves.
 * An error here must never trigger the global auto-logout (would loop or
 * destroy a still-valid session while the user is recovering it).
 */
const AUTH_MANAGED_PATHS = [
  "/sign-in",
  "/sign-up",
  "/sign-out",
  "/verify-token",
  "/find-user",
  "/verify-otp",
  "/change-pass",
  "/2fa/verify",
  "/2fa/remove",
  "/passkeys/auth/start",
  "/passkeys/auth/finish",
];

const isAuthManaged = (url?: string): boolean => {
  if (!url) return false;
  // Strip origin so both relative and absolute backend URLs match.
  const path = apiOrigin && url.startsWith(apiOrigin) ? url.slice(apiOrigin.length) : url;
  return AUTH_MANAGED_PATHS.some((p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));
};

const AxiosInterceptor = ({ children }: { children: JSX.Element }) => {
    const auth = useAuth();
    // Ref avoids a stale signOut closure while keeping the effect stable.
    const signOutRef = useRef(auth?.signOut);
    signOutRef.current = auth?.signOut;

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                const errorStatus = error?.response?.status;
                const errorMessage = error?.response?.data?.message as string
                const requestUrl = (error?.config?.url ?? "") as string;

                if ((errorStatus >= 500 && errorStatus <= 599)){
                    //(500 - 599) = Server error responses.
                    // Carry the status through: callers (e.g. the push
                    // subscribe flow) need to tell "backend not configured"
                    // (503) apart from a real server fault (500).
                    return Promise.reject({ message: "Server error, please try again or later", status: errorStatus });
                }

                if(error?.code === "ERR_NETWORK") {
                    return Promise.reject({ message: "Connection to server failed, please verify your internet connection" });
                }

                // Only a 401 from the backend (outside auth-managed flows)
                // means "session invalid": anything else (403, network
                // blips) must not nuke the local session. signOut clears the
                // server-side cookie as well.
                if(
                    errorStatus === 401 &&
                    !isAuthManaged(requestUrl) &&
                    typeof errorMessage === "string" &&
                    error.code !== "ECONNABORTED" &&
                    (errorMessage.startsWith("Authentication") ||
                     errorMessage.startsWith("Access") ||
                     errorMessage.startsWith("Session"))
                ) {
                    signOutRef.current?.();
                }

                return Promise.reject(error?.response?.data);
            },
        );

        return () => (
            api.interceptors.response.eject(responseInterceptor)
        )

    }, [])

    return children;
}


export default api;
export { AxiosInterceptor }
