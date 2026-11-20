
/* ===================== HELPERS ===================== */
const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const hasVal = v => v !== "" && v !== null && v !== undefined;
const fmt = (v, d=2) => { if (v===null || v===undefined || isNaN(v)) return "—"; return Number(v).toFixed(d); };
const avg3 = (a,b,c) => (num(a)+num(b)+num(c))/3;

/* پیکربندی متمرکز الک‌ها؛ داده‌های هر سایز مستقل‌اند، اما موتور محاسبات مشترک است. */
function isAsphaltSize(size){ return String(size ?? S.asphaltSize ?? "19").trim() === "25" ? "25" : "19"; }
const ASPHALT_SIEVE_CONFIG = {
  "19": [
    {ret:"ret34", label:"3/4", mm:19, specUp:"specUp34", specLow:"specLow34", crush:"crush34", fracture:true},
    {ret:"ret12", label:"1/2", mm:12.5, specUp:"specUp12", specLow:"specLow12", crush:"crush12", fracture:true},
    {ret:"ret316", label:"3/16", mm:4.75, specUp:"specUp316", specLow:"specLow316", crush:"crush316", fracture:true},
    {ret:"ret8", label:"#8", mm:2.36, specUp:"specUp8", specLow:"specLow8", fracture:false},
    {ret:"ret50", label:"#50", mm:0.30, specUp:"specUp50", specLow:"specLow50", fracture:false},
    {ret:"ret200", label:"#200", mm:0.075, specUp:"specUp200", specLow:"specLow200", fracture:false}
  ],
  "25": [
    {ret:"ret112", label:"1½", mm:37.5, specUp:"specUp112", specLow:"specLow112", crush:"crush112", fracture:true},
    {ret:"ret1", label:"1", mm:25, specUp:"specUp1", specLow:"specLow1", crush:"crush1", fracture:true},
    {ret:"ret34_25", label:"3/4", mm:19, specUp:"specUp34_25", specLow:"specLow34_25", crush:"crush34", fracture:true},
    {ret:"ret12_25", label:"1/2", mm:12.5, specUp:"specUp12_25", specLow:"specLow12_25", crush:"crush12", fracture:true},
    {ret:"ret38_25", label:"3/8", mm:9.5, specUp:"specUp38_25", specLow:"specLow38_25", fracture:false},
    {ret:"ret4_25", label:"#4", fractureLabel:"3/16 (#4)", mm:4.75, specUp:"specUp4_25", specLow:"specLow4_25", crush:"crush316", fracture:true},
    {ret:"ret8_25", label:"#8", mm:2.36, specUp:"specUp8_25", specLow:"specLow8_25", crush:"crush8", fracture:true},
    {ret:"ret50_25", label:"#50", mm:0.30, specUp:"specUp50_25", specLow:"specLow50_25", fracture:false},
    {ret:"ret200_25", label:"#200", mm:0.075, specUp:"specUp200_25", specLow:"specLow200_25", fracture:false}
  ]
};
function getAsphaltSieveConfig(size){ return ASPHALT_SIEVE_CONFIG[isAsphaltSize(size)]; }
function getAsphaltFracturePairs(size){ return getAsphaltSieveConfig(size).filter(x=>x.fracture).map(x=>({ret:x.ret, crush:x.crush, label:x.fractureLabel || x.label})); }
function getAsphaltSieveAt(size, mm){ return getAsphaltSieveConfig(size).find(x=>Math.abs(x.mm-mm)<0.001); }

function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  for(const k in attrs){
    if(k==="class") e.className = attrs[k];
    else if(k==="html") e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if(c===null||c===undefined) return;
    if(typeof c === "string") e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}
