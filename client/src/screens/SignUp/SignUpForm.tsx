import {useNavigate} from "react-router-dom";
import {useForm, FieldValues} from 'react-hook-form';
import axios from "axios";
import {alert} from '../../components/Alert/Alert';
import {
  Typography,
  Box,
  Button,
  TextField,
  Link,
} from "@mui/material";
import {styled} from '@mui/system';
import "./signUp.css";

const NameLoginPassword = styled(TextField)(() => ({
  '& fieldset': {
    borderColor: '#ffffff',
    borderRadius: 100
  },
}));

export default function SignUpForm () {
  
  const {handleSubmit, register} = useForm();

  const navigate = useNavigate();

  const handleForm = async (data: FieldValues) => {
    try {
      const {name, login, password} = data;

      const signUp = await axios.post("https://noap-typescript-api.vercel.app/sign-up", {
        name: name,
        login: login,
        password: password,
      });

      alert({icon: 'success', title: `${signUp.data.message}`, timer: 1000});

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err: any) {
      alert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  };

  return (
    <Box className="app-container">
      <Box className="container-fluid sign-up">
        <Box className="row no-gutter">
          <Box className="col-md-6 d-none d-md-flex bg-image"></Box>
          <Box className="col-md-6 bg-light">
            <Box className="login d-flex align-items-center py-5">
              <Box className="container">
                <Box className="row">
                  <Box className="col-lg-10 col-xl-7 mx-auto">
                    <Typography variant="h3" style={{fontFamily: 'inherit ', fontWeight: 200}} align='center' className="display-4">Sign Up</Typography>
                    <Box component='form' onSubmit={handleSubmit(handleForm)}>
                      <Box className="form-group mb-3">
                        <NameLoginPassword
                          placeholder="Name"
                          className="form-control rounded-pill border-0 shadow-sm"
                          autoComplete="false"
                          size="small"
                          required
                          {...register('name')}
                        />
                      </Box>

                      <Box className="form-group mb-3">
                        <NameLoginPassword
                          placeholder="Email"
                          className="form-control rounded-pill shadow-sm"
                          autoComplete="false"
                          size="small"
                          required
                          {...register('login')}
                        />
                      </Box>

                      <Box className="form-group mb-3">
                        <NameLoginPassword
                          type="password"
                          placeholder="Password"
                          className="form-control rounded-pill shadow-sm"
                          autoComplete="false"
                          size="small"
                          required
                          {...register('password')}
                        />
                      </Box>

                      <Box className="text-center form-group">
                        <Button
                          variant='contained'
                          color="error"
                          type="submit"
                          fullWidth
                          className="text-uppercase mb-2 mt-2 rounded-pill shadow-sm"
                        >
                          Sign up
                        </Button>

                        <Box>
                          <Typography>
                            Already have an account?
                            <Link style={{marginLeft: 3, textDecoration: 'none'}} className="link-danger" href="/">
                              Sign in
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
  );
};