
/* ===================== MAIN APP / NAV ===================== */
  const STEP_RENDERERS = [renderStepAbout, renderStepCustomize, renderStepWelcome, renderStep1, renderStep0, renderStep2, renderStep3, renderStep4, renderStep5, renderStepConflicts, renderStep6];




function markImportMissingFields(card){
  if(!technicianImportActive || !card || !card.querySelectorAll) return;
  const fields = Array.from(card.querySelectorAll(".field, td.fcell"));
  fields.forEach(host=>{
    const key = host._key;
    if(!key) return;
    if(reviewSkipped(key)){ host.classList.remove("import-missing"); return; }
    if(PROJECT_EMPTY_HIGHLIGHT_KEYS.indexOf(key) !== -1){ host.classList.remove("import-missing"); return; }
    const sp = fieldSpec(key);
    if(sp.optional || sp.virtual || (sp.activeIf && !sp.activeIf())) { host.classList.remove("import-missing"); return; }
    const raw = S[key];
    if(hasVal(raw) && String(raw).trim() !== "") { host.classList.remove("import-missing"); return; }
    const sg = sampleGroupOf(key);
    if(sg){
      const complete = sg.set.some(g=>g.every(_isFilled));
      if(complete){ host.classList.remove("import-missing"); return; }
      const partial = sg.set.some(g=>g.some(_isFilled) && !g.every(_isFilled));
      if(!partial && sg.set.indexOf(sg.grp)!==0){ host.classList.remove("import-missing"); return; }
      if(partial && !sg.grp.some(_isFilled)){ host.classList.remove("import-missing"); return; }
    }
    host.classList.add("import-missing");
  });
}

function getColorTheme(){
  try{return localStorage.getItem("asphaltReporterTheme")||"dark";}catch(e){return "dark";}
}
function setColorTheme(theme, lightButton, darkButton){
  const selected=theme==="dark"?"dark":"light";
  document.body.dataset.theme=selected;
  try{localStorage.setItem("asphaltReporterTheme",selected);}catch(e){}
  // دکمه‌ها هنگام ساخت header هنوز به document متصل نیستند؛ رفرنس مستقیم لازم است.
  const light=lightButton || document.getElementById("themeLight");
  const dark=darkButton || document.getElementById("themeDark");
  if(light)light.setAttribute("aria-pressed",String(selected==="light"));
  if(dark)dark.setAttribute("aria-pressed",String(selected==="dark"));
}

function renderApp(){
  const app = document.getElementById("app");
  app.innerHTML = "";

  const appMain = el("div", {class: "app-main"});
  const appSidebar = el("div", {class: "app-sidebar"});

  const qcBrand = getQcBranding();
  const headerTitleText = "برنامه گزارش آسفالت" + (qcBrand.companyName ? " " + qcBrand.companyName : "");
  const headerLogoSlot = el("div", {
    id: "mainHeaderLogoSlot",
    class: "header-logo-center",
    style: qcBrand.logoDataUrl ? "display:flex;" : "display:none;"
  }, qcBrand.logoDataUrl ? [el("img", { src: qcBrand.logoDataUrl, alt: qcBrand.companyName || "لوگوی شرکت QC" })] : []);

  appMain.appendChild(el("header",{class:"top"},[
    el("div",{class:"brand"},[el("div",{class:"dot"}),el("div",{},[ 
      el("h1",{id:"mainHeaderTitle"}, headerTitleText),
      el("div",{class:"sub"},"طرح اختلاط بیندر / توپکا — کنترل کیفیت")
    ])]),
    headerLogoSlot,
    el("div",{style:"display:flex;gap:8px;align-items:center;flex-wrap:wrap;"},[
      (()=>{
        const lightBtn=el("button",{type:"button",id:"themeLight", "aria-pressed":String(getColorTheme()==="light")},"روشن");
        const darkBtn=el("button",{type:"button",id:"themeDark", "aria-pressed":String(getColorTheme()==="dark")},"تیره");
        const group=el("div",{class:"theme-switch",role:"group","aria-label":"انتخاب تم رنگی"},[lightBtn,darkBtn]);
        lightBtn.addEventListener("click",()=>setColorTheme("light",lightBtn,darkBtn));
        darkBtn.addEventListener("click",()=>setColorTheme("dark",lightBtn,darkBtn));
        return group;
      })(),
      el("div",{class:"badge"}, "مرحله "+(currentStep+1)+" از "+STEP_TITLES.length)
    ])
  ]));
  setColorTheme(getColorTheme());

  const stepper = el("div",{class:"stepper"});
  let activePill = null;
  STEP_TITLES.forEach((t,i)=>{
    const cls = i===currentStep
  ? "step-pill active" + (i===1?" personalize-tab":"")
  : (i<currentStep ? "step-pill done" : "step-pill" + (i===1?" personalize-tab":""));

    const pill = el("div",{class:cls}, t);
    if(i===currentStep) activePill = pill;
    pill.addEventListener("click", ()=>{
      if(i===currentStep) return;
      
      if(i<currentStep){
        if(i===2&&S.rawSaveRequested&&!S.rawSaved){S.rawSaveRequested=false;S.reportSerial="";}
        currentStep=i; renderApp(); window.scrollTo({top:0,behavior:"smooth"}); return;
      }
      const blockedAt = firstInvalidStepBefore(i);
      if(blockedAt===-1){
        currentStep=i; renderApp(); window.scrollTo({top:0,behavior:"smooth"});
      } else {
        currentStep=blockedAt; renderApp();
        const cardEl = document.querySelector(".card");
        if(cardEl) validateStep(cardEl);
        showToast("برای ادامه، فیلدهای قرمز را تکمیل یا اصلاح کنید", "err");
        const bad = document.querySelector(".field.invalid, td.invalid");
        if(bad) bad.scrollIntoView({behavior:"smooth", block:"center"});
        else window.scrollTo({top:0,behavior:"smooth"});
      }
    });
    stepper.appendChild(pill);
  });
  appSidebar.appendChild(stepper);
  if(activePill && window.matchMedia("(max-width: 900px)").matches){
    requestAnimationFrame(()=>activePill.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"}));
  }

  const card = el("div",{class: (currentStep>=4 && currentStep<=10) ? "card card-daily" : "card"});

  STEP_RENDERERS[currentStep](card);
  if(technicianImportActive) markImportMissingFields(card);
  appMain.appendChild(card);

  appMain.appendChild(el("footer",{class:"foot"}, "برای رفتن به هر مرحله، روی عنوان همان تب در سمت راست صفحه کلیک کنید. این ابزار بدون نیاز به سرور یا اینترنت، به‌صورت کاملاً محلی روی سیستم شما اجرا می‌شود."));
  appMain.appendChild(el("div",{class:"app-credit"}, "طراحی توسط آکادمی آموزشی لیان"));

  app.appendChild(appSidebar);
  app.appendChild(appMain);
}


/* بررسی می‌کند آیا همه‌ی مراحل قبل از targetStep فیلدهای الزامی‌شان پر است؛
   در صورت ناقص بودن، شماره‌ی اولین مرحله‌ی ناقص را برمی‌گرداند، وگرنه -1 */
function firstInvalidStepBefore(targetStep){
  // تب‌های «طراحی این وب-اپ»(0) و «شخصی‌سازی»(1) اطلاعاتی وارد/محاسبه نمی‌شوند،
  // پس ورود به خودشان بدون اعتبارسنجی مجاز است. اما از تب «شروع»(2) به بعد،
  // یعنی همان انتخاب طرح جدید/بارگذاری‌شده، باید پیش از رفتن به «طرح اختلاط»(3)
  // و مراحل بعدی، تکمیل شده باشد.
  if(targetStep <= 1){
    return -1;
  }

  for(let k=2;k<targetStep;k++){
    const temp = document.createElement("div");
    STEP_RENDERERS[k](temp);
    if(!validateStep(temp)) return k;
  }
  return -1;
}


/* کلید Enter داخل فیلدهای متنی/عددی، دقیقا مثل Tab، فوکوس را به فیلد بعدی
   می‌برد (به‌جز textarea که Enter در آن باید خط جدید بسازد، و به‌جز
   چک‌باکس/رادیو/فایل که رفتار پیش‌فرض خودشان حفظ می‌شود). چون این listener
   روی document نصب می‌شود، نیازی به نصب دوباره پس از هر renderApp نیست. */
function setupEnterAsTabNav(){
  document.addEventListener("keydown", (e)=>{
    if(e.key !== "Enter") return;
    const t = e.target;
    if(!t || t.tagName !== "INPUT") return;
    if(["checkbox","radio","file","button"].indexOf(t.type) !== -1) return;
    e.preventDefault();
    // خطای مشخص در ورودی: اجازه‌ی عبور از این باکس داده نمی‌شود
    const hostEl = t.closest(".field, td.fcell");
    if(hostEl && hostEl.classList.contains("invalid") && t.value.trim() !== "") return;
    // خطای ترتیب (تاریخ/وزن‌ها): همان لحظه‌ی Enter نشان بده و جلو نرو
    if(hostEl && hostEl._key && CROSS_KEYS[hostEl._key] && t.value.trim() !== ""){
      const ce = crossError(hostEl._key);
      if(ce){ showFieldError(hostEl, ce); hostEl.classList.add("cross-invalid"); return; }
    }
    
    // اگر در جدول وزن مخصوص هستیم، ناوبری ستونی
    const table = t.closest("table.sample-table");
    if(table && t.dataset.sample){
      const currentSample = t.dataset.sample;
      const allInputs = Array.from(table.querySelectorAll("input[data-sample]"));
      const sampleInputs = allInputs.filter(inp => inp.dataset.sample === currentSample);
      const idx = sampleInputs.indexOf(t);
      
      if(idx > -1 && idx < sampleInputs.length - 1){
        // رفتن به ورودی بعدی در همان ستون
        sampleInputs[idx + 1].focus();
        sampleInputs[idx + 1].select();
      } else if(idx === sampleInputs.length - 1){
        // آخرین ورودی ستون، رفتن به اولین ورودی ستون بعدی
        const nextSample = String(Number(currentSample) + 1);
        const nextColInputs = allInputs.filter(inp => inp.dataset.sample === nextSample);
        if(nextColInputs.length > 0){
          nextColInputs[0].focus();
          nextColInputs[0].select();
        } else {
          // اگر ستون بعدی نیست، خارج از جدول
          const focusable = Array.from(document.querySelectorAll("#app input, #app textarea, #app select"))
            .filter(elm => !elm.disabled && elm.offsetParent !== null);
          const tableLastIdx = focusable.indexOf(t);
          if(tableLastIdx > -1 && tableLastIdx < focusable.length - 1){
            focusable[tableLastIdx + 1].focus();
            if(typeof focusable[tableLastIdx + 1].select === "function"){
              focusable[tableLastIdx + 1].select();
            }
          }
        }
      }
      return;
    }
    
    // برای بقیه ورودی‌ها، ناوبری عادی
    const focusable = Array.from(document.querySelectorAll("#app input, #app textarea, #app select"))
      .filter(elm => !elm.disabled && elm.offsetParent !== null);
    const idx = focusable.indexOf(t);
    if(idx > -1 && idx < focusable.length - 1){
      const nextEl = focusable[idx+1];
      nextEl.focus();
      if(typeof nextEl.select === "function") nextEl.select();
    }
  });
}



document.addEventListener("DOMContentLoaded", ()=>{
  setupEnterAsTabNav();
  renderApp();
});
