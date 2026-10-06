
/*
 VIETTRUCKS WEB PUSH REGISTER
 File: push-register.js
*/

(function () {
  "use strict";

  const FUNCTION_NAME = "viettrucks-push-register";
  const SW_PATH = "/sw.js";

  let client;
  let button;
  let currentUserId = null;
  let busy = false;

  function setButton(text, disabled = false) {
    if (!button) return;
    button.textContent = text;
    button.disabled = disabled;
  }

  
function decodeVapidKey(key) {
  const cleanKey = String(key || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!/^[A-Za-z0-9_-]{87}$/.test(cleanKey)) {
    throw new Error(
      "VAPID Public Key không hợp lệ. " +
      "Hãy kiểm tra khóa trong Supabase Secrets."
    );
  }

  const padding = "=".repeat(
    (4 - cleanKey.length % 4) % 4
  );

  const base64 = (cleanKey + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);

  const bytes = Uint8Array.from(
    raw,
    c => c.charCodeAt(0)
  );

  if (bytes.length !== 65 || bytes[0] !== 4) {
    throw new Error(
      "VAPID Public Key không đúng định dạng."
    );
  }

  return bytes;
}


  async function callApi(action, extra = {}) {
    const { data: sessionData, error: sessionError } =
      await client.auth.getSession();

    const token = sessionData?.session?.access_token;

    if (sessionError || !token) {
      throw new Error("Vui lòng đăng nhập VietTrucks.");
    }

    const { data, error } =
      await client.functions.invoke(FUNCTION_NAME, {
        body: { action, ...extra },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    if (error) {
      let message = error.message;

      try {
        if (error.context) {
          const response = await error.context.json();
          message = response.error || message;
        }
      } catch (_) {}

      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(
        data?.error || "Yêu cầu không thành công."
      );
    }

    return data;
  }

  async function getSubscription() {
    const registration =
      await navigator.serviceWorker.register(SW_PATH);

    await navigator.serviceWorker.ready;

    return {
      registration,
      subscription:
        await registration.pushManager.getSubscription()
    };
  }

  async function refreshButton() {
    if (!button || busy) return;

    if (!currentUserId) {
      button.style.display = "none";
      return;
    }

    button.style.display = "inline-flex";

    if (!("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)) {
      setButton("Thiết bị chưa hỗ trợ thông báo", true);
      return;
    }

    if (Notification.permission === "denied") {
      setButton("🔕 Thông báo bị chặn", true);
      return;
    }

    try {
      const { subscription } = await getSubscription();

      if (subscription) {
        setButton("🔕 Tắt thông báo");
      } else {
        setButton("🔔 Bật thông báo");
      }
    } catch (error) {
      console.error("Push status:", error);
      setButton("🔔 Bật thông báo");
    }
  }

  async function togglePush() {
    if (busy || !currentUserId) return;

    busy = true;
    setButton("Đang xử lý...", true);

    try {
      const { registration, subscription } =
        await getSubscription();

      if (subscription) {
        await callApi("unsubscribe", {
          endpoint: subscription.endpoint
        });

        const removed = await subscription.unsubscribe();

        if (!removed) {
          throw new Error(
            "Không thể hủy đăng ký trên trình duyệt."
          );
        }

        alert("Đã tắt thông báo VietTrucks.");
      } else {
        const keyData = await callApi("get-key");

        const permission =
          await Notification.requestPermission();

        if (permission !== "granted") {
          throw new Error(
            "Bạn chưa cấp quyền nhận thông báo."
          );
        }

        const newSubscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              decodeVapidKey(keyData.publicKey)
          });

        try {
          await callApi("subscribe", {
            subscription: newSubscription.toJSON()
          });
        } catch (error) {
          await newSubscription.unsubscribe();
          throw error;
        }

        alert(
          "Đã bật thông báo VietTrucks thành công!"
        );
      }
    } catch (error) {
      console.error("VietTrucks Push:", error);
      alert(error.message || "Có lỗi xảy ra.");
    } finally {
      busy = false;
      await refreshButton();
    }
  }

  async function init() {
    client = window.supabaseClient;

    if (!client) {
      console.error("VietTrucks: Supabase chưa sẵn sàng.");
      return;
    }

    const header = document.querySelector(".header-actions");
    if (!header) return;

    button = document.createElement("button");
    button.id = "vtPushToggle";
    button.type = "button";
    button.textContent = "🔔 Bật thông báo";

    Object.assign(button.style, {
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "#15803d",
      color: "#ffffff",
      border: "0",
      borderRadius: "9px",
      padding: "9px 12px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      maxWidth: "150px",
      lineHeight: "1.3"
    });

    const bell = document.getElementById("vtBellWrap");

    if (bell) {
      bell.insertAdjacentElement("afterend", button);
    } else {
      header.appendChild(button);
    }

    button.addEventListener("click", togglePush);

    const { data } = await client.auth.getUser();

    currentUserId = data?.user?.id || null;

    await refreshButton();

    client.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user?.id || null;

      if (nextId !== currentUserId) {
        currentUserId = nextId;
        setTimeout(refreshButton, 0);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
