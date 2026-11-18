
/* ===================== محدوده‌ی پذیرش (حداقل / حداکثر) =====================
   بالای هر تب ورودی یک پنل «محدوده‌ی پذیرش» می‌نشیند: برای هر پارامترِ همان تب دو باکس حداقل/حداکثر
   (مشاور اعلام می‌کند). باکس خالی = مقدار پیش‌فرض استاندارد (به‌صورت کم‌رنگ دیده می‌شود)، پر = جایگزین.
   پذیرش «نمونه‌به‌نمونه» است و فقط گزارش می‌دهد (مسدود نمی‌کند): نمونه‌ی خارج از مشخصات هم باید ثبت شود.
   الک‌ها (دانه‌بندی) و بنزین مصرفی عمداً بررسی نمی‌شوند.

   **هیچ پیام عدم تطابقی داخل تب‌های ورودی نشان داده نمی‌شود.** همه‌ی تناقض‌ها (عدم تطابق با محدوده‌ی پذیرش و
   اختلاف طرح/گزارش) یک‌جا در تب «تطبیق با معیارها» (قبل از «گزارش نهایی») لیست می‌شوند: js/steps/conflicts.js از
   acceptEvaluateAll() استفاده می‌کند.

   پیش‌فرض‌ها (ترافیک سنگین؛ نشریه 101 ویرایش 1404 فصل 20، AASHTO T245 و تصمیم‌های کاربر):
   - دمای آسفالت 100–163 °C ، دمای محیط ≥ 10 °C
   - Gmb 2.20–2.50 ، Pb 3.5–6.5 ٪
   - شکستگی دو جبهه ≥ 80٪ (ESAL 3 تا 10 میلیون، عمق ≤ 100 mm)
   - Va 2.4–5.6 (4 ± 1.6) ، VMA ≥ 13 ، VFA 65–75 ، F/A 0.6–1.2   (استحکام و نرمی بررسی پذیرش ندارند)
   - اختلاف مجاز ±0.04 (مقدار = گزارش − طرح):
       Gagg (Gsb) گزارش با Gagg طرح ،
       و فقط در صورت انجام تست رایس: Gse گزارش با Gse طرح و Gmm رایس با Gmm طرح
   کلیدهای S: acc_<id>_min و acc_<id>_max ؛ با طرح اختلاط ذخیره/بارگذاری می‌شوند (DESIGN_KEYS).
   F/A: حدود رواداری‌اش در پنل «محدوده‌ی پذیرش» تب «دانه‌بندی» است (tabs:["gradation"])؛ مقدار برخطش در تب مارشال هم نمایش داده می‌شود.
   افزودن پارامتر جدید = یک ردیف در ACCEPT_DEFS.
   هر ردیف: items(r, tab) → [{v, name?, desc?, lv?, disp?}] ؛ lv = شناسه‌ی ردیف در live-box (فقط برای نمایش مقدار). */

/* عدد معتبر S[k] یا null (خالی/نامعتبر) */
function _accN(k){
  if(!hasVal(S[k]) || String(S[k]).trim() === "") return null;
  const r = normalizeField(k, S[k]);
  if(r.error) return null;
  const v = parseFloat(r.value);
  return isNaN(v) ? null : v;
}
const _accAll = keys => keys.every(k => _accN(k) !== null);
const _accRound = (v, d) => { const p = Math.pow(10, d); return Math.round(v * p + (v >= 0 ? 1e-9 : -1e-9)) / p; };
const _accTxt = v => String(+Number(v).toFixed(3));        // بدون صفرهای اضافه‌ی انتها
/* متن عدد برای پیام: خروجی‌های سه‌رقمی (Gmb) با همان دقت، بقیه بدون صفر اضافه */
const _accShow = (d, v) => (d.dec !== null && d.dec >= 3) ? Number(v).toFixed(d.dec) : _accTxt(v);
/* مقدار نمایشی (ردیف‌های اختلاف با علامت: +0.012 / -0.051) */
const _accVal = (d, v) => (d.signed && v > 0 ? "+" : "") + _accShow(d, v);

const _pbReady   = () => _accAll(["totalWeight","filterDryInitial","filterAfterTest","materialAfterWash","gasolineUsed","dishFactor"]);
const _gradReady = () => _accAll(getAsphaltSieveConfig().map(x=>x.ret));
const _fractureReady = () => _accAll(getAsphaltFracturePairs().flatMap(x=>[x.ret,x.crush]));
/* آمادگی ویژگی‌های حجمی: وزن مخصوص نمونه + درصد قیر + Gsb طرح */
const _volReady  = r => r.GmbReport > 0 && _pbReady() && r.gsbDesign > 0;
const _pos = v => (v > 0 ? v : null);

/* ---- کنترل اختلاف «طرح» با «گزارش» (Gmm رایس / Gse / Gagg) ---- */
/* Gse گزارش از Gmm رایس (اندازه‌گیری‌شده) و Pb نمونه:  Gse = (100 - Pb) / (100/Gmm - Pb/Gac) */
function _gseReport(r){
  const gmm = _accN("gmm"), gac = _accN("gac");
  if(!(gmm > 0) || !(gac > 0) || !_pbReady() || !(r.K7 > 0)) return null;
  const den = 100 / gmm - r.Pb / gac;
  return den > 0 ? (100 - r.Pb) / den : null;
}
/* Gse طرح (محاسبه‌شده): Gse = (100 - Pb) / (100/Gmm - Pb/Gac) با Gmm طرح، Pb بهینه‌ی طرح و Gac (هر سه الزامی در تب «طرح اختلاط») */
function gseDesignValue(){
  const gmm = _accN("gmmDesign"), pb = _accN("pbOptimum"), gac = _accN("gac");
  if(!(gmm > 0) || !(gac > 0) || pb === null || !(pb > 0 && pb < 100)) return null;
  const den = 100 / gmm - pb / gac;
  return den > 0 ? (100 - pb) / den : null;
}
const _gseDesign  = () => gseDesignValue();
/* Gagg (Gsb) گزارش = وزن مخصوص حقیقی مصالح همان روز (F19: از دانه‌بندی واقعی نمونه و G1..G3) */
const _gaggReport = r => (_pbReady() && _gradReady() && r.K7 > 0 && r.F19 > 0) ? r.F19 : null;
/* اختلاف با دقت 3 رقم (هر دو طرف اول گرد می‌شوند) */
const _diff3 = (a, b) => (a === null || b === null || a === undefined || b === undefined) ? null : _accRound(_accRound(a, 3) - _accRound(b, 3), 3);

const ACCEPT_DEFS = [
  { id:"temp", tabs:["project"], label:"دمای آسفالت", unit:"°C", dec:null,
    def:()=>({min:100, max:163}),
    src:"حداقل 100 °C تصمیم کاربر؛ حداکثر 163 °C نشریه 101 بند 6-3-5-3-20 (دامنه‌ی خود نشریه 124 تا 163؛ نشریه 234 حداقل 120)",
    items:()=>[{v:_accN("asphaltTemp"), field:"asphaltTemp"}],
    low:"مخلوط سرد است و ممکن است به تراکم لازم نرسد.",
    high:"مخلوط داغ است؛ خطر سوختن قیر و روان شدن مخلوط." },

  { id:"amb", tabs:["project"], label:"دمای محیط", unit:"°C", dec:null,
    def:()=>({min:10, max:null}),
    src:"نشریه 234 بند 9-14-3 (پخش آسفالت در دمای محیط کمتر از 10 درجه ممنوع است)",
    items:()=>[{v:_accN("ambientTemp"), field:"ambientTemp"}],
    low:"پخش آسفالت در دمای محیط زیر 10 درجه مجاز نیست." },

  { id:"gmb", tabs:["sg"], label:"وزن مخصوص مارشال (Gmb)", unit:"", dec:OUTPUT_DEC.gmb,
    def:()=>({min:2.20, max:2.50}),
    src:"تصمیم کاربر (Gmb هر نمونه و میانگین)",
    items:(r)=>[
      {v:_pos(r.Hind && r.Hind[0]), name:"Gmb نمونه 1", lv:"gmb1"},
      {v:_pos(r.Hind && r.Hind[1]), name:"Gmb نمونه 2", lv:"gmb2"},
      {v:_pos(r.Hind && r.Hind[2]), name:"Gmb نمونه 3", lv:"gmb3"},
      {v:_pos(r.GmbReport), name:"میانگین Gmb", lv:"gmb", main:true}],
    low:"احتمال خطای وزن‌کشی (هوا/آب/SSD) یا مخلوط سبک/متخلخل.",
    high:"احتمال خطای وزن‌کشی (هوا/آب/SSD) یا مخلوط بسیار سنگین." },

  { id:"pb", tabs:["bitumen"], label:"درصد قیر (Pb)", unit:"%", dec:OUTPUT_DEC.pb,
    def:()=>({min:3.5, max:6.5}),
    src:"تصمیم کاربر (محدوده‌ی 3.5 تا 6.5 درصد)",
    items:(r)=>[{v:(_pbReady() && r.K7 > 0) ? r.Pb : null, lv:"pb"}],
    low:"قیر کمتر از حد مجاز است؛ خطر کم‌دوامی و ریزش مصالح.",
    high:"قیر بیش از حد مجاز است؛ خطر قیرزدگی و کاهش فضای خالی." },

  { id:"crush", tabs:["gradation"], label:"درصد شکستگی (دو جبهه)", unit:"%", dec:OUTPUT_DEC.fracture,
    def:()=>({min:80, max:null, note:"ESAL 3 تا 10 میلیون، عمق ≤ 100 mm؛ برای 10 تا 30 میلیون: 90 و ≥ 30 میلیون: 100"}),
    src:"نشریه 101 ج 3-20 (دو جبهه؛ ستون ESAL را با پروژه تطبیق بده)",
    items:(r)=>[{v:(_fractureReady() && getAsphaltFracturePairs().reduce((a,p)=>a+num(S[p.ret]),0) > 0) ? r.fracturePct : null, lv:"frac"}],
    low:"مصالح درشت کمتر از حد لازم شکسته است؛ منبع/سنگ‌شکن و جداسازی مصالح را بررسی کن." },

  { id:"va", tabs:["marshall"], label:"فضای خالی (Va)", unit:"%", dec:OUTPUT_DEC.va,
    def:()=>({min:2.4, max:5.6, note:"هدف طرح 4 ± 1.6"}),
    src:"نشریه 101 ج 28-20 (هدف طرح 4٪؛ محدوده‌ی طراحی 3 تا 5 در ج 5-20)",
    items:(r)=>[{v:(r.GmbReport > 0 && ((r.vaMethod === "gmm" && _accN("gmm") !== null) || _volReady(r))) ? r.Va : null, lv:"va"}],
    low:"فضای خالی کم است؛ خطر قیرزدگی و شیارافتادگی.",
    high:"فضای خالی زیاد است؛ خطر نفوذ آب و ریزش دانه‌ها." },

  { id:"vma", tabs:["marshall"], label:"فضای خالی بین سنگدانه‌ها (VMA)", unit:"%", dec:OUTPUT_DEC.vma,
    def:()=>({min:13, max:null, note:"اندازه‌ی 19 mm و Va=4؛ اگر اندازه‌ی اسمی 12.5 است: 14"}),
    src:"نشریه 101 ج 7-20",
    items:(r)=>[{v:_volReady(r) ? r.VMA : null, lv:"vma"}],
    low:"VMA کم است؛ جای کافی برای قیر مؤثر نیست (کاهش دوام)." },

  { id:"vfa", tabs:["marshall"], label:"فضای خالی پرشده با قیر (VFA)", unit:"%", dec:OUTPUT_DEC.vfa,
    def:()=>({min:65, max:75}),
    src:"نشریه 101 ج 5-20 (ترافیک سنگین؛ در نشریه 234 حداقل 60)",
    items:(r)=>[{v:_volReady(r) ? r.VFA : null, lv:"vfa"}],
    low:"VFA کم است؛ قیر نسبت به فضای خالی کم است.",
    high:"VFA زیاد است؛ خطر قیرزدگی." },

  { id:"fa", tabs:["gradation"], label:"نسبت فیلر به قیر مؤثر (F/A)", unit:"", dec:OUTPUT_DEC.fa,
    def:()=>({min:0.6, max:1.2}),
    src:"نشریه 101 بند 3-3-1-2-20 و نشریه 234 بند 9-7-7",
    items:(r)=>[{v:(_volReady(r) && _gradReady() && r.effBitumen > 0) ? r.fillerToEffBitumen : null, lv:"fa"}],
    low:"فیلر نسبت به قیر مؤثر کم است.",
    high:"فیلر نسبت به قیر مؤثر زیاد است؛ مخلوط خشک و دیر کوبیده می‌شود." },

  /* ----- اختلاف طرح/گزارش: مقدار = گزارش − طرح ؛ حدود پیش‌فرض ±0.04 (تصمیم کاربر) ----- */
  { id:"dgmm", dev:true, tabs:["sg"], label:"اختلاف Gmm رایس با Gmm طرح", unit:"", dec:3, signed:true,
    def:()=>({min:-0.04, max:0.04, note:"فقط وقتی تست رایس انجام شده؛ Gmm طرح در تب «طرح اختلاط»"}),
    src:"تصمیم کاربر: اختلاف مجاز 0.04 بین Gmm رایس اندازه‌گیری‌شده روی نمونه و Gmm طرح (رایس در قیر بهینه). Gmm محاسباتی در کنترل اختلاف‌ها دخالت ندارد و فقط در گزارش نهایی نمایش داده می‌شود.",
    items:()=>{
      const rice = _accN("gmm"); if(rice === null) return [];
      const des = _accN("gmmDesign");
      return [{v:_diff3(rice, des), name:"اختلاف Gmm رایس با Gmm طرح",
        desc:(des !== null) ? "رایس " + rice.toFixed(3) + "، طرح " + des.toFixed(3) : ""}];
    },
    low:"Gmm رایس نمونه از Gmm طرح کمتر است؛ تغییر مصالح/قیر یا خطای آزمایش رایس را بررسی کن.",
    high:"Gmm رایس نمونه از Gmm طرح بیشتر است؛ تغییر مصالح/قیر یا خطای آزمایش رایس را بررسی کن." },

  { id:"dgse", dev:true, tabs:["sg"], label:"اختلاف Gse گزارش با Gse طرح", unit:"", dec:3, signed:true,
    def:()=>({min:-0.04, max:0.04, note:"فقط با تست رایس. Gse گزارش از Gmm رایس و Pb نمونه؛ Gse طرح از Gmm طرح، Pb بهینه و Gac (تب «طرح اختلاط»)"}),
    src:"تصمیم کاربر: اختلاف Gse طرح با Gse گزارش حداکثر 0.04. هر دو با فرمول Gse = (100-Pb)/(100/Gmm - Pb/Gac): گزارش با Gmm رایس و Pb نمونه، طرح با Gmm طرح و Pb بهینه",
    items:(r)=>{ const gr = _gseReport(r), gd = _gseDesign();
      return [{v:_diff3(gr, gd), disp:gr, lv:"gse", desc:(gr !== null && gd !== null) ? "گزارش " + gr.toFixed(3) + "، طرح " + gd.toFixed(3) : ""}]; },
    low:"Gse گزارش از طرح کمتر است؛ جذب قیر/جنس مصالح یا Gmm رایس و درصد قیر را بررسی کن.",
    high:"Gse گزارش از طرح بیشتر است؛ جذب قیر/جنس مصالح یا Gmm رایس و درصد قیر را بررسی کن." },

  { id:"dgagg", dev:true, tabs:["gradation"], label:"اختلاف Gagg (Gsb) گزارش با Gagg طرح", unit:"", dec:3, signed:true,
    def:()=>({min:-0.04, max:0.04, note:"Gagg طرح را در تب «طرح اختلاط» وارد کن"}),
    src:"تصمیم کاربر: اختلاف Gagg طرح (جدول مشاور) با Gagg گزارش (وزن مخصوص حقیقی مصالح همان روز، از دانه‌بندی واقعی نمونه) حداکثر 0.04",
    items:(r)=>{ const gr = _gaggReport(r), gd = _accN("gaggDesign");
      return [{v:_diff3(gr, gd), disp:gr, lv:"gagg", desc:(gr !== null && gd !== null) ? "گزارش " + gr.toFixed(3) + "، طرح " + gd.toFixed(3) : ""}]; },
    low:"Gagg گزارش از طرح کمتر است؛ دانه‌بندی/منبع مصالح با طرح متفاوت است.",
    high:"Gagg گزارش از طرح بیشتر است؛ دانه‌بندی/منبع مصالح با طرح متفاوت است." }
];

const ACCEPT_KEYS = [];
ACCEPT_DEFS.forEach(d=>{
  d.kmin = "acc_" + d.id + "_min";
  d.kmax = "acc_" + d.id + "_max";
  [d.kmin, d.kmax].forEach(k=>{
    ACCEPT_KEYS.push(k);
    FIELD_SPEC[k] = _num(null, {optional:true, neg:true});     // اختیاری؛ فقط فرمت عدد چک می‌شود (منفی مجاز: حدود ردیف‌های «اختلاف»)
    if(!(k in S)) S[k] = "";
  });
  /* حداقل ≤ حداکثر (هر دو پر باشند) */
  const rule = {kind:"num", order:"asc", keys:[d.kmin, d.kmax], suffix:false, strict:false};
  rule.msg = (cur, ref, dir, refVal)=> dir === "before"
    ? "حداکثر نمی‌تواند از حداقل (" + refVal + ") کمتر باشد."
    : "حداقل نمی‌تواند از حداکثر (" + refVal + ") بیشتر باشد.";
  CROSS_RULES.push(rule);
  CROSS_KEYS[d.kmin] = true; CROSS_KEYS[d.kmax] = true;
});

/* حدود مؤثر: عدد واردشده توسط کاربر، وگرنه پیش‌فرض */
function acceptLimits(d){
  const df = d.def() || {};
  const umin = _accN(d.kmin), umax = _accN(d.kmax);
  return {
    min: umin !== null ? umin : (df.min === undefined ? null : df.min),
    max: umax !== null ? umax : (df.max === undefined ? null : df.max),
    df: df
  };
}

/* ارزیابی یک پارامتر: {state:"na"|"ok"|"bad", items:[...], bad:[...], main, L} */
function acceptEvaluate(d, r, tab){
  const L = acceptLimits(d), eps = 1e-9;
  const items = d.items(r, tab).map(it=>{
    const o = Object.assign({state:"na"}, it);
    let v = it.v;
    if(v === null || v === undefined || isNaN(v)) { o.v = null; return o; }
    if(d.dec !== null) v = _accRound(v, d.dec);
    o.v = v;
    if(L.min === null && L.max === null) return o;
    const low = L.min !== null && v < L.min - eps, high = L.max !== null && v > L.max + eps;
    if(!low && !high){ o.state = "ok"; return o; }
    o.state = "bad";
    const lim = (low ? "حداقل مجاز " + _accVal(d, L.min) : "حداکثر مجاز " + _accVal(d, L.max)) + (d.unit ? " " + d.unit : "");
    const hint = low ? d.low : d.high;
    o.text = (it.name || d.label) + " " + _accVal(d, v) + (it.desc ? " (" + it.desc + ")" : "") + (d.unit ? " " + d.unit : "") + (low ? " کمتر از " : " بیشتر از ") + lim + " است." + (hint ? " " + hint : "");
    return o;
  });
  const bad = items.filter(i => i.state === "bad");
  const state = bad.length ? "bad" : (items.some(i => i.state === "ok") ? "ok" : "na");
  const main = items.find(i => i.main) || items[0] || {v:null};
  return {d:d, L:L, items:items, bad:bad, state:state, main:main};
}

/* متن مقدار برای ردیف‌های live-box (مثلاً Va در تب مارشال)؛ «—» اگر هنوز قابل محاسبه نیست */
function accLiveText(id, r, tab){
  const d = ACCEPT_DEFS.find(x => x.id === id);
  if(!d) return "—";
  const it = d.items(r, tab)[0] || {};
  const v = it.disp !== undefined ? it.disp : it.v;      // ردیف‌های اختلاف: خودِ مقدار گزارش را نشان بده، نه اختلاف
  if(v === null || v === undefined || isNaN(v)) return "—";
  return (d.dec === null ? _accTxt(v) : Number(v).toFixed(d.dec)) + (d.unit ? " " + d.unit : "");
}

/* ارزیابی همه‌ی پارامترها (همه‌ی تب‌ها) با وضعیت فعلی S — برای تب «تطبیق با معیارها» */
function acceptEvaluateAll(){
  const r = calculate(S);
  return ACCEPT_DEFS.map(d => { const ev = acceptEvaluate(d, r, d.tabs[0]); ev.tab = d.tabs[0]; return ev; });
}

/* پنل بالای تب (بعد از عنوان و توضیح کارت): فقط باکس‌های حداقل/حداکثر + منبع پیش‌فرض‌ها.
   tab: project | sg | bitumen | gradation | marshall */
function addAcceptPanel(card, tab){
  const defs = ACCEPT_DEFS.filter(d => d.tabs.indexOf(tab) !== -1);
  if(!defs.length) return;
  const panel = el("div", {class:"acc-panel"});
  panel.appendChild(el("div", {class:"acc-head"}, [
    el("b", {}, "محدوده‌ی پذیرش (ترافیک سنگین)"),
    el("span", {class:"acc-sub"}, "حداقل/حداکثر ابلاغی مشاور را وارد کن. باکس خالی = مقدار پیش‌فرض استاندارد (کم‌رنگ). عدم تطابق‌ها اینجا نشان داده نمی‌شوند؛ در تب «تطبیق با معیارها» (قبل از گزارش نهایی) لیست می‌شوند و جلوی ثبت را نمی‌گیرند.")
  ]));
  defs.forEach(d=>{
    const row = el("div", {class:"acc-row"});
    row.appendChild(el("div", {class:"acc-name"}, d.label + (d.unit ? " (" + d.unit + ")" : "")));
    const df = d.def() || {};
    const mk = (key, cap, ph)=>{
      const host = el("div", {class:"field acc-f"});
      host.appendChild(el("label", {}, cap));
      const inp = el("input", {type:"text", placeholder: (ph === undefined || ph === null) ? "—" : _accTxt(ph)});
      bindTypedInput(inp, key, host);
      host.appendChild(inp);
      host.appendChild(el("div", {class:"error-msg"}, ""));
      host._key = key;
      return host;
    };
    row.appendChild(mk(d.kmin, "حداقل", df.min));
    row.appendChild(mk(d.kmax, "حداکثر", df.max));
    panel.appendChild(row);
  });
  /* منبع و توضیح پیش‌فرض‌ها (جمع‌شونده) */
  const det = el("details", {class:"acc-src"});
  det.appendChild(el("summary", {}, "منبع پیش‌فرض‌ها"));
  const ul = el("ul", {});
  defs.forEach(d=>{ const df = d.def() || {}; ul.appendChild(el("li", {}, d.label + ": " + d.src + (df.note ? " — " + df.note : ""))); });
  det.appendChild(ul);
  panel.appendChild(det);

  const desc = card.querySelector(".desc");
  if(desc && desc.parentNode === card) card.insertBefore(panel, desc.nextSibling);
  else card.insertBefore(panel, card.firstChild);
}
