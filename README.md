# Asphalt-Reporter

Asphalt Reporter HTML application (single-file, offline output).

## ساختار

```
src/
  manifest.json      ترتیب دقیق قطعات (ترتیب مهم است)
  css/               بلوک‌های CSS (به‌ترتیب اعمال)
  js/                بلوک‌های JS (همه در یک scope سراسری)
  vendor/            کتابخانه‌ی html2canvas (embedded، آفلاین)
  html/              قطعات HTML بین بلوک‌ها
build.py             ساخت فایل نهایی
dist/Asphalt_Reporter.html   خروجی نهایی (همین فایل تحویل می‌شود)
legacy/              نسخه‌ی تک‌فایل قبل از ماژولار شدن (مرجع)
```

## ساخت

```
python3 build.py
```

خروجی در `dist/Asphalt_Reporter.html` ساخته می‌شود.

برای اطمینان از اینکه بیلد با یک فایل مرجع بایت‌به‌بایت یکی است:

```
python3 build.py --check legacy/Asphalt_Reporter-23.html
```

## نکات مهم

- ترتیب بلوک‌ها در `src/manifest.json` عمداً همان ترتیب فایل اصلی است.
  بلوک‌های CSS بعدی قانون‌های قبلی را بازنویسی می‌کنند و بلوک‌های JS
  یک scope سراسری مشترک دارند؛ جابه‌جایی ترتیب بدون تست ممکن است ظاهر یا
  عملکرد را خراب کند.
- نسخه‌بندی با commit و tag انجام می‌شود، نه با اسم فایل.
- هر بار بعد از تغییر در `src/`، `python3 build.py` را اجرا کنید و `dist/` را هم commit کنید.
