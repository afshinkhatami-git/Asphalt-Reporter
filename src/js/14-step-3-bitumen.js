
function renderStep3(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"7"),"درصد قیر (اکستراکشن)"]));
  card.appendChild(el("div",{class:"desc"},"داده‌های آزمایش استخراج قیر"));
  const g = el("div",{class:"grid"});
  [
    makeField("totalWeight","وزن کل نمونه آسفالت (gr)"),
    makeField("filterDryInitial","وزن فیلتر خشک اولیه (gr)"),
    makeField("filterAfterTest","وزن فیلتر پس از آزمایش (gr)"),
    makeField("materialAfterWash","وزن مصالح پس از شست‌وشو (gr)"),
    makeField("gasolineUsed","بنزین مصرفی (ml - عدد صحیح)"),
    makeField("dishFactor","عدد دیش (%)"),
  ].forEach(f=>g.appendChild(f));
  card.appendChild(g);

  const live = liveResultBox("نتیجه‌ی محاسبه (برخط)", [
    {id:"pb", label:"درصد قیر نمونه (Pb)"},
    {id:"k7", label:"وزن خشک مصالح (gr)"},
  ]);
  card.appendChild(live);
  bindLiveBox(card, live, (r, spans)=>{
    spans.pb.textContent = liveFmtPct(r.Pb, OUTPUT_DEC.pb);
    spans.k7.textContent = liveFmt(r.K7, OUTPUT_DEC.dryWeight);
  });
  addAcceptPanel(card, "bitumen");   // محدوده‌ی پذیرش (بالای تب) — accept.js
}
