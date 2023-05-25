import { Dispatch, SetStateAction } from "react"

type Props = {
    children: any;
    open: boolean;
    title?: string;
    options?: {
        onClose?: () => void;
        titleWrapperClassName?: string;
        modalWrapperClassName?: string;
        closeButtonClassName?: string;
    };
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Modal({ children, open, setOpen, title, options }: Props) {
    const { modalWrapperClassName, titleWrapperClassName, closeButtonClassName, onClose } = options as any;

    return (
        <div>
            <input
                readOnly
                checked={open}
                type="checkbox"
                className="modal-toggle"
            />
            <div className="modal">
                <div className={`modal-box !bg-gray-800 relative transition-all duration-500 ${modalWrapperClassName && modalWrapperClassName}`}>
                    <div className={`flex flex-row justify-between pb-5 border border-transparent border-b-gray-600 ${titleWrapperClassName && titleWrapperClassName}`}>
                        {title && ( <h3 className="text-2xl tracking-tight font-light text-gray-200">{title}</h3> )}
                        <label 
                            htmlFor="my-modal-3"
                            className={`btn btn-sm btn-circle bg-gray-700 pb-[1px] ${closeButtonClassName && closeButtonClassName}`}
                            onClick={() => onClose ? onClose() : setOpen(false)}
                        >
                            ✕
                        </label>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}