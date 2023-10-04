import { Dispatch, SetStateAction, useState } from "react";

import { MdCable } from 'react-icons/md';
import { PiDesktopTowerFill } from 'react-icons/pi';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { TfiMobile } from 'react-icons/tfi';

import useUserData from "../hooks/useUserData";
import useSession from "../hooks/useSession";

import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";

import api from "./CustomHttpInterceptor";
import { toastAlert } from "./Alert";

import moment from 'moment';
import 'moment/locale/pt-br';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    closeFn: () => void;
}

export default function SessionModal({ open, setOpen, closeFn }: Props) {
    const { sessions, isFetching, fetchSessions } = useSession();
    const { userData: { _id } } = useUserData();

    const [isDeleting, setIsDeleting] = useState('');
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false)
    const [selectedSession, setSelectedSession] = useState<null | string>(null);
    const token = localStorage.getItem("@NOAP:SYSTEM") || "{}";

    const days = (date: string) => moment(date).format("ll");
    
    const handleDisconnectSessions = async (sessionId: string) => {
        try {
            setIsDeleting(sessionId);
            await api.delete(`/delete/session/${_id}/${sessionId}`);

            toastAlert({ icon: "success", title: "Session was terminated!", timer: 2000 });
            if(fetchSessions) fetchSessions();
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
        } finally {
            setIsDeleting('');
            setOpenConfirmationModal(false);
        }
    };

    const handleOpenConfirmationModal = (sessionId: string) => {
        setSelectedSession(sessionId);
        setOpenConfirmationModal(true);
    };

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Sessions"
            options={{
                modalWrapperClassName: "w-[35rem] xxs:!w-[21rem] !px-0 overflow-y-hidden",
                titleWrapperClassName: "!px-6",
                onClose: closeFn,
            }}
        >
            <div className="px-6 mt-5 ">
                <ConfirmationModal
                    open={openConfirmationModal}
                    setOpen={setOpenConfirmationModal}
                    actionButtonFn={() => handleDisconnectSessions(selectedSession as string)}
                    mainText={`Are you sure you want disconnect this session?`}
                    options={{
                        actionButtonText: "Disconnect",
                        modalWrapperClassName: "!w-96 xxs:!w-80",
                        mainTextClassName: "text-[14px] xxs:text-[12px]",
                        cancelButtonText: "Go back",
                        actionButtonsWrapperClassName: "border border-transparent border-t-gray-600 pt-4"
                    }}
                />
                <div className="flex flex-row space-x-2 pb-2">
                    <p className="text-xs uppercase tracking-widest">Active sessions</p>
                    <MdCable size={18} />
                </div>
                <div className="overflow-y-scroll max-h-96 px-2 scrollbar-thin dark:scrollbar-thumb-gray-300">
                    {(!isFetching && sessions) ? (
                        <div className="mt-5 flex flex-col space-y-5">
                            {sessions.map((session, index) => {
                                return (
                                    <div 
                                        className={`
                                            card max-h-64 xxs:max-h-96 sm:card-side dark:bg-[#1c1d1e] border border-gray-500 
                                            ${index === (sessions.length -1) && "xxs:!mb-16"}
                                        `}
                                        key={session._id}
                                    >
                                        <figure className="w-32 xxs:w-full xxs:text-[100px] object-cover border border-transparent border-r-gray-500 xxs:border-r-transparent xxs:border-b-gray-500">
                                            {session.deviceData.type === "desktop" ? (
                                                <PiDesktopTowerFill className="!mx-2 xxs:my-2"/>
                                            ) : (
                                                <TfiMobile className="!mx-4 !max-h-32 xxs:my-4"/>
                                            )}
                                        </figure>
                                        <div className="card-body !py-5">
                                            {(session.token === token && innerWidth > 640) ? (
                                                <span className="absolute bg-green-600 text-white rounded-full px-2 py-1 text-[11px] uppercase tracking-wide right-2 top-2">
                                                    Current session
                                                </span> 
                                            ) : (session.token === token && innerWidth <= 640) && (
                                                <div 
                                                    className="absolute right-2 top-3 h-4 w-4 tooltip tooltip-left tooltip-left-color-controller rounded-full bg-green-600" 
                                                    data-tip="Current session"
                                                />                                                
                                            )}
                                            <p className="uppercase tracking-wide text-[15px]">{session.deviceData.type}</p>
                                            <div className="flex flex-row text-[13px] space-x-2">
                                                <span className="!my-auto">{session.location}</span>
                                                <span className="text-[18px]">{session.countryFlag}</span>
                                            </div>
                                            <p className="text-[14px] tracking-wide">{session.browserData}</p>
                                            <p className="text-[14px] tracking-wide">Login date: {days(session.createdAt)}</p>
                                            <p className="text-[15px] uppercase tracking-wide">ip: {session.ip}</p>
                                            <div className="card-actions justify-end xxs:justify-center mt-2">
                                                <button 
                                                    className="px-3 w-full py-2 rounded-full border border-gray-500 text-[14px] uppercase tracking-wide hover:bg-red-700 hover:text-white shadow-md transition-all duration-500 ease-in-out"
                                                    onClick={() =>  handleOpenConfirmationModal(session._id)}
                                                    type="button"
                                                >
                                                    <div className="flex flex-row space-x-2 justify-center">
                                                        <span>{(isDeleting === session._id) ? "Disconnecting..." : "Disconnect"}</span>
                                                        <VscDebugDisconnect className="my-auto text-lg"/>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="my-5 h-52 mx-auto text-center space-y-2 flex flex-col">
                            <span className="mt-16 mx-auto loading loading-spinner loading-lg dark:text-gray-300 text-gray-900"/>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    ) 
}