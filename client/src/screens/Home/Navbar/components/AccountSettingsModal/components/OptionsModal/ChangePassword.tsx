import { useState, Dispatch, SetStateAction } from 'react'
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import { toastAlert } from '../../../../../../../components/Alert/Alert';
import SvgLoader from '../../../../../../../components/SvgLoader';

import api from '../../../../../../../services/api';

type Props = {
    reset: UseFormReset<FieldValues>;
    errors: FieldErrors<FieldValues>;
    register: UseFormRegister<FieldValues>;
    handleSubmit: UseFormHandleSubmit<FieldValues>;
    setChangeAccountInfo: Dispatch<SetStateAction<string>>;
}

export default function ChangePassword({ register, handleSubmit, errors, reset }: Props) {
    const [ showSvgLoader, setshowSvgLoader ] = useState(false);

    const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
    const { _id } = parsedUserToken;

    const changePassword = async ({ password, confirmPassword }: FieldValues) => {
        setshowSvgLoader(true);
    
        try {
          if(password !== confirmPassword) {
            setshowSvgLoader(false);
            return toastAlert({ icon: 'error', title: "Passwords don't match!", timer: 2500 });
          }
          
          const changeP = await api.patch('/change-pass', { password, userId: _id});
    
          setshowSvgLoader(false);
          reset({ password: '', confirmPassword: '' });
          toastAlert({icon: 'success', title: `${changeP.data.message}`, timer: 2500});
        } catch (err: any) {
          setshowSvgLoader(false);
          toastAlert({icon: 'error', title: `${err.message}`, timer: 2500});
        }
    };    

    return (
        <>
            <form onSubmit={handleSubmit(changePassword)} noValidate>
                <div className="flex flex-col space-y-2 px-6 ">
                    <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                        {errors.password?.message as string}
                    </p>
                    <input
                        type="password"
                        className="sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400"
                        placeholder="Password"
                        required
                        {...register("password", {
                            required: "Password is required!",
                            minLength: { value: 6, message: "Password is too short!" },
                            maxLength: { value: 12, message: "Too many characters!" }
                        })}
                    />
                    <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                        {errors.confirmPassword?.message as string}
                    </p>
                    <input
                        type="password"
                        autoComplete="off"
                        className="sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400"
                        placeholder="Confirm password"
                        required
                        {...register("confirmPassword", {
                            required: "Password is required!",
                            minLength: { value: 6, message: "Password is too short!" },
                            maxLength: { value: 12, message: "Too many characters!" }
                        })}
                    />
                </div>
                <div className="flex items-center justify-center">
                    <button className="bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out xxs:!w-[17rem]">
                        {showSvgLoader ? (<SvgLoader options={{ showLoadingText: true }} />) : ( <p className='py-[0.18rem]'>Change password</p> )}
                    </button>
                </div>
            </form>
        </>
    )
}