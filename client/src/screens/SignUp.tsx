import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues} from 'react-hook-form';

import { motion } from 'framer-motion';

import { toastAlert } from '../components/Alert/Alert';
import SvgLoader from '../components/SvgLoader';

import api from '../services/api';
import note from '../assets/main.svg';
import noapLogo from '../assets/logo/logo-white-no-bg.png';

export default function SignUp () {  
  const { handleSubmit, register, formState } = useForm();
  const { errors } = formState;

  const [ wasSubmited, setWasSubmitted ] = useState(false);
  const navigate = useNavigate();

  const handleForm = async ({ name, email, password }: FieldValues) => {
    setWasSubmitted(true);
    try {
      const {data: { message }} = await api.post("/sign-up", { name, email, password });
      toastAlert({icon: 'success', title: message, timer: 2500});
      setWasSubmitted(false);

      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setWasSubmitted(false);
      toastAlert({ icon: 'error', title:`${err?.message}`, timer: 2000 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-row h-screen bg-slate-800"
    >
      <img className="hidden object-cover lg:flex lg:w-[65%] w-1/2 bg-slate-800 opacity-90" src={note} draggable={false}/>
      <div className="w-screen md:w-[76%] md:mx-auto lg:w-1/2 xl:w-[50%] lg:mx-auto">
        <div className="flex flex-row h-screen bg-slate-800">
          <div className="flex flex-col px-8 justify-center items-center mx-auto xxs:px-0 md:px-0 xl:px-5 w-full lg:shadow-inner lg:shadow-gray-900">
            <div className="flex flex-col w-[70%] xxs:w-[85%]">            
              <img src={noapLogo} className='!w-[190px] xxs:w-44 sm:w-52 mx-auto'/>
              <form onSubmit={handleSubmit(handleForm)} className='w-full' noValidate>
                <div className="mb-2 mt-5 flex flex-col space-y-1">
                  <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                    {errors.name?.message as string}
                  </p>
                  <input
                    className="sign-text-inputs bg-gray-100"
                    placeholder="Name"
                    {...register("name", { required: "Name is required!" })}
                  />
                </div>
                <div className="mb-2 mt-3 flex flex-col space-y-1">
                  <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                    {errors.email?.message as string}
                  </p>
                  <input
                    type="email"
                    className="sign-text-inputs bg-gray-100"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required!",
                      pattern: { value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Invalid email!" }
                    })}
                  />
                </div>
                <div className="mb-7 mt-3 flex flex-col space-y-1">
                  <p className='text-red-500 ml-1 uppercase text-xs tracking-widest'>
                    {errors.password?.message as string}
                  </p>
                  <input
                    type="password"
                    className="sign-text-inputs bg-gray-100"
                    placeholder="Password"
                    {...register("password", {
                      required: "Password is required!",
                      minLength: { value: 6, message: "Password is too short!" },
                      maxLength: { value: 16, message: "Too many characters!" },
                    })}
                  />
                </div>
                <button className="trasition-all duration-200 hover:bg-red-700/90 uppercase mb-3 rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full bg-red-700 text-white py-2">
                  {wasSubmited ? (<SvgLoader options={{ showLoadingText: true }}/>) : (<p className="text-[15px] py-[2px] tracking-widest"> Sign up </p>)}
                </button>
                <p className="text-md xxs:text-sm text-gray-300 text-[12px] xxs:!text-[10px] uppercase tracking-widest mt-2 text-center">
                  Already have an account ?
                  <a href="/" className="text-red-600 hover:text-red-700 ml-1"> Sign In </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};