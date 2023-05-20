import { Dispatch, SetStateAction } from 'react'
import Modal from './Modal'
import SvgLoader from './SvgLoader';

type Props = {
    open: boolean;
    mainText: string;
    options?: {
        subText?: string;
        loader?: boolean;
        onClose?: () => void;
        modalWrapperClassName?: string;
        titleWrapperClassName?: string;
        subTextCustomClassName?: string;
        mainTextCustomClassName?: string;
        customCloseButtonAction?: () => void;
        customDeleteButtonText?: string;
        customCancelButtonText?: string;
    };
    deleteButtonAction: () => void;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmationModal({ open, options, setOpen, deleteButtonAction, mainText }: Props) {
    const modalProps = {
        open,
        setOpen,
        title: "Confirmation",
        options: {
            onClose: options?.onClose && options?.onClose,
            titleWrapperClassName: `${options?.titleWrapperClassName && options?.titleWrapperClassName} px-6`,
            modalWrapperClassName: `${options?.modalWrapperClassName && options?.modalWrapperClassName} px-0`
        }
    };
    
    return (
        <Modal {...modalProps}>
            <p className={`mt-5 px-6 text-sm uppercase tracking-widest text-gray-300 ${options?.mainTextCustomClassName && options?.mainTextCustomClassName}`}>
                {mainText} 
            </p>
            {options?.subText && (
                <p className={`text-xs uppercase tracking-widest text-gray-500 mt-4 mb-6 ${options?.subTextCustomClassName && options?.subTextCustomClassName}`}>
                    {options?.subText}
                </p>
            )}
            <div className="mt-5 xxs:mt-5">
                <div className="mt-3 flex flex-row justify-evenly">
                    <button
                        className="bg-gray-600 hover:bg-gray-700 text-gray-100 px-8 py-[14px] rounded-lg shadow-md shadow-gray-900 text-sm uppercase tracking-widest  transition-all duration-500 ease-in-out"
                        onClick={() => options?.customCloseButtonAction ? options?.customCloseButtonAction() : setOpen(false)}
                    >
                        {options?.customCancelButtonText ? options?.customCancelButtonText : "Cancel"}
                    </button>
                    <button 
                        className="bg-red-600 hover:bg-red-800 text-gray-100 px-7 py-3 rounded-lg shadow-md shadow-gray-900 transition-all duration-500 ease-in-out"
                        onClick={() => deleteButtonAction()}
                    >
                        {options?.loader ? (
                          <SvgLoader options={{ showLoadingText: true }} /> 
                        ) : (
                            <p className='text-sm uppercase tracking-widest'>
                                {options?.customDeleteButtonText ? options?.customDeleteButtonText : "Delete"}
                            </p>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}