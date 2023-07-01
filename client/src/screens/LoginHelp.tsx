import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from 'react-hook-form';
import Countdown from 'react-countdown';

import { motion } from 'framer-motion';

import noapLogo from '../assets/logo/logo-white-no-bg.png';
import forgotPassword from '../assets/forgot-password.svg';

import Verify2FAModal from '../components/Verify2FAModal';
import { toastAlert } from '../components/Alert/Alert';
import SuccessCheck from '../components/SuccessCheck';
import SvgLoader from '../components/SvgLoader';

import api from '../services/api';

export default function LoginHelp() {
  const [timer, setTimer] = useState('');
  const [userId, setUserId] = useState('');
  const [loader, setLoader] = useState(false);
  const [wasChanged, setWasChanged] = useState(false);
  const [needHelpWith, setNeedHelpWith] = useState("");
  const [openTFAModal, setOpenTFAModal] = useState(false);
  const [triggerCode, setTriggerCode] = useState<boolean | string>(false);

  const { handleSubmit, register, reset, formState } = useForm();
  const { errors } = formState;

  const navigate = useNavigate();

  const getEmail = async ({ email }: FieldValues) => {
    setLoader(true);

    try {
      const { data: { message, userId: _id, code } } = await api.post('/find-user', {
        email, 
        remove2FA: needHelpWith 
      });

      if(code && code === 5) setOpenTFAModal(true);
      else {
        setTriggerCode(true);
        toastAlert({ icon: 'success', title: message, timer: 2000 });
      }
      setUserId(_id);
    } catch (err: any) {
      const { message, code, spam } = err;
      if(code) setTimer(code === 3 ? 'maximum' : code === 4 && spam);

      toastAlert({ icon: 'error', title: message, timer: 2500 });
    } finally {
      setLoader(false);
    }
  };

  const verifyCode = async ({ code }: FieldValues) => {
    setLoader(true);
    reset({code: ''});

    try {
      const {data: { message }} = await api.post('/verify-otp', { userId, otp: code });
      toastAlert({icon: 'success', title: message, timer: 2000});

      if(needHelpWith === "2fa") unlink2FA(userId);
      else {
        setTriggerCode('verified');
        setLoader(false);
      }
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: err.message, timer: 2000});
    }
  }

  const unlink2FA = async (userId : string) => {
    try {
      const {data: { message }} = await api.post("/2fa/remove", { userId });
      toastAlert({icon: 'success', title: message, timer: 2000});

      setTriggerCode('verified');
      setLoader(false);
    } catch (err: any) {
      setLoader(false);
      toastAlert({icon: 'error', title: err.message, timer: 2000});
    }
  };

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
      toastAlert({icon: 'error', title: `${err.message}`, timer: 2000});
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
            <SvgLoader options={{ showLoadingText: false, LoaderClassName: "xxs:!h-5 xxs:!w-5 !my-auto" }}/>
          </div>
        </button>
      )
    }
    else {
      return (
        <button className="bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest transition-all duration-500 ease-in-out">
          {loader ? ( 
            <SvgLoader options={{ showLoadingText: true }}/> 
          ) : ( 
            "Send code"
          )}
        </button>
      )
    }
  };

  return (
    <div className="!bg-gray-800 h-screen overflow-scroll">
      <Verify2FAModal
        open={openTFAModal}
        setOpen={setOpenTFAModal}
        useNav={false}
        customSetter={setTriggerCode}
        customSetterContent={"verified"}
        customUserId={{ _id: userId }}
      />
      <div className="flex flex-row justify-between w-screen bg-gray-900 border border-transparent border-b-gray-600 pb-3 pt-1 fixed z-10">
        <img src={noapLogo} className='w-[8rem] pl-5 pt-2' draggable={false}/> 
        <a  
          className='text-gray-200 text-sm font-light tracking-widest uppercase pt-[7.5px] px-3 mr-5 mt-[9px] h-9 rounded-full hover:!bg-red-700 border border-gray-500 transition-all duration-500 ease-in-out'
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
        <div 
          className={`
            flex flex-col !mt-[3.5rem] w-full text-gray-300 xxs:px-6
            ${needHelpWith === "pass" || needHelpWith === "2fa" && "!lg:px-5 xl:px-0"}
          `}
        >
          {triggerCode !== 'verified' ? (
            <>
              {needHelpWith.length === 0 ? (
                <>
                  <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Welcome to the account help center</p>
                  <div className="mx-0 md:mx-10">
                    <p className='text-[15.5px] xxs:text-xs mt-12 text-center xxs:text-start tracking-widest uppercase'>
                      Please, choose a topic to get help with
                    </p>
                    <div className="flex flex-col space-y-5 mt-5">
                      <button
                        className='sign-text-inputs xxs:text-xs shadow-md shadow-black/30 bg-red-800 hover:bg-red-900 text-gray-300 text-sm uppercase tracking-widest'
                        onClick={() => setNeedHelpWith("2fa")}
                      >
                        Two factor authentication
                      </button>
                      <button
                        className='sign-text-inputs xxs:text-xs shadow-md shadow-black/30 bg-red-800 hover:bg-red-900 text-gray-300 text-sm uppercase tracking-widest'
                        onClick={() => setNeedHelpWith("pass")}
                      >
                        Forgot my password
                      </button>
                    </div>
                  </div>
                </>
              ) : needHelpWith === "pass" ? (
                <>
                  <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Forgot your password ? </p>
                  <p className='text-xl xxs:text-lg font-light tracking-tight mt-2 text-gray-400'>Don't worry, we're gonna help you!</p>
                  <p className='text-lg xxs:text-[15px] mt-7'>
                    To restore your password, you need to have access to the email address which you created the account with.
                  </p>
                  <p className='text-lg xxs:text-[15px] mt-4'>
                    We will send a verification code to the email address, and you just need to copy and paste on the code text box.
                  </p>
                  <form 
                    className='mt-6'
                    noValidate 
                    onSubmit={triggerCode ? handleSubmit(verifyCode) : handleSubmit(getEmail)} 
                  >
                    <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                      {!triggerCode ? (
                        <>
                          <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                            {errors.email?.message as string}
                          </p>
                          <input
                            type="email"
                            className={`
                              sign-text-inputs !h-[46px]  bg-stone-900 text-gray-300 border border-gray-600 active:border focus:border-gray-400
                              ${timer === "maximum" && "border !border-red-700 hover:!border-red-800"}
                            `}
                            placeholder="Email"
                            {...register("email", {
                              required: "Email is required!",
                              pattern: { 
                                value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 
                                message: "Invalid email!" 
                              }
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
                            <>
                              <button className="sign-text-inputs bg-red-700 hover:bg-red-800 !mt-5 text-sm uppercase tracking-widest text-gray-300">
                              {loader ? ( 
                                <SvgLoader 
                                  options={{
                                    showLoadingText: true, 
                                    LoaderClassName: "mt-[3px]"
                                  }}
                                /> 
                              ) : ("Search user")}
                            </button>
                            <button 
                              className="sign-text-inputs bg-gray-900 hover:bg-black !mt-5 !mb-8 text-sm uppercase tracking-widest text-gray-300"
                              onClick={() => setNeedHelpWith("")}
                            >
                              Go back
                            </button>
                            </>
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
                              pattern: { 
                                value: /^[0-9]{0,4}$/, 
                                message: 'Invalid code!'
                              }
                            })}
                          />
                          <button className='bg-red-700 hover:bg-red-800 rounded-full !mt-5 py-2 text-sm uppercase tracking-widest hover:!text-[13px] transition-all duration-500 ease-in-out'>
                            {loader ? ( 
                              <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> 
                            ) : (
                              "Verify code"
                            )}
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
                  <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Lost access to Google Authenticator ? </p>
                  <p className='text-[17px] xxs:text-sm font-light tracking-tight mt-2 text-gray-400'>Don't worry, we're gonna help your unlink it from your account!</p>
                  <p className='text-lg xxs:text-[15px] mt-7'>
                    To unlink 2FA from your account, you need to have access to the email address which you created the account with.
                  </p>
                  <p className='text-lg xxs:text-[15px] mt-4'>
                    We will send a verification code to the email address, and you just need to copy and paste on the code text box.
                  </p>
                  <form onSubmit={triggerCode ? handleSubmit(verifyCode) : handleSubmit(getEmail)} noValidate className='mt-4'>
                    <div className="flex flex-col space-y-2 py-5 rounded-lg !max-w-3xl mx-auto">
                      {!triggerCode ? (
                        <>
                          <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                            {errors.email?.message as string}
                          </p>
                          <input
                            type="email"
                            className={`
                              sign-text-inputs !h-[46px]  bg-stone-900 text-gray-300 border border-gray-600 active:border focus:border-gray-400
                              ${timer === "maximum" && "border !border-red-700 hover:!border-red-800"}
                            `}
                            placeholder="Email"
                            {...register("email", {
                              required: "Email is required!",
                              pattern: { 
                                value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 
                                message: "Invalid email!" 
                              }
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
                            <>
                              <button className="sign-text-inputs bg-red-700 hover:bg-red-800 !mt-5 text-sm uppercase tracking-widest text-gray-300">
                                {loader ? ( 
                                  <SvgLoader 
                                    options={{
                                      showLoadingText: true, 
                                      LoaderClassName: "mt-[3px]"
                                    }}
                                  /> 
                                ) : ("Search user")}
                              </button>
                              <button 
                                className="sign-text-inputs bg-gray-900 hover:bg-black !mt-5 !mb-8 text-sm uppercase tracking-widest text-gray-300"
                                onClick={() => setNeedHelpWith("")}
                              >
                                Go back
                              </button>
                            </>
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
                            {loader ? ( 
                              <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> 
                            ) : (
                              "Verify code"
                            )}
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
              )}
            </>
          ) : triggerCode === "verified" && needHelpWith === "pass" ? (
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
                      {loader ? ( 
                        <SvgLoader options={{showLoadingText: true, LoaderClassName: "mt-[3px]"}}/> 
                      ) : (
                        "Change password"
                      )}
                    </button>
                    {wasChanged && (<p className='!mt-7 mx-auto animate-pulse text-sm uppercase tracking-widest'>Redirecting to sign in page...</p>)}
                </div>
              </form>
            </>
          ) : (
            <>
              <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Two factor authentication sucessfuly removed from account!</p>
              <div className="w-80 mx-auto mt-8">
                <SuccessCheck 
                  endDelay={500}
                  loop={true}
                />
              </div>
              <button 
                className="sign-text-inputs bg-red-700 hover:bg-red-800 mt-5 mb-10 text-sm uppercase tracking-widest text-gray-200"
                onClick={() => navigate("/")}
              >
                Go to sign in page
              </button>
            </>
          )}
        </div>
        <img src={forgotPassword} className='xxs:!w-[87%] xxs:h-auto w-[600px] h-[580px] mt-0 xxs:mt-5 object-cover opacity-90' draggable={false}/>
      </motion.div>      
      <p className='text-center mb-10 uppercase text-xs tracking-wide text-gray-300'>© 2023 Noap team.</p>
    </div> 
  )
}