
/* ===================== CALCULATION ENGINE ===================== */
/* Faithful port of the verified formula chain from بیندر19ارجمندی-1404.xlsx
   (double-checked against cached workbook values; averaging bug fixed to
   include all 3 samples per user confirmation). */
function calculate(s){
  const air=[num(s.air1),num(s.air2),num(s.air3)];
  const water=[num(s.water1),num(s.water2),num(s.water3)];
  const ssd=[num(s.ssd1),num(s.ssd2),num(s.ssd3)];
  const avgAir = avg3(s.air1,s.air2,s.air3);
  const avgWater = avg3(s.water1,s.water2,s.water3);
  const avgSSD = avg3(s.ssd1,s.ssd2,s.ssd3);

  // Gmb و داده‌های حجمی فعال باید از همان روش انتخاب‌شده (با موم/بدون موم) بیایند.
  const HindWithoutWax = air.map((a,i)=> (ssd[i]-water[i])!==0 ? a/(ssd[i]-water[i]) : 0);
  const validHindWithoutWax = HindWithoutWax.filter(h => h > 0);
  const GmbWithoutWax = validHindWithoutWax.length > 0 ? validHindWithoutWax.reduce((sum,val)=>sum+val,0) / validHindWithoutWax.length : 0;

  let GmbWaxReport = null;
  let waxSampleVolumes = [];
  let waxDenominators = [];
  let wAir = [], wWater = [], wSsd = [];
  let HW = [];
  if(s.waxMethod==="with"){
    wAir=[num(s.wAir1),num(s.wAir2),num(s.wAir3)];
    wWater=[num(s.wWater1),num(s.wWater2),num(s.wWater3)];
    wSsd=[num(s.wSsd1),num(s.wSsd2),num(s.wSsd3)];
    const gwax = num(s.gwax)||0.9;
    waxDenominators = wAir.map((a,i)=> (wSsd[i]-wWater[i]) - ((wSsd[i]-a)/gwax));
    HW = wAir.map((a,i)=> waxDenominators[i]!==0 ? a/waxDenominators[i] : 0);
    waxSampleVolumes = waxDenominators.map((v,i)=>v>0 && wAir[i]>0 ? v : 0);
    const validHW = HW.filter(v => v > 0);
    GmbWaxReport = validHW.length > 0 ? validHW.reduce((a, b) => a + b, 0) / validHW.length : 0;
  }
  const Hind = s.waxMethod==="with" ? HW : HindWithoutWax;
  const GmbReport = s.waxMethod==="with" ? (GmbWaxReport || 0) : GmbWithoutWax;

  /* درصد قیر (استخراج) */
  const K3 = num(s.filterAfterTest) - num(s.filterDryInitial);
  const K4 = num(s.gasolineUsed)*num(s.dishFactor)/100;
  const K5 = K4+K3;
  const totalW = num(s.totalWeight);
  const Pb = totalW!==0 ? ((totalW-(num(s.materialAfterWash)+K5))/totalW)*100 : 0;
  const K7 = num(s.materialAfterWash)+K3+K4;

  /* دانه‌بندی: آرایه‌ی الک‌ها از پیکربندی سایز فعال خوانده می‌شود. */
  const sieveConfig = getAsphaltSieveConfig(s.asphaltSize);
  const retained = sieveConfig.map(x=>num(s[x.ret]));
  const sumRetained = retained.reduce((a,b)=>a+b,0);
  const pan = K7-sumRetained;
  let cumulative = 0;
  const passingValues = retained.map(v=>{
    cumulative += v;
    return K7>0 ? 100-(cumulative*100/K7) : 0;
  });
  const passingBySieve = {};
  sieveConfig.forEach((x,i)=>{ passingBySieve[x.ret] = passingValues[i]; });
  const passAt = mm => {
    const sieve = getAsphaltSieveAt(s.asphaltSize, mm);
    return sieve ? (passingBySieve[sieve.ret] ?? 0) : 0;
  };

  /* درصد شکستگی: نسبت مجموع وزن مصالح شکسته به وزن مانده روی الک‌های تعریف‌شده برای همان سایز */
  const fracturePairs = getAsphaltFracturePairs(s.asphaltSize);
  const fractureDen = fracturePairs.reduce((sum,p)=>sum+num(s[p.ret]),0);
  const fractureNum = fracturePairs.reduce((sum,p)=>sum+num(s[p.crush]),0);
  const fracturePct = fractureDen>0 ? fractureNum*100/fractureDen : 0;

  const sumRetPct = K7>0 ? sumRetained*100/K7 : 0;
  const panPct = K7>0 ? pan*100/K7 : 0;
  const sumPct = K7>0 ? sumRetPct+panPct : 0;

  /* وزن مخصوص حقیقی مصالح مخلوط (Gagg گزارش)؛ مرزهای تفکیک #8 و #200 برای هر دو سایز ثابت‌اند. */
  const passing8 = passAt(2.36), passing200 = passAt(0.075);
  const V20 = 100-passing8;
  const V21 = passing8-passing200;
  const V22 = passing200;
  const g1=num(s.g1), g2=num(s.g2), g3=num(s.g3);
  const denomF19 = (g1!==0?V20/g1:0)+(g2!==0?V21/g2:0)+(g3!==0?V22/g3:0);
  const F19 = denomF19!==0 ? 100/denomF19 : 0;

  const U13=Pb;
  const gwaxVal = num(s.gwax)||0.9;
  const activeAir = s.waxMethod==="with" ? avg3(wAir[0],wAir[1],wAir[2]) : avgAir;
  const activeVolumeDenominator = s.waxMethod==="with"
    ? ((avg3(wSsd[0],wSsd[1],wSsd[2])-avg3(wWater[0],wWater[1],wWater[2])) -
       (avg3(wSsd[0],wSsd[1],wSsd[2])-activeAir)/gwaxVal)
    : (avgSSD-avgWater);
  const P = activeVolumeDenominator;
  const O = P!==0 ? activeAir/P : 0;
  const E2 = num(s.pbaDesign), E3 = num(s.gac);
  const effBitumen = O!==0 ? U13-(((100-U13)*E2)/100) : 0;

  const ringFactor = s.ringType==="digital" ? 1 : num(s.ringFactor);
  const dialReading = num(s.dialReading);
  // ضریب اصلاح باید بر اساس حجم واقعی نمونه و با همان روش تعیین Gmb محاسبه شود.
  // بدون موم: حجم = وزن خشک در هوا / Gmb (از رابطه‌ی ارشمیدس معادل SSD-Water است).
  // با موم: حجم از اختلاف حجمی تصحیح‌شده‌ی روش موم به دست می‌آید؛ استفاده از وزن‌های بدون موم در این حالت خطاست.
  const sampleVolumes = s.waxMethod==="with"
    ? waxSampleVolumes
    : air.map((a, i) => (Hind[i] > 0 && a > 0) ? a / Hind[i] : 0);
  const validVolumes = sampleVolumes.filter(v => Number.isFinite(v) && v > 0);
  const avgVolume = validVolumes.length > 0 ? validVolumes.reduce((sum, v) => sum + v, 0) / validVolumes.length : 0;
  const correctionFactor = getCorrectionFactorFromTable(avgVolume);
  const stabilityRaw = dialReading * ringFactor;
  const stabilityCorrected = stabilityRaw * correctionFactor;

  const fillerToEffBitumen = effBitumen!==0 ? V22/effBitumen : 0;

  /* Va / VMA / VFA (دو مسیره) */
  // برای روش موم، حجم تصحیح‌شده‌ی موم‌اندود و وزن خشک متناظر مبنای Gmb در زنجیره VMA است.
  const F3o = activeVolumeDenominator;
  const F4o = F3o!==0 ? activeAir/F3o : 0;
  const sieve8 = getAsphaltSieveAt(s.asphaltSize, 2.36);
  const sieve200 = getAsphaltSieveAt(s.asphaltSize, 0.075);
  const passing8Mid = sieve8 ? (num(s[sieve8.specUp])+num(s[sieve8.specLow]))/2 : 0;
  const passing200Mid = sieve200 ? (num(s[sieve200.specUp])+num(s[sieve200.specLow]))/2 : 0;
  const V20d = 100-passing8Mid, V21d = passing8Mid-passing200Mid, V22d = passing200Mid;
  const denomGsbDesign = (g1!==0?V20d/g1:0)+(g2!==0?V21d/g2:0)+(g3!==0?V22d/g3:0);
  const gsbDesignComputed = denomGsbDesign!==0 ? 100/denomGsbDesign : 0;
  const gsbDesign = s.gsbSource==="design" ? gsbDesignComputed : num(s.gsbDesign);

  const pbaDesign = num(s.pbaDesign), gac=num(s.gac);
  const F5o = gac!==0 ? F4o*(Pb-pbaDesign)/gac : 0;
  const F6o = gac!==0 ? (F4o*Pb*pbaDesign)/(100*gac) : 0;
  const F7o = F5o+F6o;
  const F8o = gsbDesign!==0 ? (F4o*(100-Pb))/gsbDesign : 0;
  const VMA = 100-F8o;

  const gmm = num(s.gmm);
  let Va, VFA, vaMethod;
  if(hasVal(s.gmm) && gmm>0){
    // Gmm رایسِ نمونه با Gmb گزارش‌شده (میانگین Gmb نمونه‌های معتبر) جفت می‌شود.
    Va = 100*(gmm-GmbReport)/gmm;
    VFA = VMA!==0 ? 100*(VMA-Va)/VMA : 0;
    vaMethod = "gmm";
  } else if(F19 > 0){
    // بدون تست رایس، حجم مصالح را از Gagg روزانه‌ی همان دانه‌بندی واقعی بگیر.
    // GmmEstimated فقط برای نمایش در گزارش نهایی محاسبه می‌شود و ورودی Va نیست.
    const F8va = F4o*(100-Pb)/F19;
    Va = 100-(F7o+F8va);
    VFA = VMA!==0 ? (F7o/VMA)*100 : 0;
    vaMethod = "volumetric";
  } else {
    // بدون Gmm رایس و بدون Gagg قابل محاسبه، Va را از Gsb طرح جایگزین نکن.
    Va = null;
    VFA = VMA!==0 ? (F7o/VMA)*100 : 0;
    vaMethod = "unavailable";
  }

  const Gse = (gsbDesign !== 0 && (gac - (pbaDesign/100)*gsbDesign) !== 0)
      ? (gsbDesign * gac) / (gac - (pbaDesign/100) * gsbDesign) : 0;
  const Ps = 100 - Pb;
  const GmmEstimated = (Gse !== 0 && gac !== 0) ? 100 / ((Ps / Gse) + (Pb / gac)) : 0;

  const passing = {bySieve:passingBySieve};
  if(isAsphaltSize(s.asphaltSize)==="19"){
    ["p19","p9_5","p4_75","p2_36","p0_3","p0_075"].forEach((k,i)=>passing[k]=passingValues[i] ?? 0);
  } else {
    ["p37_5","p25","p19","p12_5","p9_5","p4_75","p2_36","p0_3","p0_075"].forEach((k,i)=>passing[k]=passingValues[i] ?? 0);
  }

  return {
    avgAir, avgWater, avgSSD, Hind, GmbReport, GmbWaxReport,
    Pb, K7, fracturePct, pan, sumPct, F19, effBitumen, stabilityCorrected, correctionFactor, avgVolume, sampleVolumes,
    fillerToEffBitumen, VMA, Va, VFA, vaMethod, F4o,
    gsbDesign, gsbDesignComputed, Gse, GmmEstimated, passing
  };
}
// --- محل قرارگیری: خارج از تابع calculate، مثلاً قبل از // FORM BUILDING HELPERS ---
function getCorrectionFactorFromTable(volume) {
  if (!Number.isFinite(Number(volume)) || Number(volume) <= 0) return 1.00;
  // جدول اصلاح مارشال بر مبنای حجم‌های صحیح (cm³) تعریف شده است؛
  // حجم محاسباتی اعشاری باید پیش از جست‌وجو به نزدیک‌ترین cm³ گرد شود
  // تا بین بازه‌های صحیح قرار نگیرد و به‌اشتباه ضریب 1 برنگردد.
  volume = Math.round(Number(volume));
  const table = [
    { min: 0,    max: 213,  factor: 5.56 }, { min: 214,  max: 225,  factor: 5.00 },
    { min: 226,  max: 237,  factor: 4.55 }, { min: 238,  max: 250,  factor: 4.17 },
    { min: 251,  max: 264,  factor: 3.85 }, { min: 265,  max: 276,  factor: 3.57 },
    { min: 277,  max: 289,  factor: 3.33 }, { min: 290,  max: 301,  factor: 3.03 },
    { min: 302,  max: 316,  factor: 2.78 }, { min: 317,  max: 328,  factor: 2.50 },
    { min: 329,  max: 340,  factor: 2.27 }, { min: 341,  max: 353,  factor: 2.08 },
    { min: 354,  max: 367,  factor: 1.92 }, { min: 368,  max: 379,  factor: 1.79 },
    { min: 380,  max: 392,  factor: 1.67 }, { min: 393,  max: 405,  factor: 1.56 },
    { min: 406,  max: 420,  factor: 1.47 }, { min: 421,  max: 431,  factor: 1.39 },
    { min: 432,  max: 443,  factor: 1.32 }, { min: 444,  max: 456,  factor: 1.25 },
    { min: 457,  max: 470,  factor: 1.19 }, { min: 471,  max: 482,  factor: 1.14 },
    { min: 483,  max: 495,  factor: 1.09 }, { min: 496,  max: 508,  factor: 1.04 },
    { min: 509,  max: 522,  factor: 1.00 }, { min: 523,  max: 535,  factor: 0.96 },
    { min: 536,  max: 546,  factor: 0.93 }, { min: 547,  max: 559,  factor: 0.89 },
    { min: 560,  max: 573,  factor: 0.86 }, { min: 574,  max: 585,  factor: 0.83 },
    { min: 586,  max: 598,  factor: 0.81 }, { min: 599,  max: 610,  factor: 0.78 },
    { min: 611,  max: 625,  factor: 0.76 }, { min: 626,  max: 640,  factor: 0.74 },
    { min: 641,  max: 653,  factor: 0.72 }, { min: 654,  max: 666,  factor: 0.70 },
    { min: 667,  max: 681,  factor: 0.68 }, { min: 682,  max: 695,  factor: 0.67 },
    { min: 696,  max: 708,  factor: 0.65 }, { min: 709,  max: 723,  factor: 0.63 },
    { min: 724,  max: 740,  factor: 0.61 }, { min: 741,  max: 759,  factor: 0.59 },
    { min: 760,  max: 780,  factor: 0.57 }, { min: 781,  max: 999,  factor: 0.56 }
  ];
  for (const row of table) {
    if (volume >= row.min && volume <= row.max) return row.factor;
  }
  return 1.00;
}
