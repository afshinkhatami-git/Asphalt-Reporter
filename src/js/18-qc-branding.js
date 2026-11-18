
/* ===================== QC BRANDING (شخصی‌سازی نام شرکت QC و لوگو) ===================== */
const QC_STORAGE_KEY_NAME = "lian_qc_company_name";
const QC_STORAGE_KEY_LOGO = "lian_qc_company_logo";
const MAX_LOGO_SIZE_KB = 500;
let _memQcName = "";
let _memQcLogo = "";

function getQcBranding() {
  try {
    return {
      companyName: localStorage.getItem(QC_STORAGE_KEY_NAME) || _memQcName || "",
      logoDataUrl: localStorage.getItem(QC_STORAGE_KEY_LOGO) || _memQcLogo || ""
    };
  } catch (e) {
    return { companyName: _memQcName || "", logoDataUrl: _memQcLogo || "" };
  }
}

function setQcCompanyName(name) {
  const val = (name || "").trim();
  _memQcName = val;
  try {
    if (val) localStorage.setItem(QC_STORAGE_KEY_NAME, val);
    else localStorage.removeItem(QC_STORAGE_KEY_NAME);
  } catch (e) {}
  updateHeaderBrandingDOM();
}

function setQcLogoDataUrl(dataUrl) {
  const val = dataUrl || "";
  _memQcLogo = val;
  try {
    if (val) localStorage.setItem(QC_STORAGE_KEY_LOGO, val);
    else localStorage.removeItem(QC_STORAGE_KEY_LOGO);
  } catch (e) {}
  updateHeaderBrandingDOM();
}

function updateHeaderBrandingDOM() {
  const { companyName, logoDataUrl } = getQcBranding();
  const h1El = document.getElementById("mainHeaderTitle");
  if (h1El) {
    h1El.textContent = "برنامه گزارش آسفالت" + (companyName ? " " + companyName : "");
  }
  const logoSlot = document.getElementById("mainHeaderLogoSlot");
  if (logoSlot) {
    logoSlot.innerHTML = "";
    if (logoDataUrl) {
      logoSlot.style.display = "flex";
      logoSlot.appendChild(el("img", { src: logoDataUrl, alt: companyName || "لوگوی شرکت QC" }));
    } else {
      logoSlot.style.display = "none";
    }
  }
}
