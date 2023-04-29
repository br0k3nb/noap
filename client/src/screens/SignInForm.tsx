import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from "react-hook-form";
import { motion } from "framer-motion";
import { toastAlert } from "../components/Alert/Alert";

import { FcGoogle } from "react-icons/fc";

import { useGoogleLogin } from "@react-oauth/google";

import api from "../services/api";
import note from "../assets/main.svg";
import noapLogo from "../assets/logo/logo-white-no-bg.png";

export default function SignInForm() {
  const navigate = useNavigate();

  const { handleSubmit, register, formState } = useForm();
  const { errors } = formState;

  const [ svgLoader, setSvgLoader ] = useState("");

  const thereIsATK = JSON.parse(
    window.localStorage.getItem("user_token") || "{}"
  );

  useEffect(() => {
    if (Object.keys(thereIsATK).length > 0) navigate("/home");
  }, []);

  const login = useGoogleLogin({
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
    setSvgLoader("google");

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

        const createUser = await api.post("https://noap-typescript-api.vercel.app/sign-in/google", { email, name, id });
        
        setSvgLoader("");
        toastAlert({ icon: "success", title: `${createUser.data.message}`, timer: 2000 });

        window.localStorage.setItem("user_token", JSON.stringify({
          name: createUser.data.name,
          token: createUser.data.token,
          _id: createUser.data._id,
          googleAccount: createUser.data.googleAccount
        }));

        navigate("/home");
      }
    } catch (err: any) {
      setSvgLoader("");
      toastAlert({
        icon: "error",
        title: `${err?.response.data.message}`,
        timer: 3000,
      });
    }
  };

  const handleForm = async (data: FieldValues) => {
    setSvgLoader("email");

    try {
      const { email, password } = data;

      const signIn = await api.post("/sign-in", { email, password });

      setSvgLoader("");

      window.localStorage.setItem("user_token", JSON.stringify(signIn.data));
      navigate("/home");
    } catch (err: any) {
      setSvgLoader("");
      toastAlert({
        icon: "error",
        title: `${
          err?.response.data.message
            ? err?.response.data.message
            : "Internal error, please try again or later!"
        }`,
        timer: 2500,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row h-screen bg-slate-800"
    >
      <img
        className="hidden object-cover lg:flex lg:w-[65%] w-1/2 bg-slate-800 opacity-90"
        src={note}
        draggable={false}
      />
      <div className="w-screen md:w-[76%] md:mx-auto lg:w-1/2 xl:w-[50%] lg:mx-auto">
        <div className="flex flex-row h-screen bg-slate-800">
          <div className="flex flex-col px-8 justify-center items-center mx-auto xxs:px-0 md:px-0 xl:px-5 w-full lg:shadow-inner lg:shadow-gray-900">
            <div className="flex flex-col w-[70%] xxs:w-[85%] ">
              <span className="text-center text-5xl font-light mt-5 xxs:mt-0 mb-3 text-gray-100 flex justify-center tracking-tighter">
                <div className="flex flex-row gap-x-4">
                  <img
                    src={noapLogo}
                    className="object-cover !w-[190px] xxs:w-44 sm:w-52"
                    draggable={false}
                  />
                </div>
              </span>
              <form
                onSubmit={handleSubmit(handleForm)}
                className="w-full"
                noValidate
              >
                <div className="mb-2 mt-5 flex flex-col space-y-1">
                  <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                    {errors.email?.message as string}
                  </p>
                  <input
                    type="email"
                    className="sign-text-inputs bg-gray-100"
                    placeholder="Email"
                    required
                    {...register("email", {
                      required: "Email is required!",
                      pattern: {
                        value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                        message: "Invalid email!",
                      },
                    })}
                  />
                </div>
                <div className="mb-7 mt-3 flex flex-col space-y-1">
                  <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                    {errors.password?.message as string}
                  </p>
                  <input
                    type="password"
                    className="sign-text-inputs bg-gray-100"
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
                </div>
                <div className="text-center">
                  <button
                    // prevent sending the form clicking in the sign in with email after clicking in the sign with google button
                    type={svgLoader === "googe" ? "button" : "submit"}
                    disabled={svgLoader === "google" && true}
                    className={`trasition-all duration-200 uppercase rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full bg-red-700 text-white py-2 disabled:bg-red-700/60 disabled:cursor-not-allowed ${
                      svgLoader === "google"
                        ? "hover:bg-red-700/60"
                        : "hover:bg-red-700/90"
                    }}`}
                  >
                    <div
                      className={`${
                        svgLoader === "email" && "!flex"
                      } hidden flex-row justify-center py-[1px]`}
                    >
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
                      <span className="pt-0 xxs:pt-[2.4px]">Loading...</span>
                    </div>
                    <p
                      className={`${                        
                        (svgLoader == "google" || svgLoader === "") && "!flex items-center justify-center"
                      } hidden text-[15px] py-[2px] tracking-wide !text-gray-300`}
                    >
                      Sign in with email
                    </p>
                  </button>
                  <div className="my-3">
                    <p className="text-sm uppercase tracking-widest text-gray-400">
                      OR
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={svgLoader === "email" && true}
                    onClick={() => (svgLoader === 'google' || svgLoader === "") && login()}
                    className={`disabled:bg-gray-200/60 disabled:cursor-not-allowed text-gray-900 mb-5 bg-gray-200 trasition-all duration-200 ease-in-out uppercase rounded-full shadow-md shadow-slate-900/80 hover:shadow-gray-900 text-sm w-full py-2 ${
                      svgLoader === "email"
                        ? "hover:bg-gray-200/60"
                        : "hover:bg-gray-300"
                    }}`}
                  >
                    <div
                      className={`${
                        svgLoader === "google" && "!flex"
                      } hidden flex-row justify-center py-[1px]`}
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className={`inline w-4 h-4 mr-3 text-white ${
                          svgLoader === "google" && "!text-black"
                        } animate-spin xxs:my-1 my-[1.5px]`}
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
                      className={`
                        ${(svgLoader === "email" || svgLoader === "") && "!flex"}
                        hidden items-center justify-center
                      `}
                    >
                      <FcGoogle size={26} className="mr-2" />
                      <span className="">Sign in with Google</span>
                    </div>
                  </button>
                  <div className="flex flex-col justify-between text-[12px] xxs:text-[10px] mt-2 space-y-2 uppercase tracking-widest">
                    <div>
                      <p className="text-gray-300">
                        Doesn't have an account?
                        <a
                          href="/sign-up"
                          className="text-red-600 ml-1 hover:text-red-700"
                        >
                          Sign Up
                        </a>
                      </p>
                    </div>
                    <div>
                      <a
                        href="/help"
                        className="text-gray-300 hover:text-red-600"
                      >
                        Problems logging in ?
                      </a>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}