import { createContext, useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import useUserData from '../hooks/useUserData';

import api from '../services/api';
import { toastAlert } from '../components/Alert';

export const AuthCtx = createContext<any>(null);

type SignInType = {
    email: string;
    password: string;
    callback: (token: string | null, err: any) => any;
};

export default function AuthContext({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("@NOAP:SYSTEM") || "{}";

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(token ? true : false);
    
    const { userData: { _id }, setUserData } = useUserData();

    useEffect(() => {
        const isLoggedIn = async () => {
            setLoading(true);
            
            if(token) { 
                try {
                    const { data: ip } = await api.get('https://whats-my-ip-delta.vercel.app/');
                    const { data } = await api.post("/verify-token", { token, identifier: ip });
                    
                    const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");

                    if(!data.settings.theme || (data.settings.theme && data.settings.theme === 'dark')) {
                        document.documentElement.classList.add("dark");
                    } else if (htmlElementHasDarkClass && (data.settings.theme && data.settings.theme === 'light')) {
                        document.documentElement.classList.remove("dark");
                    }

                    setUserData({ ...data });
                    
                    setUserLoggedIn(true);
                } catch (err: any) {
                    if(err) localStorage.removeItem("@NOAP:SYSTEM");
                    
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
                const { data: ip } = await api.get('https://whats-my-ip-delta.vercel.app/');
                const { data } = await api.post("/sign-in", { email, password, identifier: ip });

                if(!data.TFAEnabled && !data?.googleAccount) {
                    localStorage.setItem("@NOAP:SYSTEM", data.token);
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
                console.log(err);
            } finally { 
                setLoading(false);
            }
        },
        signOut: async () => {
            const htmlElementHasDarkClass = document.documentElement.classList.contains("dark");
            if(htmlElementHasDarkClass) document.documentElement.classList.remove("dark");

            setUserLoggedIn(false);

            if(_id) {
                try {
                    await api.post("/sign-out", { token, userId: _id });
    
                    localStorage.removeItem("@NOAP:SYSTEM");
                    navigate("/");
                } catch (err: any) {
                    console.log(err);
                    toastAlert({ icon: "error", title: "Error logging user out!", timer: 2000 });
                }
            }
        },
        setUserLoggedIn
    };

    return (
        <AuthCtx.Provider value={authActions}>
            {children}
        </AuthCtx.Provider>
    );
};