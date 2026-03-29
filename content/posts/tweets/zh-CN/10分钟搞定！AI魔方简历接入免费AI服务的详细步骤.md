---
url: /posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10分钟搞定！AI魔方简历接入免费AI服务的详细步骤
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  本教程将引导您在 AI 魔方简历中配置免费的 AI 服务，如 OpenRouter。

categories:
  - tweets

tags:
  - AI 魔方简历
  - cmdragon
  - 免费AI服务
  - 配置AI服务
  - API Key
  - 教程资源
  - 在线工具

---

## 第一步：访问 AI 魔方简历

打开 AI 魔方简历网站：  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

在左侧导航栏选择 **"AI 服务商"** 选项。

![选择 AI 服务商](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## 第二步：获取 OpenRouter API Key

### 2.1 打开 OpenRouter 官网（以OpenRouter为例）

在 AI 服务商配置页面，点击 **"获取 API Key"** 按钮。

![点击获取 API Key](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

系统将在新标签页中打开 OpenRouter 官网：

![OpenRouter 官网](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 注册/登录账号

- **已有账号**：直接登录
- **没有账号**：点击注册

> 💡 **提示**
> ：如果不想使用常用邮箱，可使用 [我们网站的临时邮箱服务](https://tools.cmdragon.cn/zh/apps/temp-email)https://tools.cmdragon.cn/zh/apps/temp-email（需确保
> OpenRouter 支持临时邮箱）。

![临时邮箱服务](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![注册账号](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 创建 API Key

登录后，按以下路径操作：

1. 点击顶部导航栏的 **"Settings"**
2. 选择左侧菜单的 **"API Keys"**
3. 点击 **"Create API Key"** 按钮

![Settings 页面](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![API Keys 管理](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![创建 API Key](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 复制 API Key

- 复制以 `sk-` 开头的密钥字符串
- **重要**：请妥善保存此密钥，后续无法再次查看完整密钥

---

## 第三步：配置 AI 魔方简历

回到 AI 魔方简历配置页面，填写以下信息：

| 字段          | 填写内容                           |
|-------------|--------------------------------|
| **API Key** | 刚才复制的 `sk-` 开头的密钥              |
| **提供商名称**   | `openrouter`                   |
| **API 端点**  | `https://openrouter.ai/api/v1` |
| **模型 ID**   | 选择免费模型（见下一步）                   |

![填写配置信息](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## 第四步：选择免费模型

### 4.1 查找免费模型

在 OpenRouter 官网的模型搜索框中输入 **`free`**，即可筛选出所有免费模型。

![搜索免费模型](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![复制模型 ID](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 复制模型 ID

选择任意免费模型，复制其完整 ID（格式如：`google/gemma-3-27b-it:free`）。

> ⚠️ **注意**：免费模型有使用次数限制，并非无限免费。

---

## 第五步：开始使用

配置完成后，即可使用 AI 模型编辑简历。

![配置完成](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![编辑简历](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![image](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![AI 功能展示](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![生成结果](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## 第六步：简历导出与打印

### 导出 PDF 简历

点击 **"导出简历"** 按钮，系统将自动生成标准 PDF 格式的简历文件。

![导出简历](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**导出方式**：

- **服务端导出**：直接在服务器端生成 PDF 文件，确保格式统一、排版精美，下载后即可使用
  ![image](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **浏览器打印**：调用浏览器原生打印功能，可连接打印机直接输出纸质简历
  ![image](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**使用场景**：

- 📄 **电子版**：用于在线投递、邮件发送、微信分享等
- 🖨️ **纸质版**：用于面试现场、招聘会等线下场景

**提示**：建议在投递前预览 PDF 效果，确保联系方式、项目经历等关键信息完整准确。

---

## 常见问题

### 错误代码 429：请求频率限制

如果遇到以下错误提示：

![频率限制错误](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**错误含义**：当前使用的免费模型已达到访问频率限制。

**解决方案**：

1. **等待后重试**：免费模型限流是暂时的，通常等待几分钟至几小时甚至更久。
2. **更换模型**：尝试其他免费模型
3. **使用付费模型**：移除模型 ID 中的 `:free` 后缀，使用付费版本，需要充值
4. **绑定自有 API Key**：在 OpenRouter 设置中绑定自己的 Google AI Studio API Key，使用独立配额

---

## 安全提示

- **API Key 是敏感信息**，请勿分享给他人
- 建议将 API Key 保存在安全的位置（如密码管理器）
- 如怀疑密钥泄露，请立即在 OpenRouter 后台删除并重新创建

---

## 相关资源

- [OpenRouter 官网](https://openrouter.ai)：https://openrouter.ai
- [OpenRouter 模型列表](https://openrouter.ai/models)：https://openrouter.ai/models
- [临时邮箱服务](https://tools.cmdragon.cn/zh/apps/temp-email)：https://tools.cmdragon.cn/zh/apps/temp-email
- [密码生成器](https://tools.cmdragon.cn/zh/apps/password-generator)：https://tools.cmdragon.cn/zh/apps/password-generator
- [打赏地址](https://tools.cmdragon.cn/zh/sponsor)：https://tools.cmdragon.cn/zh/sponsor
- [联系我们](mailto:contact@cmdragon.cn)：mailto:contact@cmdragon.cn

---

**教程完成！** 现在你可以使用配置好的 AI 模型来优化和编辑简历了。
