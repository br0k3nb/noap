import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { useGoogleLogin } from "@react-oauth/google";

import { toastAlert } from '../../../../../../../components/Alert/Alert';
import SvgLoader from '../../../../../../../components/SvgLoader';

import api from '../../../../../../../services/api';

export default function LinkGoogleAccount() {
    const [ showSvgLoader, setshowSvgLoader ] = useState(false);
    const [ redirect, setRedirect ] = useState(false);

    const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { token, _id } = parsedUserToken;

    const navigate = useNavigate();

    const linkGAcc = useGoogleLogin({
        onSuccess: (codeResponse) => fetchGoogleAccountData(codeResponse),
        onError: (error) => toastAlert({ icon: "error", title: `Login failed, ${error}}`, timer: 2500 })
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

            const createUser = await api.patch(`/convert/account/google/${token}`, { email, name, id, _id });
            toastAlert({icon: 'success', title: `${createUser.data.message}`, timer: 3000});
            
            setshowSvgLoader(false);
            setRedirect(true);

            setTimeout(() => {
                navigate('/');
                window.localStorage.removeItem("user_token");
            }, 2000);
        }
        } catch (err: any) {
            setshowSvgLoader(false);
            toastAlert({ icon: "error", title: `${err?.response.data.message}`, timer: 3000 });
        }
    };

    return (
        <div className="px-6">
            <p className="text-xl tracking-tight mb-3"> Sign in with google </p>
            <p className="text-base tracking-tight mb-6"> After siging in with google, you wont be able to use your email to login again! </p>
            <button
                type="button"
                onClick={() => linkGAcc()}
                className="text-gray-900 mb-5 bg-gray-200 trasition-all duration-200 ease-in-out uppercase rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full py-2 hover:bg-gray-300"
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