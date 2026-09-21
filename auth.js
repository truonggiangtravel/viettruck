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

// =====================================================
// VIETTRUCKS - MARKETING SOURCE TRACKING
// Ghi nhớ nguồn khách: Facebook / Zalo / Google / Referral
// =====================================================

(function saveVietTrucksMarketingSource() {
  try {
    const params = new URLSearchParams(window.location.search);

    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const utmContent = params.get("utm_content");
    const referralCode = params.get("ref");

    // Chỉ tạo/cập nhật tracking khi URL có thông tin marketing
    if (
      !utmSource &&
      !utmMedium &&
      !utmCampaign &&
      !utmContent &&
      !referralCode
    ) {
      return;
    }

    // Lấy nguồn đầu tiên đã lưu, nếu có
    let existing = {};

    try {
      existing = JSON.parse(
        localStorage.getItem("viettrucks_marketing_source") || "{}"
      );
    } catch (e) {
      existing = {};
    }

    // First-touch attribution:
    // nguồn đầu tiên đưa khách đến VietTrucks được giữ lại
    const marketingData = {
      marketing_source:
        existing.marketing_source || utmSource || null,

      marketing_medium:
        existing.marketing_medium || utmMedium || null,

      marketing_campaign:
        existing.marketing_campaign || utmCampaign || null,

      marketing_content:
        existing.marketing_content || utmContent || null,

      referral_code:
        existing.referral_code || referralCode || null,

      landing_page:
        existing.landing_page ||
        (window.location.pathname + window.location.search),

      first_utm_at:
        existing.first_utm_at || new Date().toISOString()
    };

    localStorage.setItem(
      "viettrucks_marketing_source",
      JSON.stringify(marketingData)
    );

    console.log(
      "VietTrucks marketing source:",
      marketingData
    );
  } catch (error) {
    // Tracking không được phép làm ảnh hưởng chức năng website
    console.error(
      "VietTrucks marketing tracking error:",
      error
    );
  }
})();
