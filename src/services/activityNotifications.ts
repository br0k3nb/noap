import { toastAlert } from "../components/Alert";

import { APP_BADGE_DATA_URI, APP_ICON_DATA_URI } from "./appIcon";

/**
 * Scheduling + notification plumbing for recurring activities.
 *
 * An activity's `triggerType` selects its recurrence kind: "daily" (every day
 * at `trigger.time`) or "once" (one-shot at `trigger.date` + `trigger.time`).
 * Future trigger kinds plug in at exactly three places:
 *   1. `TRIGGER_TYPES`          — the registry shown in the create/edit form,
 *   2. `shouldTriggerActivity`  — "is this activity due at `now`?",
 *   3. `activityOccurrenceKey`  — the dedup granularity (day, week, ...).
 *
 * ALL trigger dates/times are wall-clock in the app timezone, America/Recife
 * (Brazil, UTC-3, no DST), regardless of where the browser runs, and dates
 * use the "DD/MM/YYYY" format everywhere (form, storage, display).
 *
 * Browser notifications fire while a Noap tab is open; server-side Web Push
 * (`services/pushNotifications.ts` + backend `/cron/push-due`) covers every
 * subscribed device when no tab is open. Each activity fires at most once per
 * occurrence per device (localStorage dedup locally, `activities.lastPushKey`
 * server-side), within a small grace window after its trigger time so a
 * reload right after the scheduled minute still shows the reminder.
 */

/** Minutes after the scheduled time during which the reminder still fires. */
export const ACTIVITY_NOTIFICATION_GRACE_MINUTES = 5;

const NOTIFIED_KEY_PREFIX = "noap:activity-notified:";

export type ActivityTriggerType = "daily" | "once";

/** Registry of the trigger kinds the UI offers. Grows with new recurrences. */
export const TRIGGER_TYPES: {
  value: ActivityTriggerType;
  label: string;
  hint: string;
}[] = [
  {
    value: "daily",
    label: "Daily",
    hint: "Fires every day at the selected time",
  },
  {
    value: "once",
    label: "Specific date & time",
    hint: "Fires on the selected day at the selected time (DD/MM/YYYY)",
  },
];

/** The app timezone: every schedule is wall-clock in America/Recife. */
export const APP_TIME_ZONE = "America/Recife";

const pad2 = (n: number) => `${n}`.padStart(2, "0");

export type AppWallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** Minutes since midnight. */
  minutesOfDay: number;
  /** "YYYY-MM-DD" day key in the app timezone. */
  dateKey: string;
};

/** Current wall-clock time in the app timezone (America/Recife, UTC-3). */
export function appWallClock(now: Date = new Date()): AppWallClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  return {
    year,
    month,
    day,
    hour,
    minute,
    minutesOfDay: hour * 60 + minute,
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

/** Parses a "DD/MM/YYYY" date, rejecting impossible calendar days. */
export function parseBrDate(
  date?: string
): { year: number; month: number; day: number } | null {
  if (!date) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isValidBrDate(date?: string): boolean {
  return parseBrDate(date) !== null;
}

/** Auto-formats typed digits into the "DD/MM/YYYY" date mask. */
export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Parses a 24-hour "HH:MM" time into minutes since midnight. */
export function parseTimeToMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return null;
  const h = Number(hours);
  const m = Number(minutes);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Is `activity` due for a notification at `now`? */
export function shouldTriggerActivity(
  activity: Activity,
  now: Date = new Date()
): boolean {
  if (!activity || activity.enabled === false) return false;

  const wall = appWallClock(now);
  switch (activity.triggerType) {
    case "daily": {
      const triggerMinutes = parseTimeToMinutes(activity.trigger?.time);
      if (triggerMinutes === null) return false;
      // Minutes elapsed since today's trigger, wrapping safely over midnight.
      const elapsed = (wall.minutesOfDay - triggerMinutes + 1440) % 1440;
      return elapsed < ACTIVITY_NOTIFICATION_GRACE_MINUTES;
    }
    case "once": {
      const triggerMinutes = parseTimeToMinutes(activity.trigger?.time);
      const date = parseBrDate(activity.trigger?.date);
      if (triggerMinutes === null || !date) return false;
      // Only the scheduled day, and never before the scheduled minute.
      if (
        date.year !== wall.year ||
        date.month !== wall.month ||
        date.day !== wall.day
      ) {
        return false;
      }
      const elapsed = wall.minutesOfDay - triggerMinutes;
      return elapsed >= 0 && elapsed < ACTIVITY_NOTIFICATION_GRACE_MINUTES;
    }
    default:
      // Future trigger types ("weekly", "interval", ...) get their own case.
      return false;
  }
}

/** Dedup key granularity per trigger kind (see `markNotified`). */
export function activityOccurrenceKey(
  activity: Activity,
  now: Date = new Date()
): string {
  switch (activity.triggerType) {
    case "once":
      // One-shot: the scheduled day is the whole occurrence.
      return activity.trigger?.date ?? "";
    case "daily":
    default: {
      // One fire per Recife day, keyed to the day the occurrence STARTED — a
      // window bleeding past midnight can never fire again on the next day.
      const wall = appWallClock(now);
      const triggerMinutes = parseTimeToMinutes(activity.trigger?.time) ?? 0;
      const elapsed = (wall.minutesOfDay - triggerMinutes + 1440) % 1440;
      return appWallClock(new Date(now.getTime() - elapsed * 60000)).dateKey;
    }
  }
}

function notifiedKey(activityId: string, occurrenceKey: string): string {
  return `${NOTIFIED_KEY_PREFIX}${activityId}:${occurrenceKey}`;
}

export function wasNotified(activityId: string, occurrenceKey: string): boolean {
  try {
    return localStorage.getItem(notifiedKey(activityId, occurrenceKey)) !== null;
  } catch {
    // Storage unavailable (e.g. private mode): worst case the reminder is
    // shown again after a reload within the same window.
    return false;
  }
}

export function markNotified(activityId: string, occurrenceKey: string): void {
  try {
    localStorage.setItem(notifiedKey(activityId, occurrenceKey), `${Date.now()}`);
  } catch {
    /* best-effort dedup */
  }
}

/** Max age of a dedup entry before it gets pruned. */
const NOTIFIED_MAX_AGE_MS = 48 * 60 * 60 * 1000;

/**
 * Drops old dedup entries so storage stays bounded. Age-based on purpose:
 * trigger kinds have different occurrence key shapes (day keys, "DD/MM/YYYY"
 * one-shot dates) and a future occurrence must never be pruned before it
 * fires.
 */
export function pruneStaleNotifiedKeys(now: Date = new Date()): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(NOTIFIED_KEY_PREFIX)) continue;
      const markedAt = Number(localStorage.getItem(key));
      if (
        !Number.isFinite(markedAt) ||
        now.getTime() - markedAt > NOTIFIED_MAX_AGE_MS
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* best-effort cleanup */
  }
}

/**
 * Recurring-todo helpers: activity <-> note linkage, streaks and checklist
 * resets. The backend owns `noteId / seenOccurrences / doneDates`; the
 * functions below are the pure client-side counterparts (date math in the
 * app timezone + Lexical checklist manipulation) so progress UI and the
 * rollover reset never reimplement parsing in two places.
 */

/** Today in the app timezone as "DD/MM/YYYY" (matches `doneDates` keys). */
export function todayBrDate(now: Date = new Date()): string {
  const wall = appWallClock(now);
  return `${pad2(wall.day)}/${pad2(wall.month)}/${wall.year}`;
}

/** "YYYY-MM-DD" (daily occurrence key) -> "DD/MM/YYYY" (doneDates key). */
export function occurrenceKeyToBrDate(key?: string): string | null {
  if (!key) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key.trim());
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return isValidBrDate(key) ? (parseBrDate(key) ? key.trim() : null) : null;
}

/** The "DD/MM/YYYY" day `complete` should record for this occurrence. */
export function occurrenceDoneDate(
  activity: Activity,
  now: Date = new Date()
): string {
  if (activity.triggerType === "once" && isValidBrDate(activity.trigger?.date)) {
    return activity.trigger.date!.trim();
  }
  const key = activityOccurrenceKey(activity, now);
  return occurrenceKeyToBrDate(key) ?? todayBrDate(now);
}

function brDateToDayNumber(br: string): number | null {
  const parsed = parseBrDate(br);
  if (!parsed) return null;
  return Math.floor(Date.UTC(parsed.year, parsed.month - 1, parsed.day) / 86400000);
}

/**
 * Consecutive-day streak + total from `doneDates` ("DD/MM/YYYY", newest
 * last). Counts back from today when today is done, otherwise from
 * yesterday, so a habit done every day so far but not yet today keeps its
 * streak through the morning instead of flashing 0.
 */
export function computeStreak(
  doneDates?: string[],
  now: Date = new Date()
): { currentStreak: number; totalCompletions: number } {
  const days = new Set<number>();
  for (const raw of doneDates ?? []) {
    const n = brDateToDayNumber(raw);
    if (n !== null) days.add(n);
  }
  if (!days.size) return { currentStreak: 0, totalCompletions: 0 };
  const today = brDateToDayNumber(todayBrDate(now));
  if (today === null) return { currentStreak: 0, totalCompletions: days.size };
  let cursor = days.has(today) ? today : today - 1;
  if (!days.has(cursor)) return { currentStreak: 0, totalCompletions: days.size };
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return { currentStreak: streak, totalCompletions: days.size };
}

/** Full progress snapshot for badges, panels and the "answered?" state. */
export function getActivityProgress(
  activity: Pick<Activity, "doneDates">,
  now: Date = new Date()
): { currentStreak: number; totalCompletions: number; doneToday: boolean; today: string } {
  const today = todayBrDate(now);
  const todayN = brDateToDayNumber(today);
  const doneToday =
    todayN !== null &&
    (activity.doneDates ?? []).some((d) => brDateToDayNumber(d) === todayN);
  const { currentStreak, totalCompletions } = computeStreak(activity.doneDates, now);
  return { currentStreak, totalCompletions, doneToday, today };
}

/**
 * Unchecks every Lexical checklist item in a stored editor-state JSON blob.
 * Lexical persists checklists as `list` nodes with `listType: "check"` whose
 * `listitem` children carry `checked: true`; flipping those flags (deep, any
 * nesting level) is the whole reset — text, order and structure are kept so
 * the same note works as a recurring todo list day after day.
 */
export function resetChecklistState(stateJson: string): {
  stateJson: string;
  resetCount: number;
  changed: boolean;
} {
  let parsed: any;
  try {
    parsed = JSON.parse(stateJson);
  } catch {
    return { stateJson, resetCount: 0, changed: false };
  }
  let resetCount = 0;
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "listitem" && node.checked === true) {
      node.checked = false;
      resetCount += 1;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
    // Some stored states nest the editor under { root: {...} } or keep the
    // root itself as the walked node — cover both shapes.
    if (node.root && typeof node.root === "object") walk(node.root);
  };
  walk(parsed.root ?? parsed);
  if (!resetCount) return { stateJson, resetCount: 0, changed: false };
  return { stateJson: JSON.stringify(parsed), resetCount, changed: true };
}

/** Counts checked checklist items without mutating (for "x/y done" hints). */
export function countChecklistItems(stateJson?: string | null): {
  checked: number;
  total: number;
} {
  if (!stateJson) return { checked: 0, total: 0 };
  try {
    const parsed = JSON.parse(stateJson);
    let checked = 0;
    let total = 0;
    const walk = (node: any) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "listitem" && typeof node.checked === "boolean") {
        total += 1;
        if (node.checked) checked += 1;
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
      if (node.root && typeof node.root === "object") walk(node.root);
    };
    walk(parsed.root ?? parsed);
    return { checked, total };
  } catch {
    return { checked: 0, total: 0 };
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!notificationsSupported()) return "unsupported";
  try {
    const permission = await Notification.requestPermission();
    return permission ?? Notification.permission;
  } catch {
    return Notification.permission;
  }
}

export type ShowNotificationInput = {
  title: string;
  body?: string;
  tag?: string;
  /**
   * In-app path opened when the notification is clicked (e.g.
   * `/notes/page/1/note/<id>` for a linked recurring todo). Carried in
   * `NotificationOptions.data` so both the page-level click handler and the
   * service worker (`public/sw.js`) can deep-link to it.
   */
  url?: string;
};

/**
 * Shows a notification through the most reliable channel available: the page
 * `Notification` constructor first (desktop — best icon fidelity), then
 * service-worker `showNotification` (the only path on mobile browsers), and
 * finally an in-app toast so a reminder is never silently dropped (e.g.
 * permission denied or an unsupported browser).
 */
export async function showActivityNotification({
  title,
  body,
  tag,
  url,
}: ShowNotificationInput): Promise<void> {
  // Every notification carries the app icon + monochrome badge, embedded as
  // data URIs: they render straight from memory, so the icon can never fail
  // to load (no URL fetch that Brave Shields, service-worker scope quirks,
  // dev-server paths or offline mode could break).
  const payload: NotificationOptions & { data?: { url?: string } } = {
    body,
    icon: APP_ICON_DATA_URI,
    badge: APP_BADGE_DATA_URI,
    tag,
    data: url ? { url } : undefined,
  };

  if (getNotificationPermission() === "granted") {
    try {
      const notification = new Notification(title, payload);
      if (url) {
        // Clicking a page-level notification deep-links to the attached
        // note (recurring todo) instead of just focusing the tab.
        notification.onclick = () => {
          try {
            window.focus();
            window.location.assign(url);
          } catch {
            /* navigation is best-effort */
          }
          notification.close();
        };
      }
      return;
    } catch {
      /* mobile browsers reject the constructor — service-worker path below */
    }

    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.showNotification(title, payload);
        return;
      }
    } catch {
      /* fall through to the in-app toast */
    }
  }

  toastAlert({ icon: "info", title, text: body, timer: 8000 });
}

export function sendTestNotification(): Promise<void> {
  return showActivityNotification({
    title: "Noap activities",
    body: "Browser notifications are working!",
    tag: "noap-activity-test",
  });
}

/**
 * Registers the minimal notification service worker (`public/sw.js`). It
 * exists purely to display notifications reliably (mobile browsers reject the
 * page-level `new Notification()` constructor) and to focus the app when a
 * notification is clicked — it never intercepts fetches or caches anything.
 */
export async function registerNotificationServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // Non-fatal: showActivityNotification falls back to new Notification/toast.
  }
}