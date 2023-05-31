import { createContext, useMemo, useState } from 'react';

import api from '../services/api';

export const AuthCtx = createContext<any>(null);

type signInType = {
    email: string;
    password: string;
    callback: (token: string | null, err: any) => any;
}

export default function AuthContext({ children }: { children: JSX.Element }) {
    const [ loading, setLoading ] = useState(false);

    const authActions = useMemo(() => ({
        isLoggedIn: () => {
            const token = JSON.parse(window.localStorage.getItem("user_token") || "{}");

            if(Object.keys(token).length > 0) return true;
            return false;
        },
        isLoading: loading,
        signIn: async ({ email, password, callback }: signInType)  => {
            setLoading(true);
            try {
                const { data } = await api.post("/sign-in", { email, password });
                localStorage.setItem("user_token", JSON.stringify(data));
                setLoading(false);
                
                callback(data, null);
            }
            catch (err: any) {
                setLoading(false);
                callback(null, err);
            }
        }
    }), []);

    return (
        <AuthCtx.Provider value={authActions}>
            {children}
        </AuthCtx.Provider>
    );
};