async function requireLogin() {
  try {
    const { data, error } = await window.supabaseClient.auth.getSession();

    if (error) {
      console.error("Lỗi kiểm tra đăng nhập:", error);
      window.location.replace("dang-nhap.html");
      return false;
    }

    if (!data.session) {
      window.location.replace("dang-nhap.html");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Lỗi requireLogin:", err);
    window.location.replace("dang-nhap.html");
    return false;
  }
}

async function logout() {
  try {
    await window.supabaseClient.auth.signOut();
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
  }

  window.location.replace("dang-nhap.html");
}
