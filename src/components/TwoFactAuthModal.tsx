import { useState, Dispatch, SetStateAction } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import api from "../services/api";
import useUserData from "../hooks/useUserData";
import { useInputMask } from "../hooks/useInputMask";

import Modal from "./Modal";
import Tooltip from "./Tooltip";
import SvgLoader from "./SvgLoader";
import { toastAlert } from "./Alert";
import ConfirmationModal from "./ConfirmationModal";

import googlePlayButton from "../assets/google_play.svg";
import qrCodePlaceholder from "../assets/qrcode_placeholder.svg";

type TwoFactAuthModalType = {
    open: boolean;
    customCloseFn: () => any;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function TwoFactAuthModal ({ open, setOpen, customCloseFn } : TwoFactAuthModalType) {
    const [page, setPage] = useState(0);
    const [TFACode, setTFACode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [showSvgLoader, setShowSvgLoader] = useState(false);
    const [qrcodeImage, setQrcodeImage] = useState<string | null>(null);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

    const { userData: { _id: userId, TFAEnabled }, setUserData } = useUserData();
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
            const { data: { message } } = await api.post("/2fa/verify", { userId, TFACode });

            setUserData((prevUserData: any) => {
                return {
                    ...prevUserData,
                    TFAEnabled: true
                }
            });

            toastAlert({ icon: "success", title: message, timer: 4000 });
            setShowSvgLoader(false);
            setIsVerified(true);
        } catch (err: any) {
            (numberRef.current as HTMLInputElement).value = '';
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            setShowSvgLoader(false);
        }
    };

    const handleRemove2FA = async () => {
        setShowSvgLoader(true);

        try {
            const { data: { message } } = await api.post("/2fa/remove", { userId });

            setUserData((prevUserData: any) => {
                return {
                    ...prevUserData,
                    TFAEnabled: false
                }
            });
            
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

    const handleClickRemove2FA = () => {
        setOpen(false);
        setOpenConfirmationModal(true);
    };

    const handleCancelClickRemove2FAModal = () => {
        setOpen(true);
        setOpenConfirmationModal(false);
    };

    const handleModalClose = () => {
        if(numberRef.current) (numberRef.current as HTMLInputElement).value = '';
        customCloseFn();
    }

    return (
        <>
            <ConfirmationModal
                mainText=""
                open={openConfirmationModal}
                setOpen={setOpenConfirmationModal}
                actionButtonFn={handleRemove2FA}
                options={{
                    actionButtonText: `${showSvgLoader ? "Removing..." : "Remove 2FA"}`,
                    mainTextClassName: "text-gray-300/90 uppercase",
                    alertComponentIcon: "warning",
                    alertComponentText: "Are you sure you want to remove the 2FA from your account ?",
                    alertComponentTextClassName: "!text-[12px]",
                    alertComponentWrapperClassName: 'w-[320px]',
                    actionButtonsWrapperClassName:'mx-5 ' ,
                    modalWrapperClassName: '!px-0  w-[22rem] xxs:!w-[19rem]',
                    cancelButtonAction: handleCancelClickRemove2FAModal
                }}
            />
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
                    onClose: () =>  handleModalClose()
                }}
            >
                <div className="px-6 mt-5 text-gray-900 dark:text-gray-300">
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
                                    className="text-white mt-5 w-40 px-2 py-3 bg-green-600 hover:bg-green-700 tracking-wide rounded-lg text-[12px] uppercase hover:tracking-widest border border-gray-500 transition-all duration-300 disabled:cursor-not-allowed disabled:bg-green-600/70 disabled:opacity-50 disabled:hover:tracking-wide"
                                    disabled={qrcodeImage ? true : false}
                                    onClick={() => handleGenerateQrcode()}
                                >
                                    {showSvgLoader ? (
                                        <SvgLoader options={{ 
                                            showLoadingText: true,
                                            LoadingTextClassName: "!text-xs pt-[1px]",
                                            LoaderClassName: "!h-3 !w-3 !mt-[3.5px]"
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
                                    className="sign-text-inputs w-60 placeholder:text-center text-center  dark:bg-stone-900 dark:text-gray-300 bg-[#dbdbdb] h-10 border border-gray-700 dark:border-gray-500 hover:!border-gray-600"
                                    onChange={({currentTarget}) => handleInputChange(currentTarget.value)}
                                />
                                <button
                                    className={`mt-2 px-3 w-60 py-3 ${showSvgLoader && "!px-[4.5rem] !py-[0.60rem]"} text-white bg-green-700 hover:bg-green-800 rounded-full text-xs uppercase tracking-wide hover:tracking-widest border border-gray-700 hover:!border-gray-600 transition-all duration-500 disabled:cursor-not-allowed disabled:!bg-green-700/60 disabled:hover:tracking-wide`}
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
                            <p className="text-sm uppercase tracking-widest mb-2">Authenticate</p>
                            <p className="text-gray-500 text-md xxs:text-xs">
                                To access the two factor authentication information, you need to authenticate
                            </p> 
                            <div className="flex flex-col justify-center items-center">
                                <form 
                                    className="flex flex-col justify-center items-center"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        TFACode?.length === 6 && handleVerifyButton()
                                    }}
                                >
                                    <p className="text-xs uppercase tracking-widest mb-2 mt-7">Please, insert the code here</p>
                                    <input
                                        max={6}
                                        ref={numberRef}
                                        onKeyUp={onKeyUpNumber}
                                        className="sign-text-inputs w-60 placeholder:text-center text-center dark:bg-stone-900 dark:text-gray-300 bg-[#dbdbdb] text-gray-900 h-10 border !border-gray-600"
                                        onChange={({currentTarget}) => handleInputChange(currentTarget.value)}
                                    />
                                    <button
                                        className={`text-white mt-2 px-3 w-60 py-2 ${showSvgLoader && "!px-[4.5rem] !py-[0.60rem]"} bg-green-700 hover:bg-green-800 font-normal rounded-full text-[15px] uppercase tracking-wide hover:tracking-widest border border-gray-600 transition-all duration-500 disabled:cursor-not-allowed disabled:!bg-green-700/60 disabled:hover:tracking-wide disabled:text-gray-500`}
                                        disabled={TFACode?.length === 6 ? false : true}
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
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-2">
                            <p className="text-sm uppercase tracking-widest">2FA Settings</p>
                            <div className="flex flex-col space-y-4 mt-5 justify-center items-center">
                                <div className="form-control w-80 xxs:w-[16.8rem] dark:bg-[#181818] bg-[#dbdbdb] rounded-full px-4 py-1 border border-gray-600">
                                    <label className="cursor-pointer label">
                                    <span className="label-text text-[15px] xxs:text-[13px] dark:text-gray-300 text-gray-900">Use 2FA to reset password</span> 
                                    <input 
                                        checked
                                        readOnly
                                        type="checkbox" 
                                        className="toggle" 
                                        onClick={() => handleClickRemove2FA()}
                                    />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`flex flex-row justify-between mt-3 ${((TFAEnabled && !isVerified) || (TFAEnabled && isVerified)) && "!hidden"}`}>
                        <Tooltip text="Previous page" position="right">
                            <button 
                                className="text-xs uppercase bg-[#dbdbdb] hover:bg-[#c0c0c0] dark:!bg-[#323232] dark:hover:!bg-[#232323] p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#ebebeb] disabled:opacity-70"
                                onClick={() => setPage(page - 1)}
                                disabled={!page ? true : false}
                            >
                                <BsArrowLeft size={20} className="text-gray-900 dark:text-gray-300"/>
                            </button>
                        </Tooltip>
                        <Tooltip 
                            text={`${(page == 1 && !qrcodeImage) ? "Generate a QR code to go to the next page" : "Next page"}`} 
                            position="left"
                        >
                            <button
                                className="text-xs uppercase bg-[#dbdbdb] hover:bg-[#c0c0c0] dark:!bg-[#323232] dark:hover:!bg-[#232323] p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#ebebeb] disabled:opacity-70"
                                disabled={page === 2 || (page === 1 && !qrcodeImage) ? true : false}
                                onClick={() => setPage(page + 1)}
                            >
                                <BsArrowRight size={20} className="text-gray-900 dark:text-gray-300"/>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </Modal>
        </>
    )
}