import { Dispatch, SetStateAction } from 'react';
import { Typography, Box, Grid, Button, Card, CardContent, CardActions, Paper, Chip, IconButton, Stack } from "@mui/material";
import { Delete, Edit, MoreHoriz, AccessAlarm } from '@mui/icons-material';

import moment from 'moment';
import 'moment/locale/pt-br';

const days = (date: string) => moment(date).format('ll');
const hours = (date: string) => moment(date).format('LT');

type Activity = {
    _id: string;
    title: string;
    body: string;
    bookmark: boolean;
    bookmarkColor: string;
    themeSwitch?: boolean;
    updatedAt?: string;
    createdAt: string;
}

type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
}

type CardsProps = {
    theme: Theme | null;
    val: Activity;
    handleUpdate: (id: string) => unknown;
    handleDelete: (id: string) => unknown;
    setDeleteId: Dispatch<SetStateAction<string | number | null>>;
    setEditId: Dispatch<SetStateAction<string | boolean>>;
    index: number;
}

export default function Cards({
    theme,
    handleUpdate,
    handleDelete,
    setDeleteId,
    setEditId,
    val,
    index,
}: CardsProps) {

    return (
        <div className="rounded-2xl">
            <div className="w-[28rem] xxs:max-w-xs lg:max-w-sm flex flex-col justify-between bg-neutral-700  rounded-lg shadow-xl shadow-slate-900 mb-6 pt-6 pb-4   ">  
                <div className='px-5'>
                    <h4 className="text-gray-100 font-semibold mb-3 text-2xl">
                        {val.title}
                    </h4>
                    <p className="text-gray-100 text-md">
                        {val.body}
                    </p>
                </div>
                <div className="flex flex-row text-center justify-between text-gray-100 mt-5 mb-1 px-5">
                    <div className="flex flex-row">
                        <div
                            className="[word-wrap: break-word] mr-4 flex h-[30px] cursor-pointer items-center justify-between rounded-full border border-gray-500 bg-[#eceff1] bg-[transparent] px-[8px] text-[13px] leading-loose shadow-none transition-[opacity] duration-300 ease-linear text-neutral-200"
                        >
                            <div className="mr-1">
                                <AccessAlarm sx={{fontSize: 20}}/>
                            </div>
                            <p className='tracking-tight text-md py-2'>
                                {days(val.createdAt)} at {hours(val.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* <p className="text-sm pr-5 mt-1">
                        {!val?.updatedAt ? 'Created at: ' + dateFormater(val.createdAt) : 'Updated at: ' + dateFormater(val.updatedAt)}
                    </p> */}
                </div>
                <hr className='my-4 border border-gray-600'/>
                <div className="flex flex-row justify-between px-3 flex-wrap">
                    <div
                        className="[word-wrap: break-word] my-[5px] mr-2 flex h-[32px] cursor-pointer items-center justify-between rounded-full border border-[#9fa6b2] bg-[#eceff1] bg-[transparent] py-0 px-[12px] text-[13px] leading-loose shadow-none transition-[opacity] duration-300 ease-linear text-neutral-200"
                    >
                        <p className='tracking-tight text-md'>
                            My label
                        </p>
                        <div className="bg-red-600 rounded-full h-2 w-2 ml-2">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}