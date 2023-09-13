import { useState, Dispatch, SetStateAction, useContext } from 'react';
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import Modal from '../../../../../../../components/Modal'

import { UserDataCtx } from '../../../../../../../context/UserDataContext';

import ChangePassword from './ChangePassword';
import LinkGoogleAccount from './LinkGoogleAccount';
import IsGoogleAccount from './IsGoogleAccount';

type Props = {
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  register: UseFormRegister<FieldValues>;
  customOnCloseFunction?: () => any;
  reset: UseFormReset<FieldValues>;
  errors: FieldErrors<FieldValues>;
  open: boolean;
}

export default function OptionsModal({ open, setOpen, register, handleSubmit, reset, errors, customOnCloseFunction }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [changeAccountInfo, setChangeAccountInfo] = useState('');
    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [goBackButtonAction, setGoBackButtonAction] = useState<any>({ action: null });

    const { userData: { googleAccount, _id } } = useContext(UserDataCtx) as any;

    const handleModalClose = () => {
      if(customOnCloseFunction) customOnCloseFunction();
      setOpen(false);
      setTimeout(() => {
        setChangeAccountInfo('');
        setShowForm(false);
      }, 500);
    };

    const handleClickPassword = () => {
      setChangeAccountInfo("password");
      setShowGoBackButton(true);
      setGoBackButtonAction({
        action: () => {
          setChangeAccountInfo('');
          setGoBackButtonAction({ action: null })
        }
      })
    };

    const handleClickGoogleAccount = () => {
      setChangeAccountInfo("google");
      setShowGoBackButton(true);
      setGoBackButtonAction({
        action: () => {
          setChangeAccountInfo('');
          setGoBackButtonAction({ action: null })
        }
      })
    };

    const modalProps = {
        open,
        setOpen,
        title: "Account Settings",
        options: {
          onClose: handleModalClose,
          showGoBackButton: showGoBackButton,
          goBackButtonAction: goBackButtonAction.action,
          titleWrapperClassName: "px-6 mb-5",
          modalWrapperClassName: `!px-0 text-gray-100 !w-[22rem] ${googleAccount && "!w-[24rem]"} font-light xxs:!w-[19.4rem] overflow-x-hidden`,
        }
    };

    const changePasswordModalProps = { register, handleSubmit, reset, errors, setChangeAccountInfo, _id };
    const IsGoogleAccountProps = { register, handleSubmit, reset, errors, showForm, setShowForm, _id }

    return (  
      <Modal {...modalProps}>
        {changeAccountInfo === "" && !googleAccount ? (
          <div className="px-6 mt-1">
            <div className="flex flex-col space-y-4 text-gray-900 dark:text-gray-300">
              <button
                className="py-[13.5px] bg-[#dbdbdb] hover:bg-[#c0c0c0] dark:bg-[#32353b] dark:hover:!bg-[#222222] transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-wide hover:tracking-widest"
                onClick={() => handleClickPassword()}
              >
                <span className="py-4"> Change password </span>
              </button>
              <button
                className="py-[13.5px] bg-[#dbdbdb] hover:bg-[#c0c0c0] dark:bg-[#32353b] dark:hover:!bg-[#222222] transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-wide hover:tracking-widest"
                onClick={() => handleClickGoogleAccount()}
              >
                <span className="py-4"> Link a Google account </span>
              </button>
              <button
                className="py-[13.5px] cursor-not-allowed bg-[#dbdbdb] dark:bg-[#32353b] dark:hover:!bg-[#222222] opacity-30 rounded-3xl text-sm uppercase tracking-widest"
                disabled={true}
              >
                <span className="py-4"> Change email </span>
              </button>
            </div>
          </div>
        ) : changeAccountInfo === "password" && !googleAccount ? (
            <ChangePassword {...changePasswordModalProps} />
        ) : changeAccountInfo === "google" && !googleAccount ? (
            <LinkGoogleAccount _id={ _id }/>
        ) : (
            <IsGoogleAccount {...IsGoogleAccountProps} />
        )}
      </Modal>
    )
}