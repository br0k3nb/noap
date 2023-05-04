import { Dispatch, SetStateAction } from "react"

type Props = {
    children: any;
    open: boolean;
    title: string;
    onClose?: () => void;
    titleWrapperClasName?: string;
    modalWrapperClassName?: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Modal({ children, open, setOpen, onClose, modalWrapperClassName, title, titleWrapperClasName }: Props) {
  return (
    <div>
        <input
            readOnly
            checked={open}
            type="checkbox" 
            // id="my-modal-3"
            className="modal-toggle"
        />
        <div className="modal">
            <div className={`modal-box !bg-gray-800 relative transition-all duration-500 ${modalWrapperClassName && modalWrapperClassName}`}>
                <div className={`flex flex-row justify-between pb-5 border border-transparent border-b-gray-600 ${titleWrapperClasName && (titleWrapperClasName)}`}>
                    <h3 className="text-2xl tracking-tight font-light text-gray-200">{title}</h3>
                    <label 
                        htmlFor="my-modal-3"
                        className="btn btn-sm btn-circle bg-gray-700"
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