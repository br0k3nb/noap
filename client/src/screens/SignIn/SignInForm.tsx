import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  TextField,
  Link,
} from "@mui/material";
import { styled } from '@mui/system';
import { useForm, FieldValues } from 'react-hook-form';
// import {useQuery} from 'react-query';
import { alert, toastAlert } from '../../components/Alert/Alert';
import "./signIn.css";

const LoginAndPassword = styled(TextField)(() => ({
  '& fieldset': {
    borderColor: '#ffffff',
    borderRadius: 100
  },
}));

export default function SignInForm() {

  const navigate = useNavigate();

  const { handleSubmit, register } = useForm();

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
    try {
      const { login, password } = data;

      console.log(login, password);

      const signIn = await axios.post("https://noap-typescript-api.vercel.app/sign-in", {
        login,
        password
      });

      alert({ icon: 'success', title: `Welcome, ${signIn.data.name}`, timer: 1000 });

      window.localStorage.setItem("user_token", JSON.stringify(signIn.data));

      navigate("/activities");

    } catch (err: any) {
      alert({ icon: 'error', title: 'ERROR', text: `${err?.response.data.message}`, timer: 2000 })
    }
  };

  // const userIsSigned = useQuery(['userIsSigned'], verifyUser, {
  //   refetchInterval: 1000,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: true,
  // });




  return (
    <div className="flex flex-row bg-gray-50 h-screen">
      <div className="hidden w-1/2 bg-image object-cover lg:flex lg:w-[66%]" />
      <div className="w-screen md:w-[76%] md:mx-auto lg:w-1/2 lg:mx-auto">
        <div className="flex flex-row h-screen bg-gray-50">
          <div className="flex flex-col px-8 justify-center items-center mx-auto xxs:px-0 md:px-0 lg:px-0 w-full">
            <div className="flex flex-col w-[80%] xxs:w-[85%]">
              <p className="text-center text-5xl font-light py-2" style={{fontFamily: 'Montserrat'}} >
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
                {/* <div className="mb-3">
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-2/3 rounded-pill shadow-md shadow-black"
                  required
                  // size='small'
                  {...register("login")}
                />
              </div> */}

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
                    className="text-md trasition-all duration-200 hover:bg-red-700/90 tracking-wide hover:tracking-widest uppercase mb-3 rounded-full shadow-lg shadow-slate-400/50 hover:shadow-lg hover:shadow-gray-400 text-sm w-full bg-red-600 text-white py-2"
                  >
                    Sign in
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
    </div>
  )
};
