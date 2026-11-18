
function renderStep4(card){
  const size = isAsphaltSize(S.asphaltSize);
  const sieveConfig = getAsphaltSieveConfig(size);
  const fracturePairs = getAsphaltFracturePairs(size);
  card.appendChild(el("h2",{},[el("span",{class:"num"},"8"),"دانه‌بندی و درصد شکستگی — آسفالت "+size+" میلی‌متری"]));
  card.appendChild(el("div",{class:"desc"},"وزن مانده روی الک‌های متناسب با سایز آسفالت و وزن مصالح شکسته در الک‌های تعریف‌شده برای آزمون شکستگی"));
  card.appendChild(sectionHead("وزن مانده روی الک (gr)"));
  const retainedGrid = el("div",{class:"grid cols-3"});
  sieveConfig.forEach(x=>retainedGrid.appendChild(makeField(x.ret,"الک "+x.label)));
  card.appendChild(retainedGrid);

  card.appendChild(sectionHead("وزن مصالح شکسته — دو جبهه (gr)"));
  const crushGrid = el("div",{class:"grid cols-3"});
  fracturePairs.forEach(x=>crushGrid.appendChild(makeField(x.crush,"الک "+x.label)));
  card.appendChild(crushGrid);

  const liveRows = sieveConfig.map((x,i)=>({id:"sieve"+i,label:"درصد رد شده از الک "+x.label}));
  liveRows.push(
    {id:"frac",label:"درصد شکستگی دو جبهه"},
    {id:"gagg",label:"Gagg (Gsb) گزارش"},
    {id:"fa",label:"نسبت فیلر به قیر مؤثر (F/A)"},
    {id:"pan",label:"ته‌مانده‌ی کف / Pan (gr)"},
    {id:"sumPct",label:"جمع درصدهای مانده (با کف) — باید 100 باشد"}
  );
  const live = liveResultBox("درصد رد شده از الک و درصد شکستگی (برخط)", liveRows);
  card.appendChild(live);

  const sumChk = el("div",{class:"field span2 grad-sum-check"},[ el("div",{class:"error-msg"},"") ]);
  sumChk._key = "gradSum";
  card.appendChild(sumChk);
  setTimeout(()=>refreshCrossFlags(sumChk, false), 0);
  bindLiveBox(card, live, (r, spans)=>{
    sieveConfig.forEach((x,i)=>{ spans["sieve"+i].textContent = liveFmtPct(r.passing.bySieve[x.ret], OUTPUT_DEC.passing); });
    spans.frac.textContent = liveFmtPct(r.fracturePct, OUTPUT_DEC.fracture);
    spans.gagg.textContent = accLiveText("dgagg", r, "gradation");
    spans.fa.textContent = accLiveText("fa", r, "gradation");
    spans.pan.textContent = r.K7 > 0 ? r.pan.toFixed(1) : "—";
    spans.sumPct.textContent = r.K7 > 0 ? r.sumPct.toFixed(1) + " %" : "—";
  });
  addAcceptPanel(card, "gradation");
}
