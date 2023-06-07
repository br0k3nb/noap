import Modal from "../../../../../components/Modal";
import { useState, Dispatch, SetStateAction } from "react";

import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

import googlePlayButton from "../../../../../assets/google_play.svg";
import qrCodePlaceholder from "../../../../../assets/qrcode_placeholder.svg"

type TwoFactAuthModalType = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

// https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US&pli=1

export default function TwoFactAuthModal ({ open, setOpen } : TwoFactAuthModalType) {
    const [ page, setPage ] = useState(0);

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Two-factor authentication"
            options={{
                titleWrapperClassName: "px-6",
                modalWrapperClassName: "!px-0 overflow-hidden w-[27rem]",
                onClose: () => setOpen(false)
            }}
        >
            <div className="px-6 mt-5">
                {!page ? (
                    <>
                        <p className="text-sm uppercase tracking-widest mb-3">What is 2FA ? </p>
                        <p className="text-gray-500 text-sm">
                            Two-factor authentication (2FA) is a security system that 
                            requires two separate, distinct forms of identification in
                            order to access something. The first factor is a password
                            and the second commonly includes a text with a code sent to
                            your smartphone.
                        </p>
                        <p className="text-sm uppercase tracking-widest mt-5">How can i enable 2FA?</p>
                        <p className="text-gray-500 text-sm mt-3">
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
                ) : (
                    <>
                        <p className="text-sm uppercase tracking-widest">After downloading the app</p>
                        <p className="text-gray-500 text-sm mt-3">
                            You'll need to scan a QR code with your mobile phone. 
                            After scaning it, you'll be redirected to the Google 
                            Authenticator app with the 6 digits code.
                        </p>

                        <div className="flex flex-col justify-center items-center mt-6">
                            <img 
                                src={qrCodePlaceholder}
                                alt="QR code"
                                className="w-60 rounded"
                                draggable={false}
                            />
                            <button className="mt-5 px-3 py-3 bg-gray-900 rounded-lg text-xs uppercase tracking-widest border border-gray-700 hover:bg-black transition-all duration-300">
                                Generate QR code
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
                        className="text-xs uppercase bg-gray-900 hover:bg-black px-3 py-[0.60rem] rounded-full transition-all duration-300"
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