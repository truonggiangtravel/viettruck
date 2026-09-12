/* VietTrucks Mobile Compatibility */

(function () {
  "use strict";

  // -------------------------------------------------------
  // 1. Fix chiều cao Safari iPhone
  // -------------------------------------------------------

  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  setViewportHeight();

  window.addEventListener("resize", setViewportHeight);
  window.addEventListener("orientationchange", function () {
    setTimeout(setViewportHeight, 200);
  });

  // -------------------------------------------------------
  // 2. Không cho menu mobile gây tràn ngang
  // -------------------------------------------------------

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.display = "none";
    });
  });

  // -------------------------------------------------------
  // 3. Bao table bằng vùng scroll nếu chưa có
  // -------------------------------------------------------

  document.querySelectorAll("table").forEach(function (table) {
    if (
      table.parentElement &&
      !table.parentElement.classList.contains("table-responsive")
    ) {
      const wrapper = document.createElement("div");

      wrapper.className = "table-responsive";

      table.parentNode.insertBefore(wrapper, table);

      wrapper.appendChild(table);
    }
  });

  // -------------------------------------------------------
  // 4. Fix link/nút double-click trên mobile
  // -------------------------------------------------------

  document.querySelectorAll("button, a").forEach(function (element) {
    element.style.touchAction = "manipulation";
  });

  // -------------------------------------------------------
  // 5. Bảo vệ form submit 2 lần
  // -------------------------------------------------------

  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function () {
      const submitButton =
        form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );

      if (!submitButton) return;

      if (submitButton.dataset.submitting === "true") {
        return;
      }

      submitButton.dataset.submitting = "true";

      setTimeout(function () {
        submitButton.dataset.submitting = "false";
      }, 3000);
    });
  });

  // -------------------------------------------------------
  // 6. Giữ form không bị iOS zoom
  // -------------------------------------------------------

  document
    .querySelectorAll("input, textarea, select")
    .forEach(function (field) {
      const currentSize =
        parseFloat(
          window.getComputedStyle(field).fontSize
        );

      if (currentSize < 16) {
        field.style.fontSize = "16px";
      }
    });

  // -------------------------------------------------------
  // 7. Fix lỗi cuộn ngang
  // -------------------------------------------------------

  document.documentElement.style.maxWidth = "100%";
  document.body.style.maxWidth = "100%";

  console.log(
    "VietTrucks mobile compatibility loaded"
  );
})();



document.addEventListener("DOMContentLoaded", function () {
  console.log("VietTruck mobile.js loaded");

  const menuToggle =
  document.getElementById("menuBtn") ||
  document.querySelector(".menu-btn") ||
  document.querySelector(".menu-toggle") ||
  document.querySelector(".mobile-menu-toggle") ||
  document.getElementById("menuToggle");

  const navMenu =
  document.getElementById("menu") ||
  document.querySelector(".menu") ||
  document.querySelector(".nav-menu") ||
  document.querySelector(".mobile-menu") ||
  document.querySelector("header nav");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();

      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });
  }

  /* Quan trọng:
     Không preventDefault() trên link hoặc button của website.
  */
  document.querySelectorAll("a[href]").forEach(function (link) {
    link.style.pointerEvents = "auto";
    link.style.touchAction = "manipulation";
  });

  document.querySelectorAll("button").forEach(function (button) {
    button.style.pointerEvents = "auto";
    button.style.touchAction = "manipulation";
  });

  /* Đóng menu sau khi bấm link */
  if (navMenu) {
    navMenu.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");

        if (menuToggle) {
          menuToggle.classList.remove("active");
        }
      });
    });
  }
});

/* =========================================================
   VIETTRUCK SEARCH TAB FIX - IOS + ANDROID
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".search-tabs .tab, .tab[data-tab]");

  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-tab");

      tabs.forEach(function (item) {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      if (target === "find-truck") {
        window.location.href = "tim-xe.html";
      }

      if (target === "find-cargo") {
        window.location.href = "tim-hang.html";
      }
    });
  });
});
