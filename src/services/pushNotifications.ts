/**
 * Server-side push subscription plumbing (Web Push, RFC8030).
 *
 * The in-tab scheduler only fires while a Noap tab is open. Subscribing the
 * browser here registers THIS device with the backend, so Vercel Cron
 * (`POST /cron/push-due`, every minute) pushes due activities to every
 * subscribed device — phone, PC, ... — even when no tab is open anywhere.
 *
 * One subscription per browser/device (the push service endpoint is globally
 * unique). Re-subscribing the same device upserts server-side. Everything is
 * best-effort: failures only surface as the returned status, never as throws
 * that could break the Activities UI.
 */

import api from "./api";

import { registerNotificationServiceWorker } from "./activityNotifications";

export type PushDeviceStatus =
  | "unsupported"
  | "unsubscribed"
  | "subscribed"
  | "denied"
  | "unconfigured";

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function base64UrlToKeyBytes(base64Url: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  // Slice to a plain ArrayBuffer: PushManager.subscribe's
  // `applicationServerKey` typing accepts BufferSource but the installed
  // TS DOM lib narrows Uint8Array generics, so hand over the buffer itself.
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    await registerNotificationServiceWorker();
    // `getRegistration()` can return a registration whose worker is still
    // *installing*; PushManager.subscribe needs an ACTIVE worker. Wait for
    // `serviceWorker.ready` (resolves once a worker is active), bounded by a
    // short timeout, then fall back to a plain lookup.
    const ready = await Promise.race([
      navigator.serviceWorker?.ready ?? Promise.resolve(null),
      new Promise<ServiceWorkerRegistration | null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      ),
    ]);
    if (ready) return ready;
    return (await navigator.serviceWorker?.getRegistration()) ?? null;
  } catch {
    return null;
  }
}

/** Current device state: needs the live browser subscription + the server flag. */
export async function getPushDeviceStatus(): Promise<PushDeviceStatus> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const registration = await getRegistration();
  if (!registration) return "unsupported";
  try {
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? "subscribed" : "unsubscribed";
  } catch {
    return "unsubscribed";
  }
}

/**
 * Subscribes THIS device for server-side reminders. Requests notification
 * permission first (PushManager.subscribe rejects without it), fetches the
 * VAPID public key, subscribes, and stores the subscription server-side.
 * Returns a human-readable outcome; "unconfigured" means the backend has no
 * VAPID keys yet (see README Web Push setup).
 */
export async function subscribeDeviceForPush(
  userId: string
): Promise<{ status: PushDeviceStatus; message: string }> {
  if (!pushSupported())
    return { status: "unsupported", message: "Push notifications aren't supported in this browser" };
  if (Notification.permission === "denied")
    return { status: "denied", message: "Notifications are blocked — allow them in your browser settings" };
  if (!userId) return { status: "unsubscribed", message: "Sign in first" };
  try {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        return { status: "denied", message: "Notifications are blocked — allow them in your browser settings" };
    }
    const registration = await getRegistration();
    if (!registration)
      return { status: "unsupported", message: "Service worker unavailable in this browser" };
    let vapidPublicKey: string;
    try {
      const { data } = await api.get("/push/vapid-key");
      vapidPublicKey = data?.publicKey ?? "";
    } catch (err: any) {
      // The axios interceptor flattens 5xx into `{ message, status }`, so read
      // the status from either shape. 503 = VAPID keys missing server-side.
      const status = err?.status ?? err?.response?.status;
      if (status === 503)
        return { status: "unconfigured", message: "Server push isn't configured yet — in-tab reminders still work" };
      if (typeof status === "number" && status >= 500)
        return { status: "unsubscribed", message: "Server push is temporarily unavailable — please try again later" };
      throw err;
    }
    if (!vapidPublicKey)
      return { status: "unconfigured", message: "Server push isn't configured yet — in-tab reminders still work" };
    const existing = await registration.pushManager.getSubscription().catch(() => null);
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToKeyBytes(vapidPublicKey),
      }));
    const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    // toJSON drops raw keys in some browsers: read them off the subscription.
    const p256dh = json.keys?.p256dh ?? arrayBufferToBase64Url(subscription.getKey?.("p256dh") ?? null);
    const auth = json.keys?.auth ?? arrayBufferToBase64Url(subscription.getKey?.("auth") ?? null);
    if (!json.endpoint || !p256dh || !auth) {
      await subscription.unsubscribe().catch(() => undefined);
      return { status: "unsupported", message: "This browser returned an invalid push subscription" };
    }
    await api.post(`/push/subscribe/${userId}`, {
      endpoint: json.endpoint,
      p256dh,
      auth,
      userAgent: navigator.userAgent ?? "",
    });
    return { status: "subscribed", message: "This device will ring even with Noap closed!" };
  } catch (err: any) {
    // 503 from any step (vapid-key or subscribe) = push disabled server-side.
    const status = err?.status ?? err?.response?.status;
    if (status === 503)
      return { status: "unconfigured", message: "Server push isn't configured yet — in-tab reminders still work" };
    if (typeof status === "number" && status >= 500)
      return { status: "unsubscribed", message: "Server push is temporarily unavailable — please try again later" };
    const msg = String(err?.message ?? "");
    // Chromium surfaces "the browser couldn't reach ITS vendor push service
    // (FCM)" as this exact message — a local network/VPN/proxy/ad-blocker
    // issue, never a server setting: there is nothing to configure on our side.
    if (msg.includes("push service error")) {
      return {
        status: "unsubscribed",
        message:
          "Your browser couldn't reach its push service — check your internet, VPN, proxy or ad-blocker and try again",
      };
    }
    // Subscribe raced ahead of the worker's activation.
    if (msg.includes("service worker unavailable") || msg.includes("not active")) {
      return {
        status: "unsubscribed",
        message: "The service worker is still starting — wait a second and try again",
      };
    }
    return { status: "unsubscribed", message: msg || "Could not enable server notifications" };
  }
}

/** Removes THIS device's subscription (browser + server row). */
export async function unsubscribeDeviceForPush(
  userId: string
): Promise<{ status: PushDeviceStatus; message: string }> {
  try {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription().catch(() => null);
    const endpoint = (subscription?.toJSON() as { endpoint?: string } | undefined)?.endpoint;
    await subscription?.unsubscribe().catch(() => undefined);
    if (endpoint && userId) {
      await api.post(`/push/unsubscribe/${userId}`, { endpoint }).catch(() => undefined);
    }
    return { status: "unsubscribed", message: "Server notifications off for this device" };
  } catch (err: any) {
    return { status: "unsubscribed", message: err?.message ?? "Could not disable server notifications" };
  }
}

export type PushDevice = {
  endpoint: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** "Your devices" list (endpoint + UA label; never includes push secrets). */
export async function listPushDevices(userId: string): Promise<PushDevice[]> {
  if (!userId) return [];
  try {
    const { data } = await api.get(`/push/subscriptions/${userId}`);
    return data?.subscriptions ?? [];
  } catch {
    return [];
  }
}
