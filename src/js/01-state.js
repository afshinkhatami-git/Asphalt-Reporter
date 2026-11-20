
const S = {
  // شروع
  startChoice:"",
  designChoice:"",
  techLoaded:false,
  reportMode:"",
  userCode:(()=>{try{return localStorage.getItem("asphaltReporterUserCode")||"";}catch(e){return "";}})(),
  serialResponsibilityConfirmed:false,
  reportSerial:"",
  rawSaved:false,
  rawSaveRequested:false,
  archivedReport:false,

  // step1 - پروژه
  projectName:"",
  employer:"", contractor:"", reqNo:"", reqDate:"", reportDate:"",
  plant:"", asphaltType:"", asphaltSize:"19", designDate:"",
  sampleDate:"", sampleTime:"", sampleLocation:"", sampleNo:"",
  ambientTemp:"", asphaltTemp:"", notes:"",

  // طرح اختلاط (قابل ذخیره/بارگذاری)
  designName:"",
  designCode:"",
  gsbSource:"design",
  gsbDesign:"2.64", pbaDesign:"0.38", gac:"1.024",
  gmmDesign:"", gaggDesign:"",     // مرجع طرح (الزامی): Gmm طرح (رایس در قیر بهینه) و Gagg طرح (Gsb مخلوط، جدول مشاور)
  gmm:"",

  // مارشال - نوع نمونه (با موم/بدون موم)
  waxMethod:"without", gwax:"0.9",

  // step3 - وزن مخصوص (بالک)
  air1:"", air2:"", air3:"",
  water1:"", water2:"", water3:"",
  ssd1:"", ssd2:"", ssd3:"",
  // wax variant (only if waxMethod=with)
  wAir1:"", wAir2:"", wAir3:"",
  wWater1:"", wWater2:"", wWater3:"",
  wSsd1:"", wSsd2:"", wSsd3:"",

  // step4 - درصد قیر (اکستراکشن)
  totalWeight:"", filterDryInitial:"", filterAfterTest:"",
  materialAfterWash:"", gasolineUsed:"", dishFactor:"",

  // step5 - دانه بندی
  ret34:"", ret12:"", ret316:"", ret8:"", ret50:"", ret200:"",
  // الک‌های اختصاصی آسفالت ۲۵ میلی‌متری
  ret112:"", ret1:"", ret34_25:"", ret12_25:"", ret38_25:"", ret4_25:"", ret8_25:"", ret50_25:"", ret200_25:"",
  crush34:"", crush12:"", crush316:"", crush8:"", crush112:"", crush1:"",
  // حدود دانه‌بندی طرح ۲۵ میلی‌متری
  specUp112:"", specLow112:"", specUp1:"", specLow1:"", specUp34_25:"", specLow34_25:"",
  specUp12_25:"", specLow12_25:"", specUp38_25:"", specLow38_25:"", specUp4_25:"", specLow4_25:"",
  specUp8_25:"", specLow8_25:"", specUp50_25:"", specLow50_25:"", specUp200_25:"", specLow200_25:"",
  specUp34:"100", specLow34:"100",
  specUp12:"100", specLow12:"90",
  specUp316:"67", specLow316:"53",
  specUp8:"46", specLow8:"34",
  specUp50:"16", specLow50:"6",
  specUp200:"8", specLow200:"2",

  // step6 - مارشال
  ringType:"digital",
  ringFactor:"", dialReading:"", flow:"",
  g1:"", g2:"", g3:"",

  confirmed:false,
  reportGenerated:false   // ← این خط اضافه شود
};

let currentStep = 0;
let technicianImportActive = false;
