
/* ===================== تب «تطبیق با معیارها» (قبل از گزارش نهایی) =====================
   همه‌ی عدم‌تطابق‌ها یک‌جا: خارج از محدوده‌ی پذیرش + اختلاف طرح/گزارش (Gse، Gagg و Gmm رایس با طرح).
   فقط گزارش می‌دهد؛ چیزی را مسدود نمی‌کند. ارزیابی از accept.js (acceptEvaluateAll) می‌آید.
   داخل تب‌های ورودی دیگر هیچ پیام عدم تطابقی نشان داده نمی‌شود. */
const CF_TAB_STEP = {project:4, sg:5, bitumen:6, gradation:7, marshall:8};

function _cfLimits(ev){
  const L = ev.L, d = ev.d, f = v => _accVal(d, v) + (d.unit ? " " + d.unit : "");
  if(L.min !== null && L.max !== null) return d.signed ? "از " + f(L.min) + " تا " + f(L.max) : f(L.min) + " تا " + f(L.max);
  if(L.min !== null) return "حداقل " + f(L.min);
  if(L.max !== null) return "حداکثر " + f(L.max);
  return "—";
}

function renderStepConflicts(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"10"),"تطبیق با معیارها"]));
  card.appendChild(el("div",{class:"desc"},"موارد خارج از محدوده‌ی پذیرش، و در پایان اختلاف بیش از حد مجاز (0.04) طرح با گزارش. این تب فقط گزارش می‌دهد؛ جلوی ثبت یا رفتن به گزارش نهایی را نمی‌گیرد و به برگه‌ی گزارش نهایی ربطی ندارد."));

  const evs = acceptEvaluateAll();
  const accEvs = evs.filter(ev => !ev.d.dev), devEvs = evs.filter(ev => ev.d.dev);
  const bad = [];
  accEvs.forEach(ev => ev.bad.forEach(b => bad.push({tab:ev.tab, text:b.text})));
  const devBad = [];
  devEvs.forEach(ev => ev.bad.forEach(b => devBad.push(b.text)));
  const total = bad.length + devBad.length;
  let naCount = 0;
  accEvs.forEach(ev => { if(ev.items.length && ev.state === "na") naCount++; });

  card.appendChild(el("div",{class:"cf-summary " + (total ? "cf-bad" : "cf-ok")},
    total ? "⚠ " + total + " مورد عدم تطابق پیدا شد" : "✓ هیچ عدم تطابقی پیدا نشد" + (naCount ? " (" + naCount + " کنترل هنوز به‌خاطر ناقص بودن داده قابل محاسبه نیست)" : "")));

  /* ۱) لیست تناقض‌های محدوده‌ی پذیرش، به تفکیک تب */
  if(bad.length){
    card.appendChild(el("div",{class:"cf-h"},"خارج از محدوده‌ی پذیرش"));
    Object.keys(CF_TAB_STEP).forEach(tab=>{
      const items = bad.filter(b => b.tab === tab);
      if(!items.length) return;
      const step = CF_TAB_STEP[tab];
      const grp = el("div",{class:"cf-group"});
      const go = el("button",{type:"button",class:"cf-go"},"رفتن به تب");
      go.addEventListener("click", ()=>{ currentStep = step; renderApp(); window.scrollTo({top:0,behavior:"smooth"}); });
      grp.appendChild(el("div",{class:"cf-group-title"},[STEP_TITLES[step], go]));
      items.forEach(b => grp.appendChild(el("div",{class:"cf-item"}, b.text)));
      card.appendChild(grp);
    });
  }

  /* ۲) وضعیت کنترل‌های محدوده‌ی پذیرش */
  card.appendChild(el("div",{class:"cf-h"},"وضعیت کنترل‌های محدوده‌ی پذیرش"));
  const tbl = el("table",{class:"cf-tbl"});
  tbl.appendChild(el("tr",{},["تب","پارامتر","مقدار","محدوده","وضعیت"].map(h => el("th",{},h))));
  accEvs.forEach(ev=>{
    const d = ev.d, lim = _cfLimits(ev), tabName = STEP_TITLES[CF_TAB_STEP[ev.tab]];
    ev.items.forEach(it=>{
      const val = it.v === null ? "—" : _accVal(d, it.v) + (d.unit ? " " + d.unit : "");
      const st = it.state === "bad" ? "⚠ عدم تطابق" : (it.state === "ok" ? "✓ مطابق" : "محاسبه نشده");
      tbl.appendChild(el("tr",{class: it.state === "bad" ? "cf-row-bad" : (it.state === "ok" ? "cf-row-ok" : "")},[
        el("td",{}, tabName), el("td",{class:"cf-name"}, it.name || d.label),
        el("td",{class: it.v === null ? "cf-na" : ""}, val), el("td",{}, lim), el("td",{class:"cf-st" + (it.state === "na" ? " cf-na" : "")}, st)]));
    });
  });
  card.appendChild(el("div",{class:"cf-tblwrap"},[tbl]));
  card.appendChild(el("div",{style:"margin-top:10px;font-size:11.5px;color:var(--ink-soft);line-height:1.9;"},
    "محدوده‌ها را در پنل «محدوده‌ی پذیرش» بالای هر تب تغییر بده. الک‌ها (دانه‌بندی)، بنزین مصرفی، استحکام و نرمی بررسی پذیرش ندارند. «محاسبه نشده» یعنی داده‌ی لازم هنوز وارد نشده."));

  /* ۳) مقادیر طرح و گزارش زیر هم (Gmm محاسباتی فقط در برگه گزارش نهایی نمایش داده می‌شود) */
  const r = calculate(S);
  const rice = _accN("gmm");
  const gmm3 = _accN("gmmDesign"), gagg3 = _accN("gaggDesign");
  const gse1 = rice !== null ? _gseReport(r) : null, gse3 = gseDesignValue();
  const gagg1 = _gaggReport(r);
  const f3 = v => v === null ? "—" : Number(v).toFixed(3);
  const rows = [];
  if(rice !== null){
    rows.push(["Gmm رایس — اندازه‌گیری‌شده روی نمونه", f3(rice)]);
    rows.push(["Gmm طرح — رایس در قیر بهینه", f3(gmm3)]);
    rows.push(["Gse گزارش (از Gmm رایس و Pb نمونه)", f3(gse1)]);
    rows.push(["Gse طرح (از Gmm طرح و Pb بهینه)", f3(gse3)]);
  }
  rows.push(["Gagg گزارش (وزن مخصوص حقیقی مصالح همان روز)", f3(gagg1)]);
  rows.push(["Gagg طرح", f3(gagg3)]);
  card.appendChild(el("div",{class:"cf-h"},"مقادیر طرح و گزارش (برای مقایسه‌ی چشمی)"));
  const vt = el("table",{class:"cf-tbl cf-vals"});
  rows.forEach(rw => vt.appendChild(el("tr",{},[el("td",{class:"cf-name"}, rw[0]), el("td",{}, rw[1])])));
  card.appendChild(el("div",{class:"cf-tblwrap"},[vt]));
  card.appendChild(el("div",{style:"font-size:11.5px;color:var(--ink-soft);line-height:1.9;margin-top:8px;"},[
    "Gse گزارش و طرح با فرمول یکسان محاسبه می‌شوند؛ تفاوت فقط در ورودی‌هاست:",
    el("div",{dir:"ltr",style:"text-align:left;font-family:monospace;"},"Gse  = (100 - Pb) / (100/Gmm - Pb/Gac)")]));

  /* ۴) بندهای آخر: فقط اگر اختلاف بیش از 0.04 بود (اگر نبود، هیچ اعلامی نمی‌آید) */
  if(devBad.length){
    card.appendChild(el("div",{class:"cf-h"},"اختلاف طرح با گزارش بیش از حد مجاز (0.04)"));
    devBad.forEach(t => card.appendChild(el("div",{class:"cf-item"}, t)));
  }
}
