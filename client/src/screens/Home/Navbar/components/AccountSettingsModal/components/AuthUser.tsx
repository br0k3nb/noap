import { useState, Dispatch, SetStateAction } from 'react'
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import Modal from '../../../../../../components/Modal'
import { toastAlert } from '../../../../../../components/Alert/Alert';
import SvgLoader from '../../../../../../components/SvgLoader';

import api from '../../../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setOpenSettings: Dispatch<SetStateAction<boolean>>;
    register: UseFormRegister<FieldValues>;
    setAuth: Dispatch<SetStateAction<boolean>>;
    handleSubmit: UseFormHandleSubmit<FieldValues>;
    reset: UseFormReset<FieldValues>;
    errors: FieldErrors<FieldValues>;
}

export default function AuthUser({ setAuth, register, reset, handleSubmit, errors, open, setOpen, setOpenSettings }: Props) {
    const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { token, _id } = parsedUserToken;

    const [ showSvgLoader, setshowSvgLoader ] = useState(false);

    const authUser = async ({ password }: FieldValues) => {
        setshowSvgLoader(true);

        try {
            const verify = await api.post(`/verify-user`, { password, _id });

            setAuth(true);  
            setshowSvgLoader(false);
            setOpen(false);
            setTimeout(() => setOpenSettings(true));

            reset({password: ''});
            toastAlert({icon: 'success', title: `${verify.data.message}`, timer: 2500});
        } catch (err: any) {
            setshowSvgLoader(false);
            toastAlert({icon: 'error', title: `${err.message}`, timer: 2500});
        }
    };

    const handleModalClose = () => {
        reset({ password: '' });
        setOpen(false);
    };

    const modalProps = {
        open,
        setOpen,
        title: "Account Settings",
        options: {
          onClose: handleModalClose,
          titleWrapperClassName: "px-6 mb-4",
          modalWrapperClassName: "!px-0 text-gray-100 !w-[22rem] xxs:!w-[19.4rem] font-light"
        }
    }

    return (
        <Modal {...modalProps}>
          <div className="px-6">
              <div className="flex flex-col space-y-2 ">
                <p className="text-xl">Confirm your identity</p>
                <p className="text-base text-gray-400">
                  To change yout account information, you have to authenticate
                  first!
                </p>
              </div>
              <div className="flex flex-col space-y-2 mt-5">
                <form onSubmit={handleSubmit(authUser)} noValidate>
                  <p className="text-red-500 ml-1 !mb-2 uppercase text-sm tracking-widest">
                    {errors.password?.message as string}
                  </p>
                  <input
                    type="password"
                    className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400`}
                    placeholder="Password"
                    required
                    {...register("password", {
                      required: "Password is required!",
                      minLength: { value: 6, message: "Password is too short!" },
                      maxLength: { value: 12, message: "Too many characters!" }
                    })}
                  />
                  <button className="bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out w-full">
                    {showSvgLoader ? ( <SvgLoader options={{showLoadingText: true}} /> ) : ("Confirm")}
                  </button>
                </form>
              </div>
          </div>
        </Modal>
    )
}