import axios from "axios";
import {useNavigate} from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  TextField,
  Link,
} from "@mui/material";
import {styled} from '@mui/system';
import {useForm, FieldValues} from 'react-hook-form';
// import {useQuery} from 'react-query';
import {alert, toastAlert} from '../../components/Alert/Alert';
import "./signIn.css";

const LoginAndPassword = styled(TextField)(() => ({
  '& fieldset': {
    borderColor: '#ffffff',
    borderRadius: 100
  },
}));

export default function SignInForm () {

  const navigate = useNavigate();

  const {handleSubmit, register} = useForm();

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
      const {login, password} = data;

      const signIn = await axios.post("https://noap-typescript-api.vercel.app/sign-in", {
        login,
        password
      });

      alert({icon: 'success', title: `Welcome, ${signIn.data.name}`, timer: 1000});

      window.localStorage.setItem("user_token", JSON.stringify(signIn.data));

      navigate("/activities");

    } catch (err: any) {
      alert({icon: 'error', title: 'ERROR', text: `${err?.response.data.message}`, timer: 2000})
    } 
  };

  // const userIsSigned = useQuery(['userIsSigned'], verifyUser, {
  //   refetchInterval: 1000,
  //   refetchOnMount: true,
  //   refetchOnWindowFocus: true,
  // });

  return (
    <Box>
      <Box className="container-fluid sign-up">
        <Box className="row">
          <Box className="col-md-6 d-none d-md-flex bg-image"></Box>
            <Box className="col-md-6 bg-light">
              <Box className="login d-flex align-items-center py-5">
                <Box className="container">
                  <Box className="row">
                    <Box className="col-lg-10 col-xl-7 mx-auto">
                      <Typography variant="h3" style={{fontFamily: 'inherit ', fontWeight: 200}} className="display-4" align="center">Sign in</Typography>
                      <Box component='form' onSubmit={handleSubmit(handleForm)}>
                        <Box className="form-group mb-3">
                          <LoginAndPassword
                            type="text"
                            placeholder="Enter your email"
                            className="form-control rounded-pill shadow-sm"
                            required
                            size='small'
                            {...register("login")}
                          />
                        </Box>

                        <Box className="form-group mb-3">
                          <LoginAndPassword
                            type="password"
                            placeholder="Enter your password"
                            className="form-control rounded-pill shadow-sm"
                            required
                            size="small"
                            style={{
                              borderColor: '#ffffff',
                              borderRadius: '1000px',
                              borderWidth: 0,
                            }}
                            {...register("password")}
                          />
                        </Box>

                        <Box className="text-center form-group">
                          <Button
                            variant='contained'
                            color="error"
                            type="submit"
                            fullWidth
                            className="text-uppercase mb-3 mt-2 rounded-pill shadow-sm"
                          >
                            Sign in
                          </Button>
                        
                        <Box className="signUp">
                          <Typography>
                            Doesn't have an account?
                            <Link style={{marginLeft: 3, textDecoration: 'none'}} href="/sign-up" className="link-danger">
                              Sign Up
                            </Link>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
};
