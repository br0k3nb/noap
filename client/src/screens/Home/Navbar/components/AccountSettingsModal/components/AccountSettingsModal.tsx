import { Dispatch, SetStateAction } from 'react';
import { useForm } from "react-hook-form";

import AuthUser from './AuthUser';
import OptionsModal from './OptionsModal/OptionsModal';

type Props = {
    open: boolean;
    openAccSettingsModal: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setUserIsAuth: Dispatch<SetStateAction<boolean>>;
    setOpenAccSettingsModal: Dispatch<SetStateAction<boolean>>;
    customOnCloseFunction?: () => any;
};

export default function index({ open, setOpen, setUserIsAuth, setOpenAccSettingsModal, openAccSettingsModal, customOnCloseFunction }: Props) {
    const { register, handleSubmit, reset, formState } = useForm();
    const { errors } = formState;

    const authUserModalProps = {
        open,
        reset,
        errors,
        setOpen,
        register,
        handleSubmit,
        customOnCloseFunction,
        setAuth: setUserIsAuth,
        setOpenSettings: setOpenAccSettingsModal
    }

    const optionsModalProps = {
        open: openAccSettingsModal,
        setOpen: setOpenAccSettingsModal,
        customOnCloseFunction,
        register,
        reset,
        handleSubmit,
        errors
    }

    return (
        <>
            <AuthUser {...authUserModalProps} />
            <OptionsModal {...optionsModalProps} />
        </>
    )
}