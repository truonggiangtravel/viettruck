
/* VIETTRUCKS WEB PUSH SERVICE WORKER
   Version 1.0
*/

self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "VietTrucks",
      body: "Bạn có thông báo mới."
    };
  }

  const title = String(
    data.title || "Thông báo VietTrucks"
  ).slice(0, 120);

  const options = {
    body: String(
      data.body || "Bạn có thông báo mới."
    ).slice(0, 250),

    icon: "/favicon.ico",
    badge: "/favicon.ico",

    tag: String(
      data.tag || "viettrucks-notification"
    ),

    renotify: false,

    data: {
      url: safeUrl(data.url)
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

function safeUrl(value) {
  try {
    const url = new URL(
      value || "/",
      self.location.origin
    );

    return url.origin === self.location.origin
      ? url.href
      : self.location.origin + "/";
  } catch {
    return self.location.origin + "/";
  }
}

self.addEventListener(
  "notificationclick",
  event => {
    event.notification.close();

    const target = safeUrl(
      event.notification.data?.url
    );

    event.waitUntil(
      (async () => {
        const windows = await clients.matchAll({
          type: "window",
          includeUncontrolled: true
        });

        for (const windowClient of windows) {
          if (
            new URL(windowClient.url).origin ===
            self.location.origin
          ) {
            await windowClient.focus();
            await windowClient.navigate(target);
            return;
          }
        }

        await clients.openWindow(target);
      })()
    );
  }
);
