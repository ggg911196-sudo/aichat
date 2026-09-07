# 📋 Ai Chat — سند کامل پروژه

> **برای ادامهٔ کار در چت جدید:** این فایل را آپلود کن و بنویس
> «این پروژه‌ام است، ادامه بده». همه‌چیز اینجاست.
>
> آخرین بروزرسانی: ۲۰۲۶/۰۹/۰۷

---

# 🌐 آدرس‌ها

| مورد | آدرس |
|---|---|
| **سایت زنده** | https://aichat-app-53x.pages.dev |
| **پروکسی (API)** | https://aichat-proxy.ggg911196.workers.dev |
| **مخزن کد** | https://github.com/ggg911196-sudo/aichat |
| سایت قدیمی (بدون Git) | https://aichat-dfk.pages.dev |

---

# 🔑 حساب‌ها و شناسه‌ها

| مورد | مقدار |
|---|---|
| حساب Cloudflare | `Ggg911196@gmail.com` |
| Cloudflare Account ID | `885f19cbeb2da33425b622d470d429a8` |
| Cloudflare Subdomain | `ggg911196.workers.dev` |
| حساب GitHub | `ggg911196-sudo` |
| نام مخزن | `aichat` (عمومی) |
| نام پروژهٔ Pages | `aichat-app` |
| نام Worker | `aichat-proxy` |
| KV Namespace | `aichat-quota` |
| **KV Namespace ID** | `bf9373609ed74de5b4cbbb548107e60f` |

---

# 🔐 کلیدها و رمزها

> 🔒 مقادیر واقعی عمداً اینجا نیستند (مخزن عمومی است).
> آنها در فایل محلی `پروژه-اطلاعات-کامل.md` و در Cloudflare Secrets هستند.

| نام | محل نگهداری | مقدار |
|---|---|---|
| `GEMINI_KEY` | Cloudflare Secret | `«در Cloudflare Secret — فایل محلی»` |
| `GROQ_KEY` | Cloudflare Secret | `«در Cloudflare Secret — فایل محلی»` |
| توکن GitHub (deploy) | `~/.secrets/gh` | `«در ~/.secrets/gh — فایل محلی»` |

**نکات امنیتی:**
- هیچ‌کدام از این کلیدها در `index.html` نیستند — همه روی سرور
- توکن GitHub فقط به مخزن `aichat` دسترسی دارد (Contents: Read/Write)
- کلید Groq قبلاً در HTML لو رفته بود → **بهتر است در console.groq.com/keys عوض شود**
- توکن‌های Cloudflare (`cfat_…`) ساخته شدند ولی **کار نکردند** و باید حذف شوند

---

# 🏗 معماری

```
کاربر (مرورگر/APK)
      │
      ▼
aichat-app-53x.pages.dev        ← سایت (HTML+CSS+JS در یک فایل)
      │  fetch /api/chat
      ▼
aichat-proxy.workers.dev        ← پروکسی امن
      │  • کلیدها اینجا (Secret)
      │  • سهمیه بر اساس IP + شناسهٔ دستگاه
      │  • شمارش در KV (دائمی)
      ▼
Gemini API  /  Groq API
```

**چرا پروکسی؟** کلید API هرگز به مرورگر کاربر نمی‌رسد.

---

# ⚙️ انتشار خودکار (مهم‌ترین بخش)

هر دو از GitHub خودکار منتشر می‌شوند:

| | مسیر در مخزن | زمان انتشار |
|---|---|---|
| سایت | ریشه (`index.html`, `icons/`, …) | ~۱۲ ثانیه |
| Worker | پوشهٔ `/worker` | ~۳۰ ثانیه |

**تنظیمات Workers Build:**
```
Repository:       ggg911196-sudo/aichat
Branch:           main
Root directory:   /worker
Deploy command:   npx wrangler deploy
```

**روش انتشار (در سندباکس):**
```bash
python3 /home/user/push.py "پیام تغییر"
```
اسکریپت پوشهٔ `gh/` را کامل به GitHub می‌فرستد؛ بقیه خودکار است.

---

# 📁 فایل‌های پروژه

| مسیر | توضیح |
|---|---|
| `gh/` | **منبع اصلی** — این پوشه به GitHub می‌رود |
| `gh/index.html` | کل اپ (~۶۴۷ KB، HTML+CSS+JS یکجا) |
| `gh/manifest.json` | تنظیمات PWA |
| `gh/sw.js` | Service Worker (آفلاین) |
| `gh/icons/` | ۱۰ آیکون |
| `gh/_headers` | هدرهای امنیتی |
| `gh/worker/index.js` | کد Worker (نسخهٔ KV، ۵۶ خط) |
| `gh/worker/wrangler.toml` | تنظیمات Worker + بایندینگ KV |
| `push.py` | اسکریپت انتشار |
| `.secrets/gh` | توکن GitHub |
| `site/` | کپی از `gh/` (قدیمی، فقط پشتیبان) |
| `chat-7.html` | نسخهٔ بدون PWA (مرجع) |

---

# 🤖 سرویس‌های هوش مصنوعی

**زنجیرهٔ خودکار** — اگر یکی جواب ندهد، بعدی امتحان می‌شود:

| ترتیب | مدل | وضعیت |
|---|---|---|
| ۱ | `gemini-3.5-flash` | ✅ اصلی |
| ۲ | `gemini-3.5-flash-lite` | ✅ (thinkingConfig قبول نمی‌کند) |
| ۳ | `gemini-3.8-flash` | ⚠️ گاهی 503 |
| ۴ | Groq `openai/gpt-oss-120b` | ✅ پشتیبان قوی |
| ۵ | Groq `qwen/qwen3.8-27b` | ✅ برای تصویر |

**تصویر:** Pollinations (`image.pollinations.ai`) — رایگان، بدون کلید
**صدا→متن:** Groq Whisper از مسیر `/api/stt`

---

# 📊 سهمیه‌ها

| مورد | مقدار | متغیر در کد |
|---|---|---|
| هر کاربر روزانه | ۲۵ | `IP_DAY` |
| هر دستگاه روزانه | ۲۵ | `DEV_DAY` |
| سقف کل روزانه | ۹۰۰ | `CAP` |
| کاربران جدید ناشناس | ۶۰ | `NEWMAX` |
| فاصلهٔ بین دو پیام | ۱.۲ ثانیه | `GAP` |
| هر کاربر در دقیقه | ۸ | `IP_MIN` |
| کل در دقیقه | ۱۵ | `RPM` |

خط اول `gh/worker/index.js` را عوض کنی، همه تغییر می‌کنند.

**محافظت در برابر دور زدن:**

| روش | نتیجه |
|---|---|
| مرورگر دیگر | ❌ مسدود |
| حالت ناشناس | ❌ مسدود |
| پاک کردن حافظه | ❌ مسدود |
| «پاک کردن همه اطلاعات» | ❌ مسدود |
| خاموش/روشن دیتا | ❌ مسدود (شناسهٔ دستگاه) |
| VPN + پاک کردن کامل | ⚠️ رد می‌شود، ولی سقف کل جلویش را می‌گیرد |

---

# ✅ کارهای انجام‌شده

- طراحی جدید (صفحهٔ تنظیمات، نوار بالا، ناوبری ۳ تبی)
- حذف کامل کلیدها از HTML → انتقال به Cloudflare Secret
- زنجیرهٔ ۵ سرویسی با سوییچ خودکار
- PWA: قابل نصب، تمام‌صفحه، آفلاین
- **باگ تاریخچه** (رکورد تکراری) → رفع
- **باگ شارژ با پاک کردن اطلاعات** → رفع
- **باگ شارژ با باز کردن دوباره سایت** → رفع
- شمارش دائمی با KV
- انتشار خودکار سایت + Worker از GitHub

# ⏳ کارهای باقی‌مانده

- [ ] **ساخت APK** — pwabuilder.com → آدرس سایت → Package → Android
- [ ] عوض کردن کلید Groq (لو رفته بود)
- [ ] حذف توکن‌های بی‌مصرف Cloudflare
- [ ] محدود کردن دامنه در Worker: `const OK=['https://aichat-app-53x.pages.dev'];`
- [ ] بررسی زبان‌ها در تنظیمات (کاربر گفته بود کار نمی‌کند)

---

# ⚠️ اشتباهاتی که تکرار نشوند

| موضوع | نکته |
|---|---|
| Cloudflare API از سندباکس | ❌ کار نمی‌کند (احراز هویت رد می‌شود) — فقط GitHub |
| توکن `cfat_` | ۴۸ حرف بعد از پیشوند **طبیعی است** |
| `gemini-2.5-*` | ۴۰۴ — برای کاربران جدید حذف شده |
| `*-lite` + `thinkingConfig` | خطا می‌دهد؛ باید حذف شود (تابع `geminiGenCfg`) |
| Gemini بدون `thinkingBudget` | پاسخ خالی با `MAX_TOKENS` |
| تصویر با Gemini | ۴۲۹ روی پلن رایگان — از Pollinations استفاده کن |
| مخزن خالی GitHub | API گیت کار نمی‌کند؛ اول یک فایل با Contents API بساز |
| `wrangler deploy` | بایندینگ داشبورد را پاک می‌کند — باید در `wrangler.toml` باشد |
| `node --check` | Node 20 است؛ wrangler محلی نصب نکن (Node 22 می‌خواهد) |

---

# 🔄 برای ادامه در چت جدید

۱. این فایل را آپلود کن
۲. اگر پوشهٔ `gh/` را نداری، از GitHub بگیر:
   `https://github.com/ggg911196-sudo/aichat`
۳. توکن GitHub را در `~/.secrets/gh` بگذار:
   ```
   GH_TOKEN=github_pat_...
   GH_REPO=ggg911196-sudo/aichat
   ```
۴. `push.py` را از مخزن یا از نو بساز
۵. بعد از هر تغییر: `python3 push.py "توضیح"`

**بررسی سلامت:**
```bash
curl https://aichat-proxy.ggg911196.workers.dev/api/health
# انتظار: {"ok":1,...,"globalCap":900,"yourCap":25,"left":25}
```
