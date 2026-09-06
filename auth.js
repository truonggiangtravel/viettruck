async function getCurrentSession() {
  const {
    data: { session },
    error
  } = await window.supabaseClient.auth.getSession();

  if (error) {
    console.error("Lỗi lấy phiên đăng nhập:", error);
    return null;
  }

  return session;
}

async function requireLogin() {
  const session = await getCurrentSession();

  if (!session) {
    window.location.replace("dang-nhap.html");
    return null;
  }

  return session;
}

async function logout() {
  const { error } = await window.supabaseClient.auth.signOut();

  if (error) {
    console.error("Lỗi đăng xuất:", error);
    return;
  }

  window.location.replace("dang-nhap.html");
}
