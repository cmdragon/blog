---
url: /en/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10 Minutes Done! Detailed Steps to Connect Free AI Services to AI Magic Resume
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  This tutorial will guide you through configuring free AI services like OpenRouter in AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Free AI Services
  - Configure AI Services
  - API Key
  - Tutorial Resources
  - Online Tools

---

## Step 1: Access AI Magic Resume

Open the AI Magic Resume website:
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Select the **"AI Service Providers"** option in the left navigation bar.

![Select AI Service Provider](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## Step 2: Get OpenRouter API Key

### 2.1 Open OpenRouter Official Website (Taking OpenRouter as an Example)

On the AI service provider configuration page, click the **"Get API Key"** button.

![Click to Get API Key](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

The system will open the OpenRouter official website in a new tab:

![OpenRouter Official Website](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Register/Login Account

- **Existing account**: Log in directly
- **No account**: Click to register

> 💡 **Tip**
> : If you don't want to use your regular email, you can use [our website's temporary email service](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (make sure OpenRouter supports temporary emails).

![Temporary Email Service](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![Register Account](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Create API Key

After logging in, follow these steps:

1. Click **"Settings"** in the top navigation bar
2. Select **"API Keys"** from the left menu
3. Click the **"Create API Key"** button

![Settings Page](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![API Keys Management](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![Create API Key](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Copy API Key

- Copy the key string starting with `sk-`
- **Important**: Please keep this key safe, as you won't be able to view the complete key again later

---

## Step 3: Configure AI Magic Resume

Return to the AI Magic Resume configuration page and fill in the following information:

| Field | Content |
|-------|---------|
| **API Key** | The `sk-`开头 key you just copied |
| **Provider Name** | `openrouter` |
| **API Endpoint** | `https://openrouter.ai/api/v1` |
| **Model ID** | Select a free model (see next step) |

![Fill in Configuration Information](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## Step 4: Select Free Model

### 4.1 Find Free Models

Enter **`free`** in the model search box on the OpenRouter official website to filter all free models.

![Search Free Models](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![Copy Model ID](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Copy Model ID

Select any free model and copy its complete ID (format example: `google/gemma-3-27b-it:free`).

> ⚠️ **Note**: Free models have usage limits and are not unlimited free.

---

## Step 5: Start Using

After configuration, you can use the AI model to edit your resume.

![Configuration Complete](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![Edit Resume](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![image](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![AI Functionality Demo](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![Generated Result](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## Step 6: Resume Export and Printing

### Export PDF Resume

Click the **"Export Resume"** button, and the system will automatically generate a standard PDF format resume file.

![Export Resume](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**Export Methods**:

- **Server-side Export**: Generate PDF files directly on the server to ensure unified format and beautiful typesetting, ready to use after download
  ![image](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **Browser Printing**: Call the browser's native printing function, which can connect to a printer to directly output paper resumes
  ![image](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**Usage Scenarios**:

- 📄 **Electronic version**: For online delivery, email sending, WeChat sharing, etc.
- 🖨️ **Paper version**: For offline scenarios such as interview sites, job fairs, etc.

**Tip**: It is recommended to preview the PDF effect before delivery to ensure that key information such as contact information and project experience is complete and accurate.

---

## Common Issues

### Error Code 429: Request Rate Limit

If you encounter the following error message:

![Rate Limit Error](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Error Meaning**: The free model currently being used has reached the access frequency limit.

**Solutions**:

1. **Wait and Retry**: Free model throttling is temporary, usually waiting a few minutes to hours or even longer.
2. **Change Model**: Try other free models
3. **Use Paid Model**: Remove the `:free` suffix from the model ID and use the paid version, which requires payment
4. **Bind Own API Key**: Bind your own Google AI Studio API Key in OpenRouter settings to use independent quota

---

## Security Tips

- **API Key is sensitive information**, do not share it with others
- It is recommended to save the API Key in a safe location (such as a password manager)
- If you suspect the key is leaked, please immediately delete and recreate it in the OpenRouter background

---

## Related Resources

- [OpenRouter Official Website](https://openrouter.ai): https://openrouter.ai
- [OpenRouter Model List](https://openrouter.ai/models): https://openrouter.ai/models
- [Temporary Email Service](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Password Generator](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Donation Address](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Contact Us](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Tutorial Complete!** Now you can use the configured AI model to optimize and edit your resume.