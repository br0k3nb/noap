import { useMemo, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

import { toastAlert } from "../../../components/Alert";
import SvgLoader from "../../../components/SvgLoader";

import useActivities from "../../../hooks/useActivities";
import useRefetch from "../../../hooks/useRefetch";

import {
    getActivityProgress,
    TRIGGER_TYPES,
} from "../../../services/activityNotifications";
import { completeLinkedNote } from "../../../services/recurringTodos";

type Props = {
    noteId?: string | null;
};

/**
 * Content of the Actions → "Recurring todo" modal: a two-way bridge between a
 * note and the activities using it as a recurring todo list.
 *
 * Styled to follow the app's modal conventions (see NoteInfoModal +
 * ListActivities): section headers in uppercase tracking-wider/widest, thin
 * `border-t-gray-600` separators between sections, activity rows with title,
 * trigger subtitle, rounded-full chips and underlined text actions, the
 * standard SvgLoader while fetching and the centered icon empty state.
 */
export default function RecurringTodoPanel({ noteId }: Props) {
    const {
        activities,
        isFetching,
        refetchActivities,
        linkActivityNote,
        unlinkActivityNote,
    } = useActivities();
    const { fetchNotes, fetchSelectedNote } = useRefetch();
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);
    const [linkTarget, setLinkTarget] = useState("");

    const linked = useMemo(
        () => (activities ?? []).filter((a) => a.noteId && noteId && a.noteId === noteId),
        [activities, noteId]
    );
    const linkable = useMemo(
        () => (activities ?? []).filter((a) => !a.noteId),
        [activities]
    );

    // "Daily · 09:00" / "Once · 25/12/2026 09:00" — same shape as the
    // Activities list so trigger subtitles read identically everywhere.
    const triggerLabel = (activity: Activity) => {
        const typeLabel = TRIGGER_TYPES.find(({ value }) => value === activity.triggerType)?.label
            ?? activity.triggerType;
        if (activity.triggerType === "once") {
            return `Once · ${activity.trigger?.date ?? "--/--/----"} ${activity.trigger?.time ?? "--:--"}`;
        }
        return `${typeLabel} · ${activity.trigger?.time ?? "--:--"}`;
    };

    if (!noteId) return null;

    if (isFetching) {
        return (
            <SvgLoader
                options={{ showLoadingText: true, wrapperClassName: "!my-[50px]" }}
            />
        );
    }

    if (!linked.length && !linkable.length) {
        // An account with no activities yet must see guidance instead of a
        // blank dialog (this panel only renders inside the modal).
        return (
            <div className="flex flex-col space-y-4 items-center justify-center text-gray-500 py-6">
                <AiFillCheckCircle size={46} />
                <p className="text-[13px] uppercase tracking-widest text-center">
                    No activities yet
                </p>
                <p className="text-xs text-center text-gray-500">
                    Create one from the bell icon in the sidebar, then come back
                    here to link this note as its recurring todo list.
                </p>
            </div>
        );
    }

    const markDone = async (activity: Activity) => {
        if (completingId) return;
        setCompletingId(activity._id);
        try {
            const { date } = await completeLinkedNote(activity);
            // Refresh the editor content (checkboxes were just reset server-side),
            // the notes list snippet, and the activities cache (fresh streak).
            await Promise.allSettled([
                Promise.resolve(fetchSelectedNote?.()),
                Promise.resolve(fetchNotes?.()),
            ]);
            await refetchActivities();
            toastAlert({ icon: "success", title: `Marked done for ${date}!`, timer: 3000 });
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message ?? "Error, please try again later!", timer: 3000 });
        } finally {
            setCompletingId(null);
        }
    };

    const linkToActivity = async () => {
        if (!noteId || !linkTarget || linking) return;
        setLinking(true);
        try {
            await linkActivityNote(linkTarget, noteId);
            setLinkTarget("");
            toastAlert({ icon: "success", title: "Note linked as recurring todo!", timer: 3000 });
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message ?? "Error, please try again later!", timer: 3000 });
        } finally {
            setLinking(false);
        }
    };

    const unlink = async (activity: Activity) => {
        try {
            await unlinkActivityNote(activity._id);
            toastAlert({ icon: "success", title: "Note unlinked!", timer: 2000 });
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message ?? "Error, please try again later!", timer: 2000 });
        }
    };

    return (
        <div className="dark:text-gray-300 text-gray-900">
            {linked.length > 0 && (
                <>
                    <div className="flex flex-row justify-between">
                        <p className="text-base uppercase tracking-widest my-auto">
                            Linked activities
                        </p>
                    </div>
                    <div className="flex flex-col space-y-3 mt-3 text-sm max-h-[13rem] overflow-y-scroll overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
                        {linked.map((activity) => {
                            const { currentStreak, totalCompletions, doneToday } =
                                getActivityProgress(activity);
                            const busy = completingId === activity._id;
                            return (
                                <div className="flex space-x-2 justify-between pr-1" key={activity._id}>
                                    <div className="flex flex-col min-w-0 my-auto">
                                        <p className="truncate">{activity.title}</p>
                                        <p className="text-[11px] uppercase tracking-widest text-gray-500">
                                            {triggerLabel(activity)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-600 text-gray-500">
                                                🔥 {currentStreak}d · {totalCompletions} done
                                            </span>
                                            {doneToday && (
                                                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-700 text-white">
                                                    done today ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <button
                                                type="button"
                                                className="text-[10px] uppercase tracking-widest underline text-gray-500 hover:text-gray-300 disabled:opacity-50"
                                                disabled={busy || doneToday}
                                                onClick={() => markDone(activity)}
                                            >
                                                {busy
                                                    ? "Saving…"
                                                    : doneToday
                                                        ? "Done ✓"
                                                        : "Mark done"}
                                            </button>
                                            <button
                                                type="button"
                                                className="text-[10px] uppercase tracking-widest underline text-gray-500 hover:text-gray-300"
                                                onClick={() => unlink(activity)}
                                            >
                                                Unlink
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                        Marking done records today and resets the checklist for the next occurrence.
                    </p>
                </>
            )}
            {linkable.length > 0 && (
                <>
                    <div className="border border-transparent border-t-gray-600 my-4" />
                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-row space-x-2">
                            <p className="text-[15px] uppercase tracking-wider">
                                {linked.length
                                    ? "Also link another activity"
                                    : "Make this a recurring todo"}
                            </p>
                            <AiFillCheckCircle size={20} className="my-auto" />
                        </div>
                        <p className="text-[13px] uppercase tracking-wider text-gray-500">
                            Attach this note as the activity's recurring checklist.
                        </p>
                        <label className="text-xs uppercase tracking-widest">Activity</label>
                        <div className="flex flex-row items-center space-x-3">
                            <select
                                value={linkTarget}
                                onChange={(e) => setLinkTarget(e.target.value)}
                                className="sign-text-inputs text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border max-w-[15rem]"
                            >
                                <option value="">Select activity…</option>
                                {linkable.map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.title.slice(0, 40)}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={!linkTarget || linking}
                                onClick={linkToActivity}
                                className="text-xs uppercase tracking-widest rounded-full px-4 py-1 border border-gray-600 hover:bg-[#dadada] dark:hover:bg-stone-600 transition-colors duration-300 disabled:opacity-50 shrink-0"
                            >
                                {linking ? "Linking…" : "Link"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
