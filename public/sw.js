// Service worker for Noap activity notifications.
//
// It intentionally has NO fetch handler: it never caches or proxies anything.
// Its jobs:
//   1. let the app display notifications through `registration.showNotification`
//      (the only reliable path on mobile browsers, where the page-level
//      `new Notification()` constructor is not supported),
//   2. render server-side pushes (`push` event from Vercel Cron fan-out) even
//      when no Noap tab is open — this is what rings the phone/PC alike,
//   3. focus/restore the Noap tab when the user clicks a notification.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    try { data = { body: event.data ? event.data.text() : "" }; } catch { data = {}; }
  }
  const title = data.title || "Noap activity";
  const url = data.url || "/";
  // Tag dedupes against the in-tab notification of the same occurrence
  // (server + tab share the `noap-activity-<id>-<key>` shape).
  const options = {
    body: data.body || "Scheduled activity",
    tag: data.tag || "noap-activity",
    data: { url },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Deep-link notifications attached to a recurring-todo note straight to
  // that note; plain reminders keep the old focus-or-open-root behavior.
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if ("focus" in client) {
          try {
            if (url !== "/" && "navigate" in client) await client.navigate(url);
          } catch {
            /* navigation is best-effort — focusing still helps */
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
