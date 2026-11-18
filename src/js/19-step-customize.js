
function renderStepCustomize(card) {
  card.innerHTML = "";
  const container = el("div", { class: "about-container" });
  container.appendChild(el("h2",{},[
    el("span",{class:"num"},"2"),
    "شخصی‌سازی"
  ]));

  const p1 = el("p", { class: "about-text" });
  p1.innerHTML = `نسخه ای که در اختیار شماست ، نسخه ی عمومی برنامه است که بصورت رایگان انتشار پیدا کرده. امکانات برنامه در حد "ضروریات" است . طبعاً برای همکارانی که نیازمند برنامه ای حرفه ای تر هستند ، <span style="color:#1a6bbf;"><strong>نسخه ی دیگری در محیط پایتون</strong></span> طراحی شده است که امکانات ویژه ای دارد . از جمله :`;

  const list = el("ul", { class: "about-list" }, [
    el("li", {}, "ثبت تک تک مشتریان در بانک اطلاعات برنامه"),
    el("li", {}, "ذخیره ی تمام نتایج با شماره سریال یکتا در داخل برنامه"),
    el("li", {}, "امکان جستجو و رویت گزارشات پیشین (ReadOnly)"),
    el("li", {}, "تعریف رواداریها و حدود ویژه بر اساس مشخصات خصوصی پروژه"),
    el("li", {}, "گزارش تحلیل عددی توسط برنامه بر اساس مشخصات و رواداریهای اعلامی")
  ]);

  const p2 = el("p", { class: "about-text" });
  p2.innerHTML = `علاوه بر این موارد ، این نسخه از برنامه قادر به ارائه ی <strong>"تحلیل هوشمند"</strong> گزارش بر اساس بانک اطلاعاتی است که از چند مرجع گردآوری و به برنامه آموزش داده شده است . این مراجع عبارتند از :`;

  const subList = el("ul", { class: "about-list", style: "list-style-type: disc; margin-right: 20px;" }, [
    el("li", {}, "رفرنسهای معتبر فنی (نشریات 101 ، 234 و ضابطه ی 773)"),
    el("li", {}, "تجربیات فنی اعتبار سنجی شده در محیط کارخانه و واحد کنترل کیفیت")
  ]);

  const p3 = el("p", { class: "about-text" });
  p3.innerHTML = `مجموعه ی این اطلاعات که بالغ بر چند صد بلوک اطلاعاتی بوده پی از ماهها مطابقت با رفرنسهای فنی ، بررسی همزمان توسط 4 هوش مصنوعی و نهایتا اطمینان از صحت آنها در قالب "تحلیل هوشمند" به برنامه اضافه شده است . لازم به تاکید است که <span style="color:#1a6bbf;">این الگو تاکنون در هیچیک از نرم افزارهای مشابه عملیاتی نشده</span> و <em>علاوه بر بومی بودن ، بصورت آفلاین</em> عمل می نماید.`;

  const p4 = el("p", { class: "about-text", style: "margin-top:20px; font-weight:bold; color:#1a6bbf;" }, "برای اظهار نظر در خصوص برنامه ی فعلی ، کسب اطلاعات بیشتر و در صورت تمایل ، استفاده از نرم افزار اختصاصی، میتوانید از راههای زیر با ما تماس بگیرید");

  const contactInfo = el("div", { style: "margin-top:15px; border-top:1px solid #eee; pt:10px; line-height:1.8;" }, [
    el("div", {}, "Email : afshinkhatami@gmail.com"),
    el("div", {}, [
      el("span", {}, "Tel : 09111204988 "),
      el("span", { style: "font-size:0.85em; font-style:italic; color:#666;" }, " (مستقیم یا در پیام رسانهای داخلی و خارجی)")
    ])
  ]);

  container.appendChild(p1);
  container.appendChild(list);
  container.appendChild(p2);
  container.appendChild(subList);
  container.appendChild(p3);
  container.appendChild(p4);
  container.appendChild(contactInfo);

  // --- کادر شخصی‌سازی لوگو و نام شرکت QC در زیر متن اصلی ---
  const brandData = getQcBranding();
  const customPanel = el("div", { class: "qc-custom-panel" });
  customPanel.appendChild(el("div", { class: "qc-panel-title" }, "🏢 تنظیم لوگو و نام شرکت کنترل کیفیت (QC)"));

  const stackBox = el("div", { class: "qc-row-stack" });

  // سطر اول: دریافت فایل لوگو، نمایش، تغییر و حذف آن
  const logoField = el("div", { class: "field" });
  const logoLabel = el("label", {}, [
    "تصویر لوگوی شرکت",
    el("span", { class: "hint", style: "color:var(--amber);font-weight:700;" }, "(حداکثر حجم مجاز: " + MAX_LOGO_SIZE_KB + " کیلوبایت)")
  ]);
  logoField.appendChild(logoLabel);

  const fileInput = el("input", {
    type: "file",
    accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/gif",
    style: "display:none;"
  });
  logoField.appendChild(fileInput);

  const previewBox = el("div", { class: "qc-logo-preview" });
  const btnUploadOrChange = el("button", { type: "button", class: "btn-ghost btn-sm-action" }, "");
  const btnDeleteLogo = el("button", { type: "button", class: "btn-danger-soft" }, "حذف لوگو");
  const sizeReminder = el("div", { class: "qc-size-note" }, "یادآوری: حجم فایل لوگو حداکثر " + MAX_LOGO_SIZE_KB + " کیلوبایت باشد (فرمت PNG یا JPG).");
  const errEl = el("div", { class: "error-msg", style: "margin-top:4px;" }, "");

  function syncLogoControls() {
    const currentLogo = getQcBranding().logoDataUrl;
    previewBox.innerHTML = "";
    if (currentLogo) {
      previewBox.appendChild(el("img", { src: currentLogo, alt: "لوگو" }));
      btnUploadOrChange.textContent = "تغییر لوگو";
      btnDeleteLogo.disabled = false;
    } else {
      const noLogoSpan = el("span", { class: "qc-no-logo" });
      noLogoSpan.innerHTML = "بدون<br>لوگو";
      previewBox.appendChild(noLogoSpan);
      btnUploadOrChange.textContent = "انتخاب فایل لوگو";
      btnDeleteLogo.disabled = true;
    }
  }
  syncLogoControls();

  btnUploadOrChange.addEventListener("click", () => {
    errEl.style.display = "none";
    fileInput.value = "";
    fileInput.click();
  });

  btnDeleteLogo.addEventListener("click", () => {
    errEl.style.display = "none";
    fileInput.value = "";
    setQcLogoDataUrl("");
    syncLogoControls();
    showToast("لوگوی شرکت حذف شد");
  });

  fileInput.addEventListener("change", () => {
    errEl.style.display = "none";
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const sizeKB = file.size / 1024;
    if (sizeKB > MAX_LOGO_SIZE_KB) {
      errEl.textContent = "حجم فایل انتخاب‌شده (" + Math.round(sizeKB) + " کیلوبایت) بیشتر از حد مجاز (" + MAX_LOGO_SIZE_KB + " کیلوبایت) است. لطفاً تصویر سبک‌تری انتخاب کنید.";
      errEl.style.display = "block";
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 240;
        let w = img.width || 120;
        let h = img.height || 120;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/png", 0.92);
        setQcLogoDataUrl(dataUrl);
        syncLogoControls();
        showToast("لوگوی شرکت با موفقیت بارگذاری و ذخیره شد");
      };
      img.onerror = () => {
        errEl.textContent = "خطا در خواندن فایل تصویر. لطفاً یک فایل تصویری معتبر انتخاب کنید.";
        errEl.style.display = "block";
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // چیدمان در ابتدای سطر اول: دریافت فایل / تغییر، نمایش لوگو، حذف لوگو
  const logoRow = el("div", { class: "qc-logo-row" }, [
    btnUploadOrChange,
    previewBox,
    btnDeleteLogo
  ]);
  logoField.appendChild(logoRow);
  logoField.appendChild(sizeReminder);
  logoField.appendChild(errEl);

  // سطر دوم: دریافت نام شرکت QC در ابتدای سطر بعدی
  const nameField = el("div", { class: "field", style: "max-width: 420px;" });
  const nameLabel = el("label", {}, [
    "نام شرکت QC",
    el("span", { class: "hint" }, "(نمایش در سربرگ برنامه و صفحه گزارش نهایی)")
  ]);
  const nameInput = el("input", {
    type: "text",
    placeholder: "مثال: آزمایشگاه فنی کاوش",
    value: brandData.companyName
  });
  nameInput.addEventListener("input", () => {
    setQcCompanyName(nameInput.value);
  });
  nameField.appendChild(nameLabel);
  nameField.appendChild(nameInput);

  stackBox.appendChild(logoField);
  stackBox.appendChild(nameField);
  customPanel.appendChild(stackBox);
  container.appendChild(customPanel);

  card.appendChild(container);
}

  // سطر ۱۳ — "(مستقیم یا در پیام‌رسانهای...)" : ۲ سایز ریزتر + italic
  
