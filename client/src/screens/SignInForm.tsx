import { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from 'react-hook-form';
// import {useQuery} from 'react-query';
import { alert, toastAlert } from '../components/Alert/Alert';
import { motion } from 'framer-motion';

export default function SignInForm() {

  const navigate = useNavigate();

  const { handleSubmit, register } = useForm();
  const [wasSubmited, setWasSubmitted] = useState(false);

  // const thereIsATK = JSON.parse(window.localStorage.getItem("user_token") || '{}');

  // const verifyUser = async () => {
  //   if(thereIsATK !== null) {
  //       try {
  //         await axios.post("http://localhost:3001/verify-user", {
  //           userToken: thereIsATK.token,
  //         });
  //         navigate('/activities');
  //     } catch (err) {
  //         toastAlert({icon: 'error', title: `${err?.response?.data?.message}`, timer: 2000});
  //         window.localStorage.removeItem("user_token");
  //     }
  //   }
  // };

  const handleForm = async (data: FieldValues) => {
    setWasSubmitted(true);

    try {
      const { login, password } = data;

      console.log(login, password);

      const signIn = await axios.post("https://noap-typescript-api.vercel.app/sign-in", {
        login,
        password
      });

      setWasSubmitted(false);

      // alert({ icon: 'success', title: `Welcome, ${signIn.data.name}`, timer: 1000 });

      window.localStorage.setItem("user_token", JSON.stringify(signIn.data));

      navigate("/activities");

    } catch (err: any) {
      setWasSubmitted(false);
      alert({ icon: 'error', title: 'ERROR', text: `${err?.response.data.message}`, timer: 2000 })
    }
  };

  // const userIsSigned = useQuery(['userIsSigned'], verifyUser, {
  //   refetchInterval: 1000,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: true,
  // });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-row bg-gray-50 h-screen"
    >
      <div className="hidden w-1/2 bg-image object-cover lg:flex lg:w-[66%]" />
      <div className="w-screen md:w-[76%] md:mx-auto lg:w-1/2 xl:w-[45%] lg:mx-auto">
        <div className="flex flex-row h-screen bg-gray-50">
          <div className="flex flex-col px-8 justify-center items-center mx-auto xxs:px-0 md:px-0 xl:px-5 w-full">
            <div className="flex flex-col w-[80%] xxs:w-[85%]">
              <p className="text-center text-5xl font-light py-2" style={{ fontFamily: 'Montserrat' }} >
                Sign in
              </p>

              <form onSubmit={handleSubmit(handleForm)} className='w-full'>
                <div className="mb-2 mt-10">
                  <input
                    type="text"
                    className="sign-text-inputs"
                    placeholder="Email"
                    required
                    {...register("login")}
                  />
                </div>

                <div className="mb-7 mt-3">
                  <input
                    type="password"
                    className="sign-text-inputs"
                    placeholder="Password"
                    required
                    {...register("password")}
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="trasition-all duration-200 hover:bg-red-700/90 uppercase mb-3 rounded-full shadow-lg shadow-slate-400/50 hover:shadow-gray-400 text-sm w-full bg-red-600 text-white py-2"
                  >
                    <div className={`${!wasSubmited && 'hidden'} flex flex-row justify-center`}>
                      <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin xxs:my-1 my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                      </svg>
                      <span className='pt-0 xxs:pt-[2.4px]'>
                        Loading...  
                      </span>
                    </div>

                    <p className={`${wasSubmited && 'hidden'} text-[14px] py-[2px]`}>Sign in</p>
                  </button>

                  <div>
                    <p className="text-md">
                      Doesn't have an account?
                      <a href="/sign-up" className="text-red-600 ml-1">
                        Sign Up
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
};