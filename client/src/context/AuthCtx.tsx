import { createContext, useState, useEffect } from 'react';
import useUserData from '../hooks/useUserData';

import api from '../services/api';

export const AuthCtx = createContext<any>(null);

type SignInType = {
    email: string;
    password: string;
    callback: (token: string | null, err: any) => any;
};

export default function AuthContext({ children }: { children: JSX.Element }) {
    const token = JSON.parse(localStorage.getItem("@NOAP:SYSTEM") || "{}");
    
    const [loading, setLoading] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(token?.token ? true : false);
    
    const { setUserData } = useUserData();
    
    useEffect(() => {
        const isLoggedIn = async () => {
            setLoading(true);

            if(Object.keys(token).length > 0) {
                try {
                    const { data } = await api.post("/verify-token", { token: token?.token });
                    
                    const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");

                    if(!data.settings.theme || (data.settings.theme && data.settings.theme === 'dark')) document.documentElement.classList.add("dark");
                    else if (htmlElementHasDarkClass && (data.settings.theme && data.settings.theme === 'light')) {
                        document.documentElement.classList.remove("dark");
                    }

                    setUserData({ ...data });
                    
                    setUserLoggedIn(true);
                } catch (err: any) {
                    if(!err?.code || err?.code > 1) localStorage.removeItem("@NOAP:SYSTEM");
    
                    setUserLoggedIn(false);
                } finally {
                    setLoading(false);
                }
            }
        };
        isLoggedIn();
    }, []);

    const authActions = {
        userIsLoggedIn: userLoggedIn,
        isLoading: loading,
        signIn: async ({ email, password, callback }: SignInType)  => {
            setLoading(true);

            try {
                const { data } = await api.post("/sign-in", { email, password });
                if(!data.TFAEnabled && !data?.googleAccount) {
                    localStorage.setItem("@NOAP:SYSTEM", JSON.stringify({ token: data.token }));
                    setUserLoggedIn(true);
                }
                
                if(!data.settings.theme || (data.settings.theme && data.settings.theme === 'dark')) {
                    document.documentElement.classList.add("dark");
                }
                setUserData(data);
                setLoading(false);
                
                callback(data, null);

            } catch (err: any) { 
                callback(null, err);
            } finally { 
                setLoading(false);
            }
        },
        signOut: () => {
            const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");
            if(htmlElementHasDarkClass) document.documentElement.classList.remove("dark");
            
            localStorage.removeItem("@NOAP:SYSTEM");
            setUserLoggedIn(false);
        },
        setUserLoggedIn
    };

    return (
        <AuthCtx.Provider value={authActions}>
            {children}
        </AuthCtx.Provider>
    );
};