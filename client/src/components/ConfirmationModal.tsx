import { Dispatch, SetStateAction } from 'react'
import Modal from './Modal'

type Props = {
    open: boolean;
    subText?: string;
    mainText: string;
    loader?: boolean;
    onClose?: () => void;
    modalWrapperClassName?: string;
    titleWrapperClassName?: string;
    subTextCustomClassName?: string;
    mainTextCustomClassName?: string;
    customCloseButtonAction?: () => void;
    deleteButtonAction: () => void;
    customDeleteButtonText?: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmationModal({ 
    open,
    loader, 
    setOpen, 
    onClose, 
    subText, 
    mainText,
    modalWrapperClassName,
    titleWrapperClassName,
    subTextCustomClassName,
    mainTextCustomClassName,
    customCloseButtonAction,
    customDeleteButtonText,
    deleteButtonAction }: Props) {

    const modalProps = {
        open,
        setOpen,
        title: "Confirmation",
        options: {
            onClose: onClose && onClose,
            titleWrapperClassName: `!border-transparent ${titleWrapperClassName && titleWrapperClassName}`,
            modalWrapperClassName: `${modalWrapperClassName && modalWrapperClassName}`
        }
    };
    
    return (
        <Modal {...modalProps}>
            <p className={`text-xs uppercase tracking-widest text-gray-300 ${mainTextCustomClassName && mainTextCustomClassName}`}>
                {mainText} 
            </p>
            {subText && (
                <p className={`text-xs uppercase tracking-widest text-gray-500 mt-4 mb-6 ${subTextCustomClassName && subTextCustomClassName}`}>
                    {subText}
                </p>
            )}
            <div className="mt-7 xxs:mt-5">
                <div className="mt-3 flex flex-row justify-evenly">
                    <button
                        className="bg-gray-600 hover:bg-gray-700 text-gray-100 px-8 py-3 rounded-lg shadow-md shadow-gray-900"
                        onClick={() => customCloseButtonAction ? customCloseButtonAction() : setOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="bg-red-600 hover:bg-red-700 text-gray-100 px-7 py-3 rounded-lg shadow-md shadow-gray-900"
                        onClick={() => deleteButtonAction()}
                    >
                        {loader ? (
                            <div
                                className='flex flex-row justify-center animate-pulse'
                            >
                                <svg
                                aria-hidden="true"
                                role="status"
                                className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="#E5E7EB"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentColor"
                                />
                                </svg>
                                <span className="pb-[3px] xxs:pt-[2.4px] text-sm uppercase tracking-widest">
                                    Loading...
                                </span>
                            </div>
                        ) : (
                            <p>
                                {customDeleteButtonText ? customDeleteButtonText : "Delete"}
                            </p>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}