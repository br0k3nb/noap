import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from "react-hook-form";
import { useGoogleLogin } from "@react-oauth/google";

import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";

import { motion } from "framer-motion";

import Verify2FAModal from "../components/Verify2FAModal";
import { toastAlert } from "../components/Alert";
import SvgLoader from "../components/SvgLoader";

import api from "../services/api";
import useAuth from "../hooks/useAuth";

import note from "../assets/main.svg";
import noapLogo from "../assets/logo/logo-white-no-bg.png";
import useUserData from "../hooks/useUserData";

export default function SignIn() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { setUserData: setUserDataContext } = useUserData();

  const { handleSubmit, register, formState } = useForm();
  const { errors } = formState;

  const [svgLoader, setSvgLoader] = useState("");
  const [openTFAModal, setOpenTFAModal] = useState(false);
  const [userData, setUserData] = useState({ _id: "", token: "" });

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => fetchGoogleAccountData(codeResponse),
    onError: (error) => {
      toastAlert({ icon: "error", title: `Login failed, ${error}`, timer: 2500 });
    }
  });

  const fetchGoogleAccountData = async ({ access_token }: { access_token: string }) => {
    setSvgLoader("google");
    try {
      const { data: { email, id, name } } = await api.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "application/json",
          },
        }
      );

      const { data: ip } = await api.get('https://whats-my-ip-delta.vercel.app/');

      const { 
        data: {
          _id,
          token,
          settings,
          TFAEnabled,
          googleAccount,
          name: userName
        }
      } = await api.post("/sign-in/google", { email, name, id, identifier: ip });

      setSvgLoader("");

      if(!settings.theme || (settings.theme && settings.theme === 'dark')) {
        document.documentElement.classList.add("dark");
      }

      localStorage.setItem("@NOAP:SYSTEM", token);
      setUserDataContext({
        _id,
        settings,
        TFAEnabled,
        googleAccount,
        name: userName
      });
      auth.setUserLoggedIn(true);
    } catch (err: any) {
      setSvgLoader("");
      toastAlert({ icon: "error", title: err.message, timer: 3000 });
    }
  };

  const handleForm = async ({ email, password }: FieldValues) => {
    setSvgLoader("email");

    const callback = (data: any, err: any) => {
      if (!err && data) {
        setUserData(data);

        const { TFAEnabled } = data;

        if(TFAEnabled) return setOpenTFAModal(true);

        if(data?.lastOpenedNote && data?.settings?.onLoginGoToLastOpenedNote) navigate(`/notes/page/1/note/${data.lastOpenedNote}`);
        else navigate(`/notes/page/1`)

        setSvgLoader("");
      } 
      else {
        setSvgLoader("");
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 2500 });
      }
    }

    await auth.signIn({ email, password, callback });
  };

  const userTFAAuth = () => {
    localStorage.setItem("@NOAP:SYSTEM", userData.token);
    auth.setUserLoggedIn(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row h-screen bg-[#0f1011]"
    >
      <Verify2FAModal
        customUserId={{ _id: userData._id }}
        open={openTFAModal}
        customFn={userTFAAuth}
        setOpen={setOpenTFAModal}
      />
      <img 
        className="hidden object-cover lg:flex lg:w-[65%] w-1/2 bg-[#0f1011] opacity-90 border border-transparent border-r-[#404040]" 
        draggable={false} 
        src={note} 
      />
      <div className="w-screen md:w-[76%] md:mx-auto lg:w-1/2 xl:w-[50%] lg:mx-auto">
        <div className="flex flex-row h-screen bg-[#0f1011]">
          <div className="flex flex-col px-8 justify-center items-center mx-auto xxs:px-0 md:px-0 xl:px-5 w-full">
            <div className="flex flex-col w-[70%] xxs:w-[85%]">
              <img 
                className="!w-[190px] xxs:w-44 sm:w-52 mx-auto" 
                draggable={false}
                src={noapLogo} 
              />
              <form onSubmit={handleSubmit(handleForm)} noValidate>
                <div className="mb-2 mt-5 flex flex-col space-y-1">
                  <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                    {errors.email?.message as string}
                  </p>
                  <input
                    type="email"
                    className="sign-text-inputs"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required!",
                      pattern: { value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Invalid email!" }
                    })}
                  />
                </div>
                <div className="mb-7 mt-3 flex flex-col space-y-1">
                  <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                    {errors.password?.message as string}
                  </p>
                  <input
                    type="password"
                    className="sign-text-inputs"
                    placeholder="Password"
                    {...register("password", {
                      required: "Password is required!",
                      minLength: { value: 6, message: "Password is too short!"},
                      maxLength: { value: 16, message: "Too many characters!"}
                    })}
                  />
                </div>
                <div className="text-center">
                  <button
                    // prevent sending the form clicking in the sign in with email after clicking in the sign with google button
                    type={svgLoader === "googe" ? "button" : "submit"}
                    disabled={svgLoader === "google" && true}
                    className="trasition-all duration-300 uppercase rounded-full shadow-md text-sm w-full bg-red-700/90 text-white py-[9.5px] disabled:!bg-red-800/60 disabled:cursor-not-allowed hover:bg-red-800"
                  >
                    {svgLoader === "email" ? (
                      <SvgLoader options={{ showLoadingText: true }} />
                    ) : (svgLoader == "google" || svgLoader === "") && (
                      <div className="flex flex-row items-center justify-center text-[15px] py-[0.060rem] tracking-wide !text-white">
                        <span>Sign in with email</span>
                        <HiOutlineMail size={23} className="ml-2" />
                      </div>
                    )}
                  </button>
                  <p className="text-sm uppercase tracking-widest text-gray-400 my-3"> OR </p>
                  <button
                    type="button"
                    disabled={svgLoader === "email" && true}
                    onClick={() => (svgLoader === 'google' || svgLoader === "") && login()}
                    className="disabled:!bg-gray-200/80 disabled:cursor-not-allowed text-gray-900 mb-5 bg-[#eeeff1] trasition-all duration-300 ease-in-out uppercase rounded-full text-sm w-full py-2 hover:bg-[#cdcdcf]"
                  >
                    {svgLoader === "google" ? (
                      <SvgLoader options={{ showLoadingText: true, LoaderClassName: "!text-black" }} />
                    ) : (svgLoader === "email" || svgLoader === "") && (
                      <div className="flex items-center justify-center">
                        <span className="">Sign in with Google</span>
                        <FcGoogle size={26} className="ml-2" />
                      </div>
                    )}
                  </button>
                  <div className="flex flex-col justify-between text-[12px] xxs:text-[10px] mt-2 space-y-2 uppercase tracking-widest">
                    <p className="text-gray-300">
                      Doesn't have an account ?
                      <a href="/sign-up" className="text-red-600 ml-1 hover:text-red-700"> Sign Up </a>
                    </p>
{/*                     <a href="/help" className="text-gray-300 hover:text-red-600 transition-all duration-300 ease-in-out">
                      Problems logging in ?
                    </a> */}
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
