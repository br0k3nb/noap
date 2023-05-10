import { useState, Dispatch, SetStateAction } from 'react'
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import Modal from '../../../../../../components/Modal'
import { toastAlert } from '../../../../../../components/Alert/Alert';

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

    const authUser = async (data: FieldValues) => {
        setshowSvgLoader(true);

        try {
            const verify = await api.post(`/verify-user/${token}`, {
                password: data.password,
               _id 
            });

            setAuth(true);  
            setshowSvgLoader(false);
            setOpen(false);
            setTimeout(() => setOpenSettings(true));

            reset({password: ''});
            toastAlert({icon: 'success', title: `${verify.data.message}`, timer: 2500});
        } catch (err: any) {
            setshowSvgLoader(false);
            toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2500});
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
            titleWrapperClassName: "px-6 mb-5",
            modalWrapperClassName: "!px-0 text-gray-100 !w-96 font-light",
        }
    }

    return (
        <Modal {...modalProps}>
            <div className="px-6">
                <div className="flex flex-col space-y-2">
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
                        minLength: {
                          value: 6,
                          message: "Password is too short!",
                        },
                        maxLength: {
                          value: 12,
                          message: "Too many characters!",
                        },
                      })}
                    />
                    <button
                      className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out w-full`}
                    >
                      <div className={`flex flex-row justify-center ${!showSvgLoader && "hidden"}`}>
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
                        <span className="pb-[2px] xxs:pt-[2.4px]">
                          Loading...
                        </span>
                      </div>
                      <p className={`${showSvgLoader && "hidden"}`}>Confirm</p>
                    </button>
                  </form>
                </div>
            </div>
        </Modal>
    )
}