
/* ===================== REPORT (final step) ===================== */
function td(cls, text){ return el("td",{class:cls}, text); }
/* مقدار چپ‌به‌راست و ایزوله (تاریخ، ساعت، عدد+واحد) تا در متن راست‌چین جابه‌جا/برعکس نشود (مثل «C° 25»).
   calt خاموش است چون فونت Vazirmatn جای «/» بین ارقام را بسته به بافت عوض می‌کند و html2canvas
   متن را تکه‌تکه می‌کشد؛ نتیجه‌اش روی‌هم‌افتادن اسلش با رقم بود (1405/05/28 ← 140‌505/28). */
function ltr(text){ return el("span",{dir:"ltr",style:"display:inline-block;unicode-bidi:isolate;font-feature-settings:'calt' 0;"}, text); }

function buildGradationSVG(r){
  const W=700, H=330, padL=54, padR=16, padT=36, padB=28;
  const plotW=W-padL-padR, plotH=H-padT-padB;
  const cfg = getAsphaltSieveConfig();
  const xmax = isAsphaltSize()==="25" ? 40 : 25.6;
  const xmin=0.05;
  const xTicks=[0.05,0.1,0.2,0.4,0.8,1.6,3.2,6.4,12.8,25.6].filter(x=>x<xmax);
  xTicks.push(xmax);
  const xPix = mm => padL + (Math.log10(mm)-Math.log10(xmin))/(Math.log10(xmax)-Math.log10(xmin))*plotW;
  const yPix = pct => padT + (100-pct)/100*plotH;
  const sizes = cfg.map(x=>x.mm);
  const sieveLabels = cfg.map(x=>x.label);
  const measured = cfg.map(x=>r.passing.bySieve[x.ret] ?? 0);
  const upper = cfg.map(x=>num(S[x.specUp]));
  const lower = cfg.map(x=>num(S[x.specLow]));
  const ptStr = arr => sizes.map((mm,i)=> xPix(mm)+","+yPix(arr[i])).join(" ");

  let grid="";
  xTicks.forEach(t=>{
    const x=xPix(t);
    grid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT+plotH}" stroke="#e3e1db" stroke-width="1"/>`;
    grid += `<text x="${x}" y="${H-8}" font-size="9" text-anchor="middle" fill="#5b5f66">${t}</text>`;
  });
  for(let p=0;p<=100;p+=20){
    const y=yPix(p);
    grid += `<line x1="${padL}" y1="${y}" x2="${padL+plotW}" y2="${y}" stroke="#e3e1db" stroke-width="1"/>`;
    grid += `<text x="${padL-8}" y="${y+3}" font-size="9" text-anchor="end" fill="#5b5f66">${p}</text>`;
  }
  let topAxis = `<line x1="${padL}" y1="${padT}" x2="${padL+plotW}" y2="${padT}" stroke="#5b5f66" stroke-width="1"/>`;
  sizes.forEach((mm,i)=>{
    const x=xPix(mm);
    topAxis += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT-5}" stroke="#5b5f66" stroke-width="1"/>`;
    topAxis += `<text x="${x}" y="${padT-9}" font-size="9" text-anchor="middle" fill="#2b2e33" font-weight="700">${sieveLabels[i]}</text>`;
  });
  topAxis += `<text x="${padL+plotW/2}" y="10" font-size="9" text-anchor="middle" fill="#5b5f66">شماره الک</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
    ${grid}${topAxis}
    <polyline points="${ptStr(upper)}" fill="none" stroke="#a86a2e" stroke-width="1.6"/>
    <polyline points="${ptStr(lower)}" fill="none" stroke="#a86a2e" stroke-width="1.6"/>
    <polyline points="${ptStr(measured)}" fill="none" stroke="#232323" stroke-width="1.8" stroke-dasharray="5,3"/>
    ${sizes.map((mm,i)=>{
      const cx=xPix(mm), cy=yPix(measured[i]);
      const labelAbove = measured[i] < 93;
      const ty = labelAbove ? cy-7 : cy+14;
      return `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#2f5d82"/><text x="${cx}" y="${ty}" font-size="9" text-anchor="middle" fill="#183c57" font-weight="700">${Number(measured[i]).toFixed(1)}</text>`;
    }).join("")}
    <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="none" stroke="#b9b7b0"/>
    <text x="13" y="${padT+plotH/2}" transform="rotate(-90 13 ${padT+plotH/2})" font-size="10" font-weight="700" text-anchor="middle" fill="#2b2e33">درصد رد شده</text>
    <text x="${padL+plotW/2}" y="${H-1}" font-size="9" text-anchor="middle" fill="#5b5f66">اندازه سایز (mm)</text>
  </svg>`;
}

function buildReportSheet(r){
  const wrap = el("div",{id:"reportSheet"});
  const qcBrand = (typeof getQcBranding === "function") ? getQcBranding() : { companyName: "", logoDataUrl: "" };
  const reportTitle = el("h3",{});
  reportTitle.innerHTML = 'گزارش آزمایش طرح اختلاط آسفالت <span dir="rtl" style="direction:rtl;unicode-bidi:isolate;display:inline-block;">(بیندر/توپکا)</span>';
  if (qcBrand.companyName) {
    reportTitle.appendChild(document.createTextNode(" "));
    const qcSpan = el("span", { dir: "rtl", style: "direction:rtl;unicode-bidi:isolate;display:inline-block;" }, qcBrand.companyName);
    reportTitle.appendChild(qcSpan);
  }
  const rtitleChildren = [
    reportTitle,
    el("div",{class:"rsub"},"بر اساس نشریه ۱۰۱ / ضابطه ۷۷۳ / ASTM-AASHTO"),
    (S.reportMode==="official"||S.archivedReport) && (S.reportSerial||!S.rawSaved) ? el("div",{class:"rsub",style:"font-weight:700;color:#1f3d6b;margin-top:4px;"},"شماره سریال: "+(S.reportSerial||makeReportSerial())) : null,
    S.reportMode==="review" ? el("div",{class:"rsub",style:"font-weight:700;color:#9a5b00;margin-top:4px;"},"صرفاً جهت بررسی — فاقد شماره سریال") : null,
    S.projectName ? el("div",{class:"rsub",style:"font-weight:700;color:#2b2e33;margin-top:4px;"}, "پروژه: "+S.projectName) : null
  ];
  if (qcBrand.logoDataUrl) {
    rtitleChildren.push(
      el("div", { class: "report-logo-slot" }, [
        el("img", { src: qcBrand.logoDataUrl, alt: qcBrand.companyName || "لوگوی شرکت QC" })
      ])
    );
  }
  wrap.appendChild(el("div",{class:"rtitle" + (qcBrand.logoDataUrl ? " has-qc-logo" : "")}, rtitleChildren));

  const graphBox = el("div",{style:"padding:10px 14px 0;"});
  const graphCaption = el("div",{style:"font-size:11px;font-weight:700;color:#2b2e33;margin-bottom:4px;"});
  graphCaption.innerHTML = 'منحنی دانه‌بندی <span dir="rtl" style="direction:rtl;unicode-bidi:isolate;display:inline-block;">(خط‌چین: نمونه — خطوط توپر: محدوده مشخصات فنی)</span>';
  graphBox.appendChild(graphCaption);
  graphBox.innerHTML += buildGradationSVG(r);
  wrap.appendChild(graphBox);

  const table = el("table",{class:"rtable"});

  table.appendChild(el("tr",{},[(()=>{const t=td("section",""); t.setAttribute("colspan","6"); t.style.height="10px"; return t;})()]));
  table.appendChild(el("tr",{},[td("label","کارفرما"),td("val",S.employer||"—"),td("label","دمای محیط"),td("val",ltr((S.ambientTemp||"—")+" °C")),td("label","تاریخ نمونه‌برداری"),td("val",ltr(S.sampleDate||"—"))]));
  table.appendChild(el("tr",{},[td("label","کارخانه"),td("val",S.plant||"—"),td("label","دمای آسفالت"),td("val",ltr((S.asphaltTemp||"—")+" °C")),td("label","تاریخ گزارش"),td("val",ltr(S.reportDate||"—"))]));
  table.appendChild(el("tr",{},[td("label","نوع آسفالت"),td("val",S.asphaltType||"—"),td("label","درصد قیر نمونه"),td("val",fmt(r.Pb, OUTPUT_DEC.pb)+" %"),td("label","شماره نمونه"),td("val",S.reportMode==="review"?"—":(S.sampleNo||"—")+"_AS")]));
  table.appendChild(el("tr",{},[td("label","سایز آسفالت"),td("val",S.asphaltSize||"—"),td("label","وزن مخصوص مارشال (Gmb)"),td("val",fmt(r.GmbReport, OUTPUT_DEC.gmb)),td("label","شماره درخواست"),td("val",S.reqNo||"—")]));
  table.appendChild(el("tr",{},[td("label","تاریخ طرح"),td("val",ltr(S.designDate||"—")),td("label","فضای خالی (Va) %"),td("val",fmt(r.Va, OUTPUT_DEC.va)+" %"),td("label","تاریخ درخواست"),td("val",ltr(S.reqDate||"—"))]));
  table.appendChild(el("tr",{},[td("label","ساعت نمونه‌برداری"),td("val",ltr(S.sampleTime||"—")),td("label","درصد شکستگی"),td("val",fmt(r.fracturePct, OUTPUT_DEC.fracture)+" %"),td("label","استحکام اصلاح‌شده (kg)"),td("val",fmt(r.stabilityCorrected, OUTPUT_DEC.stability))]));
  table.appendChild(el("tr",{},[td("label","وزن مخصوص حقیقی مصالح (Gsb)"),td("val",fmt(r.F19,4)),td("label","VMA %"),td("val",fmt(r.VMA, OUTPUT_DEC.vma)+" %"),td("label","نرمی -  (mm)"),td("val",fmt(num(S.flow),1))]));
  // ردیف اول: پارامترهای اصلی طرح
 // اصلاح نهایی چیدمان: ترکیب پارامترها در دو ردیف مرتب
  table.appendChild(el("tr", {}, [
      td("label", "درصد قیر مؤثر"), td("val", fmt(r.effBitumen, OUTPUT_DEC.pb) + " %"),
      td("label", "VFA %"), td("val", fmt(r.VFA, OUTPUT_DEC.vfa) + " %"),
      td("label", "نسبت فیلر به قیر (F/A)"), td("val", fmt(r.fillerToEffBitumen, OUTPUT_DEC.fa))
  ]));

  table.appendChild(el("tr", {}, [
      td("label", "قیر بهینه طرح"), td("val", fmt(num(S.pbOptimum), 2) + " %"),
      td("label", "Gmm رایس (نمونه)"), td("val", hasVal(S.gmm) ? fmt(num(S.gmm), OUTPUT_DEC.gmm) : "—"),
      td("label", "Gagg (گزارش)"), td("val", fmt(r.F19, OUTPUT_DEC.gse))
  ]));


  const locationRow = el("tr");
  locationRow.appendChild(td("label","محل نمونه‌برداری"));
  const locationTd = el("td",{class:"notes"}, S.sampleLocation || "—");
  locationTd.setAttribute("colspan","5");
  locationRow.appendChild(locationTd);
  table.appendChild(locationRow);

  const notesRow = el("tr");
  notesRow.appendChild(td("label","توضیحات"));
  const notesTd = el("td",{class:"notes"}, S.notes || "—");
  notesTd.setAttribute("colspan","5");
  notesRow.appendChild(notesTd);
  table.appendChild(notesRow);

  wrap.appendChild(table);

  // پاورقی گزارش: شماره سریال در پایین‌ترین بخش گزارش چاپی + نام آکادمی
  const activeSerial = (S.reportMode==="official"||S.archivedReport) ? (S.reportSerial||makeReportSerial()) : "";
  if(activeSerial){
    wrap.appendChild(el("div",{class:"report-footer"},[
      el("span",{},"طراحی توسط آکادمی آموزشی لیان"),
      el("span",{class:"rf-serial"},"شماره سریال: " + activeSerial)
    ]));
  } else {
    wrap.appendChild(el("div",{class:"report-footer centered-only"}, "طراحی توسط آکادمی آموزشی لیان"));
  }

  return wrap;
}

function fixParensForExport(doc, root){
  const showText=doc.defaultView?.NodeFilter?.SHOW_TEXT ?? NodeFilter.SHOW_TEXT;
  const walker=doc.createTreeWalker(root,showText,null);
  const nodes=[];
  while(walker.nextNode()){
    if(/[()]/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  }
  nodes.forEach(node=>{
    const txt=node.nodeValue, idxs=[];
    for(let i=0;i<txt.length;i++) if(txt[i]==="("||txt[i]===")") idxs.push(i);
    const leftOf=(i)=>{
      const range=doc.createRange();
      range.setStart(node,i); range.setEnd(node,i+1);
      const rect=range.getBoundingClientRect();
      return rect.width?rect.left:null;
    };
    const glyph={}, stack=[];
    idxs.forEach(i=>{
      if(txt[i]==="(") stack.push(i);
      else if(stack.length){
        const open=stack.pop(), xOpen=leftOf(open), xClose=leftOf(i);
        if(xOpen!==null&&xClose!==null){
          glyph[open]=xOpen<=xClose?"(":")";
          glyph[i]=xOpen<=xClose?")":"(";
        }
      }
    });
    idxs.forEach(i=>{if(!(i in glyph)) glyph[i]=txt[i]==="("?")":"(";});
    const frag=doc.createDocumentFragment();
    let last=0;
    idxs.forEach(i=>{
      if(i>last) frag.appendChild(doc.createTextNode(txt.slice(last,i)));
      const span=doc.createElement("span");
      span.textContent=glyph[i];
      span.style.cssText="display:inline-block;direction:ltr;unicode-bidi:isolate;";
      frag.appendChild(span);
      last=i+1;
    });
    if(last<txt.length) frag.appendChild(doc.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag,node);
  });
}

function renderStep6(card){
  if(S.reportMode==="official" && !S.rawSaved && !S.archivedReport) S.reportSerial=makeReportSerial();
  card.appendChild(el("h2",{},[el("span",{class:"num"},"11"),"پیش‌نمایش گزارش نهایی"]));
  card.appendChild(el("div",{class:"desc"},S.reportMode==="review"?"این نتیجه فقط برای بررسی است و شماره سریال یا خروجی تصویر ندارد.":S.archivedReport?"گزارش آرشیوی؛ سریال آن از فایل خام بازیابی شده است.":"گزارش رسمی: فایل خام با شماره سریال و شماره نمونه ذخیره می‌شود؛ سپس دریافت تصویر فعال خواهد شد."));
  const r=calculate(S);
  const reportWrap=el("div",{id:"reportWrap"});
  reportWrap.appendChild(buildReportSheet(r));
  card.appendChild(reportWrap);
  const confirmBox=el("div",{class:"confirm-box"});
  const chk=el("input",{type:"checkbox",id:"confirmChk"});
  chk.checked=!!S.confirmed;
  const lbl=el("label",{for:"confirmChk"},"مقادیر بالا را بررسی کردم و صحت آن‌ها را تأیید می‌کنم.");
  confirmBox.appendChild(chk); confirmBox.appendChild(lbl); card.appendChild(confirmBox);
  const status=el("div",{style:"text-align:center;margin:10px 0;font-weight:700;color:var(--ink-soft);"},S.rawSaved?"ذخیره فایل خام توسط شما تأیید شد؛ اکنون می‌توانید تصویر گزارش را دریافت کنید.":S.rawSaveRequested?"دانلود به مرورگر سپرده شد. پس از بررسی و ذخیره فایل، دکمه تأیید را بزنید.":S.reportMode==="review"?"حالت بررسی: شماره سریال و ذخیره تصویر غیرفعال است.":S.confirmed?"":"");
  card.appendChild(status);
  card.appendChild(el("div",{class:"report-flow-hint",style:"text-align:center;white-space:nowrap;overflow-x:auto;font-size:12px;font-weight:700;color:#52ddff;text-shadow:0 0 5px rgba(82,221,255,.22);margin:12px 0 6px;"},S.reportMode==="review"?"حالت بررسی: ذخیره فایل دیجیتال و تصویر در این مسیر غیرفعال است.":"برای دریافت گزارش، دکمه‌ها را به‌ترتیب فعال کنید: ذخیره فایل دیجیتال، تأیید ذخیره، تصویر گزارش، گزارش جدید."));
  const exportBar=el("div",{class:"export-bar report-action-stack"});
  const btnSaveRaw=el("button",{class:"btn-amber"},"ذخیره فایل دیجیتال گزارش");
  const btnConfirmRaw=el("button",{class:"btn-primary"},"فایل دیجیتال گزارش ذخیره شده");
  const btnImg=el("button",{class:"btn-amber"},"ذخیره تصویر گزارش");
  const btnReset=el("button",{class:"btn-new-report"},"شروع گزارش جدید");
  const canArchive=S.reportMode!=="review";
  const canImage=S.confirmed&&S.rawSaved&&canArchive;
  btnImg.disabled=!canImage;
  btnSaveRaw.disabled=!S.confirmed||!canArchive||S.rawSaved||S.rawSaveRequested;
  btnSaveRaw.style.display=canArchive?"":"none";
  btnConfirmRaw.disabled=!S.confirmed||!canArchive||!S.rawSaveRequested||S.rawSaved;
  btnConfirmRaw.style.display=canArchive?"":"none";
  btnImg.style.display=canArchive?"":"none";
  btnReset.disabled=!(S.reportGenerated||(S.reportMode==="review"&&S.confirmed));
  btnReset.style.display="";
  exportBar.appendChild(btnSaveRaw); exportBar.appendChild(btnConfirmRaw); exportBar.appendChild(btnImg); exportBar.appendChild(btnReset); card.appendChild(exportBar);
  btnSaveRaw.addEventListener("click",()=>{
    if(!S.confirmed||!canArchive||S.rawSaved||S.rawSaveRequested)return;
    try{
      const res=saveFullReportToFile();
      if(!res.ok){showToast("مرورگر نتوانست دانلود فایل خام را آغاز کند.","err");return;}
      renderApp();
      showToast("دانلود "+res.name+" به مرورگر سپرده شد؛ پس از ذخیره، تأیید کنید.");
    }catch(e){showToast("خطا در آماده‌سازی دانلود فایل خام.","err");}
  });
  btnConfirmRaw.addEventListener("click",()=>{
    if(!S.confirmed||!canArchive||!S.rawSaveRequested)return;
    S.rawSaved=true;
    S.rawSaveRequested=false;
    S.reportGenerated=false;
    renderApp();
    showToast("تأیید شما ثبت شد؛ اکنون دریافت تصویر فعال است.");
  });
  btnReset.addEventListener("click",()=>resetForNewReport());
  chk.addEventListener("change",()=>{
    S.confirmed=chk.checked;
    btnSaveRaw.disabled=!S.confirmed||!canArchive||S.rawSaved||S.rawSaveRequested;
    btnSaveRaw.style.display=canArchive?"":"none";
    btnConfirmRaw.disabled=!S.confirmed||!canArchive||!S.rawSaveRequested||S.rawSaved;
    btnConfirmRaw.style.display=canArchive?"":"none";
    btnImg.disabled=!(S.confirmed&&S.rawSaved&&canArchive);
    btnImg.style.display=canArchive?"":"none";
    btnReset.disabled=!(S.reportGenerated||(S.reportMode==="review"&&S.confirmed));
    status.textContent=S.rawSaved?"ذخیره فایل خام توسط شما تأیید شد؛ اکنون می‌توانید تصویر گزارش را دریافت کنید.":S.rawSaveRequested?"دانلود به مرورگر سپرده شد. پس از بررسی و ذخیره فایل، دکمه تأیید را بزنید.":S.reportMode==="review"?"حالت بررسی: شماره سریال و ذخیره تصویر غیرفعال است.":S.confirmed?"":"";
  });
  function persianizeExportDigits(doc,root){
     const showText=doc.defaultView?.NodeFilter?.SHOW_TEXT ?? NodeFilter.SHOW_TEXT;
     const walker=doc.createTreeWalker(root,showText,null), nodes=[];
     while(walker.nextNode()) if(/[0-9]/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
     nodes.forEach(node=>{node.nodeValue=node.nodeValue.replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)]);});
   }
   async function generateReportCanvas(){
    const target=document.getElementById("reportSheet");
    await ensureHtml2Canvas();
    await document.fonts.ready;
    return await html2canvas(target,{scale:2,backgroundColor:"#ffffff",useCORS:true,letterRendering:true,onclone:(clonedDoc)=>{
      clonedDoc.querySelectorAll('#reportSheet [dir="rtl"]').forEach(node=>{node.style.direction="rtl";node.style.unicodeBidi="isolate";node.style.display="inline-block";});
      const sheet=clonedDoc.getElementById("reportSheet"); if(sheet){persianizeExportDigits(clonedDoc,sheet);fixParensForExport(clonedDoc,sheet);}
    }});
  }
  btnImg.addEventListener("click",async()=>{
    if(!canImage)return;
    const originalText=btnImg.innerText; btnImg.disabled=true; btnImg.innerText="در حال ساخت تصویر...";
    try{
      const canvas=await generateReportCanvas();
      const link=document.createElement("a"); link.href=canvas.toDataURL("image/png"); link.download=reportFileBase()+".png"; link.click();
      S.reportGenerated=true; btnReset.disabled=false; btnReset.style.display="";
    }catch(e){console.error("خطا در تولید تصویر:",e);alert("خطا در تولید تصویر: "+(e&&e.message?e.message:String(e)));}
    finally{btnImg.disabled=!(S.confirmed&&S.rawSaved&&canArchive);btnImg.innerText=originalText;}
  });
}
