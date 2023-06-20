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
};

export default function index({ open, setOpen, setUserIsAuth, setOpenAccSettingsModal, openAccSettingsModal }: Props) {
    const { register, handleSubmit, reset, formState } = useForm();
    const { errors } = formState;

    const authUserModalProps = {
        open,
        reset,
        errors,
        setOpen,
        register,
        handleSubmit,
        setAuth: setUserIsAuth,
        setOpenSettings: setOpenAccSettingsModal
    }

    const optionsModalProps = {
        open: openAccSettingsModal,
        setOpen: setOpenAccSettingsModal,
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