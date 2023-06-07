import { Dispatch, SetStateAction } from "react"

import { RiArrowGoBackFill } from "react-icons/ri";

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    title?: string;
    children: any;
    options?: {
        onClose?: () => void;
        showGoBackButton?: boolean;
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
        onClose, 
        showGoBackButton,
        goBackButtonAction
    } = options || {};

    return (
        <div>
            <input
                readOnly
                checked={open}
                type="checkbox"
                className="modal-toggle"
            />
            <div className="modal">
                <div className={`border border-gray-600 modal-box !bg-gray-800 relative transition-all duration-500 ${modalWrapperClassName && modalWrapperClassName}`}>
                    <div className={`flex flex-row justify-between pb-5 border border-transparent border-b-gray-600 ${titleWrapperClassName && titleWrapperClassName}`}>
                        {title && ( <h3 className="text-2xl tracking-tight font-light text-gray-200">{title}</h3> )}
                        <div className="flex flex-row justify-between space-x-2">
                            {(showGoBackButton && goBackButtonAction) && (
                                <div className="tooltip tooltip-bottom" data-tip="Go back">
                                    <div 
                                        className="btn btn-sm btn-circle bg-gray-700 border border-gray-900"
                                        onClick={() => goBackButtonAction()}
                                    >
                                        <RiArrowGoBackFill 
                                            size={18}
                                            className="ml-[1px]"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="tooltip tooltip-bottom" data-tip="Close">
                                <label 
                                    htmlFor="my-modal-3"
                                    className={`btn btn-sm btn-circle bg-gray-700 pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                                    onClick={() => onClose ? onClose() : setOpen(false)}
                                >
                                    ✕
                                </label>
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}