---
url: /uk-UA/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: Готово за 10 хвилин! Детальні кроки підключення AI Magic Resume до безкоштовних сервісів ШІ
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Цей посібник допоможе вам налаштувати безкоштовні сервіси ШІ, такі як OpenRouter, у вашому AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Безкоштовні сервіси ШІ
  - Налаштувати сервіс ШІ
  - API-ключ
  - Ресурси посібника
  - Онлайн-інструменти

---

## Крок 1: Доступ до AI Magic Resume

Відкрийте веб-сайт AI Magic Resume:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Виберіть опцію **"Постачальник ШІ"** в лівій панелі навігації.

![Вибрати постачальника ШІ](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## Крок 2: Отримання API-ключа OpenRouter

### 2.1 Відкрити веб-сайт OpenRouter (на прикладі OpenRouter)

На сторінці налаштування постачальника ШІ натисніть кнопку **"Отримати API-ключ"**.

![Натисніть, щоб отримати API-ключ](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

Система відкриє офіційний веб-сайт OpenRouter у новій вкладці:

![Офіційний веб-сайт OpenRouter](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Реєстрація/Вхід

- **Вже є обліковий запис**: Увійдіть безпосередньо
- **Немає облікового запису**: Натисніть зареєструватися

> 💡 **Порада**
> : Якщо ви не хочете використовувати свою звичайну електронну пошту, ви можете скористатися нашим [сервісом тимчасової електронної пошти](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (переконайтеся, що OpenRouter підтримує тимчасову електронну пошту).

![Сервіс тимчасової електронної пошти](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![Зареєструвати обліковий запис](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Створити API-ключ

Після входу в систему дотримуйтесь цього шляху:

1. Натисніть **"Settings"** у верхній панелі навігації
2. Виберіть **"API Keys"** у лівому меню
3. Натисніть кнопку **"Create API Key"**

![Сторінка налаштувань](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![Управління API-ключами](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![Створити API-ключ](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Копіювати API-ключ

- Скопіюйте рядок ключа, який починається з `sk-`
- **Важливо**: Будь ласка, збережіть цей ключ у безпечному місці, ви не зможете переглянути повний ключ пізніше

---

## Крок 3: Налаштування AI Magic Resume

Поверніться на сторінку налаштування AI Magic Resume і заповніть наступну інформацію:

| Поле          | Вміст                           |
|-------------|--------------------------------|
| **API-ключ** | Ключ, який ви скопіювали і починається з `sk-`              |
| **Ім'я постачальника**   | `openrouter`                   |
| **Кінцева точка API**  | `https://openrouter.ai/api/v1` |
| **ID моделі**   | Виберіть безкоштовну модель (див. наступний крок)                   |

![Заповнити інформацію про налаштування](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## Крок 4: Вибір безкоштовної моделі

### 4.1 Знайти безкоштовні моделі

На веб-сайті OpenRouter введіть **`free`** у полі пошуку моделей, щоб відфільтрувати всі безкоштовні моделі.

![Пошук безкоштовних моделей](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![Копіювати ID моделі](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Копіювати ID моделі

Виберіть будь-яку безкоштовну модель і скопіюйте її повний ID (формат як: `google/gemma-3-27b-it:free`).

> ⚠️ **Примітка**: Безкоштовні моделі мають обмеження щодо використання і не є необмеженими.

---

## Крок 5: Початок використання

Після завершення налаштування ви можете використовувати модель ШІ для редагування свого резюме.

![Налаштування завершено](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![Редагувати резюме](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![Зображення](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![Відображення функцій ШІ](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![Згенеровані результати](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## Крок 6: Експорт та друк резюме

### Експорт резюме у PDF

Натисніть кнопку **"Експортувати резюме"**, система автоматично створить файл резюме у стандартному форматі PDF.

![Експортувати резюме](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**Способи експорту**:

- **Експорт з сервера**: Створення PDF-файлу безпосередньо на сервері, забезпечення уніфікованого формату і гарного макету, готово до використання після завантаження
  ![Зображення](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **Друк у браузері**: Викликає власну функцію друку браузера, може підключатися до принтера для безпосереднього виводу паперових копій
  ![Зображення](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**Сценарії використання**:

- 📄 **Електронна версія**: Для онлайн-подання, надсилання електронною поштою, поширення у WeChat тощо
- 🖨️ **Паперова версія**: Для співбесід, ярмарків вакансій та інших офлайн-сценаріїв

**Порада**: Рекомендується попередньо переглянути ефект PDF перед поданням, щоб переконатися, що ключова інформація, така як контактна інформація та досвід проектів, є повною і точною.

---

## Часті запитання

### Код помилки 429: Обмеження частоти запитів

Якщо ви зіткнулися з наступною помилкою:

![Обмеження частоти](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Значення помилки**: Модель, яка використовується, досягла обмеження частоти доступу.

**Рішення**:

1. **Зачекати і повторити спробу**: Обмеження для безкоштовних моделей є тимчасовим, зазвичай зачекайте від кількох хвилин до годин або навіть довше.
2. **Змінити модель**: Спробуйте інші безкоштовні моделі
3. **Використовувати платну модель**: Видаліть суфікс `:free` з ID моделі і використовуйте платну версію, потрібно поповнення
4. **Прив'язати свій API-ключ**: Прив'яжіть свій власний API-ключ Google AI Studio в налаштуваннях OpenRouter для використання незалежної квоти

---

## Поради щодо безпеки

- **API-ключ є конфіденційною інформацією**, будь ласка, не діліться ним з іншими
- Рекомендується зберігати API-ключ у безпечному місці (наприклад, у менеджері паролів)
- Якщо ви підозрюєте витік ключа, будь ласка, негайно видаліть його і створіть заново в бекенді OpenRouter

---

## Пов'язані ресурси

- [Офіційний веб-сайт OpenRouter](https://openrouter.ai): https://openrouter.ai
- [Список моделей OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [Сервіс тимчасової електронної пошти](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Генератор паролів](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Адреса для спонсорства](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Зв'яжіться з нами](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Посібник завершено!** Тепер ви можете використовувати налаштовану модель ШІ для оптимізації та редагування свого резюме.
