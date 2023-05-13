import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from 'react-hook-form';
import Countdown from 'react-countdown';

import { motion } from 'framer-motion';

import noapLogo from '../assets/logo/logo-white-no-bg.png';
import forgotPassword from '../assets/forgot-password.svg';

import { toastAlert } from '../components/Alert/Alert';
import SvgLoader from '../components/SvgLoader';

import api from '../services/api';

export default function LoginHelp() {
  const [ timer, setTimer ] = useState('');
  const [ userId, setUserId ] = useState('');
  const [ loader, setLoader ] = useState(false);
  const [ wasChanged, setWasChanged ] = useState(false);
  const [ triggerCode, setTriggerCode ] = useState<boolean | string>(false);

  const { handleSubmit, register, reset, formState } = useForm();
  const { errors } = formState;

  const navigate = useNavigate();

  const getEmail = async ({ email }: FieldValues) => {
    setLoader(true);
    try {
      const {data: { message, userId: _id }} = await api.post('/find-user', {email});
      toastAlert({ icon: 'success', title: message, timer: 2000 });      
      setTriggerCode(true);
      setLoader(false);
      setUserId(_id);
    } catch (err: any) {
      const {response: { data: {message, code, spam}}} = err;
      setLoader(false);
      setTimer(code === 3 ? 'maximum' : code === 4 && spam);

      toastAlert({ icon: 'error', title: message ? message : 'Internal error, please try again later!', timer: 2500 });
    }
  };

  const verifyCode = async ({ code }: FieldValues) => {
    setLoader(true);
    reset({code: ''});
    try {
      const {data: { message }} = await api.post('/verify-otp', { userId, otp: code });
      toastAlert({icon: 'success', title: message, timer: 2000});
      setTriggerCode('verified');
      setLoader(false);
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: err.response.data.message, timer: 2000});
    }
  }

  const changePasssword = async ({ password, confirmP }: FieldValues) => {
    setLoader(true);
    try {
      if(password !== confirmP) {
        setLoader(false);
        return toastAlert({icon: 'error', title: "Passwords don't match!", timer: 2500});
      }

      const {data: { message }} = await api.patch('/change-pass', { userId, password });
      toastAlert({icon: 'success', title: message, timer: 2000});
      setWasChanged(true);
      setLoader(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  }

  const renderer = ({ minutes, seconds, completed }: any) => {
    if (!completed) {
      return (
        <button className="bg-stone-700 hover:bg-stone-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out">
          <div className="flex flex-row justify-center py-[4px] px-5 xxs:px-10">          
            <p className='!text-xs pt-[1px] xxs:pt-[2.4px] mr-2'>
                you can send another email in {minutes} minute(s) : {seconds} second(s)
            </p>  
            <SvgLoader options={{LoaderClassName: "xxs:!h-5 xxs:!w-5 !my-auto"}}/>
          </div>
        </button>
      )
    }
    else return (
      <button className="bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out">
        {loader ? ( <SvgLoader options={{showLoadingText: true}}/> ) : ( <p className={`${loader && 'hidden'}`}>Send code</p> )}
      </button>
    )
  };

  return (
    <div className="!bg-gray-800 h-screen overflow-scroll">
      <div className="flex flex-row justify-between w-screen bg-stone-900 pb-3 pt-1 fixed z-10">
        <img src={noapLogo} className='w-[8rem] pl-5 pt-2' draggable={false}/> 
        <a  href='/' className='text-gray-200 text-sm font-light tracking-widest uppercase pt-[7.5px] px-3 mr-5 mt-[9px] h-9 rounded-full hover:!bg-red-700 border border-gray-500 transition-all duration-500 ease-in-out'>
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
              <p className='text-lg xxs:text-[15px] mt-10'>
                To restore your password, you need to have access to the email address which you created the account with.
                <br/>
                <br/>
                We will send a verification code to the email address, and you just need to copy and paste on the code text box.
              </p>
              <form onSubmit={triggerCode ? handleSubmit(verifyCode) : handleSubmit(getEmail)} noValidate className='mt-10'>
                <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                  {!triggerCode ? (
                    <>
                      <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                        {errors.email?.message as string}
                      </p>
                      <input
                        type="email"
                        className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${timer === "maximum" && "border !border-red-700 hover:!border-red-800"}`}
                        placeholder="Email"
                        {...register("email", {
                          required: "Email is required!",
                          pattern: { value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Invalid email!" }
                        })}
                      />
                      {(timer !== 'maximum' && timer !== '') ? ( <Countdown date={timer} renderer={renderer} /> ) : timer === 'maximum' ? (
                        <>
                          <p className='!mt-5 !mb-2 text-xs uppercase tracking-widest text-red-600 px-2'>Maximum number of emails exceeded and you will not be able to send more emails. Please wait 24 hours to send new emails!</p>
                          <button className='rounded-full py-2 text-sm uppercase tracking-widest bg-gray-600 hover:cursor-not-allowed opacity-60' disabled={true} type='button'>
                            Send code
                          </button>
                        </>
                      ) : (
                        <button className={`bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out`}>
                          {loader ? ( <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> ): ("Send code")}
                        </button>
                      )}                        
                    </>
                  ) : (
                    <>
                      <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                        {errors.code?.message as string}
                      </p>
                      <input 
                        type="number"
                        className='sign-text-inputs  bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                        placeholder='Enter the code sent to your email'
                        autoComplete='off'
                        {...register('code', {
                          required: "Insert a valid code!",
                          pattern: { value: /^[0-9]{0,4}$/, message: 'Invalid code!'}
                        })}
                      />
                      <button className='bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest hover:!text-[13px] transition-all duration-500 ease-in-out'>
                        {loader ? ( <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> ): ("Verify code")}
                      </button>
                      <button 
                        type='button'
                        className='border border-gray-600 hover:bg-stone-800 rounded-full !mt-2 py-2 text-sm uppercase tracking-widest hover:!text-[13px] transition-all duration-500 ease-in-out'
                        onClick={() => setTriggerCode(false)}
                      >
                        Didn't recive the code ?
                      </button>
                    </>
                  )}
                </div>
              </form>
            </>
          ) : (
            <>
              <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Reset your password</p>
                <form onSubmit={handleSubmit(changePasssword)} noValidate className='mt-2'>
                  <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                    <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                      {errors.password?.message as string}
                    </p>
                    <input
                      type="password"
                      className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                      placeholder="Password"
                      {...register("password", {
                        required: "Password is required!",
                        minLength: { value: 6, message: "Your password is too short!" },
                        maxLength: { value: 16, message: "Too many characters!" },
                      })}
                    />
                    <p className='text-red-500 ml-1 uppercase text-xs tracking-widest !mt-4'>
                      {errors.confirmP?.message as string}
                    </p>
                    <input
                      type="password"
                      className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                      placeholder="Confirm password"
                      {...register("confirmP", {
                        required: "Password is required!",
                        minLength: { value: 6, message: "Your password is too short!" },
                        maxLength: { value: 12, message: "Too many characters!" },
                      })}
                    />
                    <button className="bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out">
                      {loader ? ( <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> ): ("Change password")}
                    </button>
                    {wasChanged && (<p className='!mt-7 mx-auto animate-pulse text-sm uppercase tracking-widest'>Redirecting to sign in page...</p>)}
                </div>
              </form>
            </>
          )}
        </div>
        <img src={forgotPassword} className='xxs:w-[90%] xxs:h-auto w-[600px] h-[580px] mt-0 xxs:mt-5 object-cover opacity-90' draggable={false}/>
      </motion.div>      
      <p className='text-center mb-10 uppercase text-xs tracking-wide text-gray-300'>© 2023 Noap.</p>
    </div> 
  )
}