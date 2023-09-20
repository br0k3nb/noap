import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { useGoogleLogin } from "@react-oauth/google";

import { toastAlert } from '../../../Alert';
import SvgLoader from '../../../SvgLoader';

import api from '../../../../services/api';

export default function LinkGoogleAccount({ _id } : { _id: string }) {
    const [showSvgLoader, setshowSvgLoader] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const navigate = useNavigate();

    const linkGAcc = useGoogleLogin({
        onSuccess: (codeResponse) => fetchGoogleAccountData(codeResponse),
        onError: (error) => toastAlert({ icon: "error", title: `Login failed, ${error}`, timer: 2500 })
    });

    const fetchGoogleAccountData = async (codeResponse: any) => {
        setshowSvgLoader(true);

        try {
            if (codeResponse) {
            const userData = await api.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
                {
                    headers: {
                    Authorization: `Bearer ${codeResponse.access_token}`,
                    Accept: "application/json",
                    },
                }
            );

            const { email, name, id } = userData.data;

            const createUser = await api.patch(`/convert/account/google`, { email, name, id, _id });
            toastAlert({ icon: 'success', title: createUser.data.message, timer: 3000 });
            
            setshowSvgLoader(false);
            setRedirect(true);

            setTimeout(() => {
                navigate('/');
                localStorage.removeItem("@NOAP:SYSTEM");
            }, 2000);
        }
        } catch (err: any) {
            setshowSvgLoader(false);
            toastAlert({ icon: "error", title: err?.message, timer: 3000 });
        }
    };

    return (
        <div className="px-6">
            <p className="text-xl tracking-tight mb-3 text-gray-900 dark:text-gray-300"> Sign in with google </p>
            <p className="text-base tracking-tight mb-6 text-gray-600"> After siging in with google, you wont be able to use your email to login again! </p>
            <button
                type="button"
                onClick={() => linkGAcc()}
                className="text-gray-900 mb-5 bg-[#dbdbdb] trasition-all duration-300 ease-in-out uppercase rounded-full text-sm w-full py-2 hover:bg-[#c0c0c0] hover:tracking-[0.05em] border border-gray-400"
            >
                {showSvgLoader ? ( <SvgLoader options={{ showLoadingText: true, LoaderClassName: "!text-black" }} /> ) : (
                    <div className="flex items-center justify-center">
                        <FcGoogle size={26} className="mr-2" />
                        <span className="">Link a google account</span>
                    </div>
                )}
            </button>
            {redirect && (
                <div className="flex items-center justify-center">
                    <div className="!mt-2 animate-pulse text-sm uppercase tracking-widest">
                        <p>Redirecting to sign in page...</p>
                    </div>
                </div>
            )}
        </div>
    )
}