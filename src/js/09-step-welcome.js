
function renderStepWelcome(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"3"),"شروع کار"]));
  card.appendChild(el("div",{class:"desc"},"شماره نمونه را وارد کنید و سپس مشخص کنید گزارش رسمی می‌خواهید یا فقط آسفالت را بررسی می‌کنید. برای گزارش رسمی، شماره کاربر و صحت شماره نمونه الزامی است."));

  // ۱) شماره نمونه و شماره کاربر در یک سطر و با کادرهای مجزا
  const topIdsRow = el("div",{class:"grid",style:"margin-bottom:14px;"});
  const sampleField = makeField("sampleNo","شماره نمونه",{hint:"ورود شماره نمونه یکتا و صحیح بر عهده کاربر است"});
  const sampleInp = sampleField.querySelector("input");

  const userField = el("div",{class:"field"});
  userField.appendChild(el("label",{},["شماره کاربر",el("span",{class:"hint"},"کد اختصاص‌یافته به کاربر")]));
  const userInput = el("input",{type:"text",value:S.userCode||"",placeholder:"مثلاً 001",maxlength:"20"});
  if(S.userCode) userInput.readOnly = true;
  userField._validator = ()=>S.archivedReport||S.reportMode==="archived"||S.reportMode==="review"||/^[A-Za-z0-9-]{1,20}$/.test(toLatinDigits(userInput.value).trim()) ? "" : "شماره کاربر باید ۱ تا ۲۰ نویسه و شامل حروف لاتین، عدد یا خط تیره باشد.";
  userField.appendChild(userInput);
  userField.appendChild(el("div",{class:"error-msg"},"شماره کاربر باید ۱ تا ۲۰ نویسه و شامل حروف لاتین، عدد یا خط تیره باشد."));

  topIdsRow.appendChild(sampleField);
  topIdsRow.appendChild(userField);
  card.appendChild(topIdsRow);

  // ۲) ردیف اول دکمه‌ها: ۳ دکمه هم‌ارز (فقط یکی فعال و ثابت می‌ماند)
  const modeGroup = el("div",{class:"choice-group start-top-choices"});
  const optLoadReport = el("div",{class:"choice start-choice-top"+(S.startChoice==="loadReport"?" selected":"")},[
    el("div",{class:"title"},"فراخوان گزارش آرشیوشده"),
    el("div",{class:"desc2"},"بارگذاری فایل خام گزارش قبلی و بازبینی آن")
  ]);
  const officialMode = el("div",{class:"choice start-choice-top"+(S.reportMode==="official" && S.startChoice!=="loadReport"?" selected":"")},[
    el("div",{class:"title"},"گزارش رسمی با شماره سریال"),
    el("div",{class:"desc2"},"فایل خام ذخیره می‌شود و دریافت تصویر پس از ذخیره فعال خواهد شد")
  ]);
  const reviewMode = el("div",{class:"choice start-choice-top"+(S.reportMode==="review" && S.startChoice!=="loadReport"?" selected":"")},[
    el("div",{class:"title"},"بررسی آسفالت"),
    el("div",{class:"desc2"},"برای مشاهده و تحلیل؛ بدون شماره سریال و بدون ذخیره تصویر")
  ]);
  modeGroup.appendChild(optLoadReport); modeGroup.appendChild(officialMode); modeGroup.appendChild(reviewMode);
  card.appendChild(modeGroup);

  // ۳) ردیف دوم دکمه‌ها: دقیقاً زیر دکمه‌های ردیف اول و هم‌تراز با آن‌ها
  const cg = el("div",{class:"choice-group start-bottom-choices"});
  const optNew = el("div",{class:"choice start-choice-bottom"+(S.designChoice==="new"?" selected":"")},[
    el("div",{class:"title"},"ورود اطلاعات طرح جدید"),
    el("div",{class:"desc2"},"تعریف یک طرح اختلاط تازه در مرحله بعد")
  ]);
  const optLoad = el("div",{class:"choice start-choice-bottom"+(S.designChoice==="load"?" selected":"")},[
    el("div",{class:"title"},"فراخوان طرح ذخیره‌شده"),
    el("div",{class:"desc2"},"انتخاب فایل JSON طرح اختلاط که قبلاً ذخیره کرده‌اید")
  ]);
  const optTech = el("div",{class:"choice start-choice-bottom"+(S.techLoaded?" selected":"")},[
    el("div",{class:"title"},"دریافت اطلاعات تکنسین QC"),
    el("div",{class:"desc2"},"بارگذاری فایل JSON برنامه تکنسین؛ اطلاعات خام آزمایش به فرم‌های گزارشگر منتقل می‌شود")
  ]);
  cg.appendChild(optNew); cg.appendChild(optLoad); cg.appendChild(optTech);
  card.appendChild(cg);

  const modeField = el("div",{class:"field",style:"margin-top:6px;"});
  modeField._validator = ()=>S.archivedReport||S.reportMode ? "" : "لطفاً نوع استفاده را انتخاب کنید.";
  modeField.appendChild(el("div",{class:"error-msg"},"لطفاً نوع استفاده را انتخاب کنید."));
  card.appendChild(modeField);

  const startField = el("div",{class:"field",style:"margin-top:4px;"});
  startField._key = "startChoice";
  startField._required = true;
  startField.appendChild(el("div",{class:"error-msg"},"لطفاً یکی از گزینه‌های بالا را برای شروع انتخاب کنید."));
  card.appendChild(startField);

  const fileInput = el("input",{type:"file",accept:"application/json",style:"display:none;"});
  const reportFileInput = el("input",{type:"file",accept:"application/json",style:"display:none;"});
  const technicianFileInput = el("input",{type:"file",accept:"application/json",style:"display:none;"});
  const loadMsg = el("div",{style:"font-size:12px;font-weight:600;margin-top:10px;color:var(--ink-soft);"},"");
  card.appendChild(fileInput);
  card.appendChild(reportFileInput);
  card.appendChild(technicianFileInput);
  card.appendChild(loadMsg);

  // ۴) توضیحات، پیش‌نمایش شماره سریال (نارنجی و وسط‌چین) و تأیید مسئولیت در پایین دکمه‌ها
  const serialSettings = el("div",{class:"field",style:"margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:10px;"});
  serialSettings.appendChild(el("div",{style:"font-weight:700;margin-bottom:6px;"},"مشخصات شماره‌گذاری گزارش رسمی"));

  const serialPreview = el("div",{style:"margin:10px 0;font-weight:800;font-size:14.5px;color:var(--amber);text-align:center;direction:ltr;unicode-bidi:isolate;"},"");
  serialSettings.appendChild(serialPreview);
  serialSettings.appendChild(el("div",{style:"font-size:12px;color:var(--ink-soft);margin-top:4px;"},"فرمت شماره سریال: ASR_تاریخ نمونه‌برداری_شماره کاربر_شماره طرح_شماره نمونه (مثال: ASR_14050821_001_024_143)"));

  const responsibilityBox=el("div",{style:"margin-top:12px;padding:12px;border:1px solid var(--ui-mid);border-radius:8px;background:var(--ui-deep);color:#f1f6f8;font-size:12px;line-height:1.9;"});
  responsibilityBox.appendChild(el("div",{style:"font-weight:700;color:#fff;margin-bottom:3px;"},"مسئولیت یکتایی شماره نمونه و شماره سریال"));
  responsibilityBox.appendChild(el("div",{},"برنامه به سابقه گزارش‌ها در دستگاه‌ها یا مرورگرهای دیگر دسترسی ندارد و یکتایی شماره سریال را به‌صورت خودکار کنترل نمی‌کند. مسئولیت وارد کردن «شماره نمونه» درست و غیرتکراری و نگهداری فایل خام بر عهده کاربر است."));
  const responsibilityLabel=el("label",{style:"display:block;margin-top:8px;cursor:pointer;"});
  const responsibilityCheck=el("input",{type:"checkbox"});
  responsibilityCheck.checked=!!S.serialResponsibilityConfirmed;
  responsibilityLabel.appendChild(responsibilityCheck);
  responsibilityLabel.appendChild(document.createTextNode(" شماره نمونه را بررسی کردم و مسئولیت صحت آن، یکتا بودن شماره سریال و نگهداری فایل خام را می‌پذیرم."));
  responsibilityBox.appendChild(responsibilityLabel);
  const responsibilityField=el("div",{class:"field"});
  responsibilityField._validator=()=>S.archivedReport||S.reportMode!=="official"||responsibilityCheck.checked?"":"برای گزارش رسمی، تأیید مسئولیت صحت شماره نمونه لازم است.";
  responsibilityField.appendChild(el("div",{class:"error-msg"},"برای گزارش رسمی، تأیید مسئولیت صحت شماره نمونه لازم است."));
  serialSettings.appendChild(responsibilityBox); serialSettings.appendChild(responsibilityField);
  card.appendChild(serialSettings);

  function syncTopRowClasses(){
    optLoadReport.classList.toggle("selected", S.startChoice==="loadReport");
    officialMode.classList.toggle("selected", S.reportMode==="official" && S.startChoice!=="loadReport");
    reviewMode.classList.toggle("selected", S.reportMode==="review" && S.startChoice!=="loadReport");
  }

  function syncBottomRowClasses(){
    optNew.classList.toggle("selected", S.designChoice==="new");
    optLoad.classList.toggle("selected", S.designChoice==="load");
    optTech.classList.toggle("selected", !!S.techLoaded);
  }

  const refreshSerialPreview=()=>{
    S.userCode=toLatinDigits(userInput.value).trim();
    serialSettings.style.display="block";
    serialPreview.style.display=S.reportMode==="official"?"block":"none";
    responsibilityBox.style.display=S.reportMode==="official"?"block":"none";
    serialPreview.textContent=S.reportMode==="official"&&userField._validator()==="" ? "پیش‌نمایش شماره سریال: "+makeReportSerial() : "";
    updateStartSerialControls();
  };
  function updateStartSerialControls(){
    const revMode=S.reportMode==="review";
    sampleInp.disabled=revMode;
    sampleField.classList.toggle("start-serial-disabled",revMode);
    if(revMode) clearFieldError(sampleField);
    const locked=S.reportMode==="review"||S.reportMode==="archived"||S.archivedReport||S.startChoice==="loadReport";
    const archiveLoaded=!!S.archivedReport;
    serialSettings.classList.toggle("start-serial-disabled",locked&&!archiveLoaded);
    userField.classList.toggle("start-serial-disabled",locked&&!archiveLoaded);
    userInput.disabled=locked;
    responsibilityCheck.disabled=locked||S.rawSaved;
  }
  function chooseReportMode(mode){
    if(S.rawSaved){showToast("پس از ذخیره فایل خام، نوع گزارش و شماره سریال این گزارش تغییر نمی‌کند.","err");return;}
    if(S.rawSaveRequested&&mode!==S.reportMode){S.rawSaveRequested=false;S.reportSerial="";}
    if(S.archivedReport){S.archivedReport=false;S.reportSerial="";S.confirmed=false;S.reportGenerated=false;}
    if(S.startChoice==="loadReport"){S.startChoice=S.designChoice || (S.techLoaded?"loadTechnician":"");}
    S.reportMode=mode;
    syncTopRowClasses();
    refreshSerialPreview();
  }
  officialMode.addEventListener("click",()=>chooseReportMode("official"));
  reviewMode.addEventListener("click",()=>chooseReportMode("review"));
  userInput.addEventListener("input",refreshSerialPreview);
  sampleInp.addEventListener("input",refreshSerialPreview);
  userInput.addEventListener("blur",()=>{ if(!S.userCode && userField._validator()===""){ try{localStorage.setItem("asphaltReporterUserCode",S.userCode);}catch(e){} userInput.readOnly=true; } });
  responsibilityCheck.addEventListener("change",()=>{S.serialResponsibilityConfirmed=responsibilityCheck.checked;});
  refreshSerialPreview();

  function persistUserCodeIfValid(){
    S.userCode=toLatinDigits(userInput.value).trim();
    try{
      if(!localStorage.getItem("asphaltReporterUserCode") && /^[A-Za-z0-9-]{1,20}$/.test(S.userCode)){
        localStorage.setItem("asphaltReporterUserCode",S.userCode); userInput.readOnly=true;
      }
    }catch(e){}
  }

  function selectDesignChoice(choiceVal){
    persistUserCodeIfValid();
    S.designChoice = choiceVal;
    S.startChoice = choiceVal;
    syncBottomRowClasses();
    updateStartSerialControls();
    refreshSerialPreview();
    startField.classList.remove("invalid");
  }

  optNew.addEventListener("click", ()=>{
    persistUserCodeIfValid();
    if(S.techLoaded){
      selectDesignChoice("new");
      loadMsg.textContent = "✓ طرح جدید انتخاب شد (اطلاعات تکنسین QC همچنان فعال است).";
      loadMsg.style.color = "var(--ok)";
    } else {
      resetForNewReport(true);
    }
  });

  optLoad.addEventListener("click", ()=>{
    fileInput.value = "";
    fileInput.click();
  });

  optLoadReport.addEventListener("click", ()=>{
    reportFileInput.value = "";
    reportFileInput.click();
  });

  optTech.addEventListener("click", ()=>{
    persistUserCodeIfValid();
    technicianFileInput.value = "";
    technicianFileInput.click();
  });

  technicianFileInput.addEventListener("change", ()=>{
    if(!technicianFileInput.files || !technicianFileInput.files[0]) return;
    loadTechnicianDataFromFile(technicianFileInput.files[0], (ok, message)=>{
      if(!ok){
        loadMsg.textContent = message || "فایل JSON تکنسین معتبر نیست.";
        loadMsg.style.color = "var(--err)";
        showToast(loadMsg.textContent, "err");
        return;
      }
      S.techLoaded = true;
      S.startChoice = S.designChoice || "loadTechnician";
      syncBottomRowClasses();
      startField.classList.remove("invalid");
      const blockedAt = firstInvalidStepBefore(10);
      currentStep = blockedAt === -1 ? 10 : blockedAt;
      renderApp();
      const cardEl = document.querySelector(".card");
      if(cardEl && blockedAt !== -1) validateStep(cardEl);
      if(cardEl) markImportMissingFields(cardEl);
      showToast("اطلاعات تکنسین دریافت شد؛ فیلدهای ناقص با کادر نارنجی مشخص شده‌اند");
    });
  });

  fileInput.addEventListener("change", ()=>{
    if(!fileInput.files || !fileInput.files[0]) return;
    loadDesignFromFile(fileInput.files[0], (ok)=>{
      if(ok){
        selectDesignChoice("load");
      }
      loadMsg.textContent = ok ? ("✓ طرح «"+(S.designName||"")+"» با موفقیت بارگذاری شد.") : "فایل طرح معتبر نیست.";
      loadMsg.style.color = ok ? "var(--ok)" : "var(--err)";
      if(ok) showToast("طرح «" + (S.designName || "") + "» بارگذاری شد");
    });
  });

  reportFileInput.addEventListener("change", ()=>{
    if(!reportFileInput.files || !reportFileInput.files[0]) return;
    loadFullReportFromFile(reportFileInput.files[0], (ok)=>{
      if(!ok){
        loadMsg.textContent = "فایل اطلاعات گزارش معتبر نیست.";
        loadMsg.style.color = "var(--err)";
        showToast("فایل انتخاب‌شده معتبر نیست", "err");
        return;
      }
      technicianImportActive = false;
      S.techLoaded = false;
      S.designChoice = "";
      S.startChoice = "loadReport";
      syncTopRowClasses();
      syncBottomRowClasses();
      updateStartSerialControls();
      const blockedAt = firstInvalidStepBefore(10);
      if(blockedAt === -1){
        currentStep = 10;
        renderApp();
        window.scrollTo({top:0, behavior:"smooth"});
        showToast("تمامی اطلاعات طرح و آزمایش‌ها بارگذاری و گزارش آماده شد");
      } else {
        currentStep = blockedAt;
        renderApp();
        const cardEl = document.querySelector(".card");
        if(cardEl) validateStep(cardEl);
        showToast("اطلاعات بارگذاری شد؛ لطفاً فیلد مشخص‌شده را بررسی کنید", "err");
      }
    });
  });
}
