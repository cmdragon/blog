---
url: /fa/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: انجام شده در 10 دقیقه! مراحل دقیق اتصال AI Magic Resume به خدمات هوش مصنوعی رایگان
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  این آموزش شما را برای پیکربندی خدمات هوش مصنوعی رایگان مانند OpenRouter در AI Magic Resume راهنمایی می‌کند.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - خدمات هوش مصنوعی رایگان
  - پیکربندی خدمات هوش مصنوعی
  - کلید API
  - منابع آموزشی
  - ابزارهای آنلاین

---

## مرحله 1: دسترسی به AI Magic Resume

وب‌سایت AI Magic Resume را باز کنید:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

گزینه **"ارائه‌دهنده هوش مصنوعی"** را در نوار پیمایش سمت چپ انتخاب کنید.

![انتخاب ارائه‌دهنده هوش مصنوعی](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## مرحله 2: دریافت کلید API OpenRouter

### 2.1 باز کردن وب‌سایت OpenRouter (با استفاده از OpenRouter به عنوان مثال)

در صفحه پیکربندی ارائه‌دهنده هوش مصنوعی، روی دکمه **"دریافت کلید API"** کلیک کنید.

![برای دریافت کلید API کلیک کنید](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

سیستم وب‌سایت رسمی OpenRouter را در یک تب جدید باز می‌کند:

![وب‌سایت رسمی OpenRouter](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 ثبت‌نام/ورود

- **از قبل حساب دارید**: مستقیماً وارد شوید
- **حساب ندارید**: روی ثبت‌نام کلیک کنید

> 💡 **نکته**
> : اگر نمی‌خواهید از ایمیل معمولی خود استفاده کنید، می‌توانید از [سرویس ایمیل موقت ما](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email استفاده کنید (مطمئن شوید که OpenRouter از ایمیل موقت پشتیبانی می‌کند).

![سرویس ایمیل موقت](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![ثبت‌نام حساب](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 ایجاد کلید API

پس از ورود، این مسیر را دنبال کنید:

1. روی **"Settings"** در نوار پیمایش بالا کلیک کنید
2. **"API Keys"** را از منوی سمت چپ انتخاب کنید
3. روی دکمه **"Create API Key"** کلیک کنید

![صفحه تنظیمات](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![مدیریت کلیدهای API](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![ایجاد کلید API](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 کپی کردن کلید API

- رشته کلید که با `sk-` شروع می‌شود را کپی کنید
- **مهم**: لطفاً این کلید را به طور ایمن ذخیره کنید، بعداً نمی‌توانید کلید کامل را دوباره مشاهده کنید

---

## مرحله 3: پیکربندی AI Magic Resume

به صفحه پیکربندی AI Magic Resume بازگردید و اطلاعات زیر را پر کنید:

| فیلد          | محتوا                           |
|-------------|--------------------------------|
| **کلید API** | کلیدی که کپی کردید و با `sk-` شروع می‌شود              |
| **نام ارائه‌دهنده**   | `openrouter`                   |
| **نقطه پایانی API**  | `https://openrouter.ai/api/v1` |
| **شناسه مدل**   | یک مدل رایگان انتخاب کنید (مرحله بعد را ببینید)                   |

![پر کردن اطلاعات پیکربندی](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## مرحله 4: انتخاب مدل رایگان

### 4.1 یافتن مدل‌های رایگان

در وب‌سایت OpenRouter، **`free`** را در کادر جستجوی مدل وارد کنید تا تمام مدل‌های رایگان را فیلتر کنید.

![جستجوی مدل‌های رایگان](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![کپی کردن شناسه مدل](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 کپی کردن شناسه مدل

هر مدل رایگانی را انتخاب کنید و شناسه کامل آن را کپی کنید (فرمت مانند: `google/gemma-3-27b-it:free`).

> ⚠️ **توجه**: مدل‌های رایگان دارای محدودیت استفاده هستند و نامحدود رایگان نیستند.

---

## مرحله 5: شروع به استفاده

پس از تکمیل پیکربندی، می‌توانید از مدل هوش مصنوعی برای ویرایش رزومه خود استفاده کنید.

![پیکربندی تکمیل شد](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![ویرایش رزومه](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![تصویر](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![نمایش ویژگی‌های هوش مصنوعی](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![نتایج تولید شده](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## مرحله 6: صادرات و چاپ رزومه

### صادرات رزومه PDF

روی دکمه **"صادرات رزومه"** کلیک کنید، سیستم به طور خودکار یک فایل رزومه با فرمت PDF استاندارد تولید می‌کند.

![صادرات رزومه](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**روش‌های صادرات**:

- **صادرات سرور**: تولید فایل PDF مستقیماً روی سرور، اطمینان از فرمت یکسان و چیدمان زیبا، آماده استفاده پس از دانلود
  ![تصویر](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **چاپ مرورگر**: فراخوانی عملکرد چاپ بومی مرورگر، می‌تواند به چاپگر متصل شود تا مستقیماً کپی‌های کاغذی را خروجی دهد
  ![تصویر](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**سناریوهای استفاده**:

- 📄 **نسخه الکترونیکی**: برای ارسال آنلاین، ارسال ایمیل، اشتراک‌گذاری WeChat و غیره
- 🖨️ **نسخه کاغذی**: برای مصاحبه‌ها، نمایشگاه‌های شغلی و سایر سناریوهای آفلاین

**نکته**: توصیه می‌شود قبل از ارسال، اثر PDF را پیش‌نمایش کنید، تا اطمینان حاصل شود که اطلاعات کلیدی مانند اطلاعات تماس و تجربیات پروژه کامل و دقیق است.

---

## سؤالات متداول

### کد خطای 429: محدودیت نرخ درخواست

اگر با خطای زیر مواجه شدید:

![محدودیت نرخ](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

```json
{
  "error": {
    "message": "Provider returned Error",
    "code": 429,
    "metadata": {
      "raw": "google/gemma-3-27b-it:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations",
      "provider_name": "Google AI Studio",
      "is_byok": false
    }
  },
  "user_id": "user_2vDtkMeeWdLNDw24VQIEI0SunB3"
}
```

**معنای خطا**: مدل رایگان مورد استفاده به محدودیت نرخ دسترسی رسیده است.

**راه‌حل‌ها**:

1. **صبر کنید و دوباره امتحان کنید**: محدودیت برای مدل‌های رایگان موقتی است، معمولاً چند دقیقه تا چند ساعت یا حتی بیشتر صبر کنید.
2. **تغییر مدل**: مدل‌های رایگان دیگر را امتحان کنید
3. **استفاده از مدل پولی**: پسوند `:free` را از شناسه مدل حذف کنید و از نسخه پولی استفاده کنید، نیاز به شارژ دارد
4. **متصل کردن کلید API خودتان**: کلید API Google AI Studio خودتان را در تنظیمات OpenRouter متصل کنید تا از سهمیه مستقل استفاده کنید

---

## نکات امنیتی

- **کلید API اطلاعات حساس است**، لطفاً آن را با دیگران به اشتراک نگذارید
- توصیه می‌شود کلید API را در مکان امنی ذخیره کنید (مانند مدیر رمز عبور)
- اگر به نشت کلید مشکوک هستید، لطفاً فوراً آن را در بک‌اند OpenRouter حذف کرده و دوباره ایجاد کنید

---

## منابع مرتبط

- [وب‌سایت رسمی OpenRouter](https://openrouter.ai): https://openrouter.ai
- [فهرست مدل‌های OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [سرویس ایمیل موقت](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [تولیدکننده رمز عبور](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [آدرس حمایت](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [تماس با ما](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**آموزش تکمیل شد!** اکنون می‌توانید از مدل هوش مصنوعی پیکربندی شده برای بهینه‌سازی و ویرایش رزومه خود استفاده کنید.
