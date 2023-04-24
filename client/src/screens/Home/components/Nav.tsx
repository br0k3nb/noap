import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from 'react-hook-form';

import { useGoogleLogin } from "@react-oauth/google";

import { FcGoogle } from "react-icons/fc";

import {
  BsFillHouseDoorFill,
  BsJournalPlus,
  BsTagFill,
  BsFillCalendarEventFill,
  // BsFillGearFill,
  BsDoorOpenFill
} from "react-icons/bs";

import { BiLock } from "react-icons/bi";

import api from '../../../services/api';
import { toastAlert } from '../../../components/Alert/Alert';

// import { motion } from "framer-motion";

type NavProps = {
  addNewNote: () => Promise<void>;
  handleSignout: () => void
  expanded: boolean;
  newNote: boolean;
  navbar: boolean;
  token: {
    googleAccount: boolean;
    token: string;
    name: string;
    _id: string;
  }
};

export default function Nav({
  navbar,
  newNote,
  addNewNote,
  expanded,
  handleSignout,
  token
}: NavProps) {
  const [ auth, setAuth ] = useState(false);
  const [ checked, setChecked ] = useState(false);
  const [ changeInfo, setChangeInfo ] = useState('');
  const [ convertAcc, setConvertAcc ] =  useState('');
  const [ svgLoader, setSvgLoader ] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;

  const navigate = useNavigate();

  const authUser = async (data: FieldValues) => {
    setSvgLoader(true);

    try {
      const verify = await api.post(`https://noap-typescript-api.vercel.app/verify-user/${token.token}`, {
        password: data.password,
        _id: token._id
      }, {
        headers: { 
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Disposition': 'form-data'
        }
      });

      setAuth(true);  
      setSvgLoader(false);

      reset({password: ''});
      
      toastAlert({icon: 'success', title: `${verify.data.message}`, timer: 2500});
    } catch (err: any) {
      setSvgLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2500});
    }
  };

  const changePassword = async (data: FieldValues) => {
    setSvgLoader(true);

    try {
      const { password, confirmPassword } = data;  

      if(password !== confirmPassword) {
        setSvgLoader(false);
        return toastAlert({icon: 'error', title: "Passwords don't match!", timer: 2500});
      }
      
      const changeP = await api.patch('https://noap-typescript-api.vercel.app/change-pass', {
        password,
        userId: token._id
      }, {
        headers: { 
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Disposition': 'form-data'
        }
      });

      setSvgLoader(false);
      reset({password: '', confirmPassword: ''});
      toastAlert({icon: 'success', title: `${changeP.data.message}`, timer: 2500});
    } catch (err: any) {
      setSvgLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2500});
    }
  };

  const handleAccountConversion = async (data: FieldValues) => {
    setSvgLoader(true);

    try {
    
      if(data.password !== data.confirmPassword) {
        setSvgLoader(false);
        return toastAlert({icon: 'error', title: "Passwords don't match!", timer: 2500});
      }
      
      const convertAccount = await api.patch(`https://noap-typescript-api.vercel.app/convert/account/email/${token.token}}`, {
        password: data.password,
        _id: token._id
      });

      setSvgLoader(false);
      setConvertAcc('redirect');
      reset({password: '', confirmPassword: ''});
      toastAlert({icon: 'success', title: `${convertAccount.data.message}`, timer: 3000});

      setTimeout(() => {
        navigate('/');
        window.localStorage.removeItem("user_token");
      }, 2000);
    } catch (err: any) {
      setSvgLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2500});      
    }
  }

  const linkGAcc = useGoogleLogin({
    onSuccess: (codeResponse) => {
      fetchGoogleAccountData(codeResponse);
    },
    onError: (error) =>
      toastAlert({
        icon: "error",
        title: `Login failed, ${error}}`,
        timer: 2500,
      }),
  });

  const fetchGoogleAccountData = async (codeResponse: any) => {
    setSvgLoader(true);

    try {
      if (codeResponse) {
        const userData = await api.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${codeResponse.access_token}`,
              Accept: "application/json",
            },
          }
        );

        const { email, name, id } = userData.data;

        const createUser = await api.patch(`https://noap-typescript-api.vercel.app/convert/account/google/${token.token}`, { 
            email,
            name,
            id, _id: token._id 
          }
        );
        
        setSvgLoader(false);
        setConvertAcc('redirect');

        toastAlert({icon: 'success', title: `${createUser.data.message}`, timer: 3000});

        setTimeout(() => {
          navigate('/');
          window.localStorage.removeItem("user_token");
        }, 2000);
      }
    } catch (err: any) {
      setSvgLoader(false);
      console.log(err);
      toastAlert({
        icon: "error",
        title: `${err?.response.data.message}`,
        timer: 3000,
      });
    }
  };

  const handleModalClose = () => {
    reset({
      password: '',
      confirmPassword: ''
    });

    setChecked(false);
    setChangeInfo('');
    setTimeout(() => setConvertAcc(''), 500);
  };

  return (
    <div className={`${expanded && "hidden"}`}>
      <input
        checked={checked}
        readOnly
        type="checkbox"
        className="modal-toggle"
      />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label 
          className={`modal-box relative !px-0 !text-gray-100 max-w-none !w-80 sm:!w-96 max-h-[23.4rem] !bg-gray-800 !font-light ${auth && changeInfo === '' && 'max-h-[23.4rem]'} ${token?.googleAccount && !convertAcc ? '!max-h-[30rem] !w-[90%]' : (token?.googleAccount && convertAcc) &&'!max-h-[24rem] '} transition-all duration-500`} 
        >
          <div className="flex flex-row justify-between pb-2 px-6">
            <h3 className="text-2xl xxs:text-xl tracking-tighter transition-all duration-500">Change login details</h3>
            <label 
              htmlFor="my-modal-4" 
              className="btn btn-sm btn-circle"
              onClick={() => handleModalClose()}
            >
              ✕
            </label>
          </div>
          <div className='bg-gray-600 !h-[1px] mt-3' />
          <div className="flex flex-col mt-4">
            {!auth && !token?.googleAccount ? (
              <div className="px-6">
                <div className="flex flex-col space-y-2">
                  <p className='text-xl'>Confirm your identity</p>
                  <p className='text-base text-gray-400'>To change yout account information, you have to authenticate first!</p>
                </div>
                <div className="flex flex-col space-y-2 mt-10">
                  <form onSubmit={handleSubmit(authUser)} noValidate>
                    <p className='text-red-500 ml-1 !mb-2 uppercase text-sm tracking-widest'>
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
                          message: "Password is too short!"
                        },
                        maxLength: {
                          value: 12,
                          message: "Too many characters!"
                        },
                      })}
                    />
                    <button 
                      className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out w-full`}
                    >
                      <div className={`${!svgLoader && 'hidden'} flex flex-row justify-center`}>
                        <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        <span className='pb-[2px] xxs:pt-[2.4px]'>
                          Loading...  
                        </span>
                      </div>
                      <p className={`${svgLoader && 'hidden'}`}>Confirm</p>
                    </button>
                  </form>
                </div>
              </div>
            ) : auth && !token?.googleAccount ? (
              <>
              {changeInfo === '' ? (
                <div className="px-6 mt-1">
                  <div className="flex flex-col space-y-4">
                      <button className='py-[13.5px]' onClick={() => setChangeInfo('password')}>
                        <span className='py-4 px-[5.7rem] xxs:px-[3.7rem] hover:bg-gray-600 bg-gray-700 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-widest'>Change password</span>
                      </button>
                      <button className='py-[13.5px]' onClick={() => setChangeInfo('google')}>
                        <span
                          className='py-4 px-[4.2rem] xxs:px-[3.7rem] hover:bg-gray-600 bg-gray-700 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-widest'
                        >
                          Link a Google account
                        </span>
                      </button>
                      <button className='py-[13.5px] cursor-not-allowed' disabled={true}>
                        <span className='py-4 px-[6.9rem] xxs:px-[4.9rem] bg-gray-600 opacity-30 rounded-3xl text-sm uppercase tracking-widest'>Change email</span>
                      </button>
                  </div>
                </div>
              ) : changeInfo === 'password' ? (
                <form onSubmit={handleSubmit(changePassword)} noValidate>
                    <div className="flex flex-col space-y-2 px-6 ">
                      <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
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
                            message: "Password is too short!"
                          },
                          maxLength: {
                            value: 12,
                            message: "Too many characters!"
                          },
                        })}
                      />
                      <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                        {errors.confirmPassword?.message as string}
                      </p>
                      <input
                        type="password"
                        autoComplete='off'
                        className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400`}
                        placeholder='Confirm password'
                        required
                        {...register("confirmPassword", {
                          required: "Password is required!",
                          minLength: {
                            value: 6,
                            message: "Password is too short!"
                          },
                          maxLength: {
                            value: 12,
                            message: "Too many characters!"
                          },
                        })}
                      />
                    </div>
                    <button 
                      className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out w-[21rem] xxs:!w-[17rem] mx-6`}
                    >
                      <div className={`${!svgLoader && 'hidden'} flex flex-row justify-center`}>
                        <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        <span className='pb-[2px] xxs:pt-[2.4px]'>
                          Loading...  
                        </span>
                      </div>
                      <p className={`${svgLoader && 'hidden'}`}>Change password</p>
                    </button>
                </form>
              ) : (
                <div className="px-6">
                  <p className='text-xl tracking-tight mb-3'>Sign in with google</p>
                  <p className='text-base tracking-tight mb-6'>After siging in with google, you wont be able to use your email to login again!</p>
                  <button
                    type="button"
                    onClick={() => linkGAcc()}
                    className="text-gray-900 mb-5 bg-gray-200 trasition-all duration-200 ease-in-out uppercase rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full py-2 hover:bg-gray-300"
                  >
                    <div
                      className={`flex flex-row justify-center py-[1px] ${!svgLoader && 'hidden'}`}
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 mr-3 animate-spin xxs:my-1 my-[1.5px] text-black"
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
                      <span className="pt-0 xxs:pt-[2.4px]">Loading...</span>
                    </div>
                    <div
                      className={`flex items-center justify-center ${svgLoader && 'hidden'}`}
                    >
                      <FcGoogle size={26} className="mr-2" />
                      <span className="">Link a google account</span>
                    </div>
                  </button>
                  {convertAcc === 'redirect' && (
                    <div className="flex items-center justify-center">
                      <div className="!mt-2 animate-pulse text-sm uppercase tracking-widest">
                        <p>Redirecting to sign in page...</p>    
                      </div>
                    </div>
                  )}
                </div>
              )}
              </>
            ) : (
              <>
                {convertAcc !== 'password' && convertAcc === '' ? (
                  <div className="px-6">
                    <div className="alert shadow-md shadow-gray-900">
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className='text-sm uppercase'>
                          Accounts created with Google are not eligible to change the account information.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 text-gray-200 text-sm">
                      <p className=''>
                        To be able to change your account information, you need to convert your account created with Google, to a normal account.
                      </p>
                      <p className='mt-2'>
                        The conversion is simple, after clicking the convert button, you'll need to create a password and click the send button. After that, your acccount will be converted and to sign in again, you'll need to use your google email and the password that you've created. 
                      </p>
                    </div>  
                    <button className='mt-9 w-full mb-5' onClick={() => setConvertAcc('password')}>
                      <span 
                        className='py-4 px-[26%] hover:bg-gray-600 bg-gray-700 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-widest'
                      >
                        Convert account
                      </span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(handleAccountConversion)} noValidate className='mt-2'>
                    <div className="flex flex-col space-y-2 px-6 ">
                        <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
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
                              message: "Password is too short!"
                            },
                            maxLength: {
                              value: 12,
                              message: "Too many characters!"
                            },
                          })}
                        />
                        <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                          {errors.confirmPassword?.message as string}
                        </p>
                        <input
                          type="password"
                          autoComplete='off'
                          className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400`}
                          placeholder='Confirm password'
                          required
                          {...register("confirmPassword", {
                            required: "Password is required!",
                            minLength: {
                              value: 6,
                              message: "Password is too short!"
                            },
                            maxLength: {
                              value: 12,
                              message: "Too many characters!"
                            },
                          })}
                        />
                      </div>
                    <button 
                      className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out w-[21rem] xxs:!w-[17rem] mx-6`}
                    >
                      <div className={`${!svgLoader && 'hidden'} flex flex-row justify-center`}>
                        <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        <span className='pb-[2px] xxs:pt-[2.4px]'>
                          Loading...  
                        </span>
                      </div>
                      <p className={`${svgLoader && 'hidden'}`}>Send</p>
                    </button>

                    {convertAcc === 'redirect' && (
                      <div className="flex items-center justify-center">
                        <div className="!mt-4 animate-pulse text-sm uppercase tracking-widest">
                          <p>Redirecting to sign in page...</p>    
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </>
            )}
          </div>
        </label>
      </label>
      <div
        className={`fixed ${
          !navbar && "flex xxs:hidden"
        }`}
      >
        <div 
          className="flex flex-col items-center w-[60px] h-screen overflow-hidden text-gray-400 bg-stone-900 justify-end"
        >
          <div
            className="flex items-center justify-center w-11 h-11 pb-1 mt-auto hover:text-gray-300 absolute top-6"
          >
            <div className="dropdown dropdown-right pt-[6.2px]">
              <label tabIndex={0} className="">
                <div className="tooltip tooltip-right text-gray-100 before:text-[15px]" data-tip="Account">
                  <div className="rounded-full border !border-gray-500 bg-stone-700 hover:bg-stone-800 text-lg w-[2.75rem] h-[2.75rem] transition-all duration-500 ease-in-out">
                    <p className='mt-[7px]'>
                      {token?.name && token?.name[0].toUpperCase()}
                    </p>
                  </div>
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu shadow w-64 rounded-xl bg-stone-800"
              >
                <li className="">
                  {/* <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => setChecked(!checked)}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <p>Account settings</p>
                        <BsFillPersonLinesFill size={19} className="pt-1"/>
                      </div>
                    </label>
                  </a>
                  <div className="mx-2 border border-transparent !border-b-gray-700 !h-[1px] p-0 !rounded-none"/> */}
                  <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => setChecked(true)}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <span>Change login information</span>  
                        <BiLock size={22} className="pt-1"/>
                      </div>
                    </label>
                  </a>
                  <div className="mx-2 border border-transparent !border-b-stone-900 !h-[1px] p-0 !rounded-none"/>
                  <a
                    className="active:!bg-gray-600 rounded-xl"
                    onClick={() => handleSignout()}
                  >
                    <label htmlFor="my-modal-4" className="text-gray-300">
                      <div className="flex flex-row space-x-2">
                        <p>Log out</p>
                        <BsDoorOpenFill size={19} className="pt-1"/>
                      </div>
                    </label>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="!bg-gray-600 h-1 w-1 rounded-full absolute top-[98px]"/>
          <div className="flex flex-col items-center absolute top-28">
            <div className="tooltip tooltip-right text-gray-300" data-tip="Home">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillHouseDoorFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div
              className={`tooltip tooltip-right text-gray-100 ${newNote && 'tooltip-open'}`}
              data-tip={`${newNote ? "Adding note..." : "Add new note"}`}
            >
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                onClick={() => addNewNote()}
              >
                {newNote ? (
                  <svg aria-hidden="true" role="status" className="inline w-5 h-5 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>
                ) : (
                  <BsJournalPlus className="text-gray-300" size={23} />
                )}
              </a>
            </div>
            <div className="tooltip tooltip-right text-gray-300" data-tip="Labels">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsTagFill className="text-gray-300" size={23} />
              </a>
            </div>
            <div className="tooltip tooltip-right text-gray-300" data-tip="Events">
              <a
                className="flex items-center justify-center w-16 h-12 mt-2 hover:bg-gray-700 hover:text-gray-300"
                href="#"
              >
                <BsFillCalendarEventFill className="text-gray-300 " size={22} />
              </a>
            </div>
            {/* <div className="flex items-center justify-center h-12 pt-1 hover:bg-gray-700 hover:text-gray-300 mt-2">
              <div className="dropdown">
                <label tabIndex={0} className="px-5 py-4">
                  <div className="tooltip tooltip-right text-gray-300" data-tip="Settings">
                    <BsFillGearFill className="text-gray-300" size={23} />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a
                      className="active:!bg-gray-600"
                      onClick={() => handleSignout()}
                    >
                      <label htmlFor="my-modal-4" className="text-gray-200">
                        <div className="flex flex-row space-x-2">
                          <p>Log out</p>
                          <BsDoorOpenFill size={19} className="pt-1"/>
                        </div>
                      </label>
                    </a>
                  </li>
                </ul>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}