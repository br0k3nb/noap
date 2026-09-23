import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";

import SvgLoader from "../../../../../components/SvgLoader";
import { toastAlert } from "../../../../../components/Alert";

import useActivities from "../../../../../hooks/useActivities";
import useUserData from "../../../../../hooks/useUserData";

import api from "../../../../../services/api";

import {
    formatDateInput,
    getActivityProgress,
    isValidBrDate,
    TRIGGER_TYPES,
} from "../../../../../services/activityNotifications";

type Props = {
    mode: "create" | "edit";
    activity?: Activity | null;
    onSaved: () => void;
    loader: boolean;
    setLoader: Dispatch<SetStateAction<boolean>>;
};

type ActivityFormValues = {
    title: string;
    description: string;
    triggerType: string;
    date: string;
    time: string;
    enabled: boolean;
    noteId: string;
};

type NoteOption = { _id: string; name?: string };

export default function ActivityForm({ mode, activity, onSaved, loader, setLoader }: Props) {
    const { createActivity, updateActivity } = useActivities();
    const { userData: { _id: userId } } = useUserData();
    const { handleSubmit, register, formState, watch } = useForm<ActivityFormValues>();
    const { errors } = formState;

    const selectedTriggerType = watch("triggerType", activity?.triggerType ?? "daily");

    const [noteOptions, setNoteOptions] = useState<NoteOption[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);

    // Lightweight note picker: first page of the user's notes (regular +
    // pinned) is plenty to link a recurring todo list without a full search
    // UI. Failures only hide the picker — creating the activity still works.
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        (async () => {
            setNotesLoading(true);
            try {
                const { data } = await api.get(`/notes/1/${userId}`, {
                    params: { pinnedNotesPage: 1, limit: 50 },
                });
                if (cancelled) return;
                const docs = data?.notes?.docs ?? [];
                const pinDocs = data?.pinnedNotes?.docs ?? [];
                const seen = new Set<string>();
                const merged: NoteOption[] = [];
                for (const n of [...pinDocs, ...docs]) {
                    if (!n?._id || seen.has(n._id)) continue;
                    seen.add(n._id);
                    merged.push({ _id: n._id, name: n.name });
                }
                // The currently linked note may live on another page — keep
                // it selectable even when it is missing from page 1.
                if (activity?.noteId && !seen.has(activity.noteId)) {
                    try {
                        const { data: noteData } = await api.get(`/note/${activity.noteId}`, {
                            params: { author: userId },
                        });
                        if (!cancelled && noteData?.note?._id) {
                            merged.unshift({
                                _id: noteData.note._id,
                                name: noteData.note.name,
                            });
                        }
                    } catch {
                        /* linked note deleted elsewhere — picker stays unlinked */
                    }
                }
                if (!cancelled) setNoteOptions(merged);
            } catch {
                /* picker stays empty, activity CRUD unaffected */
            } finally {
                if (!cancelled) setNotesLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [userId]);

    // "DD/MM/YYYY" input with an auto-applied mask; masking runs first and the
    // (already masked) value is then forwarded to RHF's change handler.
    const dateRegister = register("date", {
        validate: (value: string) => {
            if (selectedTriggerType !== "once") return true;
            if (!value) return "Date is required!";
            return isValidBrDate(value) || "Use a valid date in the DD/MM/YYYY format!";
        },
    });

    const submitActivity = async (values: ActivityFormValues) => {
        setLoader(true);

        try {
            const description = values.description?.trim();
            const noteId = values.noteId?.trim() ? values.noteId.trim() : undefined;
            const payload = {
                title: values.title,
                description: description ? description : undefined,
                triggerType: values.triggerType,
                trigger: values.triggerType === "once"
                    ? { time: values.time, date: values.date }
                    : { time: values.time },
                enabled: values.enabled,
                noteId,
            };

            const { message } = mode === "create"
                ? await createActivity(payload)
                : await updateActivity(activity!._id, payload);

            setLoader(false);
            toastAlert({ icon: 'success', title: message, timer: 3000 });
            onSaved();
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: err?.message ?? "Error, please try again later!", timer: 3000 });
        }
    };

    return (
        // The modal box itself scrolls (see ActivitiesModal's wrapper classes),
        // so the form needs no breakpoint-specific inner scroller here.
        <div className="mt-5 pb-3">
            <div className="px-6 mb-3">
                <p className='text-lg tracking-tight font-light'>
                    {mode === "create" ? "Add a new activity" : "Edit activity"}
                </p>
            </div>
            <form noValidate onSubmit={handleSubmit(submitActivity)}>
                <div className="px-6 flex flex-col space-y-4">
                    <p className='text-sm text-gray-500 uppercase tracking-widest'>
                        {mode === "create" ? "Set up your schedule" : "Update your schedule"}
                    </p>

                    <div>
                        <label className='text-xs uppercase tracking-widest'>Title</label>
                        <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                            {errors.title?.message as string}
                        </p>
                        <input
                            className={`sign-text-inputs text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border ${errors.title?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                            placeholder="e.g. Drink water"
                            defaultValue={activity?.title ?? ""}
                            {...register("title", {
                                required: "Title is required!",
                                maxLength: { value: 120, message: "Title must be at most 120 characters!" },
                            })}
                        />
                    </div>

                    <div>
                        <label className='text-xs uppercase tracking-widest'>Description (optional)</label>
                        <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                            {errors.description?.message as string}
                        </p>
                        <textarea
                            className={`sign-text-inputs resize-none h-20 text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border ${errors.description?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                            placeholder="What is this activity about?"
                            defaultValue={activity?.description ?? ""}
                            {...register("description", {
                                maxLength: { value: 500, message: "Description must be at most 500 characters!" },
                            })}
                        />
                    </div>

                    <div>
                        <label className='text-xs uppercase tracking-widest'>Trigger</label>
                        <select
                            className="sign-text-inputs text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border"
                            defaultValue={activity?.triggerType ?? "daily"}
                            {...register("triggerType")}
                        >
                            {TRIGGER_TYPES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <p className='text-xs text-gray-500 mt-2 uppercase tracking-widest'>
                            {TRIGGER_TYPES.find(({ value }) => value === selectedTriggerType)?.hint}
                        </p>
                    </div>

                    {selectedTriggerType === "once" && (
                        <div>
                            <label className='text-xs uppercase tracking-widest'>Date</label>
                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                {errors.date?.message as string}
                            </p>
                            <input
                                placeholder="DD/MM/YYYY"
                                maxLength={10}
                                inputMode="numeric"
                                className={`sign-text-inputs text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border ${errors.date?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                defaultValue={activity?.trigger?.date ?? ""}
                                {...dateRegister}
                                onChange={({ target }) => {
                                    target.value = formatDateInput(target.value);
                                    dateRegister.onChange({ target, type: "change" });
                                }}
                            />
                            <p className='text-xs text-gray-500 mt-2 uppercase tracking-widest'>
                                Format: DD/MM/YYYY
                            </p>
                        </div>
                    )}

                    <div>
                        <label className='text-xs uppercase tracking-widest'>Time</label>
                        <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                            {errors.time?.message as string}
                        </p>
                        <input
                            type="time"
                            className={`sign-text-inputs dark:[color-scheme:dark] text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border ${errors.time?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                            defaultValue={activity?.trigger?.time ?? "09:00"}
                            {...register("time", { required: "Time is required!" })}
                        />
                        <p className='text-xs text-gray-500 mt-2 uppercase tracking-widest'>
                            Uses the America/Recife timezone (UTC−3)
                        </p>
                    </div>

                    <div>
                        <label className='text-xs uppercase tracking-widest'>Linked note (recurring todo list)</label>
                        <select
                            className="sign-text-inputs text-gray-900 dark:text-gray-300 bg-[#ffffff] border dark:border-[#404040] border-stone-400 dark:bg-[#1c1d1e] shadow-none active:border"
                            defaultValue={activity?.noteId ?? ""}
                            {...register("noteId")}
                        >
                            <option value="">No linked note</option>
                            {noteOptions.map((n) => (
                                <option key={n._id} value={n._id}>
                                    {(n.name || "Unnamed note").slice(0, 60)}
                                </option>
                            ))}
                        </select>
                        <p className='text-xs text-gray-500 mt-2 uppercase tracking-widest'>
                            {notesLoading
                                ? "Loading your notes…"
                                : "Check items off + “Mark done” records the day; the note resets next occurrence."}
                        </p>
                        {mode === "edit" && activity && (() => {
                            const { currentStreak, totalCompletions, doneToday } = getActivityProgress(activity);
                            if (!activity.noteId) return null;
                            return (
                                <p className='text-xs text-gray-500 mt-1 uppercase tracking-widest'>
                                    🔥 {currentStreak} day streak · {totalCompletions} done
                                    {doneToday ? " · done today ✓" : ""}
                                </p>
                            );
                        })()}
                    </div>

                    <label className='flex items-center space-x-3 text-xs uppercase tracking-widest cursor-pointer !mt-6'>
                        <input
                            type="checkbox"
                            className="toggle toggle-sm"
                            defaultChecked={activity ? activity.enabled : true}
                            {...register("enabled")}
                        />
                        <span>Active — fire the notification on schedule</span>
                    </label>

                    <div className='mt-6 !mb-0'>
                        <div className='border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                            <button
                                type={loader ? 'button' : 'submit'}
                                className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'
                            >
                                {!loader ? (mode === "create" ? "Create activity" : "Save changes") : (<SvgLoader options={{ showLoadingText: true }}/>)}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}