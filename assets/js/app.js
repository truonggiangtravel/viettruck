const cargo=[["Hà Nội → Hồ Chí Minh","Hàng điện tử · 5 tấn","Thỏa thuận"],["Bắc Ninh → Đà Nẵng","Máy móc · 10 tấn","12.000.000 đ"],["Hải Phòng → Hà Nội","Hàng tiêu dùng · 3 tấn","Thỏa thuận"],["Đồng Nai → Cần Thơ","Nông sản · 15 tấn","28.000.000 đ"],["TP.HCM → Bình Dương","Vật liệu xây dựng · 8 tấn","Thỏa thuận"]];const trucks=[["Xe tải thùng 5 tấn","Hà Nội → Hồ Chí Minh","Sẵn sàng"],["Xe container 15 tấn","Hải Phòng → Đà Nẵng","Sẵn sàng"],["Xe tải lạnh 3.5 tấn","TP.HCM → Hà Nội","Sẵn sàng"],["Xe đầu kéo 30 tấn","Bắc Ninh → Cần Thơ","Sẵn sàng"],["Xe tải thùng 8 tấn","Đồng Nai → Hải Phòng","Sẵn sàng"]];function renderList(id,rows,icon){document.getElementById(id).innerHTML=rows.map(r=>`<div class="list-item"><div class="thumb">${icon}</div><div><h4>${r[0]}</h4><small>${r[1]}</small></div><div class="price">${r[2]}</div><button class="mini-btn">Xem chi tiết</button></div>`).join('')}renderList('cargoList',cargo,'📦');renderList('truckList',trucks,'🚚');document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById('searchBtn').textContent=t.dataset.tab==='find-truck'?'Tìm xe ngay':'Tìm hàng ngay'}));document.querySelectorAll('.popular button').forEach(btn=>btn.addEventListener('click',()=>{const[a,b]=btn.textContent.split('→').map(s=>s.trim());document.getElementById('from').value=a;document.getElementById('to').value=b}));document.getElementById('searchBtn').addEventListener('click',()=>{const f=document.getElementById('from').value||'điểm đi',t=document.getElementById('to').value||'điểm đến';alert(`Đang tìm chuyến phù hợp: ${f} → ${t}

Đây là bản demo giao diện.`)});const modal = document.getElementById('authModal');
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
