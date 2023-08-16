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
        titleCustomClassName?:string;
        closeButtonClassName?: string;
        titleWrapperClassName?: string;
        modalWrapperClassName?: string;
        goBackButtonAction?: () => void;
    };
}

export default function Modal({ children, open, setOpen, title, options }: Props) {
    const { 
        modalWrapperClassName, 
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
            <div className="modal !text-black dark:!text-gray-300">
                <div 
                    className={`
                        border border-gray-900 dark:border-gray-600 modal-box !bg-[#d9dbde] dark:!bg-[#0f1011] relative transition-all duration-500 
                        ${modalWrapperClassName && modalWrapperClassName}
                    `}
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
                                <div className="tooltip tooltip-bottom" data-tip="Go back">
                                    <div 
                                        className="btn btn-sm btn-circle bg-gray-700 dark:!bg-[#323232] border border-gray-900"
                                        onClick={() => goBackButtonAction()}
                                    >
                                        <RiArrowGoBackFill 
                                            size={18}
                                            className="ml-[1px]"
                                        />
                                    </div>
                                </div>
                            )}
                            {showCloseTooltip ? (
                                <div className="tooltip tooltip-bottom uppercase tracking-wide before:!text-[11.5px]" data-tip="Close">
                                    <label 
                                        htmlFor="my-modal-3"
                                        className={`btn btn-sm btn-circle bg-[#d9dbde] dark:!bg-[#404040] dark:hover:!bg-[#323232] pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                                        onClick={() => onClose ? onClose() : setOpen && setOpen(false)}
                                    >
                                        ✕
                                    </label>
                                </div>
                            ) : ( 
                                <label 
                                    htmlFor="my-modal-3"
                                    className={`text-gray-900 dark:text-gray-300 btn btn-sm btn-circle bg-inherit hover:bg-[#bbbbbb] dark:!bg-[#404040] dark:hover:!bg-[#323232] pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
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