
/* ===================== STATE ===================== */
/* بارگذاری تنبل html2canvas: کد این کتابخانه فقط وقتی که واقعاً دکمه‌ی
   «دریافت تصویر گزارش» زده می‌شود parse/اجرا می‌شود، نه در لحظه‌ی بازشدن صفحه. */
let __h2cLoaded = false;
function ensureHtml2Canvas(){
  return new Promise((resolve, reject)=>{
    if(__h2cLoaded || typeof window.html2canvas === "function"){ __h2cLoaded = true; resolve(); return; }
    try{
      const srcTag = document.getElementById("html2canvas-lib-src");
      const s = document.createElement("script");
      s.textContent = srcTag.textContent;
      document.head.appendChild(s);
      document.head.removeChild(s);
      __h2cLoaded = true;
      resolve();
    }catch(e){ reject(e); }
  });
}
