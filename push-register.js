/*
 VIETTRUCKS WEB PUSH REGISTER
 File: push-register.js

 FIX:
 - Push subscription phải gắn đúng user đang đăng nhập
 - Không coi subscription cũ của user khác là đã bật
 - Khi đổi Admin -> Driver, cho phép đăng ký lại endpoint
*/

(function () {
  "use strict";

  const FUNCTION_NAME = "viettrucks-push-register";
  const SW_PATH = "/sw.js";

  let client;
  let button;
  let currentUserId = null;
  let busy = false;

  // Trạng thái subscription của USER hiện tại
  let currentUserSubscribed = false;

  function setButton(text, disabled = false) {
    if (!button) return;

    button.textContent = text;
    button.disabled = disabled;

    button.style.opacity = disabled ? "0.7" : "1";
    button.style.cursor = disabled ? "not-allowed" : "pointer";
  }


  // ==========================================================
  // VAPID KEY
  // ==========================================================

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


  // ==========================================================
  // CALL EDGE FUNCTION
  // ==========================================================

  async function callApi(action, extra = {}) {

    const {
      data: sessionData,
      error: sessionError
    } = await client.auth.getSession();

    const token =
      sessionData?.session?.access_token;

    if (sessionError || !token) {
      throw new Error(
        "Vui lòng đăng nhập VietTrucks."
      );
    }

    const { data, error } =
      await client.functions.invoke(
        FUNCTION_NAME,
        {
          body: {
            action,
            ...extra
          },

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (error) {

      let message =
        error.message ||
        "Không thể kết nối máy chủ.";

      try {

        if (error.context) {

          const response =
            await error.context.json();

          message =
            response?.error ||
            message;
        }

      } catch (_) {}

      throw new Error(message);
    }


    if (!data?.success) {
      throw new Error(
        data?.error ||
        "Yêu cầu không thành công."
      );
    }

    return data;
  }


  // ==========================================================
  // SERVICE WORKER + BROWSER SUBSCRIPTION
  // ==========================================================

  async function getSubscription() {

    const registration =
      await navigator.serviceWorker.register(
        SW_PATH
      );

    await navigator.serviceWorker.ready;

    const subscription =
      await registration.pushManager
        .getSubscription();

    return {
      registration,
      subscription
    };
  }


  // ==========================================================
  // KIỂM TRA SUBSCRIPTION CÓ THUỘC USER HIỆN TẠI KHÔNG
  // ==========================================================

  async function checkCurrentUserSubscription(
    subscription
  ) {

    currentUserSubscribed = false;

    if (!subscription) {
      return false;
    }

    try {

      const result =
        await callApi(
          "status",
          {
            endpoint:
              subscription.endpoint
          }
        );

      /*
       Edge Function status có thể trả về
       các dạng khác nhau.

       Hỗ trợ nhiều field để tránh lỗi
       nếu function đang dùng naming khác.
      */

      const subscribed =
        result?.subscribed === true ||
        result?.isSubscribed === true ||
        result?.is_subscribed === true ||
        result?.exists === true ||
        result?.active === true;

      currentUserSubscribed =
        subscribed === true;

      return currentUserSubscribed;

    } catch (error) {

      console.error(
        "VietTrucks Push status:",
        error
      );

      currentUserSubscribed = false;

      return false;
    }
  }


  // ==========================================================
  // REFRESH BUTTON
  // ==========================================================

  async function refreshButton() {
  if (!button || busy) return;

  // Chưa đăng nhập
  // Kiểm tra trực tiếp session Supabase.
// Không phụ thuộc currentUserId đã kịp cập nhật hay chưa.
if (!currentUserId) {
  try {
    const { data, error } =
      await window.supabaseClient.auth.getSession();

    if (error) {
      console.error("Push getSession:", error);
    }

    const sessionUser =
      data?.session?.user || null;

    if (sessionUser?.id) {
      currentUserId = sessionUser.id;
    }
  } catch (error) {
    console.error(
      "Push kiểm tra session:",
      error
    );
  }
}

// Thực sự chưa đăng nhập mới ẩn nút
if (!currentUserId) {
  currentUserSubscribed = false;
  button.dataset.pushEnabled = "0";
  button.style.display = "none";
  return;
}

  button.style.display = "inline-flex";

  // Trình duyệt không hỗ trợ
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    currentUserSubscribed = false;
    button.dataset.pushEnabled = "0";
    setButton("Thiết bị chưa hỗ trợ thông báo", true);
    return;
  }

  // Người dùng đã chặn thông báo
  if (Notification.permission === "denied") {
    currentUserSubscribed = false;
    button.dataset.pushEnabled = "0";
    setButton("🔕 Thông báo bị chặn", true);
    return;
  }

  try {
    setButton("Đang kiểm tra...", true);

    // Lấy subscription hiện tại của trình duyệt
    const { subscription } = await getSubscription();

    // Không có subscription trên trình duyệt
    if (!subscription) {
      currentUserSubscribed = false;
      button.dataset.pushEnabled = "0";
      setButton("🔔 Bật thông báo");
      return;
    }

    // Kiểm tra subscription này có thuộc tài khoản
    // đang đăng nhập hay không
    const belongsToCurrentUser =
      await checkCurrentUserSubscription(subscription);

    if (belongsToCurrentUser) {
      currentUserSubscribed = true;
      button.dataset.pushEnabled = "1";

      setButton("🔕 Tắt thông báo");
    } else {
      currentUserSubscribed = false;
      button.dataset.pushEnabled = "0";

      setButton("🔔 Bật thông báo");
    }

  } catch (error) {
    console.error(
      "VietTrucks Push refresh:",
      error
    );

    currentUserSubscribed = false;
    button.dataset.pushEnabled = "0";

        setButton("🔔 Bật thông báo");
  }
}


  // ==========================================================
  // BẬT / TẮT PUSH
  // ==========================================================

  async function togglePush() {

    if (
      busy ||
      !currentUserId
    ) {
      return;
    }


    busy = true;

    setButton(
      "Đang xử lý...",
      true
    );


    try {

      const {
        registration,
        subscription
      } = await getSubscription();


      // ======================================================
      // USER HIỆN TẠI ĐÃ BẬT
      // -> TẮT
      // ======================================================

      if (
        subscription &&
        currentUserSubscribed
      ) {

        await callApi(
          "unsubscribe",
          {
            endpoint:
              subscription.endpoint
          }
        );


        const removed =
          await subscription.unsubscribe();


        if (!removed) {

          throw new Error(
            "Không thể hủy đăng ký " +
            "trên trình duyệt."
          );
        }


        currentUserSubscribed = false;


        alert(
          "Đã tắt thông báo VietTrucks."
        );

        return;
      }


      // ======================================================
      // USER HIỆN TẠI CHƯA BẬT
      // ======================================================

      const permission =
        await Notification.requestPermission();


      if (
        permission !== "granted"
      ) {

        throw new Error(
          "Bạn chưa cấp quyền nhận thông báo."
        );
      }


      let activeSubscription =
        subscription;


      // ======================================================
      // TRÌNH DUYỆT CHƯA CÓ SUBSCRIPTION
      // -> TẠO MỚI
      // ======================================================

      if (!activeSubscription) {

        const keyData =
          await callApi(
            "get-key"
          );


        activeSubscription =
          await registration.pushManager
            .subscribe({

              userVisibleOnly: true,

              applicationServerKey:
                decodeVapidKey(
                  keyData.publicKey
                )
            });
      }


      // ======================================================
      // QUAN TRỌNG:
      //
      // Dù subscription đã tồn tại từ Admin,
      // vẫn gửi lại lên server bằng token
      // của USER hiện tại.
      //
      // Server sẽ gắn endpoint với user mới.
      // ======================================================

      try {

        await callApi(
          "subscribe",
          {
            subscription:
              activeSubscription.toJSON()
          }
        );

      } catch (error) {

        /*
         Không unsubscribe subscription cũ
         trong trường hợp đây là subscription
         đang tồn tại từ trước.

         Chỉ báo lỗi để tránh làm mất
         subscription hợp lệ ngoài ý muốn.
        */

        throw error;
      }


      currentUserSubscribed = true;


      alert(
        "Đã bật thông báo VietTrucks thành công!"
      );


    } catch (error) {

      console.error(
        "VietTrucks Push:",
        error
      );

      alert(
        error.message ||
        "Có lỗi xảy ra."
      );

    } finally {

      busy = false;

      await refreshButton();
    }
  }


  // ==========================================================
  // USER CHANGE
  // ==========================================================

  async function handleUserChange(
    nextUserId
  ) {

    const changed =
      nextUserId !== currentUserId;


    currentUserId =
      nextUserId || null;


    if (changed) {

      currentUserSubscribed = false;
    }


    await refreshButton();
  }


  // ==========================================================
  // INIT
  // ==========================================================

  async function init() {

    client =
      window.supabaseClient;


    if (!client) {

      console.error(
        "VietTrucks: Supabase chưa sẵn sàng."
      );

      return;
    }


    const header =
      document.querySelector(
        ".header-actions"
      );


    if (!header) {
      return;
    }


    // Tránh tạo trùng button
    const existingButton =
      document.getElementById(
        "vtPushToggle"
      );


    if (existingButton) {

      button =
        existingButton;

    } else {

      button =
        document.createElement(
          "button"
        );


      button.id =
        "vtPushToggle";


      button.type =
        "button";


      button.textContent =
        "🔔 Bật thông báo";


      Object.assign(button.style, {
  display: "inline-flex",
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
  whiteSpace: "nowrap",
  lineHeight: "1.3",
  zIndex: "9999"
});

// MOBILE
if (window.innerWidth <= 768) {
  Object.assign(button.style, {
    position: "fixed",
    top: "82px",
    right: "12px",
    width: "auto",
    maxWidth: "none",
    padding: "9px 12px",
    fontSize: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,.18)"
  });
}


      const bell =
        document.getElementById(
          "vtBellWrap"
        );


      if (bell) {

        bell.insertAdjacentElement(
          "afterend",
          button
        );

      } else {

        header.appendChild(
          button
        );
      }
    }


    button.removeEventListener(
      "click",
      togglePush
    );


    button.addEventListener(
      "click",
      togglePush
    );


    // ========================================================
    // USER HIỆN TẠI
    // ========================================================

    const {
      data,
      error
    } =
      await client.auth.getUser();


    if (error) {

      console.warn(
        "VietTrucks getUser:",
        error
      );
    }


    currentUserId =
      data?.user?.id ||
      null;


    await refreshButton();


    // ========================================================
    // THEO DÕI LOGIN / LOGOUT / ĐỔI USER
    // ========================================================

    client.auth.onAuthStateChange(
      (_event, session) => {

        const nextId =
          session?.user?.id ||
          null;


        setTimeout(
          () => {
            handleUserChange(
              nextId
            );
          },
          0
        );
      }
    );
  }


  // ==========================================================
  // START
  // ==========================================================

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
