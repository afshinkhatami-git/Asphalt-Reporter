
const DESIGN_KEYS = ["designName","designCode","asphaltSize","gsbSource","gsbDesign","pbaDesign","gac","pbOptimum","gmmDesign","gaggDesign",
  "g1","g2","g3",
  "specUp34","specLow34","specUp12","specLow12","specUp316","specLow316","specUp8","specLow8","specUp50","specLow50","specUp200","specLow200",
  "specUp112","specLow112","specUp1","specLow1","specUp34_25","specLow34_25","specUp12_25","specLow12_25","specUp38_25","specLow38_25","specUp4_25","specLow4_25","specUp8_25","specLow8_25","specUp50_25","specLow50_25","specUp200_25","specLow200_25"].concat(ACCEPT_KEYS);   // + حداقل/حداکثرهای محدوده‌ی پذیرش (accept.js)

function collectDesignData(){ const o={}; DESIGN_KEYS.forEach(k=>o[k]=S[k]); return o; }
function applyDesignData(o){
  DESIGN_KEYS.forEach(k=>{
    if(k === "asphaltSize" && technicianImportActive) return; // سایز نمونه‌ی تکنسین مبنای ساختار گزارش است
    if(k in o) S[k]=o[k];
  });
  if(!("asphaltSize" in o) && !technicianImportActive) S.asphaltSize = "19"; // فایل‌های طرح قدیمی فقط ساختار ۱۹ میلی‌متری داشتند
  ACCEPT_KEYS.forEach(k=>{ if(!(k in o)) S[k] = ""; });   // طرح بدون محدوده‌ی پذیرش → پیش‌فرض‌های استاندارد، نه مقادیر طرح قبلی
}

function showToast(msg, type){
  type = type || "ok";
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:" +
    (type === "ok" ? "#3a7d55" : "#b8452f") +
    ";color:#fff;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;" +
    "z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);font-family:inherit;direction:rtl;";
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = "opacity .3s";
    t.style.opacity = "0";
    setTimeout(() => { if(t.parentNode) document.body.removeChild(t); }, 300);
  }, 2000);
}

function resetForNewReport(fromNewDesignClick=false){
  technicianImportActive = false;
  const keepKeys = new Set([...DESIGN_KEYS,"userCode"]);
  const preservedMode = fromNewDesignClick ? S.reportMode : "";
  const defaults = {
    startChoice: fromNewDesignClick ? "new" : "",
    designChoice: fromNewDesignClick ? "new" : "",
    techLoaded: false,
    reportMode: preservedMode,
    serialResponsibilityConfirmed:false,
    reportSerial:"",
    rawSaved:false,
    rawSaveRequested:false,
    archivedReport:false,
    ringType: "digital",
    ringFactor: "",
    waxMethod: "without",
    gwax: "0.9",
    confirmed: false,
    reportGenerated: false
  };
  Object.keys(S).forEach(k => {
    if(keepKeys.has(k)) return;
    S[k] = defaults.hasOwnProperty(k) ? defaults[k] : "";
  });
  currentStep = fromNewDesignClick ? 3 : 2;
  renderApp();
  window.scrollTo({top:0, behavior:"smooth"});
}

function loadDesignFromFile(file, onDone){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(reader.result);
      applyDesignData(obj);
      onDone && onDone(true);
    }catch(e){ onDone && onDone(false); }
  };
  reader.readAsText(file, "utf-8");
}

/* دریافت پیش‌نویس JSON برنامه تکنسین QC؛ داده‌های خام حفظ می‌شوند و محاسبات در Reporter انجام می‌گیرد. */
function loadTechnicianDataFromFile(file, onDone){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(reader.result);
      if(!obj || typeof obj !== "object" || Array.isArray(obj)) { onDone && onDone(false,"ساختار فایل JSON معتبر نیست."); return; }
      const size = String(toLatinDigits(obj.asphaltSize ?? "")).trim();
      if(size !== "19" && size !== "25") { onDone && onDone(false,"سایز آسفالت در فایل مشخص نیست؛ فقط ۱۹ یا ۲۵ میلی‌متر پذیرفته می‌شود."); return; }
      const previousDesignSize = isAsphaltSize(S.asphaltSize);
      const savedReportMode = S.reportMode;
      const savedDesignChoice = S.designChoice;
      const savedSerialConfirm = S.serialResponsibilityConfirmed;
      resetForNewReport(false);
      S.reportMode = savedReportMode;
      S.designChoice = savedDesignChoice;
      S.serialResponsibilityConfirmed = savedSerialConfirm;
      if(previousDesignSize !== size){
        DESIGN_KEYS.forEach(k=>{ if(k !== "asphaltSize" && ACCEPT_KEYS.indexOf(k) === -1) S[k] = ""; });
        S.gsbSource = "design";
      }
      const common = ["projectName","employer","contractor","reqNo","reqDate","asphaltType","sampleDate","sampleTime","sampleLocation","ambientTemp","asphaltTemp","notes","gmm",
        "air1","air2","air3","water1","water2","water3","ssd1","ssd2","ssd3",
        "totalWeight","filterDryInitial","filterAfterTest","materialAfterWash","gasolineUsed","dishFactor","dialReading","flow"];
      common.forEach(k=>{ S[k] = obj[k] === undefined || obj[k] === null ? "" : String(obj[k]); });
      const importedSampleNo = obj.sampleNo ?? obj.sampleNumber;
      S.sampleNo = importedSampleNo === undefined || importedSampleNo === null ? "" : String(importedSampleNo);
      S.asphaltSize = size;
      const keys19 = ["ret34","ret12","ret316","ret8","ret50","ret200","crush34","crush12","crush316"];
      const keys25 = ["ret112","ret1","ret34_25","ret12_25","ret38_25","ret4_25","ret8_25","ret50_25","ret200_25","crush112","crush1","crush34","crush12","crush316","crush8"];
      (size === "19" ? keys19 : keys25).forEach(k=>{ S[k] = obj[k] === undefined || obj[k] === null ? "" : String(obj[k]); });
      S.techLoaded = true;
      S.startChoice = savedDesignChoice || "loadTechnician";
      S.confirmed = false;
      S.reportGenerated = false;
      technicianImportActive = true;
      onDone && onDone(true);
    }catch(e){ onDone && onDone(false,"خواندن فایل JSON با خطا مواجه شد."); }
  };
  reader.onerror = ()=>onDone && onDone(false,"امکان خواندن فایل انتخاب‌شده وجود ندارد.");
  reader.readAsText(file, "utf-8");
}

const FULL_REPORT_KEYS = [
  // اطلاعات طرح اختلاط
  "designName","designCode","gsbSource","gsbDesign","pbaDesign","gac","pbOptimum","gmmDesign","gaggDesign",
  "g1","g2","g3",
  "specUp34","specLow34","specUp12","specLow12","specUp316","specLow316",
  "specUp8","specLow8","specUp50","specLow50","specUp200","specLow200",
  "specUp112","specLow112","specUp1","specLow1","specUp34_25","specLow34_25","specUp12_25","specLow12_25","specUp38_25","specLow38_25","specUp4_25","specLow4_25","specUp8_25","specLow8_25","specUp50_25","specLow50_25","specUp200_25","specLow200_25",
  // اطلاعات پروژه و نمونه‌برداری
  "projectName","employer","contractor","reqNo","reqDate","reportDate",
  "plant","asphaltType","asphaltSize","designDate",
  "sampleDate","sampleTime","sampleLocation","sampleNo",
  "ambientTemp","asphaltTemp","notes",
  // وزن مخصوص مارشال و رایس
  "gmm",
  "air1","air2","air3","water1","water2","water3","ssd1","ssd2","ssd3",
  "wAir1","wAir2","wAir3","wWater1","wWater2","wWater3","wSsd1","wSsd2","wSsd3",
  // درصد قیر (اکستراکشن)
  "totalWeight","filterDryInitial","filterAfterTest",
  "materialAfterWash","gasolineUsed","dishFactor",
  // دانه‌بندی و درصد شکستگی
  "ret34","ret12","ret316","ret8","ret50","ret200",
  "ret112","ret1","ret34_25","ret12_25","ret38_25","ret4_25","ret8_25","ret50_25","ret200_25",
  "crush34","crush12","crush316","crush8","crush112","crush1",
  // آزمایش مارشال
  "waxMethod","gwax","ringType","ringFactor","dialReading","flow"
].concat(ACCEPT_KEYS);   // + حداقل/حداکثرهای محدوده‌ی پذیرش (accept.js)

function collectFullReportData(){
  const o = { _type: "asphalt_full_report", _savedAt: new Date().toISOString(), _reportSerial:S.reportSerial||"", _userCode:S.userCode||"", _reportMode:S.archivedReport?"archived":S.reportMode||"official" };
  FULL_REPORT_KEYS.forEach(k => { o[k] = S[k] ?? ""; });
  return o;
}

function applyFullReportData(o){
  if(!o || typeof o !== "object") return false;
  technicianImportActive = false;
  FULL_REPORT_KEYS.forEach(k => {
    if(k in o && o[k] !== undefined && o[k] !== null){
      S[k] = String(o[k]);
    }
  });
  ACCEPT_KEYS.forEach(k => { if(!(k in o)) S[k] = ""; });   // فایل بدون محدوده‌ی پذیرش → پیش‌فرض‌های استاندارد
  S.startChoice = "loadReport";
  S.designChoice = "";
  S.techLoaded = false;
  S.reportSerial = String(o._reportSerial||"");
  S.userCode = String(S.userCode||o._userCode||"");
  S.serialResponsibilityConfirmed=false;
  S.reportMode = "archived";
  S.archivedReport = !!S.reportSerial;
  S.rawSaved = false;
  S.rawSaveRequested = false;
  S.confirmed = false;
  S.reportGenerated = false;
  return true;
}

/* ===================== تاریخ شمسی و سریال گزارش =====================
   تاریخ شماره سریال از «تاریخ گزارش» گرفته می‌شود؛ تاریخ نامعتبر/خالی به تاریخ امروز شمسی برمی‌گردد. */
function gregorianToJalali(gy, gm, gd){
  const gdm = [0,31,59,90,120,151,181,212,243,273,304,334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) + gd + gdm[gm-1];
  let jy = -1595 + 33*Math.floor(days/12053);
  days %= 12053;
  jy += 4*Math.floor(days/1461);
  days %= 1461;
  if(days > 365){ jy += Math.floor((days-1)/365); days = (days-1) % 365; }
  const jm = days < 186 ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + (days < 186 ? days % 31 : (days-186) % 30);
  return [jy, jm, jd];
}

/* تاریخ شمسی امروز (ساعت سیستم کاربر) به شکل 1405/08/16 */
function todayShamsi(){
  const t = new Date(), j = gregorianToJalali(t.getFullYear(), t.getMonth()+1, t.getDate());
  return j[0] + "/" + String(j[1]).padStart(2,"0") + "/" + String(j[2]).padStart(2,"0");
}

/* تاریخ شمسی به‌صورت فشرده: 14050816 */
function shamsiDateCompact(){
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(String(S.reportDate || "").trim());
  const parts = m ? [+m[1], +m[2], +m[3]] : todayShamsi().split("/").map(Number);
  return String(parts[0]) + String(parts[1]).padStart(2,"0") + String(parts[2]).padStart(2,"0");
}
function sanitizeSerialToken(val, fallback="---"){
  const clean=toLatinDigits(String(val??"")).trim().replace(/[^0-9A-Za-z-]/g,"");
  return clean || fallback;
}
function sampleNumberForFilename(){
  return sanitizeSerialToken(S.sampleNo, "بدون-شماره");
}
function makeReportSerial(){
  const dt = shamsiDateCompact();
  const usr = sanitizeSerialToken(S.userCode, "USR");
  const dsn = sanitizeSerialToken(S.designCode, "DSN");
  const smp = sanitizeSerialToken(S.sampleNo, "SMP");
  return "ASR_" + dt + "_" + usr + "_" + dsn + "_" + smp;
}
function reportFileBase(serial=S.reportSerial || makeReportSerial()){
  return serial;
}

/* ===================== ذخیره‌ی فایل JSON با پرسیدن مسیر از کاربر =====================
   دو جا JSON ذخیره می‌شود: «طرح اختلاط» (تب طرح اختلاط) و «اطلاعات اولیه‌ی آسفالت» (تب گزارش نهایی).
   هر دو از همین تابع می‌گذرند و پنجره‌ی «ذخیره‌ی با نام» باز می‌شود تا کاربر پوشه و نام را خودش انتخاب کند.
   - Chrome / Edge / Opera (کامپیوتر): showSaveFilePicker. پارامتر id باعث می‌شود مرورگر آخرین پوشه‌ی هر نوع فایل را جدا به یاد بسپارد.
   - مرورگرهایی که این امکان را ندارند (Firefox، اندروید): ناچاریم دانلود معمولی انجام شود؛ مسیر را فقط
     تنظیم خود مرورگر («همیشه بپرس کجا ذخیره شود») کنترل می‌کند.
   خروجی: Promise با {ok, cancelled, picked, name}. باید مستقیماً داخل رویداد کلیک صدا زده شود (نیاز به user activation). */
function saveJsonWithPicker(text, fileName, pickerId){
  fileName = String(fileName).replace(/[\\/:*?"<>|]/g, "-");
  if(!/\.json$/i.test(fileName)) fileName += ".json";
  const writeIntoDirectory = async ()=>{
    const dir = await window.showDirectoryPicker({mode:"readwrite", id:pickerId || "asphalt-json-folder"});
    const handle = await dir.getFileHandle(fileName,{create:true});
    const writable = await handle.createWritable();
    await writable.write(text); await writable.close();
    return {ok:true,picked:true,name:fileName,directory:dir.name};
  };
  const saveAsFile = async ()=>{
    const handle=await window.showSaveFilePicker({
      suggestedName:fileName,
      types:[{description:"فایل JSON",accept:{"application/json":[".json"]}}],
      id:pickerId || "asphalt-json-file"
    });
    const writable=await handle.createWritable();
    await writable.write(text); await writable.close();
    return {ok:true,picked:true,name:handle.name};
  };
  if(typeof window.showDirectoryPicker === "function"){
    return writeIntoDirectory().catch(e=>{
      if(e && e.name==="AbortError") return {ok:false,cancelled:true};
      if(typeof window.showSaveFilePicker==="function") return saveAsFile().catch(x=>x&&x.name==="AbortError"?{ok:false,cancelled:true}:({ok:false,error:x}));
      return {ok:false,error:e};
    });
  }
  if(typeof window.showSaveFilePicker === "function"){
    return saveAsFile().catch(e=>e&&e.name==="AbortError"?{ok:false,cancelled:true}:({ok:false,error:e}));
  }
  alert("این مرورگر امکان انتخاب مستقیم پوشه یا نشانی ذخیره‌سازی را ارائه نمی‌کند. برای تعیین محل ذخیره، برنامه را در نسخه دسکتاپ Chrome یا Edge و از یک مبدأ امن (HTTPS یا localhost) باز کنید.");
  return Promise.resolve({ok:false,unsupported:true});
}

/* ۱) ذخیره‌ی طرح اختلاط */
function saveDesignToFile(){
  const name = (S.designName && S.designName.trim()) ? S.designName.trim() : "طرح-اختلاط";
  return saveJsonWithPicker(JSON.stringify(collectDesignData(), null, 2), name + ".json", "asphalt-design");
}

/* ۲) ذخیره‌ی اطلاعات اولیه‌ی آسفالت (فایل کامل گزارش) */
function saveFullReportToFile(){
  const serial=S.archivedReport&&S.reportSerial?S.reportSerial:makeReportSerial();
  const fileName=reportFileBase(serial)+".json";
  const payload=collectFullReportData();
  payload._reportSerial=serial;
  payload._userCode=S.userCode||((/^ASR_\d{8}_([^_]+)_/.exec(serial)||[])[1]||"");
  payload._reportMode=S.archivedReport?"archived":"official";
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  S.reportSerial=serial;
  S.rawSaveRequested=true;
  S.rawSaved=false;
  S.reportGenerated=false;
  return {ok:true,name:fileName,serial};
}

function loadFullReportFromFile(file, onDone){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(reader.result);
      if(!obj || typeof obj !== "object"){ onDone && onDone(false); return; }
      applyFullReportData(obj);
      onDone && onDone(true);
    }catch(e){ onDone && onDone(false); }
  };
  reader.readAsText(file, "utf-8");
}
