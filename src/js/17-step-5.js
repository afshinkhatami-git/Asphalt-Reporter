
function renderStep5(card){
  card.appendChild(el("h2",{},[ 
    el("span",{class:"num"},"9"),
    "آزمایش مارشال"
  ]));
  card.appendChild(el("div",{class:"desc"},
    "نوع نمونه، قرائت دستگاه، ضریب رینگ و نرمی"
  ));

  card.appendChild(sectionHead("نوع رینگ دستگاه"));

  const ringTypeGroup = el("div",{class:"choice-group marshall-choice-group"});

  const optDigital = el("div",{
    class:"choice"+(S.ringType==="digital"?" selected":"")
  },[
    el("div",{class:"title"},"رینگ دیجیتال"),
    el("div",{class:"desc2"},"قرائت مستقیم استحکام از دستگاه")
  ]);

  const optAnalog = el("div",{
    class:"choice"+(S.ringType==="analog"?" selected":"")
  },[
    el("div",{class:"title"},"رینگ آنالوگ"),
    el("div",{class:"desc2"},"نیاز به ضریب رینگ برای محاسبه استحکام")
  ]);

  ringTypeGroup.appendChild(optDigital);
  ringTypeGroup.appendChild(optAnalog);
  card.appendChild(ringTypeGroup);

  card.appendChild(sectionHead(
    "روش نمونه (برای محاسبه‌ی وزن مخصوص بالک و فضای خالی)"
  ));

  const cg = el("div",{class:"choice-group marshall-choice-group"});
  const optWithout = el("div",{class:"choice"+(
    S.waxMethod==="without"?" selected":""
  )},[
    el("div",{class:"title"},"بدون موم"),
    el("div",{class:"desc2"},
      "محاسبه‌ی استاندارد بدون موم‌اندود کردن نمونه"
    )
  ]);

  const optWith = el("div",{class:"choice"+(
    S.waxMethod==="with"?" selected":""
  )},[
    el("div",{class:"title"},"با موم"),
    el("div",{class:"desc2"},
      "نمونه موم‌اندود شده - نیاز به وزن مخصوص موم دارد"
    )
  ]);

  const gwaxField = el("div",{
    style:"margin-top:12px;"+
      (S.waxMethod==="with"?"":"display:none;")
  });

  gwaxField.appendChild(
    makeField("gwax","وزن مخصوص موم (Gwax)")
  );

  optWithout.addEventListener("click", ()=>{
    S.waxMethod="without";
    optWithout.classList.add("selected");
    optWith.classList.remove("selected");
    gwaxField.style.display="none";
  });

  optWith.addEventListener("click", ()=>{
    S.waxMethod="with";
    optWith.classList.add("selected");
    optWithout.classList.remove("selected");
    gwaxField.style.display="block";
  });

  cg.appendChild(optWithout);
  cg.appendChild(optWith);
  card.appendChild(cg);
  card.appendChild(gwaxField);

  card.appendChild(el("div",{
    style:"font-size:11px;color:var(--ink-soft);margin:4px 0 16px;"
  },"توجه: با انتخاب «با موم»، در تب «وزن مخصوص» فیلدهای وزن نمونه‌ی موم‌اندود هم فعال می‌شود."));


  //  ساخت فیلد ضریب رینگ به همراه wrapper
  const ringFactorField = makeField("ringFactor","ضریب رینگ");
  const ringFactorWrapper = el("div",{style:(S.ringType==="digital"?"opacity:0.5;pointer-events:none;":"")});
  ringFactorWrapper.appendChild(ringFactorField);

  // مدیریت کلیک روی منوها
  optDigital.addEventListener("click", ()=>{
    S.ringType="digital"; 
    optDigital.classList.add("selected"); 
    optAnalog.classList.remove("selected");
    ringFactorWrapper.style.opacity="0.5";
    ringFactorWrapper.style.pointerEvents="none";
    S.ringFactor = "1";
  });

  optAnalog.addEventListener("click", ()=>{
    S.ringType="analog"; 
    optAnalog.classList.add("selected"); 
    optDigital.classList.remove("selected");
    ringFactorWrapper.style.opacity="1";
    ringFactorWrapper.style.pointerEvents="auto";
    S.ringFactor = "3.367";
  });

  // grid با wrapper به‌جای فیلد مستقیم

  const g = el("div",{class:"grid cols-3"});
  g.appendChild(ringFactorWrapper);
  [
    makeField("dialReading","قرائت گیج (استحکام خام)"),
    makeField("flow","نرمی - Flow (mm)",{hint:"عیناً در گزارش درج می‌شود"}),
  ].forEach(f=>g.appendChild(f));

  card.appendChild(g);

  const live = liveResultBox("نتیجه‌ی محاسبه (برخط)", [
    {id:"volume", label:"میانگین حجم نمونه (cm³)"},
    {id:"corr", label:"ضریب اصلاح حجم"},
    {id:"stab", label:"استحکام اصلاح‌شده (kg)"},
    {id:"va",   label:"فضای خالی (Va)"},
    {id:"vma",  label:"VMA"},
    {id:"vfa",  label:"VFA"},
    {id:"fa",   label:"نسبت فیلر به قیر مؤثر (F/A)"},
  ]);
  card.appendChild(live);
  bindLiveBox(card, live, (r, spans)=>{
    spans.volume.textContent = liveFmt(r.avgVolume, 1);
    spans.corr.textContent = liveFmt(r.correctionFactor, OUTPUT_DEC.corrFactor);
    spans.stab.textContent = liveFmt(r.stabilityCorrected, OUTPUT_DEC.stability);
    ["va","vma","vfa","fa"].forEach(id => { spans[id].textContent = accLiveText(id, r, "marshall"); });   // accept.js
  });
  addAcceptPanel(card, "marshall");   // محدوده‌ی پذیرش (بالای تب) — accept.js
}
