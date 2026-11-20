
function renderStep2(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"6"),"وزن مخصوص مارشال (بالک)"]));
  card.appendChild(el("div",{class:"desc"},"وزن سه نمونه به گرم"));
  card.appendChild(sampleTable("وزن مخصوص اصلی", [
    {label:"وزن در هوا (خشک)", keys:["air1","air2","air3"]},
    {label:"وزن در آب", keys:["water1","water2","water3"]},
    {label:"وزن اشباع با سطح خشک (SSD)", keys:["ssd1","ssd2","ssd3"]},
  ], ["نمونه ۱","نمونه ۲","نمونه ۳"]));

  card.appendChild(sectionHead("Gmm - وزن مخصوص حداکثر نظری (اختیاری - آزمایش رایس روزانه)"));
  const gmmBox = el("div",{class:"grid"});
  gmmBox.appendChild(makeField("gmm","Gmm (خالی بگذارید اگر انجام نشده)",{span2:true,hint:"در صورت خالی بودن، Va با روش حجمی (بدون Gmm) محاسبه می‌شود"}));
  card.appendChild(gmmBox);

  if(S.waxMethod==="with"){
    card.appendChild(sampleTable("وزن مخصوص با موم", [
      {label:"وزن خشک در هوا", keys:["wAir1","wAir2","wAir3"]},
      {label:"وزن موم‌اندود در آب", keys:["wWater1","wWater2","wWater3"]},
      {label:"وزن موم‌اندود در هوا", keys:["wSsd1","wSsd2","wSsd3"]},
    ], ["نمونه ۱","نمونه ۲","نمونه ۳"]));
  }


  const liveRows = [
    {id:"gmb1", label:"Gmb نمونه ۱"},
    {id:"gmb2", label:"Gmb نمونه ۲"},
    {id:"gmb3", label:"Gmb نمونه ۳"},
    {id:"gmb", label:"میانگین وزن مخصوص مارشال (Gmb)"},
    {id:"gse", label:"Gse گزارش (از Gmm رایس و Pb)"},
    {id:"avgVolume", label:"میانگین حجم نمونه برای ضریب اصلاح (cm³)"}
  ];
  if(S.waxMethod==="with") liveRows.push({id:"gmbWax", label:"میانگین وزن مخصوص با موم"});
  const live = liveResultBox("نتیجه‌ی محاسبه (برخط)", liveRows);
  card.appendChild(live);
  bindLiveBox(card, live, (r, spans)=>{
    if(r.Hind && r.Hind.length === 3){
      spans.gmb1.textContent = liveFmt(r.Hind[0], OUTPUT_DEC.gmb);
      spans.gmb2.textContent = liveFmt(r.Hind[1], OUTPUT_DEC.gmb);
      spans.gmb3.textContent = liveFmt(r.Hind[2], OUTPUT_DEC.gmb);
    }
    spans.gmb.textContent = liveFmt(r.GmbReport, OUTPUT_DEC.gmb);
    spans.avgVolume.textContent = liveFmt(r.avgVolume, 1);
    spans.gse.textContent = accLiveText("dgse", r, "sg");   // accept.js
    if(spans.gmbWax) spans.gmbWax.textContent = liveFmt(r.GmbWaxReport, OUTPUT_DEC.gmb);
  });
  const live2 = liveResultBox("پارامترهای محاسباتی طرح (برخط)", [
    {id:"gsbD", label:"Gsb طرح"},
    {id:"gseC", label:"Gse محاسباتی"},
    {id:"gmmC", label:"Gmm محاسباتی"}
  ]);
  card.appendChild(live2);
  bindLiveBox(card, live2, (r, spans)=>{
    spans.gsbD.textContent = liveFmt(r.gsbDesign, 3);
    spans.gseC.textContent = liveFmt(r.Gse, OUTPUT_DEC.gse);
    spans.gmmC.textContent = (_pbReady() && r.K7>0) ? liveFmt(r.GmmEstimated, OUTPUT_DEC.gmm) : "—";
  });
  addAcceptPanel(card, "sg");   // محدوده‌ی پذیرش (بالای تب) — accept.js
}
