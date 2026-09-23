import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BsBellFill, BsThreeDotsVertical } from "react-icons/bs";
import { AiFillWarning, AiFillInfoCircle } from "react-icons/ai";

import SvgLoader from "../../../../../components/SvgLoader";
import { toastAlert } from "../../../../../components/Alert";

import useActivities from "../../../../../hooks/useActivities";
import useSelectedNote from "../../../../../hooks/useSelectedNote";
import useUserData from "../../../../../hooks/useUserData";

import api from "../../../../../services/api";
import { completeLinkedNote } from "../../../../../services/recurringTodos";

import {
    getActivityProgress,
    getNotificationPermission,
    requestNotificationPermission,
    sendTestNotification,
    TRIGGER_TYPES,
} from "../../../../../services/activityNotifications";
import {
    getPushDeviceStatus,
    listPushDevices,
    subscribeDeviceForPush,
    unsubscribeDeviceForPush,
    type PushDevice,
    type PushDeviceStatus,
} from "../../../../../services/pushNotifications";

type Props = {
    activities: Activity[];
    isFetching: boolean;
    onAddActivityClick: () => void;
    resetActivityInfoToEdit: (activity: Activity) => void;
    openDeleteModal: (activity: Activity) => void;
    onToggleActivity: (activity: Activity) => void;
};

export default function ListActivities({
    activities,
    isFetching,
    onAddActivityClick,
    resetActivityInfoToEdit,
    openDeleteModal,
    onToggleActivity,
}: Props) {
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [permission, setPermission] = useState(getNotificationPermission());
    const [requestingPermission, setRequestingPermission] = useState(false);
    const [completingId, setCompletingId] = useState<string | null>(null);
    // Server-side push (this device rings even with Noap closed). Resolved
    // once per modal open: permission-gated, best-effort, never blocks the list.
    const [pushStatus, setPushStatus] = useState<PushDeviceStatus>("unsubscribed");
    const [pushBusy, setPushBusy] = useState(false);
    const [pushDevices, setPushDevices] = useState<PushDevice[]>([]);

    const navigate = useNavigate();
    const { refetchActivities } = useActivities();
    const { setSelectedNote } = useSelectedNote();
    const { userData: { _id: userId } } = useUserData();

    // "Daily · 09:00" / "Once · 25/12/2026 09:00"; future kinds add a case.
    const triggerLabel = (activity: Activity) => {
        const typeLabel = TRIGGER_TYPES.find(({ value }) => value === activity.triggerType)?.label
            ?? activity.triggerType;
        if (activity.triggerType === "once") {
            return `Once · ${activity.trigger?.date ?? "--/--/----"} ${activity.trigger?.time ?? "--:--"}`;
        }
        return `${typeLabel} · ${activity.trigger?.time ?? "--:--"}`;
    };

    const enableNotifications = async () => {
        setRequestingPermission(true);
        setPermission(await requestNotificationPermission());
        setRequestingPermission(false);
    };

    // Resolve server-push state when the modal opens (and after the in-tab
    // permission changes, so enabling one refreshes the other row).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const status = await getPushDeviceStatus();
            if (cancelled) return;
            setPushStatus(status);
            if (status === "subscribed" && userId) {
                setPushDevices(await listPushDevices(userId));
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permission]);

    const toggleServerPush = async () => {
        if (pushBusy) return;
        setPushBusy(true);
        try {
            const result = pushStatus === "subscribed"
                ? await unsubscribeDeviceForPush(userId)
                : await subscribeDeviceForPush(userId);
            setPushStatus(result.status);
            // Permission may have changed inside subscribe (first enable asks
            // for it): sync the in-tab row too.
            setPermission(getNotificationPermission());
            if (result.status === "subscribed") {
                setPushDevices(await listPushDevices(userId));
            } else {
                setPushDevices([]);
            }
            toastAlert({
                icon: result.status === "subscribed" ? "success" : "info",
                title: result.message,
                timer: 4000,
            });
        } finally {
            setPushBusy(false);
        }
    };

    const pushRowLabel = () => {
        switch (pushStatus) {
            case "subscribed":
                return `Server push on · ${pushDevices.length || "this"} device${pushDevices.length === 1 ? "" : "s"}`;
            case "denied":
                return "Server push blocked — allow notifications first";
            case "unsupported":
                return "Server push unsupported in this browser";
            case "unconfigured":
                return "Server push not configured — in-tab reminders still work";
            default:
                return "Ring this device even with Noap closed";
        }
    };

    const openLinkedNote = async (activity: Activity) => {
        if (!activity.noteId) return;
        try {
            // Resolve the page the note lives on so deep-linking never lands
            // on an empty page when the note moved.
            const { data } = await api.get(`/notes/1/${userId}`, {
                params: { limit: 100, search: "" },
            });
            const all = [...(data?.pinnedNotes?.docs ?? []), ...(data?.notes?.docs ?? [])];
            const found = all.find((n: any) => n._id === activity.noteId);
            const page = found?.pageLocation ?? 1;
            setSelectedNote?.(activity.noteId);
            navigate(`/notes/page/${page}/note/${activity.noteId}`);
        } catch {
            setSelectedNote?.(activity.noteId!);
            navigate(`/notes/page/1/note/${activity.noteId}`);
        }
    };

    const markDone = async (activity: Activity) => {
        if (!activity.noteId || completingId) return;
        setCompletingId(activity._id);
        try {
            const { date } = await completeLinkedNote(activity);
            await refetchActivities();
            toastAlert({ icon: "success", title: `Marked done for ${date}!`, timer: 3000 });
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message ?? "Error, please try again later!", timer: 3000 });
        } finally {
            setCompletingId(null);
        }
    };

    return (
        <div className="dark:text-gray-300 text-gray-900">
            <div className="flex flex-row justify-between mb-3 px-6 my-4">
                <p className='text-base uppercase tracking-widest my-auto'>Your activities</p>
            </div>
            {isFetching ? (
                <SvgLoader options={{ showLoadingText: true, wrapperClassName: "!my-[70px] !mr-4" }} />
            ) : !isFetching && activities.length ? (
                <div className="flex flex-col space-y-2 mt-4 text-sm w-[19.5rem] mx-auto xxs:!w-[15rem] h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
                    {activities.map((activity) => {
                        const progress = getActivityProgress(activity);
                        const hasLink = !!activity.noteId;
                        return (
                        <div className="flex space-x-2 justify-between pr-2" key={activity._id}>
                            <div className="flex flex-col min-w-0 my-auto">
                                <p className="truncate">{activity.title}</p>
                                <p className="text-[11px] uppercase tracking-widest text-gray-500">
                                    {triggerLabel(activity)}
                                </p>
                                {hasLink && (
                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-600 text-gray-500">
                                            📝 todo linked
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-600 text-gray-500">
                                            🔥 {progress.currentStreak}d · {progress.totalCompletions} done
                                        </span>
                                        {progress.doneToday && (
                                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-700 text-white">
                                                done today ✓
                                            </span>
                                        )}
                                    </div>
                                )}
                                {hasLink && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            type="button"
                                            className="text-[10px] uppercase tracking-widest underline text-gray-500 hover:text-gray-300 disabled:opacity-50"
                                            disabled={progress.doneToday || completingId === activity._id}
                                            onClick={() => markDone(activity)}
                                        >
                                            {completingId === activity._id
                                                ? "Saving…"
                                                : progress.doneToday
                                                    ? "Done ✓"
                                                    : "Mark done"}
                                        </button>
                                        <button
                                            type="button"
                                            className="text-[10px] uppercase tracking-widest underline text-gray-500 hover:text-gray-300"
                                            onClick={() => openLinkedNote(activity)}
                                        >
                                            Open note
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-sm"
                                    checked={activity.enabled}
                                    onChange={() => onToggleActivity(activity)}
                                />
                                <div className="flex items-center justify-center cursor-pointer">
                                    <div className="dropdown dropdown-left">
                                        <label tabIndex={0} className='cursor-pointer'>
                                            <BsThreeDotsVertical size={16} onClick={() => setShowDropdown(activity._id)} />
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu shadow rounded-box w-[150px] dark:!bg-[#17181b] bg-[#ffffff] border border-gray-600"
                                            style={activity._id !== showDropdown ? { display: 'none' }: undefined}
                                        >
                                            <li className="text-xs uppercase tracking-widest">
                                                <a className="active:!bg-inherit" onClick={() => resetActivityInfoToEdit(activity)}>
                                                    Edit activity
                                                </a>
                                            </li>
                                            <li className="text-xs uppercase tracking-widest">
                                                <a className="active:!bg-inherit" onClick={() => openDeleteModal(activity)}>
                                                    Delete activity
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col space-y-4 items-center justify-center h-[12.8rem] text-gray-500">
                    <BsBellFill size={50} className='!mt-5'/>
                    <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>
                        No activities were found!
                    </p>
                </div>
            )}
            {permission === "unsupported" ? (
                <p className='text-xs uppercase tracking-widest text-gray-500 px-6 mt-3'>
                    Browser notifications aren't supported in this browser
                </p>
            ) : permission === "granted" ? (
                <div className="px-6 mt-3 flex justify-between items-center">
                    <p className='text-xs uppercase tracking-widest text-gray-500'>
                        Browser notifications enabled
                    </p>
                    <button
                        type='button'
                        className='text-xs uppercase tracking-widest rounded-full px-4 py-1 border border-gray-600 hover:bg-[#dadada] dark:hover:bg-stone-600 transition-colors duration-300'
                        onClick={() => sendTestNotification()}
                    >
                        Send test
                    </button>
                </div>
            ) : permission === "denied" ? (
                <div className="px-6 mt-3 flex flex-row items-center space-x-2">
                    <AiFillWarning size={20} className='text-yellow-600 flex-shrink-0' />
                    <p className='text-xs uppercase tracking-widest text-gray-500'>
                        Notifications are blocked — allow them in your browser settings
                    </p>
                </div>
            ) : (
                <div className="px-6 mt-3 flex justify-between items-center">
                    <div className="flex flex-row items-center space-x-2">
                        <AiFillInfoCircle size={20} className='text-blue-500 flex-shrink-0' />
                        <p className='text-xs uppercase tracking-widest text-gray-500'>
                            Enable browser notifications
                        </p>
                    </div>
                    <button
                        type='button'
                        className='text-xs uppercase tracking-widest rounded-full px-4 py-1 border border-gray-600 hover:bg-[#dadada] dark:hover:bg-stone-600 transition-colors duration-300'
                        disabled={requestingPermission}
                        onClick={enableNotifications}
                    >
                        {requestingPermission ? "..." : "Enable"}
                    </button>
                </div>
            )}
            {/* Server-side push: this device rings even with Noap closed (phone
                + PC each subscribe once; Vercel Cron fans out every minute). */}
            <div className="px-6 mt-3 flex justify-between items-center gap-2">
                <div className="flex flex-row items-center space-x-2 min-w-0">
                    <BsBellFill size={16} className='text-green-600 flex-shrink-0' />
                    {/* No `truncate`: this label is long ("Ring this device
                        even with Noap closed" and variants) and must wrap onto
                        several lines inside the narrow modal. */}
                    <p className='text-xs uppercase tracking-widest text-gray-500 leading-snug break-words min-w-0'>
                        {pushRowLabel()}
                    </p>
                </div>
                <button
                    type='button'
                    className='text-xs uppercase tracking-widest rounded-full px-4 py-1 border border-gray-600 hover:bg-[#dadada] dark:hover:bg-stone-600 transition-colors duration-300 disabled:opacity-50 shrink-0'
                    disabled={pushBusy || pushStatus === "unsupported" || pushStatus === "unconfigured"}
                    onClick={toggleServerPush}
                >
                    {pushBusy ? "..." : pushStatus === "subscribed" ? "Turn off" : "Enable"}
                </button>
            </div>
            <div className="flex justify-center items-center border border-transparent border-t-gray-600 mt-4">
                <button 
                    className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 pb-1 transition-all hover:text-[15px] duration-500'
                    onClick={() => onAddActivityClick()}
                >
                    New activity
                </button>
            </div>
        </div>
    )
}