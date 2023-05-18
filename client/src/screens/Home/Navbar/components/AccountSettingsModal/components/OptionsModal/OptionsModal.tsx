import { useState, Dispatch, SetStateAction } from 'react';
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import Modal from '../../../../../../../components/Modal'

import ChangePassword from './ChangePassword';
import LinkGoogleAccount from './LinkGoogleAccount';
import IsGoogleAccount from './IsGoogleAccount';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    register: UseFormRegister<FieldValues>;
    handleSubmit: UseFormHandleSubmit<FieldValues>;
    reset: UseFormReset<FieldValues>;
    errors: FieldErrors<FieldValues>;
}

export default function OptionsModal({ open, setOpen, register, handleSubmit, reset, errors }: Props) {
    const [ changeAccountInfo, setChangeAccountInfo ] = useState('');
    const [ showForm, setShowForm ] = useState(false);

    const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { googleAccount } = parsedUserToken;

    const handleModalClose = () => {
      setOpen(false);
      setTimeout(() => {
        setChangeAccountInfo('');
        setShowForm(false);
      }, 500);
    };

    const modalProps = {
        open,
        setOpen,
        title: "Account Settings",
        options: {
            onClose: handleModalClose,
            titleWrapperClassName: "px-6 mb-5",
            modalWrapperClassName: "!px-0 text-gray-100 !w-96 font-light xxs:!w-[19.4rem]",
        }
    }

    const changePasswordModalProps = { register, handleSubmit, reset, errors, setChangeAccountInfo };
    const IsGoogleAccountProps = { register, handleSubmit, reset, errors, showForm, setShowForm }

    return (  
      <Modal {...modalProps}>
        {changeAccountInfo === "" && !googleAccount ? (
          <div className="px-6 mt-1">
            <div className="flex flex-col space-y-4">
              <button
                className="py-[13.5px] hover:bg-gray-600 bg-gray-700 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-widest"
                onClick={() => setChangeAccountInfo("password")}
              >
                <span className="py-4"> Change password </span>
              </button>
              <button
                className="py-[13.5px] hover:bg-gray-600 bg-gray-700 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-widest"
                onClick={() => setChangeAccountInfo("google")}
              >
                <span className="py-4"> Link a Google account </span>
              </button>
              <button
                className="py-[13.5px] cursor-not-allowed bg-gray-600 opacity-30 rounded-3xl text-sm uppercase tracking-widest"
                disabled={true}
              >
                <span className="py-4"> Change email </span>
              </button>
            </div>
          </div>
        ) : changeAccountInfo === "password" && !googleAccount ? (
            <ChangePassword {...changePasswordModalProps} />
        ) : changeAccountInfo === "google" && !googleAccount ? (
            <LinkGoogleAccount />
        ) : (
            <IsGoogleAccount {...IsGoogleAccountProps} />
        )}
      </Modal>
    )
}