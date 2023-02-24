import {useState, useContext, SetStateAction, Dispatch, ChangeEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useQuery} from 'react-query';
import {useForm, useFieldArray} from 'react-hook-form';

import {
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  FormLabel,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Switch, 
  Divider,
  Checkbox,
  FormGroup,
} from "@mui/material";

import {Add, Notes, Settings, MoreVert} from '@mui/icons-material';

import moment from 'moment';
import 'moment/locale/pt-br';

import logo from '../../logo/icon.png';
import {alert, toastAlert} from "../../components/Alert/Alert";
import {DialogBody, TitleDialog, ContentDialog, ActionsDialog} from '../../components/Dialog';
import api from '../../services/api';
import {ThemeContext} from "../../App";
import {MaterialUISwitch} from "./components/MuiSwitch";
import Nav from './components/Nav';
import Cards from './components/Cards'

import "./activities.css";
import "../../styles/themes/dark.css";
import "../../styles/themes/light.css";

export default function Activities () {

  type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
  }

  const logoPng = <img width='8%' src={logo} alt='logo' style={{padding: 0, margin: 0}} />

  const theme = useContext<Theme | null>(ThemeContext);

  const navigate = useNavigate();

  const [editId, setEditId] = useState<SetStateAction<boolean>>(false);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl,setAnchorEl] = useState<SetStateAction<HTMLElement | null>>();
  const [wasSaved, setWasSaved] = useState<SetStateAction<null | number | string>>(null);
  const [wasUpdated, setWasUpdated] = useState(false);
  const [themeVal, setThemeVal] = useState(true);
  
  const defaultValues = {
    title: '',
    body: '',
    bookmark: true,
    bookmarkColor: '',
  };

  type Activity = {
    _id?: string;
    title: string;
    body: string;
    bookmark: boolean;
    bookmarkColor: string;
    themeSwitch?: boolean;
    activities?: { name: string; keyName: string;}[];
  }

  const {register, handleSubmit, reset, watch, control} = useForm<Activity>({defaultValues});

  const {fields, append} = useFieldArray({
    name: 'activities',
    keyName: 'idFArr',
    control
  });

  const getTheme = window.localStorage.getItem('theme');

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || '');

  const bookmark = watch('bookmark', true);
  const bookmarkColor = watch('bookmarkColor');
  const themeValue = watch('themeSwitch');

  const dateFormater = (date: string) => moment(date).format('DD/MM/YYYY HH:mm');

  const getTk = async () => {
    try {
      if(getTheme !== null) reset({themeSwitch: getTheme === 'light' ? false : true});
      else reset({themeSwitch: true})

      if(parsedUserToken !== '') {
        const verifyTk = await api.get(`http://localhost:3001/activities/${parsedUserToken._id}/${parsedUserToken.token}`);
        append(verifyTk.data);
      }
      else return navigate("/");
    } catch (err) {
        navigate("/");
        window.localStorage.removeItem("user_token");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(false);
    reset({
      title: '',
      body: '',
      bookmark: true,
      bookmarkColor: ''
    });
  }

  const handleDelete = async (id: string) => {
    try {
        const deleteNote = await api.delete(`http://localhost:3001/de-ac/${id}/${parsedUserToken.token}`);
        toastAlert({icon: 'success', title: `${deleteNote.data.message}`, timer: 2000});
    } catch (err) {
        toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  };

  const handleUpdate = async (data?: Activity) => {
      try {
        if(data) {
          console.log(data);
          // const filter = fields.map(val => val?._id === data && val);

          // reset({
          //   title: filter?.title,
          //   body: filter?.body,
          //   bookmark: filter?.bookmark,
          //   bookmarkColor: filter?.bookmarkColor
          // });
        
          setOpen(true);

          const {title, body} = data;

          const updateNote = await api.put(`http://localhost:3001/up-ac/${parsedUserToken.token}`, {
            title,
            body,
            bookmark,
            bookmarkColor,
            id: editId,
            token: parsedUserToken.token
          });

          setWasUpdated(editId);

          toastAlert({icon: 'success', title: `${updateNote.data}`, timer: 2000});
        }
      } catch (err) {
        toastAlert({icon: 'error', title: `${err.response.data}`, timer: 2000});
      };
  };

  const handleCreate = async (data?: Activity) => {
    try {
      if(data) {
        setOpen(true);

        const {title, body} = data;
  
        const create = await api.post(`http://localhost:3001/new-ac/${parsedUserToken.token}`, {
          title,
          body,
          bookmark,
          bookmarkColor,
          userId: parsedUserToken._id,
        });
  
        toastAlert({icon: 'success', title: `${create.data.message}`, timer: 2000});
  
        setWasSaved('true' + Math.random());
  
        reset({
          title: '',
          body: '',
          bookmark: true,
          bookmarkColor: '',
        });
      }
    } catch (err) {
      console.log(err);
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    };
  };

  const handleSignout = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  }

  const handleTheme = (e: boolean) => {
    if(e === false) {
      theme?.setTheme('light');
      window.localStorage.setItem('theme', 'light');
    };

    if(e === true) {
      theme?.setTheme('dark');
      window.localStorage.setItem('theme', 'dark');
    } 
  }

  const actions = [
    {icon: <Settings style={{marginRight: 1}} onClick={() => setOpenSettings(true)} />, name: 'Settings'},
    {icon: <Add style={{marginRight: 1}} onClick={() => handleCreate()} />, name: 'Add'},
  ];

  useQuery(['verifyUser', editId, deleteId, wasSaved, themeValue], getTk, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // refetchInterval: 5000,
  }); 
  
  return (
      <>
        <Box id={theme?.theme} style={{paddingTop: 6}}>
          <Nav 
            handleCreate={handleCreate} 
            parsedUserToken={parsedUserToken}
            handleSignout={handleSignout}
            setAnchorEl={setAnchorEl}
            anchorEl={anchorEl}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            theme={theme}
            setOpenSettings={setOpenSettings}
          />
          <Grid 
            sx={{pl: 4, pr: 4, mt: 10}} 
            container 
            direction='row' 
            spacing={3}
          >
            {fields.length <= 0 ? (
                <>
                  <Box style={{margin: '0 auto'}}>
                    <Grid container justifyContent='center' mt={5} >
                        <Notes sx={{color: 'gray', fontSize: 190}}/>
                    </Grid>

                    <Typography align="center" variant='h5' mt={1} sx={{color: 'gray'}}> Your notes will appear here </Typography>
                  </Box>
                </>
              ) : fields.map((val, index) => {
                return (
                    <Cards
                      key={index}
                      handleDelete={handleDelete}
                      handleUpdate={handleUpdate}
                      setDeleteId={setDeleteId}
                      setEditId={setEditId}
                      theme={theme}
                      wasUpdated={wasUpdated}
                      val={val}
                      dateFormater={dateFormater}
                      index={index}
                    />
                );
              })}
            </Grid>
            <Box sx={{height: 320}}>
              <SpeedDial
                ariaLabel="SpeedDial basic example"
                style={{position: 'fixed', bottom: 16, right: 16}}
                icon={<SpeedDialIcon id={theme?.theme} className='customDial' style={{paddingRight: 1.5, paddingBottom: 30}}/>}
              >
                {actions.map((action) => (
                  <SpeedDialAction
                    id={theme?.theme} 
                    className='customDialOptions'
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    style={{paddingRight: 25}}
                  />
                ))}
              </SpeedDial>
            </Box>
          </Box>

          <DialogBody open={open} onClose={handleClose} >
            <TitleDialog closeBtn={handleClose} style={theme?.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Typography style={{letterSpacing: -1, fontSize: 22}} >
                {editId !== null ? ('Edit note'): ('Add a new note')}
              </Typography>
            </TitleDialog>
            <ContentDialog style={theme?.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Box component='form' onSubmit={editId !== null ? (handleSubmit(handleUpdate)) : (handleSubmit(handleCreate))}>
                <Box className="form-group mb-3">
                <InputLabel 
                    required
                    className={
                      theme?.theme === 'dark' ? 'a-class-with-black-text-set-as-important mb-2' :
                      'a-class-with-black-text-set-as-important-light mb-2'
                    }
                  > Title
                  </InputLabel>
                  <TextField
                    inputProps={{
                      className: theme?.theme === 'dark' ? 'a-class-with-black-text-set-as-important' : 'a-class-with-black-text-set-as-important-light',
                    }}
                    type="text"
                    placeholder="Title"
                    autoComplete="false"
                    fullWidth
                    required
                    {...register('title')}
                  />
                </Box>

                <Box className="form-group mb-4">
                  <InputLabel 
                    required
                    className={
                      theme?.theme === 'dark' ? 'a-class-with-black-text-set-as-important mb-2' :
                      'a-class-with-black-text-set-as-important-light mb-2'
                    }
                  > Content
                  </InputLabel>
                  <TextField
                    inputProps={{
                      className: theme?.theme === 'dark' ? 'a-class-with-black-text-set-as-important' : 'a-class-with-black-text-set-as-important-light',
                    }}
                    multiline
                    placeholder="Content"
                    fullWidth
                    required
                    {...register('body')}
                  />
                </Box>

                <Grid container>
                  <Grid item md={12}>
                    <FormControlLabel 
                        style={{padding: 0, margin: 0}}
                        labelPlacement="start" 
                        control={
                          <Checkbox defaultChecked />
                        } 
                        label="Activate bookmark"
                        {...register('bookmark')}
                    />
                    {bookmark === true && (
                      <>
                        <Box>
                          <FormLabel style={{color: 'white'}}>Choose the color: </FormLabel>
                          <input 
                            {...register('bookmarkColor')}
                            type="color" 
                            style={{
                              transform: 'translate(10px, 10px)', 
                              borderWidth: '1px',
                              borderRadius: '4%', 
                              padding: 0, 
                              width: '150px'
                            }}
                          />
                        </Box>
                      </>
                    )}
                  </Grid>
                </Grid>

                <Button
                  type='submit'
                  variant="contained"
                  className="text-uppercase mb-2 mt-3 rounded-pill shadow"
                  fullWidth
                  style={theme?.theme === 'dark' ? {backgroundColor: '#141414', color: '#EEEEEE'} : undefined}
                >
                  {editId !== null ? 'Edit' : 'Add'}
                </Button>
              </Box>
            </ContentDialog>
          </DialogBody>

          <DialogBody maxWidth='xs' open={openSettings} onClose={() => setOpenSettings(false)}>
            <TitleDialog closeBtn={() => setOpenSettings(false)} style={theme?.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Typography style={{letterSpacing: -1, fontSize: 22}} >
                Settings
              </Typography>
            </TitleDialog>
            <ContentDialog style={theme?.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : undefined}>
              <Box>
                <Typography
                  style={{
                    display: 'block'
                  }}
                >
                  Theme
                  <MaterialUISwitch
                    onClick={(e: any) => handleTheme(e.target.checked)}
                    checked={themeValue}
                    {...register('themeSwitch')}
                  />  
                </Typography>

                {/* <FormControlLabel
                  style={{marginTop: 3, marginLeft: 0}}
                  value="start"
                  
                  control={<Switch color="primary" checked={typeof showPriority == 'Boolean' ? showPriority: Boolean(showPriority)} {...register('priorityColor')} />}
                  label="Show priority colors"
                  labelPlacement="start"
                /> */}

                <Button variant="contained" style={{marginTop: 10, marginBottom: 5}}>
                  Change profile picture
                </Button>

              </Box>            
                
            </ContentDialog>
            <ActionsDialog style={theme?.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : undefined}>
                <Button
                  variant="contained"
                  className="text-uppercase mb-2 mt-3 rounded-pill shadow"
                  fullWidth
                  style={theme?.theme === 'dark' ? {backgroundColor: '#141414', color: '#EEEEEE', fontSize: 14} : undefined}
                  onClick={() => setOpenSettings(false)}
                >
                  Save
                </Button>
            </ActionsDialog>
          </DialogBody>
        </>
    );
}