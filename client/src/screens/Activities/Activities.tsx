import {useState, useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useQuery} from 'react-query';
import {useForm} from 'react-hook-form';

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

  const logoPng = <img width='8%' src={logo} alt='logo' style={{padding: 0, margin: 0}} />

  const theme = useContext(ThemeContext);

  const navigate = useNavigate();

  const [newAc, setNewAc] = useState([]);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl,setAnchorEl] = useState(null);
  const [wasSaved, setWasSaved] = useState(null);
  const [wasUpdated, setWasUpdated] = useState(false);
  const [themeVal, setThemeVal] = useState(true);

  const defaultValues = {
    title: '',
    body: '',
    priority: '',
    bookmark: true,
    priorityColor: true,
  }

  const {register, handleSubmit, reset, watch} = useForm({defaultValues});

  const getTheme = window.localStorage.getItem('theme');

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token"));

  const priorityVal = watch('priority');
  const bookmark = watch('bookmark', true);
  const themeValue = watch('themeSwitch');
  const showPriority = watch('priorityColor', true);

  const getTk = async () => {
    try {
      if(getTheme !== null) reset({themeSwitch: getTheme === 'light' ? false : true, priorityColor: true});
      else reset({themeSwitch: true})

      console.log(bookmark);

      if(parsedUserToken !== null && parsedUserToken !== undefined) {
        const verifyTk = await api.get(`http://localhost:3001/activities/${parsedUserToken._id}/${parsedUserToken.token}`);
        setNewAc(verifyTk.data);
      }
      
      else return navigate("/");
    } catch (err) {
        navigate("/");
        window.localStorage.removeItem("user_token");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    reset({
      title: '',
      body: '',
      priority: ''
    });
  }

  const handleDelete = async (id) => {
    try {
        console.log(id);
        const deleteNote = await api.delete(`http://localhost:3001/de-ac/${id}/${parsedUserToken.token}`);
        toastAlert({icon: 'success', title: `${deleteNote.data.message}`, timer: 2000});
    } catch (err) {
        toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    }
  };

  const handleUpdate = async (id) => {
      try {
        if(id) {
          const filter = newAc.map(val => val).find(val => val._id === id);

          console.log(filter);

          reset({
            title: filter?.title,
            body: filter?.body,
            priority: filter?.priority
          });
          
          console.log(reset({
            title: filter?.title,
            body: filter?.body,
            priority: filter?.priority
          }));

          setOpen(true);

          const {title, body, priority} = id;

          if(title !== undefined) {
            const updateNote = await api.put(`http://localhost:3001/up-ac/${parsedUserToken.token}`, {
              title,
              body,
              priority,
              id: editId,
              token: parsedUserToken.token
            });

            setWasUpdated(editId);

            toastAlert({icon: 'success', title: `${updateNote.data}`, timer: 2000});
          };
        } else setOpen(true);
      } catch (err) {
        console.log(err);
        toastAlert({icon: 'error', title: `${err?.response?.data}`, timer: 2000});
      };
  };

  const handleCreate = async (data) => {
    try {
      setOpen(true);

      const {title, body, priority} = data;

      if(title !== undefined) {
        const create = await api.post(`http://localhost:3001/new-ac/${parsedUserToken.token}`, {
          title,
          body,
          priority, 
          userId: parsedUserToken._id,
        });
  
        toastAlert({icon: 'success', title: `${create.data.message}`, timer: 2000});
  
        setWasSaved('true' + Math.random());

        reset({
          title: '',
          body: '',
          priority: ''
        });
      };
    } catch (err) {
      toastAlert({icon: 'error', title: `${err.response.data.message}`, timer: 2000});
    };
  };

  const handleSignout = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  }

  const handleTheme = (e) => {
    if(e === false) {
      theme.setTheme('light');
      window.localStorage.setItem('theme', 'light');
    };

    if(e === true) {
      theme.setTheme('dark');
      window.localStorage.setItem('theme', 'dark');
    } 
  }

  const actions = [
    {icon: <Settings style={{marginRight: 1}} onClick={() => setOpenSettings(true)} />, name: 'Settings'},
    {icon: <Add style={{marginRight: 1}} onClick={handleCreate} />, name: 'Add'},
  ];

  useQuery(['verifyUser', editId, deleteId, wasSaved, themeValue], getTk, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  }); 
  
  return (
      <>
        <Box id={theme.theme} style={{paddingTop: 6}}>
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
            {newAc.length <= 0 ? (
                <>
                  <Box style={{margin: '0 auto'}}>
                    <Grid container justifyContent='center' mt={5} >
                        <Notes sx={{color: 'gray', fontSize: 190}}/>
                    </Grid>

                    <Typography align="center" variant='h5' mt={1} sx={{color: 'gray'}}> Your notes will appear here </Typography>
                  </Box>
                </>
              ) : newAc.map((val, index) => {
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
                      index={index}
                      showPriority={showPriority}
                    />
                );
              })}
            </Grid>
            <Box sx={{height: 320}}>
              <SpeedDial
                ariaLabel="SpeedDial basic example"
                style={{position: 'fixed', bottom: 16, right: 16}}
                icon={<SpeedDialIcon id={theme.theme} className='customDial' style={{paddingRight: 1.5, paddingBottom: 30}}/>}
              >
                {actions.map((action) => (
                  <SpeedDialAction
                    id={theme.theme} 
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
            <TitleDialog closeBtn={handleClose} style={theme.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Typography style={{letterSpacing: -1, fontSize: 22}} >
                {editId !== null ? ('Edit note'): ('Add a new note')}
              </Typography>
            </TitleDialog>
            <ContentDialog style={theme.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Box component='form' onSubmit={editId !== null ? (handleSubmit(handleUpdate)) : (handleSubmit(handleCreate))}>
                <Box className="form-group mb-3">
                <InputLabel 
                    required
                    className={
                      theme.theme === 'dark' ? 'a-class-with-black-text-set-as-important mb-2' :
                      'a-class-with-black-text-set-as-important-light mb-2'
                    }
                  > Title
                  </InputLabel>
                  <TextField
                    inputProps={{
                      className: theme.theme === 'dark' ? 'a-class-with-black-text-set-as-important' : 'a-class-with-black-text-set-as-important-light',
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
                      theme.theme === 'dark' ? 'a-class-with-black-text-set-as-important mb-2' :
                      'a-class-with-black-text-set-as-important-light mb-2'
                    }
                  > Content
                  </InputLabel>
                  <TextField
                    inputProps={{
                      className: theme.theme === 'dark' ? 'a-class-with-black-text-set-as-important' : 'a-class-with-black-text-set-as-important-light',
                    }}
                    multiline
                    placeholder="Content"
                    fullWidth
                    required
                    {...register('body')}
                  />
                </Box>

                {/* <FormGroup justifyContent='left'> */}
                <Grid md={12}>
                  <FormControlLabel 
                      labelPlacement="start"
                      align='left' 
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
                          <input type="color" style={{transform: 'translate(10px, 10px)', borderWidth: '1px', padding: 0, width: '150px'}}/>
                        </Box>
                      </>
                    )}
                </Grid>
                  
                {/* </FormGroup> */}
                
                <FormControl style={{paddingLeft: 3, marginTop: '50px'}}>
                  <FormLabel style={theme.theme === 'dark' ? {color: '#EEEEEE'} : null} >Priority level</FormLabel>
                  <RadioGroup
                    row
                    {...register('formcontrol')}
                  >
                    <FormControlLabel value="Maximum" control={<Radio style={theme.theme === 'dark' ? {color: '#EEEEEE'} : null} checked={priorityVal === 'Maximum' ? true : false} {...register('priority')} required/>} label="Maximum" />
                    <FormControlLabel value="Medium" control={<Radio style={theme.theme === 'dark' ? {color: '#EEEEEE'} : null} checked={priorityVal === 'Medium' ? true : false} {...register('priority')} required />} label="Medium" />
                    <FormControlLabel value="Minimum" control={<Radio style={theme.theme === 'dark' ? {color: '#EEEEEE'} : null} checked={priorityVal === 'Minimum' ? true : false} {...register('priority')} required  />} label="Minimum" />
                  </RadioGroup>
                </FormControl>

                <Button
                  type='submit'
                  variant="contained"
                  className="text-uppercase mb-2 mt-3 rounded-pill shadow"
                  fullWidth
                  style={theme.theme === 'dark' ? {backgroundColor: '#141414', color: '#EEEEEE'} : null}
                >
                  {editId !== null ? 'Edit' : 'Add'}
                </Button>
              </Box>
            </ContentDialog>
          </DialogBody>

          <DialogBody maxWidth='xs' open={openSettings} onClose={() => setOpenSettings(false)}>
            <TitleDialog closeBtn={() => setOpenSettings(false)} style={theme.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Typography style={{letterSpacing: -1, fontSize: 22}} >
                Settings
              </Typography>
            </TitleDialog>
            <ContentDialog style={theme.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
              <Box>
                <Typography
                  style={{
                    display: 'block'
                  }}
                >
                  Theme
                  <MaterialUISwitch
                    onClick={(e) => handleTheme(e.target.checked)}
                    checked={typeof themeValue == 'Boolean' ? themeValue: Boolean(themeValue)}
                    {...register('themeSwitch')}
                  />  
                </Typography>

                <FormControlLabel
                  style={{marginTop: 3, marginLeft: 0}}
                  value="start"
                  
                  control={<Switch color="primary" checked={typeof showPriority == 'Boolean' ? showPriority: Boolean(showPriority)} {...register('priorityColor')} />}
                  label="Show priority colors"
                  labelPlacement="start"
                />

                <Button variant="contained" style={{marginTop: 10, marginBottom: 5}}>
                  Change profile picture
                </Button>

              </Box>            
                
            </ContentDialog>
            <ActionsDialog style={theme.theme === 'dark' ? {backgroundColor: '#4c4c4c', color: '#EEEEEE'} : null}>
                <Button
                  variant="contained"
                  className="text-uppercase mb-2 mt-3 rounded-pill shadow"
                  fullWidth
                  style={theme.theme === 'dark' ? {backgroundColor: '#141414', color: '#EEEEEE', fontSize: 14} : null}
                  onClick={() => setOpenSettings(false)}
                >
                  Save
                </Button>
            </ActionsDialog>
          </DialogBody>
        </>
    );
}