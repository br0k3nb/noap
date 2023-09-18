import { Dispatch, SetStateAction } from "react"

import { RiArrowGoBackFill } from "react-icons/ri";

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

    return (
        <>
            <input
                readOnly
                checked={open}
                type="checkbox"
                className="modal-toggle"
            />
            <div className="modal text-gray-900 dark:text-gray-300">
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
                        <div className="flex flex-row justify-between space-x-2">
                            {(showGoBackButton && goBackButtonAction) && (
                                <div className="tooltip tooltip-bottom before:bg-[#eeeff1] dark:before:bg-[#404040] before:border before:border-gray-900 before:text-gray-900 dark:before:border-gray-600 dark:before:text-gray-300" data-tip="Go back">
                                    <div 
                                        className="btn btn-sm btn-circle bg-[#ffffff] hover:bg-[#eeeff1] dark:!bg-[#404040] dark:hover:!bg-[#323232] border border-gray-600"
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
                                        ✕
                                    </label>
                                </div>
                            ) : ( 
                                <label 
                                    htmlFor="my-modal-3"
                                    className={`bg-[#ffffff] border-gray-600 text-gray-900 dark:text-gray-300 btn btn-sm btn-circle bg-inherit hover:bg-[#eeeff1] dark:!bg-[#404040] dark:hover:!bg-[#323232] pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                                    onClick={() => onClose ? onClose() : setOpen && setOpen(false)}
                                >
                                    ✕
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