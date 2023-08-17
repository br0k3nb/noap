import { Dispatch, SetStateAction } from 'react'
import Modal from './Modal'
import SvgLoader from './SvgLoader';

import { AiFillWarning, AiFillInfoCircle } from "react-icons/ai";

type Props = {
    open: boolean;
    mainText: string;
    options?: {
        subText?: string;
        loader?: boolean;
        onClose?: () => void;
        alertComponentIcon?: string;
        alertComponentText?: string;
        modalWrapperClassName?: string;
        titleWrapperClassName?: string;
        subTextCustomClassName?: string;
        alertComponentClassName?: string;
        mainTextCustomClassName?: string;
        alertComponentTextClassName?: string;
        customCloseButtonAction?: () => void;
        customDeleteButtonText?: string;
        customCancelButtonText?: string;
    };
    deleteButtonAction: () => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmationModal({ open, options, setOpen, deleteButtonAction, mainText }: Props) {
    const {
        subText, 
        onClose, 
        loader, 
        alertComponentIcon, 
        alertComponentText,
        alertComponentClassName,
        alertComponentTextClassName,
        customCancelButtonText,
        customCloseButtonAction,
        customDeleteButtonText,
        mainTextCustomClassName,
        modalWrapperClassName,
        subTextCustomClassName,
        titleWrapperClassName
    } = options || {};

    const modalProps = {
        open,
        setOpen,
        title: "Confirmation",
        options: {
            onClose: onClose && onClose,
            titleWrapperClassName: `${titleWrapperClassName && titleWrapperClassName} px-6`,
            modalWrapperClassName: `${modalWrapperClassName && modalWrapperClassName} px-0`
        }
    };

    return (
        <Modal {...modalProps}>
            <p className={`mt-5 px-6 text-sm uppercase tracking-widest text-gray-900 dark:text-gray-300 ${mainTextCustomClassName && mainTextCustomClassName}`}>
                {mainText} 
            </p>
            {options?.subText && (
                <p className={`text-xs uppercase tracking-widest text-gray-500 mt-4 mb-6 ${subTextCustomClassName && subTextCustomClassName}`}>
                    {subText}
                </p>
            )}
            {alertComponentText && (
                <div className="alert !bg-neutral-900 mx-auto w-[21.2rem] xxs:w-[16.5rem] max-h-32">
                    <div className={`text-[13.5px] uppercase tracking-wide ${alertComponentClassName && alertComponentClassName}`}>
                        {alertComponentIcon  === "warning" ? ( 
                            <AiFillWarning 
                                size={17}
                                className="stroke-info flex-shrink-0 w-6 h-6 text-yellow-600" 
                            />
                         ) : alertComponentIcon === "info" ? (
                            <AiFillInfoCircle 
                                size={17}
                                className="stroke-info flex-shrink-0 w-6 h-6 text-blue-500" 
                            />
                         ) : (
                            <AiFillWarning 
                                size={17}
                                className="stroke-info flex-shrink-0 w-6 h-6 text-yellow-600" 
                            />
                         )}
                        <span 
                            className={`text-gray-300 ${alertComponentTextClassName && alertComponentTextClassName}`}
                        >
                            {alertComponentText}
                        </span>
                    </div>
                </div>
            )}
            <div className="mt-5 xxs:mt-5">
                <div className="mt-3 flex flex-row justify-evenly">
                    <button
                        className="bg-gray-600 hover:bg-gray-700 text-gray-100 px-8 py-[14px] xxs:!py-[10px] xxs:px-6 rounded-lg dark:shadow-none transition-all duration-500 ease-in-out"
                        onClick={() => customCloseButtonAction ? customCloseButtonAction() : setOpen(false)}
                    >
                        <p className='text-sm uppercase tracking-widest xxs:!text-xs'>
                            {customCancelButtonText ? customCancelButtonText : "Cancel"}
                        </p>
                    </button>
                    <button 
                        className={`bg-red-700 hover:bg-red-800 text-gray-100 px-7 py-3 xxs:py-[10px] xxs:px-4 rounded-lg dark:shadow-none transition-all duration-500 ease-in-out`}
                        onClick={() => deleteButtonAction()}
                    >
                        {loader ? (
                            <SvgLoader 
                                options={{ 
                                    showLoadingText: true, 
                                    wrapperClassName: "h-4",
                                    LoadingTextClassName: "xxs:text-xs xxs:!py-0",
                                    LoaderClassName: "xxs:h-3 xxs:!mt-[1.5px]"
                                }} 
                            /> 
                        ) : (
                            <p className='text-sm uppercase tracking-widest xxs:!text-xs'>
                                {customDeleteButtonText ?customDeleteButtonText : "Delete"}
                            </p>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}