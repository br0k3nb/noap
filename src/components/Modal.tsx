import { Dispatch, ReactNode, SetStateAction, useEffect } from "react"

import { RiArrowGoBackFill } from "react-icons/ri";
import { AiOutlineClose } from 'react-icons/ai';

type Props = {
    open: boolean;
    setOpen?: Dispatch<SetStateAction<boolean>>;
    title?: string;
    children: any;
    options?: {
        onClose?: () => void;
        showGoBackButton?: boolean;
        showCloseTooltip?: boolean;
        closeButtonClassName?: string;
        titleCustomClassName?:string;
        titleWrapperClassName?: string;
        modalWrapperStyle?: object;
        modalWrapperClassName?: string;
        goBackButtonAction?: () => void;
        customKeyboardPressHandler?: (ev: KeyboardEvent) => void;
        customTopActionButton?: ReactNode
    };
}

export default function Modal({ children, open, setOpen, title, options }: Props) {
    const { 
        modalWrapperClassName,
        modalWrapperStyle,
        titleWrapperClassName, 
        closeButtonClassName, 
        titleCustomClassName,
        onClose, 
        showGoBackButton,
        showCloseTooltip,
        goBackButtonAction
    } = options || {};

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.keyCode === 27 && setOpen) setOpen(false);
        };

        const handleMouseClick = (event: MouseEvent) => {
            const targetId = (event.target as HTMLElement).id;
            if(targetId === "noap-modal-overlay" && setOpen) setOpen(false);
        };

        addEventListener("click", handleMouseClick);

        if(options?.customKeyboardPressHandler) addEventListener("keydown", options?.customKeyboardPressHandler);
        else addEventListener("keydown", handleKeyDown);

        return () => {
            if(options?.customKeyboardPressHandler) removeEventListener("keydown", options?.customKeyboardPressHandler);
            else removeEventListener("keydown", handleKeyDown);
            
            removeEventListener("click", handleMouseClick);
        }
    }, []);

    return (
        <>
            <input
                readOnly
                checked={open}
                type="checkbox"
                className="modal-toggle"
            />
            <div className="modal text-gray-900 dark:text-gray-300" id="noap-modal-overlay">
                <div 
                    className={`
                        border border-stone-500 dark:border-gray-600 modal-box !bg-[#ffffff] dark:!bg-[#0f1011] relative transition-all duration-500 
                        ${modalWrapperClassName && modalWrapperClassName}
                    `}
                    style={modalWrapperStyle ? modalWrapperStyle : {}}
                >
                    <div 
                        className={`
                            flex flex-row justify-between pb-5 border border-transparent border-b-gray-600 
                            ${titleWrapperClassName && titleWrapperClassName}
                        `}
                    >
                        {title && ( 
                            <h3 className={`text-2xl tracking-tight font-light text-black dark:text-gray-300 ${titleCustomClassName && titleCustomClassName}`}>
                                {title}
                            </h3> 
                        )}
                        <div className="flex flex-row justify-between space-x-2" id="modal-actions">
                            {options?.customTopActionButton && (options?.customTopActionButton)}
                            {(showGoBackButton && goBackButtonAction) && (
                                <div className="tooltip tooltip-left tooltip-left-color-controller before:!mr-[5px] after:!mr-[3px] before:text-[15px]" data-tip="Go back">
                                    <div 
                                        className="btn btn-sm btn-circle bg-[#ffffff] hover:bg-[#eeeff1] bg-inherit dark:hover:!bg-[#323232] border border-gray-600"
                                        onClick={() => goBackButtonAction()}
                                    >
                                        <RiArrowGoBackFill 
                                            size={18}
                                            className="ml-[2px] text-gray-900 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            )}
                            {showCloseTooltip ? (
                                <div className="tooltip tooltip-bottom uppercase tracking-wide before:!text-[11.5px]" data-tip="Close">
                                    <label 
                                        htmlFor="my-modal-3"
                                        className={`btn btn-sm btn-circle text-gray-900 dark:text-gray-300 bg-[#ffffff] dark:!bg-[#404040] dark:hover:!bg-[#323232] pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                                        onClick={() => onClose ? onClose() : setOpen && setOpen(false)}
                                    >
                                        <AiOutlineClose size={16} className="my-[7px]" />
                                    </label>
                                </div>
                            ) : ( 
                                <label 
                                    htmlFor="my-modal-3"
                                    className={`transition-all duration-300 ease-in-out bg-[#ffffff] border border-gray-500 text-gray-900 dark:text-gray-300 btn btn-sm btn-circle bg-inherit hover:bg-[#eeeff1] dark:hover:!bg-[#323232] pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                                    onClick={() => onClose ? onClose() : setOpen && setOpen(false)}
                                >
                                    <AiOutlineClose size={16} className="my-[7px]"/>
                                </label>
                            )} 
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </>
    )
}