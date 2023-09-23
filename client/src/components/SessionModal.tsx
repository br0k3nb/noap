import { Dispatch, SetStateAction, useState } from "react";
import { useQuery } from "react-query";
import { MdCable } from 'react-icons/md';

import useUserData from "../hooks/useUserData";

import Modal from "./Modal";
import api from "./CustomHttpInterceptor";
import { toastAlert } from "./Alert";

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SessionModal({ open, setOpen }: Props) {
    const { userData: { _id } } = useUserData();

    const fetchSessions = async() => {
        try {
            if(_id && open) {
                const { data } = await api.get(`/get/sessions/${_id}`);

                return data;
            }
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
        }
    };

    const { isFetching, data } = useQuery(["fetch-sessions"], fetchSessions, { 
        refetchInterval: 300000,
        refetchOnWindowFocus: false,
    });

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Sessions"
            options={{
                modalWrapperClassName: "w-[30rem] xxs:!w-[21rem] !px-0 overflow-y-hidden",
                titleWrapperClassName: "!px-6"
            }}
        >
            <div className="px-6 mt-5">
                <div className="flex flex-row space-x-2">
                    <p className="text-xs uppercase tracking-widest">Active sessions</p>
                    <MdCable size={18} />
                </div>
                {!isFetching && data ? (
                    <>
                        {/* {data.map((session, idx) => {
                            <div className="">
                                <p>{session.location}</p>
                            </div>
                        })} */}
                    </>
                ) : (
                    <div className="h-52">
                        <p className="animate-pulse">Loading...</p>
                    </div>
                )}
            </div>
        </Modal>
    ) 
}