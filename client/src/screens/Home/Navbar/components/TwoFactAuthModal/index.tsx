import { useState, Dispatch, SetStateAction } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import api from "../../../../../services/api";
import { useInputMask } from "../../../../../hooks/useInputMask";

import Modal from "../../../../../components/Modal";
import SvgLoader from "../../../../../components/SvgLoader";
import { toastAlert } from "../../../../../components/Alert/Alert";
import ConfirmationModal from "../../../../../components/ConfirmationModal";

import googlePlayButton from "../../../../../assets/google_play.svg";
import qrCodePlaceholder from "../../../../../assets/qrcode_placeholder.svg"

type TwoFactAuthModalType = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function TwoFactAuthModal ({ open, setOpen } : TwoFactAuthModalType) {
    const [ page, setPage ] = useState(0);
    const [ TFACode, setTFACode ] = useState("");
    const [ isVerified, setIsVerified ] = useState(false);
    const [ showSvgLoader, setShowSvgLoader ] = useState(false);
    const [ qrcodeImage, setQrcodeImage ] = useState<string | null>(null);
    const [ openConfirmationModal, setOpenConfirmationModal ] = useState(false);

    const token = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { _id: userId, TFAEnabled } = token;

    const { ref: numberRef, onKeyUp: onKeyUpNumber } = useInputMask("999-999");

    const handleGenerateQrcode = async () => {
        setShowSvgLoader(true);

        try {
            const { data } = await api.post("/2fa/qrcode", { userId });

            setQrcodeImage(data);
            setShowSvgLoader(false);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            setShowSvgLoader(false);
        }
    };

    const handleInputChange = (data: string) => {
        const stringWithoutHifen = data.replace("-", "");
    
        if(stringWithoutHifen.length < 7) setTFACode(stringWithoutHifen);
    };

    const handleVerifyButton = async () => {
        setShowSvgLoader(true);
        
        try {
            const { data: { message }} = await api.post("/2fa/verify", { userId, TFACode });

            localStorage.setItem("user_token", JSON.stringify({ ...token, TFAEnabled: true }));

            toastAlert({ icon: "success", title: message, timer: 4000 });
            setShowSvgLoader(false);
            setIsVerified(true);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            setShowSvgLoader(false);
        }
    };

    const handleRemove2FA = async () => {
        setShowSvgLoader(true);

        try {
            const {data: { message }} = await api.post("/2fa/remove", { userId });

            localStorage.setItem("user_token", JSON.stringify({ ...token, TFAEnabled: false }));
            
            toastAlert({ icon: "success", title: message, timer: 2000 });
            setShowSvgLoader(false);
            setIsVerified(false);
            setQrcodeImage(null);
            setOpenConfirmationModal(false);
            setPage(0);
        } catch (err: any) {
            toastAlert({ icon: "success", title: err.message, timer: 2000 });
            setShowSvgLoader(false);
        }
    };

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Two-factor authentication"
            options={{
                titleWrapperClassName: "px-6",
                titleCustomClassName: "xxs:!text-[19px]",
                modalWrapperClassName: `
                    !px-0 w-[27rem] xxs:!w-[19rem]
                    ${(page == 2 || TFAEnabled && isVerified) && "!w-[23rem]"}
                    ${(TFAEnabled && !isVerified) && "!w-[22.5rem]"}
                `,
                onClose: () => setOpen(false)
            }}
        >
            <div className="px-6 mt-5">
                <ConfirmationModal
                    mainText=""
                    open={openConfirmationModal}
                    setOpen={setOpenConfirmationModal}
                    deleteButtonAction={handleRemove2FA}
                    options={{
                        customDeleteButtonText: "Remove 2FA",
                        mainTextCustomClassName: "text-gray-300/90 uppercase",
                        alertComponentIcon: "warning",
                        alertComponentText: "Are you sure you want to remove the 2FA from your account ?",
                        alertComponentTextClassName: "!text-[11px]"
                    }}
                />
                {(!page && !TFAEnabled) ? (
                    <>
                        <p className="text-sm uppercase tracking-widest mb-3">What is 2FA ? </p>
                        <p className="text-gray-500 text-sm xxs:text-xs">
                            Two-factor authentication (2FA) is a security system that 
                            requires two separate, distinct forms of identification in
                            order to access something. The first factor is a password
                            and the second commonly includes a text with a code sent to
                            your smartphone.
                        </p>
                        <p className="text-sm uppercase tracking-widest mt-5">How can i enable 2FA?</p>
                        <p className="text-gray-500 text-sm mt-3 xxs:text-xs">
                            To enable 2FA, you need to download the Google Authenticator
                            app on your mobile phone.
                        </p>
                        <a className="flex flex-col justify-center items-center">
                            <p className="text-xs tracking-widest uppercase mt-7 mb-2">Get Google authenticatior</p>
                            <img 
                                src={googlePlayButton}
                                alt="Google play"
                                className="w-40 hover:cursor-pointer"
                                onClick={() => 
                                    window.open(
                                        "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US&pli=1",
                                        "_blank"
                                    )
                                }
                            />
                        </a>
                    </>
                ) : (page === 1 && !TFAEnabled) ? (
                    <>
                        <p className="text-sm uppercase tracking-widest">After downloading the app</p>
                        <p className="text-gray-500 text-sm mt-3 xxs:text-xs">
                            You'll need to scan a QR code with your mobile phone. 
                            After scaning it, you'll be redirected to the Google 
                            Authenticator app with the 6 digits code.
                        </p>

                        <div className="flex flex-col justify-center items-center mt-6">
                            <img 
                                src={qrcodeImage ? qrcodeImage : qrCodePlaceholder}
                                alt="QR code"
                                className={`w-60 rounded blur-[2px] ${qrcodeImage && "!blur-none"}`}
                                draggable={false}
                            />
                            <button 
                                className="mt-5 px-3 py-3 bg-gray-900 rounded-lg text-xs uppercase tracking-widest border border-gray-700 hover:bg-black transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60"
                                disabled={qrcodeImage ? true : false}
                                onClick={() => handleGenerateQrcode()}
                            >
                                {showSvgLoader ? (
                                    <SvgLoader options={{ 
                                        showLoadingText: true,
                                        LoadingTextClassName: "!text-xs pt-[0.5px]",
                                        LoaderClassName: "!h-3 !w-3"
                                    }}/>
                                ) : ("Generate QR code")}  
                            </button>
                        </div>
                    </>
                ) : (page === 2 && !TFAEnabled  && qrcodeImage) ? ( 
                    <>
                        <p className="text-sm uppercase tracking-widest mb-3">Now what ?</p>
                        <p className="text-gray-500 text-sm xxs:text-xs">
                            Now we validate the code generated in the Google Authenticator app.
                        </p>  
                        <div className="flex flex-col justify-center items-center">
                            <p className="text-xs uppercase tracking-widest mb-2 mt-5">Please, insert the code here</p>
                            <input
                                max={6}
                                ref={numberRef}
                                onKeyUp={onKeyUpNumber}
                                className="sign-text-inputs w-60 placeholder:text-center text-center bg-stone-900 text-gray-300 h-10 border !border-gray-700 hover:!border-gray-600"
                                onChange={({currentTarget}) => handleInputChange(currentTarget.value)}
                            />
                            <button
                                className={`mt-2 px-24 py-3 ${showSvgLoader && "!px-[4.5rem] !py-[0.60rem]"} bg-gray-900 rounded-full text-xs uppercase tracking-widest border border-gray-700 hover:bg-black transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60`}
                                disabled={TFACode.length === 6 ? false : true}
                                onClick={() => handleVerifyButton()}
                            >
                                {showSvgLoader ? (
                                    <SvgLoader options={{ 
                                        showLoadingText: true,
                                        LoadingTextClassName: "!text-xs pt-[1px]",
                                        LoaderClassName: "!h-3 !w-3"
                                    }}/>
                                ) : ("Verify")}  
                            </button>    
                        </div>
                    </>
                ) : (TFAEnabled && !isVerified) ? (
                    <div className="mb-5">
                        <p className="text-sm uppercase tracking-widest mb-3">Authenticate</p>
                        <p className="text-gray-500 text-sm xxs:text-xs">
                            To access the two factor authentication information, you need to authenticate
                        </p> 
                        <div className="flex flex-col justify-center items-center">
                            <p className="text-xs uppercase tracking-widest mb-2 mt-7">Please, insert the code here</p>
                            <input
                                max={6}
                                ref={numberRef}
                                onKeyUp={onKeyUpNumber}
                                className="sign-text-inputs w-60 placeholder:text-center text-center bg-stone-900 text-gray-300 h-10 border !border-gray-700 hover:!border-gray-600"
                                onChange={({currentTarget}) => handleInputChange(currentTarget.value)}
                            />
                            <button
                                className={`mt-2 px-24 py-3 ${showSvgLoader && "!px-[4.5rem] !py-[0.60rem]"} bg-gray-900 rounded-full text-xs uppercase tracking-widest border border-gray-700 hover:bg-black transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60`}
                                disabled={TFACode.length === 6 ? false : true}
                                onClick={() => handleVerifyButton()}
                            >
                                {showSvgLoader ? (
                                    <SvgLoader options={{ 
                                        showLoadingText: true,
                                        LoadingTextClassName: "!text-xs pt-[1px]",
                                        LoaderClassName: "!h-3 !w-3"
                                    }}/>
                                ) : ("Verify")}  
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-5">
                        <p className="text-sm uppercase tracking-widest">2FA Settings</p>
                        <div className="flex flex-col space-y-4 mt-5 justify-center items-center">
                            <div className="form-control w-80 xxs:w-[16.8rem] bg-gray-900 rounded-full px-4  py-1">
                                <label className="cursor-pointer label">
                                <span className="label-text xxs:text-[13px]">Use 2FA to reset password</span> 
                                <input type="checkbox" className="toggle toggle-info hover:cursor-not-allowed" checked />
                                </label>
                            </div>
                            <div className="w-[19.5rem] xxs:w-[15.3rem] border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/>
                            <button
                                className={`mt-2 w-[20rem] xxs:xxs:w-[16.8rem] py-3 ${showSvgLoader && "py-[0.60rem]"} bg-red-800 rounded-full text-xs uppercase tracking-widest border border-gray-700 hover:bg-red-900 transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60 text-gray-300`}
                                disabled={TFACode.length === 6 ? false : true}
                                onClick={() => setOpenConfirmationModal(true)}
                            >
                                {showSvgLoader ? (
                                    <SvgLoader options={{ 
                                        showLoadingText: true,
                                        LoadingTextClassName: "!text-xs pt-[1px]",
                                        LoaderClassName: "!h-3 !w-3"
                                    }}/>
                                ) : ("Disable 2FA")}  
                            </button>
                        </div>
                    </div>
                )}
                <div className={`flex flex-row justify-between mt-3 ${((TFAEnabled && !isVerified) || (TFAEnabled && isVerified)) && "!hidden"}`}>
                    <button 
                        className="text-xs uppercase bg-gray-900 hover:bg-black px-3 py-[0.60rem] rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60"
                        onClick={() => setPage(page - 1)}
                        disabled={!page ? true : false}
                    >
                        <div className="tooltip tooltip-right before:!normal-case" data-tip="Previous page">
                            <BsArrowLeft size={20} className="pt-1"/>
                        </div>
                    </button>
                    <button
                        className="text-xs uppercase bg-gray-900 hover:bg-black px-3 py-[0.60rem] rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60"
                        disabled={page === 2 || (page === 1 && !qrcodeImage) ? true : false}
                        onClick={() => setPage(page + 1)}
                    >
                        <div 
                            className="tooltip tooltip-left before:!normal-case" 
                            data-tip={`${(page == 1 && !qrcodeImage) ? "Generate a QR code to go to the next page" : "Next page"}`}
                        >
                            <BsArrowRight size={20} className="pt-1"/>
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    )
}