
/* ===================== FIELD TYPES & PRECISION =====================
   منبع واحد «نوع» و «دقت» همه‌ی ورودی‌ها و خروجی‌ها (طبق فایل تعریف پارامترها).
   - FIELD_SPEC  : نوع و دقت ورودی هر کلید S
   - OUTPUT_DEC  : تعداد اعشار نمایش خروجی‌های محاسبه (فقط نمایش؛ calc.js دست‌نخورده)
   - نرمال‌سازی : ارقام فارسی/عربی → لاتین ، گرد کردن اعشار اضافه (half-up دهدهی)
   - قانون کلی  : فیلد خالی یا با فرمت غلط → کادر قرمز + پیام + اجازه‌ی عبور داده نمی‌شود
   ایرادات منطقی (مثل «12/5») خطا هستند و هرگز به تقسیم یا اعشار تبدیل نمی‌شوند.
*/

/* دقت نمایش خروجی‌ها */
const OUTPUT_DEC = {
  gmb:3, gmm:3, gse:3,          // وزن مخصوص‌ها
  pb:2, dryWeight:1,            // درصد قیر و وزن خشک مصالح
  passing:1, fracture:1,        // درصد رد شده از الک / درصد شکستگی
  stability:1, corrFactor:3,    // مارشال
  va:1, vma:1, vfa:1, fa:1      // گزارش نهایی
};

/* سازنده‌های کوتاه */
const _txt  = (o)=>Object.assign({kind:"text"}, o);
const _num  = (dec, o)=>Object.assign({kind:"num", dec:dec}, o);   // dec=null → هر تعداد اعشار، بدون گرد کردن
const _date = (o)=>Object.assign({kind:"date"}, o);   // partial:true → سال، سال/ماه یا سال/ماه/روز
const _time = ()=>({kind:"time"});

const FIELD_SPEC = {
  /* --- شروع: انتخاب «طرح جدید / بارگذاری طرح» (در welcome.js دستی ثبت می‌شود) --- */
  startChoice:_txt({emptyMsg:"ابتدا یکی از دو گزینه‌ی بالا را انتخاب کنید."}),
  gradSum:_txt({virtual:true}),       // باکس مجازی کنترل جمع دانه‌بندی (ورودی ندارد؛ فقط قانون بین‌فیلدی)

  /* --- معرفی پروژه: همه متن، به‌جز موارد زیر --- */
  projectName:_txt(), employer:_txt(), contractor:_txt(),
  reqNo:_txt(),                       // متن + عدد (هر قالبی)
  reqDate:_date(), reportDate:_date(),   // تاریخ شمسی (هم‌خانواده‌ی تاریخ نمونه‌برداری)
  plant:_txt(), asphaltType:_txt(), asphaltSize:_txt(),
  designDate:_date({partial:true}),   // مستثنا: اجبار به تاریخ کامل ندارد (سال یا تاریخ شمسی)؛ ولی متن پذیرفته نمی‌شود
  sampleLocation:_txt(),
  sampleDate:_date(),                 // تاریخ شمسی
  sampleTime:_time(),                 // HH:MM
  sampleNo:_num(null),
  asphaltTemp:_num(null,{neg:true}), ambientTemp:_num(null,{neg:true}),
  notes:_txt({optional:true}),        // تنها فیلد اختیاری (توضیحات)

  /* --- طرح اختلاط (دقت‌ها مثل قبل) --- */
  designName:_txt(),
  designCode:_txt({emptyMsg:"شماره طرح را وارد کنید (مثلاً 001)."}),
  g1:_num(null), g2:_num(null), g3:_num(null),
  specUp34:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),  specLow34:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp12:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),  specLow12:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp316:_num(null,{activeIf:()=>isAsphaltSize()==="19"}), specLow316:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp8:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),   specLow8:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp50:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),  specLow50:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp200:_num(null,{activeIf:()=>isAsphaltSize()==="19"}), specLow200:_num(null,{activeIf:()=>isAsphaltSize()==="19"}),
  specUp112:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow112:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp1:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow1:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp34_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow34_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp12_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow12_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp38_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow38_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp4_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow4_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp8_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow8_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp50_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow50_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  specUp200_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}), specLow200_25:_num(null,{activeIf:()=>isAsphaltSize()==="25"}),
  gsbDesign:_num(null,{activeIf:()=>S.gsbSource==="daily"}),   // ورود دستی فقط در حالت «اطلاعات روزانه»
  pbaDesign:_num(null), gac:_num(null), pbOptimum:_num(null),
  gmmDesign:_num(3), gaggDesign:_num(3),   // وزن مخصوص‌اند → ۳ رقم؛ الزامی (مرجع کنترل اختلاف طرح/گزارش؛ Gse طرح از روی آن‌ها محاسبه می‌شود)

  /* --- وزن مخصوص: ورودی‌های وزنی با ۱ رقم اعشار --- */
  air1:_num(1), air2:_num(1), air3:_num(1),
  water1:_num(1), water2:_num(1), water3:_num(1),
  ssd1:_num(1), ssd2:_num(1), ssd3:_num(1),
  wAir1:_num(1), wAir2:_num(1), wAir3:_num(1),
  wWater1:_num(1), wWater2:_num(1), wWater3:_num(1),
  wSsd1:_num(1), wSsd2:_num(1), wSsd3:_num(1),
  gmm:_num(3,{optional:true}),        // وزن مخصوص (نه وزن) → ۳ رقم؛ اختیاری چون مسیر حجمی Va بدون Gmm هم وجود دارد

  /* --- درصد قیر --- */
  totalWeight:_num(1), filterDryInitial:_num(1), filterAfterTest:_num(1), materialAfterWash:_num(1),
  gasolineUsed:_num(0),               // میلی‌لیتر (ml)، عدد صحیح؛ در K4 = gasolineUsed×dishFactor/100 ضرب می‌شود (واحد قبلی gr/ml)
  dishFactor:_num(3),

  /* --- دانه‌بندی: اوزان با ۱ رقم اعشار --- */
  ret34:_num(1,{activeIf:()=>isAsphaltSize()==="19"}), ret12:_num(1,{activeIf:()=>isAsphaltSize()==="19"}), ret316:_num(1,{activeIf:()=>isAsphaltSize()==="19"}),
  ret8:_num(1,{activeIf:()=>isAsphaltSize()==="19"}), ret50:_num(1,{activeIf:()=>isAsphaltSize()==="19"}), ret200:_num(1,{activeIf:()=>isAsphaltSize()==="19"}),
  ret112:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret1:_num(1,{activeIf:()=>isAsphaltSize()==="25"}),
  ret34_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret12_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret38_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}),
  ret4_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret8_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret50_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), ret200_25:_num(1,{activeIf:()=>isAsphaltSize()==="25"}),
  crush34:_num(1), crush12:_num(1), crush316:_num(1), crush112:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), crush1:_num(1,{activeIf:()=>isAsphaltSize()==="25"}), crush8:_num(1,{activeIf:()=>isAsphaltSize()==="25"}),

  /* --- مارشال --- */
  gwax:_num(null,{activeIf:()=>S.waxMethod==="with"}),
  ringFactor:_num(null,{activeIf:()=>S.ringType!=="digital"}),
  dialReading:_num(0),                // قرائت گیج: عدد صحیح
  flow:_num(null)
};

/* ===================== محدوده‌ی ورود (کف و سقف تقریبی) =====================
   این‌ها «محدوده‌ی پذیرش مشخصات» نیستند (آن را مشاور اعلام می‌کند)؛ فقط جلوی عددهای «غیرممکن/اشتباه تایپی» را می‌گیرند
   (مثلاً 11800 به‌جای 1180) و عمداً بازند. مبنا: نمونه‌ی مارشال 4 اینچی آسفالت 19 میلی‌متری (بیندر/توپکا).
   هر ردیف: [کف، سقف، واحد]. کف/سقف می‌تواند null باشد (بدون قید)، و کل ردیف می‌تواند تابعی باشد که همین سه‌تایی را برگرداند.
   برای ویرایش یک محدوده، فقط عدد همان خط را عوض کن. */
const RANGE_LEVEL = "error";     // "error": کادر قرمز + قفل + مسدود شدن عبور از تب  |  "warn": فقط هشدار نارنجی (بدون مسدود کردن)  |  "off": خاموش
const _PCT = [0, 100, "%"];
const INPUT_RANGE = {
  /* معرفی پروژه */
  sampleNo:[1, 9999, ""],
  asphaltTemp:[80, 200, "°C"],          // دمای مخلوط حین نمونه‌برداری. نشریه 234 بند 9-7-4: حدود مجاز 120–163 (دانه‌بندی پیوسته، قیر خالص)؛ اینجا ±40 درجه بازتر تا نمونه‌ی خارج از مشخصات هم ثبت شود
  ambientTemp:[-30, 60, "°C"],

  /* طرح اختلاط */
  g1:[2.0, 3.2, ""], g2:[2.0, 3.2, ""], g3:[2.0, 3.2, ""], gsbDesign:[2.0, 3.2, ""],   // وزن مخصوص مصالح (معمولاً 2.4 تا 3.0)
  pbaDesign:[0, 5, "%"],                // جذب قیر (معمولاً زیر 1.5)
  gac:[0.95, 1.10, ""],                 // وزن مخصوص قیر (معمولاً 1.00 تا 1.04)
  gmmDesign:[2.30, 2.80, ""], gaggDesign:[2.40, 2.90, ""],   // مثل Gmm / Gsb معمول
  pbOptimum:[3, 9, "%"],                // قیر بهینه‌ی بیندر/توپکا (معمولاً 4 تا 6.5)
  specUp34:_PCT, specLow34:_PCT, specUp12:_PCT, specLow12:_PCT, specUp316:_PCT, specLow316:_PCT,
  specUp8:_PCT, specLow8:_PCT, specUp50:_PCT, specLow50:_PCT, specUp200:_PCT, specLow200:_PCT,
  specUp112:_PCT, specLow112:_PCT, specUp1:_PCT, specLow1:_PCT, specUp34_25:_PCT, specLow34_25:_PCT,
  specUp12_25:_PCT, specLow12_25:_PCT, specUp38_25:_PCT, specLow38_25:_PCT, specUp4_25:_PCT, specLow4_25:_PCT,
  specUp8_25:_PCT, specLow8_25:_PCT, specUp50_25:_PCT, specLow50_25:_PCT, specUp200_25:_PCT, specLow200_25:_PCT,

  /* وزن مخصوص: نمونه‌ی مارشال ~1200 gr با ارتفاع 63.5±6.5 mm (حدود 1100 تا 1360 gr) */
  air1:[1000,1600,"gr"], air2:[1000,1600,"gr"], air3:[1000,1600,"gr"],
  ssd1:[1000,1600,"gr"], ssd2:[1000,1600,"gr"], ssd3:[1000,1600,"gr"],
  water1:[500,1000,"gr"], water2:[500,1000,"gr"], water3:[500,1000,"gr"],      // ≈ 0.57 تا 0.60 وزن هوا
  wAir1:[1000,1600,"gr"], wAir2:[1000,1600,"gr"], wAir3:[1000,1600,"gr"],
  wSsd1:[1000,1600,"gr"], wSsd2:[1000,1600,"gr"], wSsd3:[1000,1600,"gr"],
  wWater1:[500,1000,"gr"], wWater2:[500,1000,"gr"], wWater3:[500,1000,"gr"],
  gmm:[2.30, 2.80, ""],                 // Gmm معمولاً 2.40 تا 2.70
  gwax:[0.7, 1.1, ""],                  // وزن مخصوص پارافین/موم ≈ 0.9

  /* درصد قیر (استخراج) */
  totalWeight:[500, 5000, "gr"], materialAfterWash:[500, 5000, "gr"],
  filterDryInitial:[0.1, 200, "gr"], filterAfterTest:[0.1, 200, "gr"],
  gasolineUsed:[0, 6000, "ml"],
  dishFactor:[0.1, 10, ""],

  /* دانه‌بندی */
  ret34:[0,5000,"gr"], ret12:[0,5000,"gr"], ret316:[0,5000,"gr"], ret8:[0,5000,"gr"], ret50:[0,5000,"gr"], ret200:[0,5000,"gr"],
  ret112:[0,5000,"gr"], ret1:[0,5000,"gr"], ret34_25:[0,5000,"gr"], ret12_25:[0,5000,"gr"], ret38_25:[0,5000,"gr"], ret4_25:[0,5000,"gr"], ret8_25:[0,5000,"gr"], ret50_25:[0,5000,"gr"], ret200_25:[0,5000,"gr"],
  crush34:[0,5000,"gr"], crush12:[0,5000,"gr"], crush316:[0,5000,"gr"], crush112:[0,5000,"gr"], crush1:[0,5000,"gr"], crush8:[0,5000,"gr"],

  /* مارشال */
  ringFactor:[0.5, 20, "kg/div"],
  dialReading:()=> S.ringType === "digital" ? [100, 8000, "kg"] : [20, 2000, "div"],   // دیجیتال: خود استحکام خام (kg) ؛ آنالوگ: تعداد درجه
  flow:[0.5, 10, "mm"]                  // نشریه 234 جدول 9-13: نرمی مجاز 2 تا 4.5 mm (مارشال استاندارد) و تا 6.8 mm (مارشال اصلاح‌شده)
};
function _rangeOf(key){
  if(RANGE_LEVEL === "off") return null;
  let r = INPUT_RANGE[key];
  if(typeof r === "function") r = r();
  return r || null;
}
/* مقدار نرمال‌شده‌ی عددی v برای key: پیام خارج‌ازمحدوده یا "" */
function rangeIssue(key, v){
  const r = _rangeOf(key);
  if(!r || !isFinite(v)) return "";
  const lo = r[0], hi = r[1], u = r[2] ? " " + r[2] : "";
  if((lo !== null && v < lo) || (hi !== null && v > hi))
    return "عدد خارج از محدوده‌ی منطقی ورود است؛ مقدار باید بین " + lo + " و " + hi + u + " باشد. (اشتباه تایپی؟ ممیز یا یک رقم اضافه/کم)";
  return "";
}

/* حالت «بررسی آسفالت»: شماره نمونه و کل تب «معرفی پروژه» غیرفعال و از اعتبارسنجی معاف‌اند */
const REVIEW_SKIP_KEYS = ["sampleNo","projectName","employer","contractor","reqNo","reqDate","reportDate","plant","asphaltType",
  "designDate","sampleDate","sampleTime","sampleLocation","asphaltTemp","ambientTemp","notes",
  "acc_temp_min","acc_temp_max","acc_amb_min","acc_amb_max"];
function reviewSkipped(key){ return S.reportMode === "review" && REVIEW_SKIP_KEYS.indexOf(key) !== -1; }

const _warnedKeys = {};
function fieldSpec(key){
  const sp = FIELD_SPEC[key];
  if(sp) return sp;
  if(!_warnedKeys[key]){ _warnedKeys[key]=1; console.warn("FIELD_SPEC: کلید تعریف‌نشده:", key); }
  return {kind:"text"};
}

/* ارقام فارسی/عربی → لاتین. فقط برای فیلدهای عددی/تاریخ/ساعت استفاده می‌شود.
   «٫» (ممیز عربی) نقطه‌ی اعشار حساب می‌شود؛ «/» عمداً دست‌نخورده می‌ماند. */
function toLatinDigits(s){
  return String(s ?? "")
    .replace(/[۰-۹]/g, c=>String(c.charCodeAt(0)-0x06F0))
    .replace(/[٠-٩]/g, c=>String(c.charCodeAt(0)-0x0660))
    .replace(/٫/g, ".")
    .replace(/−/g, "-");
}

/* گرد کردن دقیق دهدهی (half-up) روی رشته، بدون خطای ممیز شناور */
function _roundDec(intPart, fracPart, dec){
  intPart = intPart.replace(/^0+(?=\d)/, "") || "0";
  if(dec === null || dec === undefined) return fracPart ? intPart+"."+fracPart : intPart;
  const up = fracPart.length > dec && fracPart.charAt(dec) >= "5";
  const frac = fracPart.slice(0, dec).padEnd(dec, "0");
  let digits = (BigInt(intPart + frac) + (up ? 1n : 0n)).toString().padStart(dec+1, "0");
  return dec ? digits.slice(0, -dec) + "." + digits.slice(-dec) : digits;
}

const _MSG_NUM = "فرمت عدد نادرست است؛ فقط رقم و نقطه‌ی اعشار مجاز است (مثلاً 12.5). علامت «/» به معنی تقسیم نیست و پذیرفته نمی‌شود.";

/* → {value, error}.  ورودی خالی: error="" (خالی بودن را fieldError تشخیص می‌دهد) */
function normalizeField(key, raw){
  const spec = fieldSpec(key);
  if(spec.kind === "text") return {value: raw, error: ""};
  const v = toLatinDigits(raw).replace(/[‌‎‏]/g, "").trim();
  if(v === "") return {value:"", error:""};

  if(spec.kind === "num"){
    const m = /^(-?)(\d+\.?\d*|\.\d+)$/.exec(v);
    if(!m || (m[1] && !spec.neg)) return {value:v, error: spec.dec===0
      ? "عدد صحیح و بدون اعشار وارد کنید (مثلاً 25). علامت «/» پذیرفته نیست."
      : _MSG_NUM};
    const parts = m[2].split(".");
    let out = _roundDec(parts[0], parts[1] || "", spec.dec);
    if(m[1] && /[1-9]/.test(out)) out = "-" + out;
    if(RANGE_LEVEL === "error"){
      const re = rangeIssue(key, parseFloat(out));
      if(re) return {value: out, error: re, range: true};
    }
    return {value: out, error: ""};
  }
  if(spec.kind === "date"){
    const m = (spec.partial ? /^(\d{4})(?:\/(\d{1,2})(?:\/(\d{1,2}))?)?$/ : /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/).exec(v);
    const y = m && +m[1], mo = m && m[2] !== undefined ? +m[2] : null, d = m && m[3] !== undefined ? +m[3] : null;
    if(!m || y < 1300 || y > 1500 || (mo !== null && (mo < 1 || mo > 12)) || (d !== null && (d < 1 || d > (mo <= 6 ? 31 : 30))))
      return {value:v, error: spec.partial
        ? "تاریخ شمسی را با رقم وارد کنید: فقط سال یا سال/ماه/روز (مثلاً 1404 یا 1404/05/12)."
        : "تاریخ شمسی را با رقم و به شکل سال/ماه/روز وارد کنید (مثلاً 1405/03/05)."};
    return {value: m[1] + (mo !== null ? "/" + String(mo).padStart(2,"0") : "") + (d !== null ? "/" + String(d).padStart(2,"0") : ""), error:""};
  }
  if(spec.kind === "time"){
    const m = /^(\d{1,2}):(\d{2})$/.exec(v);
    if(!m || +m[1] > 23 || +m[2] > 59)
      return {value:v, error:"ساعت را به شکل ساعت:دقیقه وارد کنید (مثلاً 14:30؛ ساعت 00 تا 23 و دقیقه 00 تا 59)."};
    return {value: String(+m[1]).padStart(2,"0") + ":" + m[2], error:""};
  }
  return {value:v, error:""};
}

/* --- قانون تب وزن مخصوص ---
   هر نمونه سه وزن دارد (هوا، آب، SSD). کافی است برای «حداقل یک نمونه» هر سه وزن وارد شود؛
   نمونه‌ای که کاملاً خالی است اشکالی ندارد. اما نمونه‌ی نیمه‌کاره (مثلاً فقط وزن هوا) ممنوع است،
   چون میانگین‌ها را خراب می‌کند و Va/VMA/VFA مثلاً -190 درمی‌آید. جدول موم هم همین قانون را دارد. */
const _SG_SETS = [
  [["air1","water1","ssd1"],["air2","water2","ssd2"],["air3","water3","ssd3"]],
  [["wAir1","wWater1","wSsd1"],["wAir2","wWater2","wSsd2"],["wAir3","wWater3","wSsd3"]]
];
const _isFilled = k => hasVal(S[k]) && String(S[k]).trim() !== "";
function sampleGroupOf(key){
  for(const set of _SG_SETS) for(const grp of set) if(grp.indexOf(key) !== -1) return {set:set, grp:grp};
  return null;
}
/* پیام خطای «خالی بودن» برای key (یا ""). strict=true یعنی هنگام عبور از تب (شامل لزوم یک نمونه‌ی کامل) */
function emptyError(key, strict){
  const spec = fieldSpec(key);
  if(spec.optional) return "";
  if(spec.activeIf && !spec.activeIf()) return "";
  const sg = sampleGroupOf(key);
  if(sg){
    if(sg.grp.some(_isFilled)) return "این نمونه نیمه‌کاره است: هر سه وزن (هوا، آب، SSD) را وارد کنید، یا هر سه را خالی بگذارید.";
    if(strict && !sg.set.some(g=>g.every(_isFilled))) return "حداقل برای یک نمونه باید هر سه وزن (هوا، آب، SSD) وارد شود.";
    return "";
  }
  return spec.emptyMsg || "این فیلد خالی است؛ لطفاً مقدار را وارد کنید.";
}

/* بررسی «لایو» حین تایپ: خطا فقط وقتی داده می‌شود که مقدار دیگر نتواند با ادامه‌ی تایپ معتبر شود
   (حرف، «/» در عدد، جداکننده‌ی نادرست ...) یا وقتی مقدار کامل است ولی نامعتبر (ماه 13).
   مقدار ناقصِ ولی در مسیر درست (مثل 1405/0) تا خروج از فیلد خطا نمی‌گیرد. */
function liveError(key, raw){
  const spec = fieldSpec(key);
  const v = toLatinDigits(raw).replace(/[\u200c\u200e\u200f]/g, "").trim();
  if(v === "") return emptyError(key, false);
  if(spec.kind === "text") return "";
  const full = normalizeField(key, v);
  if(!full.error) return "";
  if(full.range){
    // خارج از محدوده: با ادامه‌ی تایپ فقط وقتی دیگر درست نمی‌شود که از سقف گذشته باشد (رقم اضافه فقط بزرگ‌ترش می‌کند)
    // یا عدد منفی از کف پایین‌تر باشد. «کمتر از کف» (مثلاً 1 در راه 1200) تا خروج از فیلد صبر می‌کند.
    const val = parseFloat(full.value), rg = _rangeOf(key);
    return (rg && ((rg[1] !== null && val > rg[1]) || (rg[0] !== null && val < rg[0] && val < 0))) ? full.error : "";
  }
  let prefixOk = false;
  if(spec.kind === "num")  prefixOk = (spec.neg ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/).test(v) && (spec.dec !== 0 || !/\./.test(v.replace(/\.$/, "")));
  if(spec.kind === "date"){
    // پیش‌وندِ معتبر: بخش‌هایی که کامل شده‌اند (سال 4 رقمی، ماه/روز 2 رقمی) باید در بازه باشند
    const m = /^(\d{0,4})(?:\/(\d{0,2})(?:\/(\d{0,2}))?)?$/.exec(v);
    prefixOk = !!m && !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(v)
      && !(m[1].length === 4 && (+m[1] < 1300 || +m[1] > 1500))
      && !(m[2] && m[2].length === 2 && (+m[2] < 1 || +m[2] > 12))
      && !(m[3] && m[3].length === 2 && (+m[3] < 1 || +m[3] > 31));
  }
  if(spec.kind === "time"){
    const m = /^(\d{0,2})(?::(\d{0,2}))?$/.exec(v);
    prefixOk = !!m && !/^\d{1,2}:\d{2}$/.test(v)
      && !(m[1].length === 2 && +m[1] > 23)
      && !(m[2] && m[2].length === 2 && +m[2] > 59);
  }
  return prefixOk ? "" : full.error;
}

/* پیام خطای فعلی مقدار S[key] ، یا "" اگر مشکلی نیست */
function fieldError(key){
  if(reviewSkipped(key)) return "";
  const spec = fieldSpec(key);
  if(spec.activeIf && !spec.activeIf()) return "";
  if(spec.virtual) return crossError(key);          // باکس مجازی (مثل کنترل جمع دانه‌بندی): فقط قانون بین‌فیلدی
  const raw = S[key];
  if(!hasVal(raw) || String(raw).trim() === "") return emptyError(key, true);
  const e = normalizeField(key, raw).error;
  return e || crossError(key);                      // اول فرمت، بعد ترتیب/رابطه‌ی بین فیلدها
}

/* ===================== قوانین بین‌فیلدی (ترتیب و رابطه‌ی مقادیر) =====================
   هر قانون یک «زنجیره» از کلیدهاست که باید به ترتیب مشخص باشند:
     order:"desc"  → هر مقدار ≤ مقدار قبلی در زنجیره (بزرگ ← کوچک)   [وزن‌ها]
     order:"asc"   → هر مقدار ≥ مقدار قبلی در زنجیره (قدیمی ← جدید)   [تاریخ‌ها]
   بررسی دوطرفه است: هر فیلد هم با نزدیک‌ترین فیلد پرِ «قبلی» و هم «بعدی» در زنجیره سنجیده می‌شود،
   و خطا روی همان فیلدی می‌نشیند که کاربر همین الان پر/ویرایش کرده (نه روی فیلد همسایه).
   مقایسه فقط بین مقادیر «پر و معتبر» است. تساوی: برای وزن‌های اصلی (وزن مخصوص و درصد قیر، strict:true) خطاست؛
   برای بقیه (تاریخ‌ها، شکسته ≤ مانده) مجاز است.
   قفل: اگر فیلد ویرایش‌شده با Tab/Enter ترک شود و خطای ترتیب داشته باشد، فوکوس در همان فیلد می‌ماند
   (مثل خطای فرمت). رفتن با ماوس، یا Shift+Tab به عقب، آزاد است تا بشود فیلد دیگر را اصلاح کرد. */
const _FLD_LABEL = {
  reqDate:"تاریخ درخواست", sampleDate:"تاریخ نمونه‌برداری", reportDate:"تاریخ گزارش", designDate:"تاریخ طرح",
  totalWeight:"وزن کل نمونه", materialAfterWash:"وزن مصالح پس از شست‌وشو",
  filterAfterTest:"وزن فیلتر پس از آزمایش", filterDryInitial:"وزن فیلتر اولیه",
  ret34:"وزن مانده الک 3/4", ret12:"وزن مانده الک 1/2", ret316:"وزن مانده الک 3/16",
  crush34:"وزن شکسته الک 3/4", crush12:"وزن شکسته الک 1/2", crush316:"وزن شکسته الک 3/16",
  ret112:"وزن مانده الک 1½", ret1:"وزن مانده الک 1", ret34_25:"وزن مانده الک 3/4 (سایز 25)",
  ret12_25:"وزن مانده الک 1/2 (سایز 25)", ret38_25:"وزن مانده الک 3/8", ret4_25:"وزن مانده الک #4",
  ret8_25:"وزن مانده الک #8 (سایز 25)", ret50_25:"وزن مانده الک #50 (سایز 25)", ret200_25:"وزن مانده الک #200 (سایز 25)",
  crush112:"وزن شکسته الک 1½", crush1:"وزن شکسته الک 1", crush8:"وزن شکسته الک #8"
};
const CROSS_RULES = [];
(function(){
  const lab = k => _FLD_LABEL[k] || k;
  const orderText = keys => keys.map(lab).join("، ");

  /* ۱) تاریخ‌ها. تاریخ درخواست عمداً در هیچ زنجیره‌ای نیست (می‌تواند همزمان یا حتی بعد از نمونه‌برداری باشد: دلایل اداری). */
  CROSS_RULES.push({kind:"date", order:"asc", keys:["sampleDate","reportDate"], suffix:true});      // نمونه‌برداری ≤ گزارش
  CROSS_RULES.push({kind:"date", order:"asc", keys:["designDate","reportDate"], suffix:false});     // طرح ≤ گزارش

  /* ۲) وزن مخصوص (هر نمونه): SSD ← هوا ← آب ؛ جدول موم: موم‌اندود در هوا ← خشک در هوا ← موم‌اندود در آب */
  for(let i=1;i<=3;i++){
    Object.assign(_FLD_LABEL, {["ssd"+i]:"وزن SSD نمونه "+i, ["air"+i]:"وزن در هوا نمونه "+i, ["water"+i]:"وزن در آب نمونه "+i,
      ["wSsd"+i]:"وزن موم‌اندود در هوا نمونه "+i, ["wAir"+i]:"وزن خشک در هوا نمونه "+i, ["wWater"+i]:"وزن موم‌اندود در آب نمونه "+i});
    CROSS_RULES.push({kind:"num", order:"desc", keys:["ssd"+i,"air"+i,"water"+i], suffix:true, strict:true});
    CROSS_RULES.push({kind:"num", order:"desc", keys:["wSsd"+i,"wAir"+i,"wWater"+i], suffix:true, strict:true});
  }

  /* ۳) درصد قیر: وزن کل ← مصالح پس از شست‌وشو ← فیلتر پس از آزمایش ← فیلتر اولیه */
  CROSS_RULES.push({kind:"num", order:"desc", keys:["totalWeight","materialAfterWash","filterAfterTest","filterDryInitial"], suffix:true, strict:true});

  /* ۴-ب) درصد شکستگی: وزن شکسته‌ی هر الک ≤ وزن مانده‌ی همان الک؛ الک‌های فعال بر اساس سایز */
  const fractureRules = [
    ["ret34","crush34"],["ret12","crush12"],["ret316","crush316"],
    ["ret112","crush112"],["ret1","crush1"],["ret34_25","crush34"],
    ["ret12_25","crush12"],["ret4_25","crush316"],["ret8_25","crush8"]
  ];
  fractureRules.forEach(keys=>CROSS_RULES.push({kind:"num", order:"desc", keys:keys, suffix:false,
    msgBefore:(cur,ref,refVal)=> lab(cur)+" نمی‌تواند از وزن مانده روی همان الک ("+refVal+" gr) بیشتر باشد؛ مصالح شکسته بخشی از مانده‌ی الک است."}));

  /* ساخت پیام: dir="before" یعنی فیلد مرجع «قبل» از این فیلد در زنجیره است، "after" یعنی بعد از آن */
  CROSS_RULES.forEach(rule=>{
    rule.msg = function(cur, ref, dir, refVal){
      if(dir === "before" && rule.msgBefore) return rule.msgBefore(cur, ref, refVal);
      let t;
      if(rule.order === "asc") t = lab(cur) + (dir === "before" ? " نمی‌تواند قبل از " : " نمی‌تواند بعد از ") + lab(ref) + " باشد";
      else if(rule.strict)     t = lab(cur) + " باید " + (dir === "before" ? "کمتر از " : "بیشتر از ") + lab(ref) + " باشد (برابر بودن هم مجاز نیست)";
      else                     t = lab(cur) + " نمی‌تواند از " + lab(ref) + (dir === "before" ? " بیشتر باشد" : " کمتر باشد");
      if(rule.suffix) t += " (ترتیب درست از " + (rule.order === "asc" ? "قدیمی به جدید" : "بزرگ به کوچک") + ": " + orderText(rule.keys) + ")";
      return t + ".";
    };
  });
})();
const CROSS_KEYS = {};
CROSS_RULES.forEach(r=>r.keys.forEach(k=>{ CROSS_KEYS[k] = true; }));
CROSS_KEYS.gradSum = true;

/* مقدار «پر و معتبر»ِ یک کلید برای مقایسه: عدد، یا آرایه‌ی [سال,ماه,روز]؛ وگرنه null */
function _crossVal(key){
  const sp = fieldSpec(key);
  if(sp.activeIf && !sp.activeIf()) return null;
  const raw = S[key];
  if(!hasVal(raw) || String(raw).trim() === "") return null;
  const r = normalizeField(key, raw);
  if(r.error) return null;
  if(sp.kind === "num") return parseFloat(r.value);
  if(sp.kind === "date") return r.value.split("/").map(Number);
  return null;
}
/* مقایسه‌ی تاریخ‌ها (ممکن است ناقص باشند: فقط سال، یا سال/ماه): فقط اجزای مشترک سنجیده می‌شوند */
function _cmpDate(a, b){
  const n = Math.min(a.length, b.length);
  for(let i=0;i<n;i++) if(a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}
/* آیا «prev» (زودتر در زنجیره) و «next» (دیرتر در زنجیره) به ترتیب مجاز هستند؟ */
function _orderOk(rule, prev, next){
  if(rule.kind === "date") return rule.order === "asc" ? _cmpDate(prev, next) <= 0 : _cmpDate(prev, next) >= 0;
  if(rule.order === "desc") return rule.strict ? prev > next : prev >= next;     // وزن‌های اصلی: اکیداً کوچک‌تر شونده
  return rule.strict ? prev < next : prev <= next;
}

/* پیام خطای بین‌فیلدی برای key ، یا "" (دوطرفه: با نزدیک‌ترین فیلد پرِ قبلی و بعدی) */
function crossError(key){
  if(reviewSkipped(key)) return "";
  if(key === "gradSum") return _gradSumError();
  for(const rule of CROSS_RULES){
    const idx = rule.keys.indexOf(key);
    if(idx === -1) continue;
    const cur = _crossVal(key);
    if(cur === null) continue;
    for(let j=idx-1;j>=0;j--){
      const pv = _crossVal(rule.keys[j]);
      if(pv === null) continue;
      if(!_orderOk(rule, pv, cur)) return rule.msg(key, rule.keys[j], "before", normalizeField(rule.keys[j], S[rule.keys[j]]).value);
      break;
    }
    for(let j=idx+1;j<rule.keys.length;j++){
      const nx = _crossVal(rule.keys[j]);
      if(nx === null) continue;
      if(!_orderOk(rule, cur, nx)) return rule.msg(key, rule.keys[j], "after", normalizeField(rule.keys[j], S[rule.keys[j]]).value);
      break;
    }
  }
  return "";
}

/* بررسی «لایو» حین تایپ برای وزن‌ها: فقط تخلفی که با ادامه‌ی تایپ دیگر درست نمی‌شود.
   قانون بزرگ←کوچک یعنی هر وزن باید ≤ وزن‌های قبلی زنجیره باشد؛ با افزودن رقم، عدد فقط بزرگ‌تر می‌شود،
   پس اگر همین حالا از مرجع قبلی بیشتر است، همان لحظه خطاست. (تخلف از سمت «کمتر از بعدی» چون هنوز ممکن است
   با رقم‌های بعدی درست شود، فقط با خروج از فیلد گرفته می‌شود.) */
function crossErrorLive(key){
  for(const rule of CROSS_RULES){
    if(rule.kind !== "num" || rule.order !== "desc") continue;
    const idx = rule.keys.indexOf(key);
    if(idx < 1) continue;
    const cur = _crossVal(key);
    if(cur === null) continue;
    for(let j=idx-1;j>=0;j--){
      const pv = _crossVal(rule.keys[j]);
      if(pv === null) continue;
      if(rule.strict ? cur >= pv : cur > pv) return rule.msg(key, rule.keys[j], "before", normalizeField(rule.keys[j], S[rule.keys[j]]).value);
      break;
    }
  }
  return "";
}
/* آیا دو کلید عضو یک قانون ترتیب هستند؟ (برای آزاد گذاشتن رفتن از فیلد خطادار به فیلدِ هم‌قانونی) */
function sharesRule(a, b){
  return CROSS_RULES.some(r=>r.keys.indexOf(a) !== -1 && r.keys.indexOf(b) !== -1);
}

/* ۴-الف) کنترل جمع دانه‌بندی: جمع وزن مانده‌ی الک‌ها نباید از وزن کل مصالح خشک بیشتر شود؛
   چون ته‌مانده‌ی کف (Pan) = وزن کل − جمع مانده‌ها می‌شود و اگر منفی شود، جمع درصدها (با کف) دیگر 100 نمی‌شود. */
function _gradSumError(){
  const r = calculate(S);
  if(!(r.K7 > 0)) return "";                 // وزن کل مصالح هنوز قابل محاسبه نیست (تب درصد قیر)
  if(r.pan >= -1e-6) return "";
  const sum = r.K7 - r.pan;
  return "جمع وزن‌های مانده روی الک‌ها ("+sum.toFixed(1)+" gr) از وزن کل مصالح خشک ("+r.K7.toFixed(1)+" gr) بیشتر است؛ " +
         "ته‌مانده‌ی کف منفی می‌شود و جمع درصدها 100 نمی‌شود. وزن‌های الک‌ها یا اطلاعات تب «درصد قیر» را بازبینی کنید.";
}
