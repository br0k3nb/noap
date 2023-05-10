import { Dispatch, SetStateAction } from 'react';
import { useForm } from "react-hook-form";

import AuthUser from './AuthUser';
import OptionsModal from './OptionsModal/OptionsModal';

type Props = {
    open: boolean;
    openSettingsModal: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setUserIsAuth: Dispatch<SetStateAction<boolean>>;
    setOpenSettingsModal: Dispatch<SetStateAction<boolean>>;
};

export default function index({ open, setOpen, setUserIsAuth, setOpenSettingsModal, openSettingsModal }: Props) {
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
        setOpenSettings: setOpenSettingsModal
    }

    const optionsModalProps = {
        open: openSettingsModal,
        setOpen: setOpenSettingsModal,
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