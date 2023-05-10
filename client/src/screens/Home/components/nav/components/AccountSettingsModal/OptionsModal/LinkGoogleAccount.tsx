import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { useGoogleLogin } from "@react-oauth/google";

import { toastAlert } from '../../../../../../../components/Alert/Alert';
import api from '../../../../../../../services/api';

export default function LinkGoogleAccount() {
    const [ showSvgLoader, setshowSvgLoader ] = useState(false);
    const [ redirect, setRedirect ] = useState(false);

    const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { token, _id } = parsedUserToken;

    const navigate = useNavigate();

    const linkGAcc = useGoogleLogin({
        onSuccess: (codeResponse) => fetchGoogleAccountData(codeResponse),
        onError: (error) =>
        toastAlert({
            icon: "error",
            title: `Login failed, ${error}}`,
            timer: 2500,
        }),
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

            const createUser = await api.patch(`/convert/account/google/${token}`, { 
                    email,
                    name,
                    id, 
                    _id 
                }
            );
            
            setshowSvgLoader(false);
            setRedirect(true);

            toastAlert({icon: 'success', title: `${createUser.data.message}`, timer: 3000});

            setTimeout(() => {
                navigate('/');
                window.localStorage.removeItem("user_token");
            }, 2000);
        }
        } catch (err: any) {
            setshowSvgLoader(false);
            console.log(err);
            toastAlert({
                icon: "error",
                title: `${err?.response.data.message}`,
                timer: 3000,
            });
        }
    };

    return (
        <div className="px-6">
            <p className="text-xl tracking-tight mb-3">
                Sign in with google
            </p>
            <p className="text-base tracking-tight mb-6">
                After siging in with google, you wont be able to use your
                email to login again!
            </p>
            <button
                type="button"
                onClick={() => linkGAcc()}
                className="text-gray-900 mb-5 bg-gray-200 trasition-all duration-200 ease-in-out uppercase rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full py-2 hover:bg-gray-300"
            >
                <div className={`flex flex-row justify-center py-[1px] ${!showSvgLoader && "hidden"}`}>
                    <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 mr-3 animate-spin xxs:my-1 my-[1.5px] text-black"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                        />
                    </svg>
                    <span className="pt-0 xxs:pt-[2.4px]">Loading...</span>
                </div>
                <div className={`flex items-center justify-center ${showSvgLoader && "hidden"}`}>
                    <FcGoogle size={26} className="mr-2" />
                    <span className="">Link a google account</span>
                </div>
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