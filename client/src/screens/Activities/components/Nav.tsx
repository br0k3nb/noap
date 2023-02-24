import {AppBar, Box, Typography, Button, MenuItem, Menu, Tooltip, Avatar, IconButton, Divider} from "@mui/material"
import {Edit, ExitToApp, DarkMode, LightMode, SentimentSatisfiedAlt} from '@mui/icons-material';

export default function Nav ({theme, handleCreate, setAnchorEl, setOpenMenu, handleSignout, parsedUserToken, anchorEl, openMenu, setOpenSettings}) {
    return ( 
        <AppBar style={{padding: 13}} id={theme.theme} className="navbar navbar-expand-lg navbar-dark customNav">
            <Box className="container-fluid">
            <Typography style={{paddingBottom: 10, marginTop: 0, letterSpacing: -1}} variant='h5' id={theme.theme} className="navbar-brand">My notes <Edit/></Typography>
            <Box className="navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Button  
                            style={{
                                color: '#ffffff', 
                                fontFamily: 'inherit',
                                marginLeft: 30,
                                paddingTop: 2
                            }}
                            onClick={handleCreate}
                            >
                            Add a new note
                        </Button>
                    </li>
                    <li className="nav-item">
                        <Button  
                            style={{
                                color: '#ffffff', 
                                fontFamily: 'inherit',
                                marginLeft: 10,
                                paddingTop: 2
                            }}
                            // onClick={handleCreate}
                        >
                        Reminders
                        </Button>
                    </li>
                    <li className="nav-item">
                        <Button  
                            style={{
                                color: '#ffffff', 
                                fontFamily: 'inherit',
                                marginLeft: 10,
                                paddingTop: 2
                            }}
                            // onClick={handleCreate}
                        >
                        Add labels
                        </Button>
                    </li>
                    <li className="nav-item">
                        <Button  
                            style={{
                                color: '#ffffff', 
                                fontFamily: 'inherit',
                                marginLeft: 10,
                                paddingTop: 2
                            }}
                            // onClick={handleCreate}
                        >
                        Trash
                        </Button>
                    </li>
                    <li className="nav-item">
                        <Button  
                            style={{
                                color: '#ffffff', 
                                fontFamily: 'inherit',
                                marginLeft: 10,
                                paddingTop: 2
                            }}
                            onClick={() => setOpenSettings(true)}
                        >
                        Settings
                        </Button>
                    </li>
                </ul>
            </Box>
        
            <Box sx={{flexGrow: 0}}>
                <Tooltip title="Open settings">
                <IconButton onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                    setOpenMenu(true);
                }} sx={{ p: 0 }}>
                    <Typography style={{letterSpacing: -1, color: '#ffffff', marginRight: 12, fontSize: 18}}>{parsedUserToken?.userName}</Typography>
                    <Avatar alt="Remy Sharp" src="https://portalead.espro.org.br/pluginfile.php/155142/user/icon/snap/f1?rev=9913976"/>
                </IconButton>
                </Tooltip>
                <Menu
                    sx={{mt: '45px'}}
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={openMenu}
                    onClose={() => {
                        setOpenMenu(false);
                        setAnchorEl(null);
                    }}
                >
                <MenuItem onClick={handleSignout}>
                    <Typography textAlign="center"> Sign out <ExitToApp/> </Typography>
                </MenuItem>
                <Divider style={{borderColor: 'black'}}/>
                <MenuItem >
                    <Typography textAlign="center"> Change profile picture <SentimentSatisfiedAlt/> </Typography>
                </MenuItem>
                </Menu>
                </Box>
            </Box>
        </AppBar>
    )
}   