
function renderStep1(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"4"),"طرح اختلاط"]));
  card.appendChild(el("div",{class:"desc"},"تمام پارامترهای ثابتِ طرح در یک جا — در پایان این تب می‌توانید طرح را ذخیره کنید"));

  const sizeNameRow = el("div",{class:"grid cols-3 design-size-name-row"});
  sizeNameRow.appendChild(makeAsphaltSizeField("سایز طرح اختلاط"));
  sizeNameRow.appendChild(makeField("designCode","شماره طرح",{hint:"باید یکتا (یونیک) باشد — مثال: 024",hintColor:"var(--amber)"}));
  sizeNameRow.appendChild(makeField("designName","نام طرح",{hint:"مثال: طرح اختلاط آسفالت بیندر کارخانه (1405)"}));
  card.appendChild(sizeNameRow);
  card.appendChild(el("div",{style:"margin-top:8px;padding:9px 12px;border-radius:8px;border:1px solid var(--amber);background:var(--amber-soft);color:var(--ink);font-size:12px;line-height:1.8;"},
    "توجه مهم: «شماره طرح» مستقیماً در ساخت شماره سریال گزارش‌ها و نام فایل دیجیتال به کار می‌رود. برای جلوگیری از تداخل فایل‌ها و گزارش‌ها، برای هر طرح اختلاط یک شماره طرح یکتا (غیرتکراری) وارد کنید؛ مسئولیت یکتا نگه داشتن شماره طرح بر عهده کاربر است."
  ));

  card.appendChild(sectionHead("وزن مخصوص حقیقی/ظاهری اجزای مصالح (برای محاسبه‌ی Gsb مخلوط)"));
  const gAgg = el("div",{class:"grid cols-3"});
  const gAggFields = [
    makeField("g1","G1 - مانده الک 8/4"),
    makeField("g2","G2 - رد الک 8/4 تا مانده 200"),
    makeField("g3","G3 - رد الک 200"),
  ];
  gAggFields.forEach(f=>gAgg.appendChild(f));
  card.appendChild(gAgg);

  card.appendChild(sectionHead("محدوده مشخصات فنی دانه‌بندی (حد بالا / پایین درصد رد شده)"));
  const specRows = getAsphaltSieveConfig().map(x=>[x.label,x.specUp,x.specLow]);
  const specTable = el("table",{class:"sample-table"});
  const specInputEls = [];
  specTable.appendChild(el("tr",{},[el("th",{},"الک"),el("th",{},"حد بالا"),el("th",{},"حد پایین")]));
  specRows.forEach(([lbl,up,low])=>{
    const tr = el("tr");
    tr.appendChild(el("td",{},lbl));
    [up,low].forEach(k=>{
      const td_=el("td",{class:"fcell"});
      td_._key = k;
      const inp=el("input",{type:"text"});
      bindTypedInput(inp, k, td_, refreshGsbDisplay);
      td_.appendChild(inp);
      tr.appendChild(td_);
      specInputEls.push(inp);
    });
    specTable.appendChild(tr);
  });
  card.appendChild(el("div",{class:"tblbox"},[specTable, el("div",{class:"tbl-error"},"")]));

  card.appendChild(sectionHead("Gsb طرح و پارامترهای مرتبط"));
  const gsbSrcGroup = el("div",{class:"choice-group",style:"margin-bottom:12px;"});
  const srcDesign = el("div",{class:"choice"+(S.gsbSource==="design"?" selected":"")},[
    el("div",{class:"title"},"از اطلاعات اوزان مخصوص طرح (G1,G2,G3)"),
    el("div",{class:"desc2"},"محاسبه‌ی خودکار — پیش‌فرض")
  ]);
  const srcDaily = el("div",{class:"choice"+(S.gsbSource==="daily"?" selected":"")},[
    el("div",{class:"title"},"از اطلاعات روزانه"),
    el("div",{class:"desc2"},"ورود دستی مقدار — برای زمانی که بخواهیم از مصالح همان روز محاسبه کنیم")
  ]);
  const gsbManualWrap = el("div",{style:"margin-top:10px;"+(S.gsbSource==="daily"?"":"display:none;")});
  const gsbManualField = makeField("gsbDesign","Gsb (ورود دستی)");
  gsbManualWrap.appendChild(gsbManualField);
  const gsbComputedWrap = el("div",{style:"margin-top:10px;"+(S.gsbSource==="design"?"":"display:none;")});
  const gsbComputedDisplay = el("div",{style:"font-size:13.5px;font-weight:700;color:var(--blue);background:var(--blue-soft);border-radius:7px;padding:9px 12px;"},"—");
  gsbComputedWrap.appendChild(el("div",{style:"font-size:12.5px;font-weight:600;margin-bottom:5px;"},"Gsb محاسبه‌شده (از G1/G2/G3 و میانه‌ی بازه‌ی مشخصات فنی)"));
  gsbComputedWrap.appendChild(gsbComputedDisplay);

  function refreshGsbDisplay(){
    if(S.gsbSource!=="design") return;
    const g1=num(S.g1), g2=num(S.g2), g3=num(S.g3);
    const sieve8 = getAsphaltSieveAt(S.asphaltSize, 2.36);
    const sieve200 = getAsphaltSieveAt(S.asphaltSize, 0.075);
    const p8 = sieve8 ? (num(S[sieve8.specUp])+num(S[sieve8.specLow]))/2 : 0;
    const p200 = sieve200 ? (num(S[sieve200.specUp])+num(S[sieve200.specLow]))/2 : 0;
    const v20=100-p8, v21=p8-p200, v22=p200;
    const denom=(g1!==0?v20/g1:0)+(g2!==0?v21/g2:0)+(g3!==0?v22/g3:0);
    const val = denom!==0 ? 100/denom : 0;
    S.gsbDesign = val ? val.toFixed(4) : "";
    gsbComputedDisplay.textContent = val ? val.toFixed(4) : "—";
  }
  gAggFields.forEach(f=>{ const inp=f.querySelector("input"); inp.addEventListener("input", refreshGsbDisplay); });
  refreshGsbDisplay();

  srcDesign.addEventListener("click", ()=>{
    S.gsbSource="design"; srcDesign.classList.add("selected"); srcDaily.classList.remove("selected");
    gsbComputedWrap.style.display="block"; gsbManualWrap.style.display="none";
    refreshGsbDisplay();
  });
  srcDaily.addEventListener("click", ()=>{
    S.gsbSource="daily"; srcDaily.classList.add("selected"); srcDesign.classList.remove("selected");
    gsbManualWrap.style.display="block"; gsbComputedWrap.style.display="none";
  });
  gsbSrcGroup.appendChild(srcDesign); gsbSrcGroup.appendChild(srcDaily);
  card.appendChild(gsbSrcGroup);
  const gsbPbaRow = el("div",{class:"grid design-gsb-pba-row"});
  gsbComputedWrap.classList.add("gsb-computed-wrap");
  gsbPbaRow.appendChild(gsbComputedWrap);
  gsbPbaRow.appendChild(makeField("pbaDesign","درصد جذب قیر در طرح (%)",{hint:"Pba — از طرح مشاور (برای Gse محاسباتی گزارش)"}));
  card.appendChild(gsbPbaRow);
  card.appendChild(gsbManualWrap);

  /* مرجع طرح (الزامی) برای کنترل اختلاف ±0.04 با گزارش (تب «تطبیق با معیارها» — accept.js).
     Gse طرح از Gmm طرح، Pb بهینه و Gac محاسبه می‌شود:  Gse = (100 - Pb) / (100/Gmm - Pb/Gac) */
  card.appendChild(sectionHead("مرجع طرح برای کنترل اختلاف با گزارش"));
  const gRef = el("div",{class:"grid cols-3 design-reference-grid"});
  [
    makeField("gmmDesign","Gmm طرح (رایس، در قیر بهینه)",{hint:"از جدول رایس طرح مشاور، در درصد قیر بهینه"}),
    makeField("gaggDesign","Gagg طرح (وزن مخصوص حقیقی مخلوط مصالح)",{hint:"از جدول وزن مخصوص مصالح طرح مشاور (همان Gsb مخلوط)"}),
    makeField("pbOptimum","درصد قیر بهینه طرح — Pb (%)",{hint:"برای محاسبه‌ی Gse طرح"}),
    makeField("gac","Gac (وزن مخصوص قیر)",{hint:"برای محاسبه‌ی Gse طرح"}),
  ].forEach(f=>gRef.appendChild(f));
  const gseBox = el("div",{class:"field"});
  gseBox.appendChild(el("label",{},"Gse طرح (محاسبه‌شده)"));
  const gseDisp = el("div",{style:"font-size:13.5px;font-weight:700;color:var(--blue);background:var(--blue-soft);border-radius:7px;padding:9px 12px;"},"—");
  gseBox.appendChild(gseDisp);
  gseBox.appendChild(el("div",{class:"hint",style:"font-size:11px;color:var(--ink-soft);margin-top:3px;"},"= (100 − Pb) / (100/Gmm − Pb/Gac)"));
  gRef.appendChild(gseBox);
  card.appendChild(gRef);
  function refreshGseDesign(){
    const v = (typeof gseDesignValue === "function") ? gseDesignValue() : null;     // accept.js
    gseDisp.textContent = v === null ? "— (پس از تکمیل فیلدهای کنارش)" : v.toFixed(3);
  }
  card.addEventListener("input", refreshGseDesign);
  card.addEventListener("change", refreshGseDesign);
  refreshGseDesign();
  card.appendChild(el("div",{style:"margin-top:4px;font-size:11px;color:var(--ink-soft);line-height:1.9;"},"Gagg همان وزن مخصوص حقیقی (Gsb) مخلوط مصالح است — نه Gse. اختلاف مجاز Gmm / Gse / Gagg بین طرح و گزارش پیش‌فرض ±0.04 است (در تب «تطبیق با معیارها» لیست می‌شود؛ حدش در پنل «محدوده‌ی پذیرش» تب‌های وزن مخصوص و دانه‌بندی قابل تغییر است)."));

  card.appendChild(el("div",{style:"margin-top:6px;font-size:11px;color:var(--ink-soft);"},"نکته: انتخاب روش نمونه (با موم / بدون موم) به تب «مارشال» منتقل شده است."));

  const saveBar = el("div",{class:"export-bar",style:"justify-content:flex-start;margin-top:20px;padding-top:16px;border-top:1px dashed var(--line);"});
  const btnSave = el("button",{class:"btn-ghost"},"ذخیره طرح (JSON)");
  const btnLoad = el("button",{class:"btn-ghost"},"بارگذاری طرح (JSON)");
  const loadFileInput = el("input",{type:"file",accept:"application/json",style:"display:none;"});
  const saveMsg = el("span",{style:"font-size:11.5px;color:var(--ink-soft);align-self:center;"},"");

  btnSave.addEventListener("click", ()=>{
    /* مسیر و نام فایل را کاربر در پنجره‌ی «ذخیره‌ی با نام» انتخاب می‌کند (design-io.js) */
    saveDesignToFile().then(res => {
      if(res.cancelled){
        saveMsg.textContent = "ذخیره لغو شد.";
        saveMsg.style.color = "var(--err)";
        return;
      }
      saveMsg.textContent = res.picked ? "طرح ذخیره شد: " + res.name : "طرح در پوشه‌ی دانلود مرورگر ذخیره شد (این مرورگر انتخاب مسیر را پشتیبانی نمی‌کند).";
      saveMsg.style.color = "var(--ok)";
    });
  });

  btnLoad.addEventListener("click", ()=>{
    loadFileInput.value = "";
    loadFileInput.click();
  });

  loadFileInput.addEventListener("change", ()=>{
    if(loadFileInput.files && loadFileInput.files[0]){
      loadDesignFromFile(loadFileInput.files[0], (ok)=>{
        if(ok){
          renderApp();
          showToast("طرح «" + (S.designName || "") + "» بارگذاری شد");
        } else {
          saveMsg.textContent = "فایل معتبر نیست.";
          saveMsg.style.color = "var(--err)";
        }
      });
    }
  });

  saveBar.appendChild(btnSave);
  saveBar.appendChild(btnLoad);
  saveBar.appendChild(loadFileInput);
  saveBar.appendChild(saveMsg);
  card.appendChild(saveBar);
}
