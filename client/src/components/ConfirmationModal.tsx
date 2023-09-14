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
        alertComponentTextClassName?: string;
        modalWrapperClassName?: string;
        titleWrapperClassName?: string;
        mainTextClassName?: string;
        subTextClassName?: string;
        actionButtonText?: string;
        actionButtonClassName?: string;
        cancelButtonText?: string;
        cancelButtonAction?: () => void;
        cancelButtonClassName?: string;
        alertComponentWrapperClassName?: string;
    };
    actionButtonFn: () => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmationModal({ open, options, setOpen, actionButtonFn, mainText }: Props) {
    const {
        subText,
        onClose,
        loader,
        alertComponentIcon,
        alertComponentText,
        alertComponentWrapperClassName,
        alertComponentTextClassName,
        cancelButtonText,
        cancelButtonAction,
        cancelButtonClassName,
        actionButtonText,
        actionButtonClassName,
        mainTextClassName,
        modalWrapperClassName,
        subTextClassName,
        titleWrapperClassName
    } = options || {};

    const default_action_button_class = "bg-red-700 hover:bg-red-800 border border-gray-900 text-gray-100 px-7 py-3 xxs:py-[10px] xxs:px-4 rounded-full dark:shadow-none transition-all duration-500 ease-in-out";
    const default_cancel_button_class = "bg-gray-600 hover:bg-gray-700 text-gray-100 border border-gray-900 px-7 mr-8 py-[10px] xxs:px-6 rounded-full dark:shadow-none transition-all duration-500 ease-in-out";

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
            <p className={`mt-5 px-6 text-sm uppercase tracking-widest text-gray-900 dark:text-gray-300 ${mainTextClassName && mainTextClassName}`}>
                {mainText} 
            </p>
            {options?.subText && (
                <p className={`text-xs uppercase tracking-widest text-gray-500 mt-4 mb-6 ${subTextClassName && subTextClassName}`}>
                    {subText}
                </p>
            )}
            {alertComponentText && (
                <div className={`alert !bg-neutral-900 mx-auto w-[21.2rem] xxs:w-[16.5rem] max-h-32 ${alertComponentWrapperClassName && alertComponentWrapperClassName}`}>
                    <div className={`text-[13.5px] uppercase tracking-wide`}>
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
            <div className="mt-5 flex flex-row justify-evenly">
                <button
                    className={`${default_cancel_button_class} ${cancelButtonClassName && cancelButtonClassName}`}
                    onClick={() => cancelButtonAction ? cancelButtonAction() : setOpen(false)}
                >
                    <p className='text-sm uppercase tracking-widest xxs:!text-xs'>
                        {cancelButtonText ? cancelButtonText : "Cancel"}
                    </p>
                </button>
                <button 
                    className={`${default_action_button_class} ${actionButtonClassName && actionButtonClassName}`}
                    onClick={() => actionButtonFn()}
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
                            {actionButtonText ? actionButtonText : "Delete"}
                        </p>
                    )}
                </button>
            </div>
        </Modal>
    )
}