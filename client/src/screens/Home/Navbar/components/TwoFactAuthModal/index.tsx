import { useState, Dispatch, SetStateAction } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import api from "../../../../../services/api";
import Modal from "../../../../../components/Modal";
import { useInputMask } from "../../../../../hooks/useInputMask";
import { toastAlert } from "../../../../../components/Alert/Alert";
import googlePlayButton from "../../../../../assets/google_play.svg";
import qrCodePlaceholder from "../../../../../assets/qrcode_placeholder.svg"

type TwoFactAuthModalType = {
    open: boolean;
    userId: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function TwoFactAuthModal ({ open, setOpen, userId } : TwoFactAuthModalType) {
    const [ page, setPage ] = useState(0);
    const [ TFACode, setTFACode ] = useState("");
    const [ isVerified, setIsVerified ] = useState(false);
    const [ qrcodeImage, setQrcodeImage ] = useState<string | null>(null);

    const { ref: numberRef, onKeyUp: onKeyUpNumber } = useInputMask("999-999");

    const handleGenerateQrcode = async () => {
        try {
            const { data } = await api.post("/2fa/qrcode", { userId });
            setQrcodeImage(data);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
        }
    };

    const handleInputChange = (data: string) => {
        const stringWithoutHifen = data.replace("-", "");
    
        if(stringWithoutHifen.length < 7) setTFACode(stringWithoutHifen);
    };

    const handleVerifyButton = async () => {
        try {
            const { data: { message }} = await api.post("/2fa/verify", { userId, TFACode });
            toastAlert({ icon: "success", title: message, timer: 2000 });
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
        }
    }

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Two-factor authentication"
            options={{
                titleWrapperClassName: "px-6",
                modalWrapperClassName: `!px-0 w-[27rem] xxs:w-[22rem] ${page == 2 && "!w-[25rem]"}`,
                onClose: () => setOpen(false)
            }}
        >
            <div className="px-6 mt-5">
                {!page ? (
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
                ) : page === 1 ? (
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
                                Generate QR code
                            </button>
                        </div>
                    </>
                ) : ( 
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
                                className="mt-2 px-24 py-3 bg-gray-900 rounded-full text-xs uppercase tracking-widest border border-gray-700 hover:bg-black transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-700/60"
                                disabled={TFACode.length === 6 ? false : true}
                                onClick={() => handleVerifyButton()}
                            >
                                Verify
                            </button>
                        </div>
                    </>
                )}
                
                <div className="flex flex-row justify-between mt-5">
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
                        disabled={page === 2 ? true : false}
                        onClick={() => setPage(page + 1)}
                    >
                        <div className="tooltip tooltip-left before:!normal-case" data-tip="Next page">
                            <BsArrowRight size={20} className="pt-1"/>
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    )
}