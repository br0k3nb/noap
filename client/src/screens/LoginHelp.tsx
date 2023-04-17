import { useState, useRef } from 'react';

import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from 'react-hook-form';

import noapLogo from '../assets/logo/logo-white-no-bg.png';
import forgotPassword from '../assets/forgot-password.svg';

import { toastAlert } from '../components/Alert/Alert';
import api from '../services/api';

type Props = {}

export default function LoginHelp({}: Props) {
  const [ loader, setLoader ] = useState(false);
  const [ wasChanged, setWasChanged ] = useState(false);
  const [ triggerCode, setTriggerCode ] = useState<boolean | string>(false);

  const { handleSubmit, register, reset } = useForm();
  const userId = useRef<string>('');

  const navigate = useNavigate();

  const getEmail = async (data: FieldValues) => {
    setLoader(true);
    // reset({email: ''});
  
    try {
      const findUser = await api.post('https://noap-typescript-api.vercel.app/find-user', {
        email: data?.email
      }, {
        headers: { 
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Disposition': 'form-data'
        }
      });

      setLoader(false);
      setTriggerCode(true);

      userId.current = findUser.data.userId;
      toastAlert({icon: 'success', title: `${findUser.data.message}`, timer: 2000});
    } catch (err: any) {
      setLoader(false);
      console.log(err);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  };

  const verifyCode = async (data: FieldValues) => {
    setLoader(true);
    reset({code: ''});

    try {
      const verifyOTP = await api.post('https://noap-typescript-api.vercel.app/verify-otp', {
        userId: userId.current,
        otp: data.code,
      }, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Disposition': 'form-data',
          "Access-Control-Allow-Origin": "*",
        }
      });
  
      setLoader(false);
      setTriggerCode('verified');

      toastAlert({icon: 'success', title: `${verifyOTP.data.message}`, timer: 2000});
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  }

  const changePasssword = async (data: FieldValues) => {
    setLoader(true);

    try {
      if(data.password === data.confirmP) {
        const changePassword = await api.patch('https://noap-typescript-api.vercel.app/change-pass', {
          userId: userId.current,
          password: data.password
        }, {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Disposition': 'form-data',
            "Access-Control-Allow-Origin": "*",
          }
        });
    
        setLoader(false);
        setWasChanged(true);

        toastAlert({icon: 'success', title: `${changePassword.data.message}`, timer: 2000});

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }

      else {
        setLoader(false);
        return toastAlert({icon: 'error', title: "Passwords don't match!", timer: 2500});
      }
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  }

  return (
    <div className="!bg-gray-800 h-screen overflow-scroll">
      <div className="flex flex-row justify-between w-screen bg-stone-900 pb-3 pt-1 fixed z-10">
        <img src={noapLogo} className='w-[8rem] pl-5 pt-2' draggable={false}/> 
        <a
          className='text-gray-200 text-sm font-light tracking-widest uppercase pt-[7.5px] px-3 mr-5 mt-[9px] h-9 rounded-full hover:!bg-red-700 border border-gray-500 hover:px-[0.86rem] transition-all duration-500 ease-in-out'
          href='/'
        >
          Sign In
        </a>
      </div>
      <motion.div 
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}  
        className="flex lg:flex-row flex-col space-x-5 px-6 mx-auto max-w-xl lg:!max-w-6xl mt-28 xxs:mt-12"
      >
        <div className="flex flex-col mt-[4.2rem] w-full text-gray-300">
          {triggerCode !== 'verified' ? (
            <>
              <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Forgot your password ? </p>
              <p className='text-xl xxs:text-lg font-light tracking-tight mt-2 text-gray-400'>Don't worry, we're gonna help you!</p>
              <div className="flex flex-col mt-10">
                <p className='text-lg xxs:text-[15px]'>
                  To restore your password, you need to have access to the email address which you created the account with.
                  <br/>
                  <br/>
                  We will send a verification code to the email address, and you just need to copy and paste on the code text box.
                </p>
              </div>
              <div className="mt-5">
                <form action="" onSubmit={triggerCode ? handleSubmit(verifyCode) : handleSubmit(getEmail)} >
                  <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                    {!triggerCode ? (
                      <>
                        <input 
                          type="email"
                          required 
                          className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                          placeholder='Email address'
                          autoComplete='off'
                          {...register('email')}
                        />
                        <button 
                          className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out`}
                        >
                          <div className={`${!loader && 'hidden'} flex flex-row justify-center py-[1px]`}>
                            <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                            </svg>
                            <span className='pt-0 xxs:pt-[2.4px]'>
                              Loading...  
                            </span>
                          </div>
                          <p className={`${loader && 'hidden'}`}>Send code</p>
                        </button>
                      </>
                    ) : (
                      <>
                        <input 
                          type="number"
                          required 
                          className='sign-text-inputs  bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                          placeholder='Enter the code sent to your email'
                          autoComplete='off'
                          {...register('code')}
                        />
                        <button 
                          className='bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest hover:!text-[13px] transition-all duration-500 ease-in-out'
                        >
                          <div className={`${!loader && 'hidden'} flex flex-row justify-center py-[1px]`}>
                            <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                            </svg>
                            <span className='pt-0 xxs:pt-[2.4px]'>
                              Loading...  
                            </span>
                          </div>
                          <p className={`${loader && 'hidden'}`}>Verify code</p>
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Reset your password</p>
              <div className="mt-2">
                <form action="" onSubmit={handleSubmit(changePasssword)} >
                  <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                    <input 
                      type="text"
                      required 
                      className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                      placeholder='Password'
                      autoComplete='off'
                      {...register('password')}
                    />
                    <input 
                      type="text"
                      required 
                      className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                      placeholder='Confirm Password'
                      autoComplete='off'
                      {...register('confirmP')}
                    />
                    <button 
                      className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out`}
                    >
                      <div className={`${!loader && 'hidden'} flex flex-row justify-center py-[1px]`}>
                        <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                        </svg>
                        <span className='pt-0 xxs:pt-[2.4px]'>
                          Loading...  
                        </span>
                      </div>
                      <p className={`${loader && 'hidden'}`}>Change password</p>
                    </button>
                    {wasChanged && (
                      <div className="!mt-7 mx-auto animate-pulse text-sm uppercase tracking-widest">
                        <p>Redirecting to sign in page...</p>    
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
        <img src={forgotPassword} className='xxs:w-[90%] xxs:h-auto w-[600px] h-[580px] mt-0 xxs:mt-5 object-cover opacity-90' draggable={false}/>
      </motion.div>
      <div className="flex flex-row justify-center items-center mb-10 uppercase text-xs tracking-wide text-gray-300">
        <p>© 2023 Noap.</p>
      </div>
    </div> 
  )
}