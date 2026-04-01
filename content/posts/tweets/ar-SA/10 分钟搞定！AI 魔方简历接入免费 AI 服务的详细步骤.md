---
url: /ar-SA/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10 دقائق فقط! خطوات تفصيلية لدمج خدمات الذكاء الاصطناعي المجانية في سيرة الذكاء الاصطناعي السحرية
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  يرشدك هذا البرنامج التعليمي إلى تكوين خدمات الذكاء الاصطناعي المجانية مثل OpenRouter في سيرة الذكاء الاصطناعي السحرية.

categories:
  - tweets

tags:
  - سيرة الذكاء الاصطناعي السحرية
  - cmdragon
  - خدمات الذكاء الاصطناعي المجانية
  - تكوين خدمات الذكاء الاصطناعي
  - مفتاح API
  - موارد البرنامج التعليمي
  - الأدوات عبر الإنترنت

---

## الخطوة الأولى: الوصول إلى سيرة الذكاء الاصطناعي السحرية

افتح موقع سيرة الذكاء الاصطناعي السحرية:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

اختر خيار **"موفر خدمة الذكاء الاصطناعي"** في شريط التنقل الأيسر.

![اختيار موفر خدمة الذكاء الاصطناعي](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## الخطوة الثانية: الحصول على مفتاح API من OpenRouter

### 2.1 فتح الموقع الرسمي لـ OpenRouter (OpenRouter كمثال)

في صفحة تكوين موفر خدمة الذكاء الاصطناعي، انقر على زر **"الحصول على مفتاح API"**.

![انقر للحصول على مفتاح API](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

سيفتح النظام الموقع الرسمي لـ OpenRouter في علامة تبويب جديدة:

![الموقع الرسمي لـ OpenRouter](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 التسجيل/تسجيل الدخول

- **لديك حساب بالفعل**: قم بتسجيل الدخول مباشرة
- **ليس لديك حساب**: انقر على تسجيل

> 💡 **تلميح**
> : إذا كنت لا ترغب في استخدام بريدك الإلكتروني المعتاد، يمكنك استخدام [خدمة البريد الإلكتروني المؤقتة لموقعنا](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (تأكد من أن OpenRouter يدعم البريد الإلكتروني المؤقت).

![خدمة البريد الإلكتروني المؤقت](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![تسجيل حساب](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 إنشاء مفتاح API

بعد تسجيل الدخول، اتبع المسار التالي:

1. انقر على **"Settings"** في شريط التنقل العلوي
2. اختر **"API Keys"** من القائمة اليسرى
3. انقر على زر **"Create API Key"**

![صفحة الإعدادات](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![إدارة مفاتيح API](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![إنشاء مفتاح API](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 نسخ مفتاح API

- انسخ سلسلة المفتاح التي تبدأ بـ `sk-`
- **مهم**: يرجى حفظ هذا المفتاح بشكل آمن، لا يمكن عرض المفتاح الكامل مرة أخرى لاحقًا

---

## الخطوة الثالثة: تكوين سيرة الذكاء الاصطناعي السحرية

عد إلى صفحة تكوين سيرة الذكاء الاصطناعي السحرية، واملأ المعلومات التالية:

| الحقل          | المحتوى                           |
|-------------|--------------------------------|
| **مفتاح API** | المفتاح الذي نسخته والذي يبدأ بـ `sk-`              |
| **اسم الموفر**   | `openrouter`                   |
| **نقطة نهاية API**  | `https://openrouter.ai/api/v1` |
| **معرف النموذج**   | اختر نموذجًا مجانيًا (انظر الخطوة التالية)                   |

![ملء معلومات التكوين](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## الخطوة الرابعة: اختيار نموذج مجاني

### 4.1 البحث عن النماذج المجانية

في الموقع الرسمي لـ OpenRouter، أدخل **`free`** في مربع بحث النماذج لتصفية جميع النماذج المجانية.

![البحث عن النماذج المجانية](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![نسخ معرف النموذج](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 نسخ معرف النموذج

اختر أي نموذج مجاني، وانسخ المعرف الكامل (بصيغة مثل: `google/gemma-3-27b-it:free`).

> ⚠️ **ملاحظة**: النماذج المجانية لها حدود في عدد الاستخدامات، وليست مجانية غير محدودة.

---

## الخطوة الخامسة: البدء في الاستخدام

بعد اكتمال التكوين، يمكنك استخدام نموذج الذكاء الاصطناعي لتحرير سيرتك الذاتية.

![اكتمل التكوين](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![تحرير السيرة الذاتية](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![صورة](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![عرض ميزات الذكاء الاصطناعي](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![النتائج المُنشأة](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## الخطوة السادسة: تصدير وطباعة السيرة الذاتية

### تصدير سيرة ذاتية بصيغة PDF

انقر على زر **"تصدير السيرة الذاتية"**، وسيقوم النظام تلقائيًا بإنشاء ملف سيرة ذاتية بصيغة PDF قياسية.

![تصدير السيرة الذاتية](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**طرق التصدير**:

- **التصدير من الخادم**: إنشاء ملف PDF مباشرة على الخادم، لضمان تنسيق موحد وتخطيط رائع، يمكن استخدامه بعد التنزيل
  ![صورة](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **الطباعة عبر المتصفح**: استدعاء وظيفة الطباعة الأصلية للمتصفح، يمكن توصيلها بالطابعة لإخراج نسخ ورقية مباشرة
  ![صورة](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**سيناريوهات الاستخدام**:

- 📄 **الإصدار الإلكتروني**: للإرسال عبر الإنترنت وإرسال البريد الإلكتروني والمشاركة عبر WeChat وما إلى ذلك
- 🖨️ **النسخة الورقية**: للمقابلات الشخصية ومعارض التوظيف وغيرها من السيناريوهات غير المتصلة بالإنترنت

**تلميح**: يوصى بمعاينة تأثير PDF قبل الإرسال، للتأكد من اكتمال ودقة المعلومات الرئيسية مثل معلومات الاتصال وخبرات المشروع.

---

## الأسئلة الشائعة

### رمز الخطأ 429: قيود معدل الطلبات

إذا واجهت الخطأ التالي:

![قيود المعدل](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

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

**معنى الخطأ**: النموذج المجاني المستخدم وصل إلى حد معدل الوصول.

**الحلول**:

1. **انتظر وحاول مرة أخرى**: الحد من النماذج المجانية مؤقت، عادةً انتظر بضع دقائق إلى ساعات أو حتى أطول.
2. **تغيير النموذج**: جرب نماذج مجانية أخرى
3. **استخدم نموذجًا مدفوعًا**: احق لاحقة `:free` من معرف النموذج، واستخدم الإصدار المدفوع، يتطلب إعادة شحن
4. **اربط مفتاح API الخاص بك**: اربط مفتاح Google AI Studio API الخاص بك في إعدادات OpenRouter، لاستخدام حصة مستقلة

---

## تنبيهات الأمان

- **مفتاح API معلومات حساسة**، يرجى عدم مشاركته مع الآخرين
- يوصى بحفظ مفتاح API في مكان آمن (مثل مدير كلمات المرور)
- إذا اشتبهت في تسرب المفتاح، يرجى حذفه وإعادة إنشائه فورًا في لوحة تحكم OpenRouter

---

## موارد ذات صلة

- [الموقع الرسمي لـ OpenRouter](https://openrouter.ai): https://openrouter.ai
- [قائمة نماذج OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [خدمة البريد الإلكتروني المؤقت](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [مولد كلمات المرور](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [عنوان المكافأة](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [اتصل بنا](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**اكتمل البرنامج التعليمي!** يمكنك الآن استخدام نموذج الذكاء الاصطناعي المُكون لتحسين وتحرير سيرتك الذاتية.
