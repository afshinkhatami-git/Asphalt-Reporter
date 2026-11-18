
function renderStep0(card){
  card.appendChild(el("h2",{},[el("span",{class:"num"},"5"),"اطلاعات پروژه و نمونه‌برداری"]));
  card.appendChild(el("div",{class:"desc"},"اطلاعات مکاتباتی و مشخصات نمونه"));
  const g = el("div",{class:"grid"});
  [
    makeField("projectName","نام پروژه",{span2:true, hint:"همه‌ی فیلدها (به‌جز توضیحات) باید پر شوند", hintColor:"var(--err)"}),
    makeField("employer","کارفرما"),
    makeField("contractor","پیمانکار"),
    // --- ردیف تاریخ‌ها به ترتیب منطق کار: درخواست ← طرح ← نمونه‌برداری (+ساعت) ← گزارش (آخرین تاریخ عملیاتی) ---
    makeField("reqNo","شماره درخواست"),
    makeField("reqDate","تاریخ درخواست",{hint:"مثال: 1405/03/05"}),
    makeField("designDate","تاریخ طرح",{hint:"مثال: 1404 یا 1404/05/12"}),
    makeField("sampleDate","تاریخ نمونه‌برداری",{hint:"مثال: 1405/03/05"}),
    makeField("sampleTime","ساعت نمونه‌برداری",{hint:"مثال: 14:30"}),
    makeField("reportDate","تاریخ گزارش",{hint:"مثال: 1405/03/20"}),
    makeField("plant","کارخانه آسفالت"),
    makeField("asphaltType","نوع آسفالت",{hint:"مثال: بیندر"}),
    makeAsphaltSizeField("سایز آسفالت"),
    makeField("sampleLocation","محل نمونه‌برداری",{span2:true}),
    // --- دماها کنار هم ---
    makeField("asphaltTemp","دمای آسفالت (°C)"),
    makeField("ambientTemp","دمای محیط (°C)"),
  ].forEach(f=>g.appendChild(f));
  card.appendChild(g);
  const g2 = el("div",{class:"grid"});
  g2.appendChild(makeField("notes","توضیحات تکمیلی",{type:"textarea",span2:true}));
  card.appendChild(g2);
  
  addAcceptPanel(card, "project");
  if(S.reportMode==="review"){
    card.classList.add("review-disabled");
    card.querySelectorAll("input,textarea,select").forEach(x=>{x.disabled=true;});
    const note=el("div",{class:"review-note"},"حالت «بررسی آسفالت» فعال است؛ این تب غیرفعال است و برای محاسبه لازم نیست.");
    const dsc=card.querySelector(".desc");
    card.insertBefore(note, dsc?dsc.nextSibling:card.firstChild);
  }   // محدوده‌ی پذیرش (بالای تب) — accept.js
}
