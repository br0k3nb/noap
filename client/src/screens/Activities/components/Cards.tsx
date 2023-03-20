import { Dispatch, SetStateAction } from 'react';
import { Typography, Box, Grid, Button, Card, CardContent, CardActions, Paper, Chip, IconButton, Stack } from "@mui/material";
import { Delete, Edit, MoreVert } from '@mui/icons-material';

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
    dateFormater: (date: string) => string;
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
    dateFormater,
    val,
    index,
}: CardsProps) {

    return (
        <div className="rounded-2xl">
            <div className="w-[28rem] xxs:max-w-xs lg:max-w-sm flex flex-col justify-between bg-gray-700 rounded-lg shadow-xl shadow-slate-900 mb-6 py-8 px-4">
                <div>
                    <h4 className="text-gray-100 font-semibold mb-3 text-2xl">
                        {val.title}
                    </h4>
                    <p className="text-gray-100 text-md">
                        {val.body}
                    </p>
                </div>
                <div className="flex flex-row text-center justify-between text-gray-100 mt-5">
                    <p className="text-sm pr-5 mt-1">
                        {!val?.updatedAt ? 'Created at: ' + dateFormater(val.createdAt) : 'Updated at: ' + dateFormater(val.updatedAt)}
                    </p>
                    <div className="w-8 h-8 rounded-full text-white bg-gray-100 flex items-center justify-center">
                        <Edit className="text-black" />
                    </div>
                </div>
            </div>
        </div>
    )
}