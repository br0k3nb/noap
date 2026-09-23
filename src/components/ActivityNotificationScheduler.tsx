import { useEffect, useRef } from "react";

import useActivities from "../hooks/useActivities";
import useUserData from "../hooks/useUserData";

import {
  activityOccurrenceKey,
  getActivityProgress,
  markNotified,
  pruneStaleNotifiedKeys,
  registerNotificationServiceWorker,
  shouldTriggerActivity,
  showActivityNotification,
  wasNotified,
} from "../services/activityNotifications";
import {
  getPushDeviceStatus,
  subscribeDeviceForPush,
} from "../services/pushNotifications";
import { rolloverLinkedNoteIfNeeded } from "../services/recurringTodos";

/** How often the scheduler re-checks for due activities. */
const CHECK_INTERVAL_MS = 20000;

/**
 * Invisible component that turns due recurring activities into browser
 * notifications while Noap is open. It ticks on an interval and whenever the
 * tab becomes visible again (catching reminders missed while the tab was in
 * the background or the machine was asleep), firing each activity at most
 * once per occurrence per device.
 *
 * It also rolls linked recurring-todo notes over: the first time a new
 * occurrence is seen, the note's checklist is reset (unchecked) exactly once
 * across devices (server-side `seenOccurrences`), so the same note recurs
 * day after day. Rollover runs independently of the notification window so a
 * new day resets the list even when the tab was opened after the trigger
 * time.
 *
 * Tab-open firing is the *fallback*: this component also auto-registers the
 * device for server-side Web Push (when permission is already granted), so
 * Vercel Cron fans the same reminder out to every subscribed device — phone
 * or PC — even when no Noap tab is open anywhere.
 */
export default function ActivityNotificationScheduler() {
  const { activities, markActivityTriggered, refetchActivities } = useActivities();
  const { userData: { _id: userId } } = useUserData();

  // Refs keep the mount-once effect independent from re-render churn: the
  // interval and listeners are installed exactly once and always read the
  // freshest data at tick time.
  const activitiesRef = useRef(activities);
  activitiesRef.current = activities;
  const markTriggeredRef = useRef(markActivityTriggered);
  markTriggeredRef.current = markActivityTriggered;
  const refetchRef = useRef(refetchActivities);
  refetchRef.current = refetchActivities;
  // Serializes rollover resets: ticks are frequent, resets hit the network.
  const rolloverRunningRef = useRef(false);

  useEffect(() => {
    registerNotificationServiceWorker();
    pruneStaleNotifiedKeys();

    const checkDueActivities = () => {
      const now = new Date();
      for (const activity of activitiesRef.current) {
        try {
          if (!shouldTriggerActivity(activity, now)) continue;

          const occurrenceKey = activityOccurrenceKey(activity, now);
          if (wasNotified(activity._id, occurrenceKey)) continue;
          // Mark before showing: a second tick must never double-fire.
          markNotified(activity._id, occurrenceKey);

          const progress = getActivityProgress(activity, now);
          const hasTodo = !!activity.noteId;
          showActivityNotification({
            title: activity.title,
            body: hasTodo
              ? `${activity.description || "Recurring todo"}${progress.doneToday ? " (done today ✓)" : " — open your todo note to check it off"}${
                  progress.currentStreak > 0 ? ` · 🔥 ${progress.currentStreak}d` : ""
                }`
              : activity.description || "Scheduled activity",
            tag: `noap-activity-${activity._id}-${occurrenceKey}`,
            url: hasTodo ? `/notes/page/1/note/${activity.noteId}` : undefined,
          });
          // Best-effort backend bookkeeping (`lastTriggeredAt`).
          markTriggeredRef.current(activity._id);
        } catch (err) {
          console.error("[noap] failed to trigger activity notification", err);
        }
      }
      void checkRollover();
    };

    /** Reset linked notes whose occurrence rolled over since last tick. */
    const checkRollover = async () => {
      if (rolloverRunningRef.current) return;
      const linked = activitiesRef.current.filter((a) => a.noteId && a.enabled !== false);
      if (!linked.length) return;
      rolloverRunningRef.current = true;
      try {
        const now = new Date();
        let changed = false;
        for (const activity of linked) {
          try {
            const { reset } = await rolloverLinkedNoteIfNeeded(activity, now);
            if (reset) changed = true;
          } catch (err) {
            console.error("[noap] failed to roll over linked note", err);
          }
        }
        // A reset rewrote note content + advanced `seenOccurrences`: refetch
        // activities so streak/seen state stays fresh everywhere.
        if (changed) await refetchRef.current?.();
      } finally {
        rolloverRunningRef.current = false;
      }
    };

    checkDueActivities();
    const intervalId = setInterval(checkDueActivities, CHECK_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkDueActivities();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Server-side push: if this device already granted notification permission,
  // register it with the backend silently (no prompt — permission is already
  // granted, so Vercel Cron can ring it even with Noap closed). Never errors
  // into the UI: unconfigured backends, denied permission, unsupported
  // browsers and offline devices are all no-ops here; the Activities modal
  // still offers the explicit toggle for everyone else.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
        const status = await getPushDeviceStatus();
        if (cancelled || status !== "unsubscribed") return;
        await subscribeDeviceForPush(userId);
      } catch {
        /* best-effort: server push must never break the tab scheduler */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}