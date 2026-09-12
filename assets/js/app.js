const modal = document.getElementById('authModal');
const title = document.getElementById('modalTitle');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeModal = document.getElementById('closeModal');

const modal = document.getElementById('authModal');
const title = document.getElementById('modalTitle');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeModal = document.getElementById('closeModal');

if (loginBtn && modal && title) {
  loginBtn.addEventListener('click', () => {
    title.textContent = 'Đăng nhập VietTruck';
    modal.classList.add('open');
  });
}

if (signupBtn && modal && title) {
  signupBtn.addEventListener('click', () => {
    title.textContent = 'Đăng ký VietTruck';
    modal.classList.add('open');
  });
}

if (closeModal && modal) {
  closeModal.addEventListener('click', () => {
    modal.classList.remove('open');
  });
}

if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });
}const postCargoBtn = document.getElementById('postCargoBtn');
if (postCargoBtn) {
  postCargoBtn.addEventListener('click', () => {
    window.location.href = 'dang-hang.html';
  });
}

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

/* ===== KẾT NỐI CÁC NÚT TRANG CHỦ VIETTRUCK ===== */

document.addEventListener('click', function (e) {

  /* Xem chi tiết hàng hóa */
  const cargoButton = e.target.closest('#cargoList .mini-btn');

  if (cargoButton) {
    window.location.href = 'tim-hang.html';
    return;
  }


  /* Xem chi tiết xe trống */
  const truckButton = e.target.closest('#truckList .mini-btn');

  if (truckButton) {
    window.location.href = 'tim-xe.html';
    return;
  }


  /* Xem tất cả */
  const link = e.target.closest('a');

  if (link) {
    const text = link.textContent.trim();

    const parentText = link.parentElement
      ? link.parentElement.textContent
      : '';

    if (text.includes('Xem tất cả')) {

      if (parentText.includes('Hàng hóa')) {
        e.preventDefault();
        window.location.href = 'tim-hang.html';
        return;
      }

      if (parentText.includes('Xe trống')) {
        e.preventDefault();
        window.location.href = 'tim-xe.html';
        return;
      }
    }
  }


  /* Các ô dịch vụ trên trang chủ */
  const card = e.target.closest('.feature, .feature-item, .service-card');

  if (card) {

    const text = card.textContent.trim();

    if (text.includes('Đăng hàng miễn phí')) {
      window.location.href = 'dang-hang.html';
      return;
    }

    if (text.includes('Hàng chiều về')) {
      window.location.href = 'hang-chieu-ve.html';
      return;
    }

    if (text.includes('Đấu giá cước')) {
      window.location.href = 'trung-tam-bao-gia.html';
      return;
    }

    if (text.includes('Theo dõi hành trình')) {
      window.location.href = 'lich-su-hanh-trinh.html';
      return;
    }

    if (text.includes('Thanh toán an toàn')) {
      window.location.href = 'vi-viettruck.html';
      return;
    }

    if (text.includes('Hỗ trợ 24/7')) {
      window.location.href = 'ho-tro-khieu-nai.html';
      return;
    }
  }

});
