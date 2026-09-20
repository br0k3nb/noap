import { createContext, useState, useEffect, useCallback, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import useUserData from '../hooks/useUserData';

import api from '../services/api';
import { fetchPublicIp } from '../services/ip';
import { toastAlert } from '../components/Alert';

export const AuthCtx = createContext<any>(null);

// Pre-cookie storage key. Only read once, on boot, to migrate a leftover
// localStorage JWT into an HttpOnly cookie via /verify-token — then deleted.
const LEGACY_TOKEN_KEY = "@NOAP:SYSTEM";

type SignInType = {
    email: string;
    password: string;
    callback: (data: any, err: any) => any;
};

function readLegacyToken(): string | null {
    try {
        const raw = localStorage.getItem(LEGACY_TOKEN_KEY);
        if (!raw || raw === "{}" || raw === "null" || raw === "undefined") return null;
        return raw;
    } catch {
        return null;
    }
}

function dropLegacyToken() {
    try {
        localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
        /* storage unavailable — nothing to clean */
    }
}

const isAuthFailure = (err: any) => {
    const status = err?.response?.status;
    return status === 401 || status === 403;
};

export default function AuthContext({ children }: { children: JSX.Element }) {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    // Always verify on boot: the session lives in an HttpOnly cookie that
    // JavaScript cannot inspect, so only the backend can confirm it.
    const [loading, setLoading] = useState(true);
    // Boot-only verification flag. Route guards must wait on THIS, not on
    // `loading`: sign-in attempts also flip `loading`, and unmounting the
    // sign-in form mid-request wipes the typed email/password on failure.
    const [isVerifying, setIsVerifying] = useState(true);
    const [verifyRound, setVerifyRound] = useState(0);

    const navigate = useNavigate();

    const { setUserData } = useUserData();
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const applyTheme = (theme?: string) => {
        const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");

        if(!theme || theme === 'dark') {
            document.documentElement.classList.add("dark");
        } else if (htmlElementHasDarkClass && theme === 'light') {
            document.documentElement.classList.remove("dark");
        }
    };

    const clearSession = useCallback((navigateToLogin = false) => {
        setUserLoggedIn(false);
        setUserData({ _id: '', name: '', settings: { theme: 'dark' } } as any);
        if (navigateToLogin) navigate("/");
    }, [navigate, setUserData]);

    useEffect(() => {
        let cancelled = false;

        const isLoggedIn = async () => {
            if (!cancelled && mountedRef.current) {
                setLoading(true);
                setIsVerifying(true);
            }

            // One-time migration: a leftover pre-cookie JWT is offered in the
            // body; on success the backend sets the cookie and we delete the
            // stored token so it is never sent again.
            const legacy = readLegacyToken();

            try {
                // IP is optional metadata: a failure here must not fail auth.
                const identifier = await fetchPublicIp();
                const body = legacy ? { token: legacy, identifier } : { identifier };
                const { data } = await api.post("/verify-token", body);

                if (cancelled || !mountedRef.current) return;

                if (legacy) dropLegacyToken();
                applyTheme(data?.settings?.theme);
                setUserData({ ...data });
                setUserLoggedIn(true);
            } catch (err: any) {
                if (cancelled || !mountedRef.current) return;

                if (isAuthFailure(err)) {
                    // No usable session (and a legacy token, if any, is dead).
                    dropLegacyToken();
                    clearSession(false);
                } else {
                    // Transient failure (network, 5xx, IP service down...):
                    // the cookie is untouched, so a retry/refresh recovers
                    // instead of logging the user out.
                    setUserLoggedIn(false);
                }
            } finally {
                if (!cancelled && mountedRef.current) {
                    setLoading(false);
                    setIsVerifying(false);
                }
            }
        };
        isLoggedIn();

        return () => { cancelled = true; };
    }, [verifyRound, clearSession, setUserData]);

    const authActions = {
        userIsLoggedIn: userLoggedIn,
        isLoading: loading,
        // True only while the boot-time session verification is running.
        // Unlike `isLoading` (also flipped by sign-in attempts), waiting on
        // this never unmounts the sign-in form mid-request.
        isVerifying,
        /** Re-run session verification (e.g. after 2FA mints the session). */
        reverifySession: () => setVerifyRound((n) => n + 1),
        signIn: async ({ email, password, callback }: SignInType)  => {
            setLoading(true);

            try {
                const identifier = await fetchPublicIp();
                // The session (or the 2FA-pending proof) arrives as an
                // HttpOnly cookie — nothing is stored in JavaScript.
                const { data } = await api.post("/sign-in", { email, password, identifier });

                if(!data.TFAEnabled && !data?.googleAccount) {
                    setUserLoggedIn(true);
                }

                applyTheme(data?.settings?.theme);
                setUserData(data);
                setLoading(false);

                callback(data, null);
            } catch (err: any) {
                callback(null, err);
                console.log(err);
            } finally {
                setLoading(false);
            }
        },
        signOut: async () => {
            const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");
            if(htmlElementHasDarkClass) document.documentElement.classList.remove("dark");

            setUserLoggedIn(false);

            try {
                // Server clears the session row and expires the cookies.
                await api.post("/sign-out", {});
            } catch (err: any) {
                // Best-effort; local logout proceeds anyway.
                console.log(err);
                if (!isAuthFailure(err)) {
                    toastAlert({ icon: "error", title: "Could not reach the server, signed out locally.", timer: 2000 });
                }
            }

            clearSession(true);
        },
        setUserLoggedIn
    };

    return (
        <AuthCtx.Provider value={authActions}>
            {children}
        </AuthCtx.Provider>
    );
};
