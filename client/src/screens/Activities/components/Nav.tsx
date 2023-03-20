import { Dispatch, SetStateAction, useState } from 'react';
import { AppBar, Box, Typography, Button, MenuItem, Menu, Tooltip, Avatar, IconButton, Divider } from "@mui/material"
import { Edit, ExitToApp, DarkMode, LightMode, SentimentSatisfiedAlt, Menu as MenuIcon, Close } from '@mui/icons-material';

type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
};

type parsedUserTokenType = {
    _id: string;
    userName: string;
    token: string;
};

type NavProps = {
    theme: Theme | null;
    handleCreate: () => unknown;
    setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
    setOpenMenu: Dispatch<SetStateAction<boolean>>;
    handleSignout: () => void;
    parsedUserToken: parsedUserTokenType;
    anchorEl: Element | ((element: Element) => Element) | null;
    openMenu: boolean;
    setOpenSettings: Dispatch<SetStateAction<boolean>>;
};


export default function Nav({
    theme,
    handleCreate,
    setAnchorEl,
    setOpenMenu,
    handleSignout,
    parsedUserToken,
    anchorEl,
    openMenu,
    setOpenSettings
}: NavProps) {

    const [navbar, setNavbar] = useState(false);

    return (
        <div className="bg-stone-900 static py-4 border-b border-stone-600">
            <div className="flex flex-col">
                <div className="flex flex-col md:flex-row flex-wrap justify-between px-6">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-2xl text-white tracking-tighter pt-[1.5px]">
                            Noap <Edit />
                        </h1>
                        <div className="md:hidden pb-[1.5px]">
                            <button onClick={() => setNavbar(!navbar)}>
                                {!navbar ?
                                    <MenuIcon className='text-white mt-1' sx={{ fontSize: 30 }} />
                                    : <Close className='text-white mt-1' sx={{ fontSize: 30 }} />
                                }
                            </button>
                        </div>
                    </div>

                    <div className={`flex-col text-start md:flex-row md:flex ${!navbar ? 'hidden' : 'block'}`}>
                        <div className="flex flex-col md:flex-row space-x-3 xxs:space-x-0 xxs:space-y-5 ">
                            <button
                                className='navbar-button-mobile md:my-auto md:px-3 lg:px-14 md:links xxs:mt-8 sm:pl-3 sm:mt-3'
                                onClick={() => handleCreate()}
                            >
                                New note
                            </button>
                            <hr className='border-gray-600 md:hidden md:w-0' />
                            <button
                                className='navbar-button-mobile md:px-3 lg:px-8 md:links'
                                onClick={() => handleCreate()}
                            >
                                reminders
                            </button>
                            <hr className='border-gray-600 md:hidden md:w-0' />
                            <button
                                className='navbar-button-mobile md:px-3 lg:px-8 md:links'
                                onClick={() => handleCreate()}
                            >
                                add labels
                            </button>
                            <hr className='border-gray-600 md:hidden md:w-0' />
                            <button
                                className='navbar-button-mobile md:px-3 lg:px-8 md:links'
                                onClick={() => handleCreate()}
                            >
                                trash
                            </button>
                            <hr className='border-gray-600 md:hidden md:w-0' />
                            <button
                                className='navbar-button-mobile md:px-3 lg:px-8 md:links  xxs:pb-5'
                                onClick={() => setOpenMenu(true)}
                            >
                                settings
                            </button>
                        </div>
                        <div className="pl-5 hidden md:flex ">
                            <Tooltip title="Open settings">
                                <IconButton onClick={(event) => {
                                    setAnchorEl(event.currentTarget);
                                    setOpenMenu(true);
                                }} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src="https://yt3.ggpht.com/yti/AHXOFjV0J15e7kweVnEy8NWSssTdBJL8Tb_RMOWsm76ZT4M=s88-c-k-c0x00ffffff-no-rj-mo" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
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
                                    <Typography textAlign="center"> Sign out <ExitToApp /> </Typography>
                                </MenuItem>
                                <Divider style={{ borderColor: 'black' }} />
                                <MenuItem >
                                    <Typography textAlign="center"> Change profile picture <SentimentSatisfiedAlt /> </Typography>
                                </MenuItem>
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}   