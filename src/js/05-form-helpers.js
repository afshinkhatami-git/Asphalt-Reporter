
/* ===================== FORM BUILDING HELPERS ===================== */
/* نمایش/پاک کردن خطا روی یک فیلد (.field) یا یک خانه‌ی جدول (td.fcell) */
function showFieldError(host, msg){
  host.classList.remove("noted");
  host.classList.add("invalid");
  const em = host.querySelector(".error-msg");
  if(em) em.textContent = msg;
  const box = host.closest(".tblbox");
  if(box){
    box.classList.add("has-invalid");
    const t = box.querySelector(".tbl-error");
    if(t) t.textContent = msg;
  }
}
/* جدول وزن مخصوص: بعد از هر تغییر، پرچم‌های «خالی/نیمه‌کاره»ی خانه‌های خالی دوباره سنجیده می‌شود
   (مثلاً با تکمیل یا خالی کردن یک نمونه، قرمزی خانه‌های هم‌نمونه‌اش درست شود) */
function refreshSampleFlags(host){
  const table = host.closest && host.closest("table.sample-table");
  if(!table) return;
  table.querySelectorAll("td.fcell.invalid").forEach(td=>{
    const inp = td.querySelector("input");
    if(!inp || inp.value.trim() !== "" || !sampleGroupOf(td._key)) return;
    const em = emptyError(td._key, true);
    if(em) showFieldError(td, em); else clearFieldError(td);
  });
}

/* هشدار غیرمسدودکننده (نارنجی): مثل «با خروج از فیلد گرد می‌شود» */
function showFieldNote(host, msg){
  host.classList.add("noted");
  const em = host.querySelector(".error-msg");
  if(em) em.textContent = msg;
  const box = host.closest(".tblbox");
  if(box){
    box.classList.add("has-note");
    const t = box.querySelector(".tbl-error");
    if(t) t.textContent = msg;
  }
}
/* هشدار تذکری (نارنجی، بدون مسدود کردن) مخصوص بعضی فیلدها. فعلاً فقط «تاریخ گزارش»:
   اگر با تاریخ شمسی امروز فرق داشته باشد فقط تذکر می‌دهد؛ عبور از تب و ثبت گزارش را نمی‌بندد.
   (نام فایل‌های خروجی از همین تاریخ ساخته می‌شود — design-io.js.) live=true: حین تایپ، فقط وقتی تاریخ کامل شد. */
function fieldAdvisory(key, raw, live){
  if(key !== "reportDate") return "";
  raw = toLatinDigits(String(raw || "")).trim();
  if(live && !/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) return "";
  const r = normalizeField(key, raw);
  if(r.error || !r.value) return "";
  const today = todayShamsi();                     // design-io.js
  if(r.value === today) return "";
  return "هشدار (مانع نیست): تاریخ گزارش " + (r.value > today ? "از تاریخ امروز (" + today + ") جلوتر است" : "با تاریخ امروز (" + today + ") فرق دارد") + ". نام فایل‌های خروجی از همین تاریخ ساخته می‌شود.";
}
function applyFieldAdvisory(host, key, raw, live){
  if(host.classList.contains("invalid")) return;
  const adv = fieldAdvisory(key, raw, live);
  if(adv) showFieldNote(host, adv);
}

/* بازسنجی خطاهای «بین‌فیلدی» (ترتیب تاریخ‌ها/وزن‌ها، کنترل جمع دانه‌بندی) برای فیلدهای هم‌کارت.
   mode="input" (حین تایپ): فقط خطاهای بین‌فیلدیِ رفع‌شده برداشته می‌شود؛ خطای تازه نمی‌نشیند
                (تا وسط تایپ مثل «1405/03/2» برای «1405/03/20» چشمک نزند).
   mode="blur"  (با خروج از فیلد): خطای تازه فقط روی «همین فیلدی که ترکش کردیم» می‌نشیند، نه روی
                فیلد همسایه؛ خطاهای رفع‌شده‌ی بقیه برداشته می‌شود. (باکس مجازی gradSum همیشه سنجیده می‌شود.)
   mode="all"   (بازگشت به تب): همه‌ی فیلدها کامل سنجیده می‌شوند. */
function refreshCrossFlags(host, mode){
  if(mode === false) mode = "all"; else if(mode === true) mode = "input";
  let root = host;
  while(root && root.parentNode) root = root.parentNode;     // بالاترین والد (کارتِ واقعی یا div موقت)
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll(".field, td.fcell").forEach(f=>{
    const key = f._key;
    if(!key || !CROSS_KEYS[key]) return;
    const owns = f.classList.contains("cross-invalid");
    if(mode === "input" && !owns) return;
    const msg = crossError(key);
    if(!msg){ if(owns) clearFieldError(f); return; }
    if(mode === "input") return;                              // حین تایپ، خطای موجود را دست نزن
    if(mode === "blur" && f !== host && !fieldSpec(key).virtual && !owns) return;   // خطای تازه فقط روی فیلد در حال ویرایش
    if(f.classList.contains("invalid") && !owns) return;      // خطای دیگری (خالی/فرمت) صاحب این باکس است
    showFieldError(f, msg);
    f.classList.add("cross-invalid");
  });
}

/* نحوه‌ی ترک فیلد: با کیبورد «به جلو» (Tab/Enter) یا نه (ماوس / Shift+Tab). برای قفل خطای ترتیب. */
let _navForward = false;
document.addEventListener("keydown", e=>{ _navForward = (e.key === "Enter") || (e.key === "Tab" && !e.shiftKey); }, true);
document.addEventListener("mousedown", ()=>{ _navForward = false; }, true);
document.addEventListener("touchstart", ()=>{ _navForward = false; }, true);

function clearFieldError(host){
  host.classList.remove("invalid");
  host.classList.remove("cross-invalid");
  host.classList.remove("noted");
  const nb = host.closest(".tblbox");
  if(nb && !nb.querySelector("td.noted")) nb.classList.remove("has-note");
  const box = host.closest(".tblbox");
  if(box && !box.querySelector("td.invalid")) box.classList.remove("has-invalid");
}

/* اتصال یک input به کلید S بر اساس نوع/دقت تعریف‌شده در FIELD_SPEC (field-types.js).
   host: عنصری که کلاس invalid روی آن می‌نشیند (.field یا td). */
function bindTypedInput(inp, key, host, onInput){
  const spec = fieldSpec(key);
  const typed = spec.kind !== "text";
  if(typed){
    inp.type = "text";
    inp.setAttribute("dir", "ltr");
    inp.setAttribute("autocomplete", "off");
    if(spec.kind === "num") inp.setAttribute("inputmode", spec.dec === 0 ? "numeric" : "decimal");
  }
  inp.value = S[key] ?? "";
  const optional = !!spec.optional;
  // مقدار نامعتبرِ قبلاً واردشده (برگشت از تب دیگر / بارگذاری طرح) از همان ابتدا قرمز نشان داده شود
  if(typed && inp.value.trim()){
    const e0 = normalizeField(key, inp.value).error;
    if(e0) setTimeout(()=>showFieldError(host, e0), 0);   // بعد از چسباندن به DOM (برای پیام زیر جدول)
    else if(CROSS_KEYS[key]) setTimeout(()=>refreshCrossFlags(host, false), 0);   // ترتیب/رابطه‌ی نامعتبرِ قبلی هم از ابتدا قرمز
  }
  if(inp.value.trim() && fieldAdvisory(key, inp.value, false)) setTimeout(()=>applyFieldAdvisory(host, key, inp.value, false), 0);   // برگشت به تب / بارگذاری فایل
  inp.addEventListener("input", ()=>{
    if(typed){
      const fixed = toLatinDigits(inp.value);      // ارقام فارسی → لاتین، همان لحظه
      if(fixed !== inp.value){
        const pos = inp.selectionStart;
        inp.value = fixed;
        try{ inp.setSelectionRange(pos, pos); }catch(e){}
      }
    }
    S[key] = inp.value;
    if(technicianImportActive) markImportMissingFields(host.closest(".card"));
    else host.classList.remove("import-missing");
    const msg = liveError(key, inp.value);          // فرمت/خالی بودن، لایو
    if(msg) showFieldError(host, msg);
    else {
      clearFieldError(host);
      // دقت لایو: اعشار بیش از حد مجاز → هشدار (نه خطا) با پیش‌نمایش مقدار گردشده.
      // متن حین تایپ دست‌نخورده می‌ماند (گرد کردن در هر ضربه رقم‌ها را می‌خورد)؛ گرد کردن با خروج از فیلد.
      if(spec.kind === "num" && typeof spec.dec === "number"){
        const m = /^-?\d*\.(\d*)$/.exec(toLatinDigits(inp.value).trim());
        if(m && m[1].length > spec.dec){
          const r = normalizeField(key, inp.value);
          if(!r.error) showFieldNote(host, (spec.dec === 0 ? "فقط عدد صحیح" : "حداکثر " + spec.dec + " رقم اعشار") + " — با خروج از فیلد گرد می‌شود: " + r.value);
        }
      }
    }
    // محدوده‌ی ورود در حالت «warn»: هشدار نارنجی (خطا نیست). حین تایپ فقط وقتی از سقف گذشته باشد؛ کامل‌تر با خروج از فیلد.
    if(!msg && RANGE_LEVEL === "warn" && spec.kind === "num" && !host.classList.contains("noted")){
      const rw = normalizeField(key, inp.value), rg = _rangeOf(key);
      if(!rw.error && rg && rg[1] !== null && parseFloat(rw.value) > rg[1]) showFieldNote(host, rangeIssue(key, parseFloat(rw.value)));
    }
    // وزن‌ها: تخلفِ قطعی از ترتیب (بزرگ‌تر از وزن قبلی در زنجیره) همان لحظه‌ی تایپ قرمز شود
    if(!msg && spec.kind === "num"){
      const le = crossErrorLive(key);
      if(le){ showFieldError(host, le); host.classList.add("cross-invalid"); }
    }
    refreshSampleFlags(host);
    refreshCrossFlags(host, "input");             // اگر این تغییر خطای ترتیبِ فیلد دیگری را رفع کرد، همان لحظه سبز شود
    if(!msg) applyFieldAdvisory(host, key, inp.value, true);   // تذکر غیرمسدودکننده (تاریخ گزارش ≠ امروز)
    if(onInput) onInput();
  });
  // با خروج از فیلد: قالب‌بندی نهایی (صفر اعشار، تاریخ 0 دار ...) ؛ ناقص/نامعتبر/خالی → قرمز
  inp.addEventListener("blur", (ev)=>{
    if(typed){
      const r = normalizeField(key, inp.value);
      if(r.error){
        // خطای مشخص در ورودی: اجازه‌ی عبور از این باکس داده نمی‌شود تا اصلاح شود
        showFieldError(host, r.error);
        setTimeout(()=>{ if(inp.isConnected){ inp.focus(); try{ inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){} } }, 0);
        return;
      }
      if(r.value !== inp.value){
        inp.value = r.value;
        inp.dispatchEvent(new Event("input", {bubbles:true}));   // برای به‌روزرسانی باکس‌های برخط
      }
    }
    if(!inp.value.trim()){
      const em = emptyError(key, false);
      if(em) showFieldError(host, em);
    } else if(RANGE_LEVEL === "warn" && typed && spec.kind === "num"){
      const rw = rangeIssue(key, parseFloat(normalizeField(key, inp.value).value));
      if(rw && !host.classList.contains("invalid")) showFieldNote(host, rw);
    }
    refreshSampleFlags(host);
    refreshCrossFlags(host, "blur");                // با خروج از فیلد: ترتیب تاریخ‌ها/وزن‌ها و کنترل جمع دانه‌بندی
    applyFieldAdvisory(host, key, inp.value, false);   // تذکر غیرمسدودکننده (بعد از بازسنجی ترتیب، تا پاک نشود)
    // خطای ترتیب روی همین فیلد + خروج با Tab/Enter به جلو → فوکوس در همین فیلد می‌ماند (مثل خطای فرمت)
    // با ماوس/لمس: فقط رفتن به یک «فیلد دیگرِ خارج از همین قانون» قفل می‌شود؛ رفتن به فیلد هم‌قانونی (برای اصلاح) یا جای خالی آزاد است
    let toOther = false;
    const rt = ev && ev.relatedTarget;
    if(rt && (rt.tagName === "INPUT" || rt.tagName === "TEXTAREA")){
      const rh = rt.closest && rt.closest(".field, td.fcell");
      toOther = !(rh && rh._key && sharesRule(key, rh._key)) && rh !== host;
    }
    if(inp.value.trim() && host.classList.contains("cross-invalid") && (_navForward || toOther)){
      setTimeout(()=>{ if(inp.isConnected){ inp.focus(); try{ inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){} } }, 0);
    }
  });
}

const PROJECT_EMPTY_HIGHLIGHT_KEYS = [];
function makeField(key, label, opts={}){
  const spec = fieldSpec(key);
  const wrap = el("div", {class:"field"+(opts.span2?" span2":"")});
  const lab = el("label", {}, label);
  if(opts.hint){
    const hintEl = el("span",{class:"hint"}, opts.hint);
    if(opts.hintColor) hintEl.style.color = opts.hintColor;
    lab.appendChild(hintEl);
  }
  wrap.appendChild(lab);
  let input;
  if(opts.type==="textarea"){
    input = el("textarea", {rows:"3"});
    input.value = S[key] ?? "";
    input.addEventListener("input", ()=>{ S[key]=input.value; clearFieldError(wrap); if(technicianImportActive) markImportMissingFields(wrap.closest(".card")); });
  } else {
    input = el("input", {type:"text"});
    bindTypedInput(input, key, wrap);
    if(spec.kind === "num" && typeof spec.dec === "number")
      input.setAttribute("placeholder", spec.dec ? "0." + "0".repeat(spec.dec) : "0");
    if(spec.kind !== "text") input.style.textAlign = "right";
  }
  wrap.appendChild(input);
  const errMsg = el("div",{class:"error-msg"}, "این فیلد خالی است؛ لطفاً مقدار را وارد کنید.");
  wrap.appendChild(errMsg);
  wrap._key = key;
  return wrap;
}

function makeAsphaltSizeField(label="سایز آسفالت"){
  const wrap = el("div", {class:"field"});
  wrap.appendChild(el("label", {}, label));
  const select = el("select", {dir:"rtl", class:"design-size-select"});
  select.appendChild(el("option", {value:"19"}, "۱۹ میلی‌متر"));
  select.appendChild(el("option", {value:"25"}, "۲۵ میلی‌متر"));
  select.value = isAsphaltSize(S.asphaltSize);
  select.addEventListener("change", ()=>{
    const previousSize = isAsphaltSize(S.asphaltSize);
    const nextSize = isAsphaltSize(select.value);
    S.asphaltSize = nextSize;
    if(previousSize !== nextSize && typeof DESIGN_KEYS !== "undefined"){
      DESIGN_KEYS.forEach(k=>{
        if(k !== "asphaltSize" && ACCEPT_KEYS.indexOf(k) === -1) S[k] = "";
      });
      S.gsbSource = "design";
    }
    renderApp();
  });
  wrap.appendChild(select);
  wrap.appendChild(el("div", {class:"error-msg"}, "سایز آسفالت را انتخاب کنید."));
  wrap._key = "asphaltSize";
  return wrap;
}

function sectionHead(text){ return el("div",{class:"subhead"}, text); }

function sampleTable(title, rows, cols){
  // rows: [{label, keys:[k1,k2,k3]}], cols: ["نمونه ۱","نمونه ۲","نمونه ۳"]
  // ساختار جدید: هر ستون (نمونه) شامل سه ورودی برای air, water, ssd
  const box = el("div", {class:"tblbox"});
  box.appendChild(sectionHead(title));
  const table = el("table",{class:"sample-table"});
  const thead = el("tr",{}, [el("th",{},"")].concat(cols.map(c=>el("th",{},c))));
  table.appendChild(thead);
  
  // ایجاد ردیف‌ها به ترتیب قبلی (هر ردیف یک پارامتر: هوا، آب، SSD)
  rows.forEach(r=>{
    const tr = el("tr");
    tr.appendChild(el("td",{},r.label));
    r.keys.forEach(k=>{
      const td = el("td",{class:"fcell"});
      td._key = k;
      const inp = el("input",{type:"text"});
      bindTypedInput(inp, k, td);
      // اضافه کردن data-attribute برای شناسایی ستون (نمونه)
      inp.dataset.sample = k.replace(/[^\d]/g, ''); // استخراج شماره نمونه
      td.appendChild(inp);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  box.appendChild(table);
  box.appendChild(el("div",{class:"tbl-error"},""));
  return box;
}


/* ===================== LIVE RESULT BOX (نمایش برخط نتایج محاسبه) ===================== */
function liveFmt(v, d=2){
  if(v===null || v===undefined || isNaN(v) || v===0) return "—";
  return Number(v).toFixed(d);
}
function liveFmtPct(v, d=1){
  const f = liveFmt(v,d);
  return f==="—" ? "—" : f+" %";
}
function liveResultBox(title, rows){
  // rows: [{id, label, suffix?}]
  const box = el("div",{class:"live-box"});
  box.appendChild(el("div",{class:"lv-title"},"⚡ "+title));
  const spans = {};
  rows.forEach(r=>{
    const rowEl = el("div",{class:"lv-row"});
    rowEl.appendChild(el("span",{class:"lv-label"},r.label));
    const val = el("span",{class:"lv-value"},"—");
    spans[r.id] = val;
    rowEl.appendChild(val);
    box.appendChild(rowEl);
  });
  box._spans = spans;
  return box;
}
/* اتصال یک باکس برخط به یک container: هر تغییر ورودی داخل container باعث
   فراخوانی محاسبه‌ی مجدد و به‌روزرسانی مقادیر می‌شود (event delegation) */
function bindLiveBox(container, box, updater){
  const refresh = ()=>{ updater(calculate(S), box._spans); };
  container.addEventListener("input", refresh);
  refresh();
}

/* قانون کلی: هر فیلد خالی یا با فرمت غلط → کادر قرمز + پیام، و false (اجازه‌ی عبور نمی‌دهد).
   فیلدهای معتبر هم نرمال می‌شوند (ارقام لاتین، گرد کردن اعشار اضافه) و در S و input می‌نشینند. */
function validateStep(container){
  let ok = true;
  container.querySelectorAll(".invalid").forEach(x=>x.classList.remove("invalid"));
  container.querySelectorAll(".has-invalid").forEach(x=>x.classList.remove("has-invalid"));
  container.querySelectorAll(".field, td.fcell").forEach(f=>{
    if(f._validator){
      const customMsg = f._validator();
      if(customMsg){ showFieldError(f, customMsg); ok = false; }
      return;
    }
    const key = f._key;
    if(!key) return;
    const spec = fieldSpec(key);
    if(spec.activeIf && !spec.activeIf()) return;
    const msg = fieldError(key);
    if(msg){
      showFieldError(f, msg);
      if(msg === crossError(key)) f.classList.add("cross-invalid");   // تا با رفع مشکل در فیلد دیگر، خودکار پاک شود
      ok = false; return;
    }
    if(spec.kind !== "text" && hasVal(S[key]) && String(S[key]).trim() !== ""){
      const r = normalizeField(key, S[key]);
      S[key] = r.value;
      const inp = f.querySelector("input");
      if(inp) inp.value = r.value;
    }
  });
  return ok;
}
