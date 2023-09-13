import { Dispatch, SetStateAction, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import { UserDataCtx } from '../context/UserDataContext';

import { useInputMask } from "../hooks/useInputMask";
import { toastAlert } from './Alert/Alert';
import SvgLoader from './SvgLoader';
import api from '../services/api';
import Modal from "./Modal";

type Props = {
    open: boolean;
    customUserId?: { _id: string };
    useNav?: boolean | string;
    customSetterContent?: any;
    setOpen?: Dispatch<SetStateAction<boolean>>;
    customSetter?: Dispatch<SetStateAction<any>>;
    customOnCloseFn?: () => void;
    customFn?: () => any;
}

export default function Verify2FAModal({ 
    open,
    useNav,
    setOpen,
    customFn,
    customSetter,
    customUserId,
    customOnCloseFn,
    customSetterContent
}: Props) {
    const [TFACode, setTFACode] = useState<string | null>(null);
    const [showSvgLoader, setShowSvgLoader] = useState(false);
     
    const { userData } = useContext(UserDataCtx) as any;
    
    const token = customUserId ? customUserId : { _id: userData._id };
    const { _id: userId } = token;

    const { ref: numberRef, onKeyUp: onKeyUpNumber } = useInputMask("999-999");
    
    const navigate = useNavigate();

    const handleInputChange = (data: string) => {
        const stringWithoutHifen = data.replace("-", "");

        if(stringWithoutHifen.length < 7) setTFACode(stringWithoutHifen);
    };

    const handleVerifyButton = async () => {
        setShowSvgLoader(true);
        
        try {
            const { data: { message }} = await api.post("/2fa/verify", { userId, TFACode });

            toastAlert({ icon: "success", title: message, timer: 4000 });
            setShowSvgLoader(false);

            if(customFn) customFn();
            if(useNav) navigate(useNav as string)
            if(customSetter) customSetter(customSetterContent ? customSetterContent : true);
            
            if(setOpen) setOpen(false);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            setShowSvgLoader(false);
        }
    };

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Two-factor authentication"
            options={{
                closeButtonClassName: "!text-gray-300 !bg-[#404040] !bg-[#323232] border-gray-500",
                titleWrapperClassName: "px-6",
                titleCustomClassName: "xxs:text-[19.5px] !text-gray-300",
                modalWrapperClassName: "!px-0 xxs:w-[19rem] w-[22.5rem] !bg-[#0f1011]",
                onClose: () => customOnCloseFn ? customOnCloseFn() : setOpen && setOpen(false)
            }}
        >
            <div className="px-6 mt-5 text-gray-300">
                <div className="mb-5">
                    <p className="text-sm uppercase tracking-widest mb-3">Authenticate</p>
                    <p className="text-gray-500 text-sm xxs:text-xs mb-3">
                        This account has 2FA enabled and to access it, your have to enter the 2FA code.
                    </p>
                    <form 
                        className="flex flex-col justify-center items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            TFACode?.length === 6 && handleVerifyButton()
                        }}
                    >
                        <p className="text-xs uppercase tracking-widest mb-2 mt-5">Please, insert the code here</p>
                        <input
                            max={6}
                            ref={numberRef}
                            onKeyUp={onKeyUpNumber}
                            className="sign-text-inputs w-60 placeholder:text-center text-center bg-stone-900 text-gray-300 h-10 border !border-gray-700 hover:!border-gray-600"
                            onChange={({currentTarget}) => handleInputChange(currentTarget.value)}
                        />
                        <button
                            className={`mt-2 px-3 w-60 py-3 ${showSvgLoader && "!px-[4.5rem] !py-[0.60rem]"} bg-green-700 hover:bg-green-800 font-normal rounded-full text-[12px] uppercase tracking-wide hover:tracking-widest border border-gray-700 transition-all duration-500 disabled:cursor-not-allowed disabled:!bg-green-700/60 disabled:hover:tracking-wide`}
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
        </Modal>
    )
}