import { useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from "react-router-dom";
import { UseFormRegister, UseFormHandleSubmit, FieldValues, FieldErrors, UseFormReset } from "react-hook-form";

import { toastAlert } from '../../../Alert';
import SvgLoader from '../../../SvgLoader';

import api from '../../../../services/api';

type Props = {
  _id: string;
  showForm: boolean;
  reset: UseFormReset<FieldValues>;
  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

export default function IsGoogleAccount({ register, reset, handleSubmit, errors, showForm, setShowForm, _id }: Props) {
    const [showSvgLoader, setshowSvgLoader] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const navigate = useNavigate();

    const handleAccountConversion = async ({ password, confirmPassword }: FieldValues) => {
        setshowSvgLoader(true);
    
        try {
          if(password !== confirmPassword) {
            setshowSvgLoader(false);
            return toastAlert({ icon: 'error', title: "Passwords don't match!", timer: 2500 });
          }
          
          const convertAccount = await api.patch(`/convert/account/email}`, { password, _id });
          toastAlert({ icon: 'success', title: `${convertAccount.data.message}`, timer: 3000 });
    
          setshowSvgLoader(false);
          setRedirect(true);
          reset({ password: '', confirmPassword: '' });
    
          setTimeout(() => {
            navigate('/');
            window.localStorage.removeItem("@NOAP:SYSTEM");
          }, 2000);
        } catch (err: any) {
          setshowSvgLoader(false);
          toastAlert({ icon: 'error', title: err.message, timer: 2500 });      
        }
    }

    return (
        <>
           {!showForm ? (
                <div className="px-6">
                    <div className="alert shadow-md">
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-current flex-shrink-0 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <p className="text-sm uppercase">Accounts created with Google are not eligible to change the account information.</p>
                        </div>
                    </div>
                    <div className="mt-5 text-[15px] text-gray-900 dark:text-gray-300">
                        <p>
                            To be able to change your account information, you need
                            to convert your account created with Google, to a normal
                            account.
                        </p>
                        <p className="mt-2">
                            The conversion is simple, after clicking the convert
                            button, you'll need to create a password and click the
                            send button. After that, your acccount will be converted
                            and to sign in again, you'll need to use your google
                            email and the password that you've created.
                        </p>
                    </div>
                    <button
                      className="mt-9 w-full py-3 font-normal text-white hover:bg-green-700 bg-green-600 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-wide hover:tracking-widest"
                      onClick={() => setShowForm(true)}
                    >
                      Convert account                     
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(handleAccountConversion)}
                    noValidate
                    className="mt-2 mx-6 text-gray-900 dark:text-gray-300"
                >
                    <div className="flex flex-col space-y-2">
                      <p className="text-red-500 ml-1 uppercase text-xs tracking-widest font-normal">
                        {errors.password?.message as string}
                      </p>
                      <input
                        type="password"
                        className={`sign-text-inputs dark:bg-stone-900 border border-gray-600 shadow-none`}
                        placeholder="Password"
                        required
                        {...register("password", {
                          required: "Password is required!",
                          minLength: { value: 6, message: "Password is too short!" },
                          maxLength: { value: 12, message: "Too many characters!" }
                        })}
                      />
                      <p className="text-red-500 ml-1 uppercase text-xs tracking-widest font-normal">
                        {errors.confirmPassword?.message as string}
                      </p>
                      <input
                        type="password"
                        autoComplete="off"
                        className={`sign-text-inputs dark:bg-stone-900 border border-gray-600 shadow-none`}
                        placeholder="Confirm password"
                        required
                        {...register("confirmPassword", {
                            required: "Password is required!",
                            minLength: { value: 6, message: "Password is too short!" },
                            maxLength: { value: 12, message: "Too many characters!" }
                        })}
                      />
                    </div>
                    <button
                      className="mt-8 w-full py-[10px] font-normal text-white hover:bg-green-700 bg-green-600 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-wide hover:tracking-widest"
                    >
                      {showSvgLoader ? <SvgLoader options={{ showLoadingText: true }} /> : "Convert"}
                    </button>                   
                    {redirect && (
                      <div className="flex items-center justify-center">
                        <div className="!mt-4 animate-pulse text-sm uppercase tracking-widest">
                          <p>Redirecting to sign in page...</p>
                        </div>
                      </div>
                    )}
                </form>
            )}
        </>
    )
}