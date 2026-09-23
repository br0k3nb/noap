import { useQuery, useQueryClient } from "@tanstack/react-query";

import useUserData from "./useUserData";

import api from "../services/api";

export type ActivityPayload = {
  title: string;
  description?: string;
  triggerType: string;
  trigger: ActivityTrigger;
  enabled?: boolean;
  /**
   * Hex id of the note acting as this activity's recurring todo list.
   * `undefined`/empty unlinks. Sent on create + edit so one form covers
   * linking, editing and unlinking.
   */
  noteId?: string | null;
};

/**
 * Shared access to the signed-in user's activities: one React Query cache
 * entry feeds both the Activities modal (CRUD) and the background
 * notification scheduler, so every mutation instantly refreshes both.
 */
export default function useActivities() {
  const {
    userData: { _id: userId },
  } = useUserData();
  const queryClient = useQueryClient();

  const fetchActivities = async ({
    signal,
  }: { signal?: AbortSignal } = {}): Promise<Activity[]> => {
    if (!userId) return [];
    const {
      data: { activities },
    } = await api.get(`/activities/${userId}`, { signal });
    return activities ?? [];
  };

  const {
    data: activities = [],
    isFetching,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["fetchActivities", userId],
    queryFn: ({ signal }) => fetchActivities({ signal }),
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });

  const refetchList = () =>
    queryClient.invalidateQueries({ queryKey: ["fetchActivities"] });

  const createActivity = async (payload: ActivityPayload) => {
    const { data } = await api.post(`/activity/add/${userId}`, payload);
    await refetchList();
    return data;
  };

  const updateActivity = async (_id: string, payload: ActivityPayload) => {
    const { data } = await api.patch(`/activity/edit/${userId}`, {
      _id,
      ...payload,
    });
    await refetchList();
    return data;
  };

  const toggleActivity = async (_id: string, enabled: boolean) => {
    const { data } = await api.post(`/activity/toggle/${_id}`, { enabled });
    await refetchList();
    return data;
  };

  const deleteActivity = async (_id: string) => {
    const { data } = await api.delete(`/activity/delete/${_id}`);
    await refetchList();
    return data;
  };

  /** Best-effort bookkeeping for the backend (`lastTriggeredAt`). */
  const markActivityTriggered = async (_id: string) => {
    try {
      await api.post(`/activity/triggered/${_id}`);
    } catch {
      /* never let bookkeeping break the notification flow */
    }
  };

  const linkActivityNote = async (_id: string, noteId: string) => {
    const { data } = await api.post(`/activity/link-note/${_id}`, { noteId });
    await refetchList();
    return data;
  };

  const unlinkActivityNote = async (_id: string) => {
    const { data } = await api.post(`/activity/unlink-note/${_id}`);
    await refetchList();
    return data;
  };

  /**
   * Marks the current occurrence as done ("answered the attached note").
   * Returns the fresh progress (`currentStreak`, `doneToday`, ...) so the
   * UI updates instantly; the caller resets the linked note's checkboxes
   * right after this succeeds (see `services/recurringTodos`).
   */
  const completeActivity = async (_id: string, date?: string) => {
    const { data } = await api.post(`/activity/complete/${_id}`, date ? { date } : {});
    await refetchList();
    return data as { message: string; date: string } & ActivityProgress;
  };

  /** Records a rollover so every device resets each occurrence exactly once. */
  const recordSeenOccurrence = async (_id: string, occurrenceKey: string) => {
    try {
      await api.post(`/activity/seen/${_id}`, { occurrenceKey });
    } catch {
      /* best-effort rollover bookkeeping */
    }
  };

  const fetchActivityProgress = async (_id: string): Promise<ActivityProgress> => {
    const { data } = await api.get(`/activity/progress/${_id}`);
    return data;
  };

  return {
    activities,
    isFetching,
    refetchActivities,
    createActivity,
    updateActivity,
    toggleActivity,
    deleteActivity,
    markActivityTriggered,
    linkActivityNote,
    unlinkActivityNote,
    completeActivity,
    recordSeenOccurrence,
    fetchActivityProgress,
  };
}