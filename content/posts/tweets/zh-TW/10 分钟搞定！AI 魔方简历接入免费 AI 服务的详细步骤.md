---
url: /zh-TW/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10 分鐘搞定！AI 魔方履歷接入免費 AI 服務的詳細步驟
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  本教程將引導您在 AI 魔方履歷中配置免費的 AI 服務，如 OpenRouter。

categories:
  - tweets

tags:
  - AI 魔方履歷
  - cmdragon
  - 免費 AI 服務
  - 配置 AI 服務
  - API Key
  - 教程資源
  - 在線工具

---

## 第一步：訪問 AI 魔方履歷

打開 AI 魔方履歷網站：  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

在左側導航欄選擇 **"AI 服務商"** 選項。

![選擇 AI 服務商](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## 第二步：獲取 OpenRouter API Key

### 2.1 打開 OpenRouter 官網（以 OpenRouter 為例）

在 AI 服務商配置頁面，點擊 **"獲取 API Key"** 按鈕。

![點擊獲取 API Key](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

系統將在新標籤頁中打開 OpenRouter 官網：

![OpenRouter 官網](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 註冊/登錄賬號

- **已有賬號**：直接登錄
- **沒有賬號**：點擊註冊

> 💡 **提示**
> ：如果不想使用常用郵箱，可使用 [我們網站的臨時郵箱服務](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email（需確保 OpenRouter 支持臨時郵箱）。

![臨時郵箱服務](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![註冊賬號](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 創建 API Key

登錄後，按以下路徑操作：

1. 點擊頂部導航欄的 **"Settings"**
2. 選擇左側菜單的 **"API Keys"**
3. 點擊 **"Create API Key"** 按鈕

![Settings 頁面](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![API Keys 管理](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![創建 API Key](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 複製 API Key

- 複製以 `sk-` 開頭的密鑰字符串
- **重要**：請妥善保存此密鑰，後續無法再次查看完整密鑰

---

## 第三步：配置 AI 魔方履歷

回到 AI 魔方履歷配置頁面，填寫以下信息：

| 字段          | 填寫內容                           |
|-------------|--------------------------------|
| **API Key** | 剛才複製的 `sk-` 開頭的密鑰              |
| **提供商名稱**   | `openrouter`                   |
| **API 端點**  | `https://openrouter.ai/api/v1` |
| **模型 ID**   | 選擇免費模型（見下一步）                   |

![填寫配置信息](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## 第四步：選擇免費模型

### 4.1 查找免費模型

在 OpenRouter 官網的模型搜索框中輸入 **`free`**，即可篩選出所有免費模型。

![搜索免費模型](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![複製模型 ID](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 複製模型 ID

選擇任意免費模型，複製其完整 ID（格式如：`google/gemma-3-27b-it:free`）。

> ⚠️ **注意**：免費模型有使用次數限制，並非無限免費。

---

## 第五步：開始使用

配置完成後，即可使用 AI 模型編輯履歷。

![配置完成](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![編輯履歷](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![圖片](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![AI 功能展示](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![生成結果](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## 第六步：履歷導出與打印

### 導出 PDF 履歷

點擊 **"導出履歷"** 按鈕，系統將自動生成標準 PDF 格式的履歷文件。

![導出履歷](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**導出方式**：

- **服務端導出**：直接在服務器端生成 PDF 文件，確保格式統一、排版精美，下載後即可使用
  ![圖片](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **瀏覽器打印**：調用瀏覽器原生打印功能，可連接打印機直接輸出紙質履歷
  ![圖片](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**使用場景**：

- 📄 **電子版**：用於在線投遞、郵件發送、微信分享等
- 🖨️ **紙質版**：用於面試現場、招聘會等線下場景

**提示**：建議在投遞前預覽 PDF 效果，確保聯繫方式、項目經歷等關鍵信息完整準確。

---

## 常見問題

### 錯誤代碼 429：請求頻率限制

如果遇到以下錯誤提示：

![頻率限制錯誤](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**錯誤含義**：當前使用的免費模型已達到訪問頻率限制。

**解決方案**：

1. **等待後重試**：免費模型限流是暫時的，通常等待幾分鐘至幾小時甚至更久。
2. **更換模型**：嘗試其他免費模型
3. **使用付費模型**：移除模型 ID 中的 `:free` 後綴，使用付費版本，需要充值
4. **綁定自有 API Key**：在 OpenRouter 設置中綁定自己的 Google AI Studio API Key，使用獨立配額

---

## 安全提示

- **API Key 是敏感信息**，請勿分享給他人
- 建議將 API Key 保存在安全的位置（如密碼管理器）
- 如懷疑密鑰洩露，請立即在 OpenRouter 後台刪除並重新創建

---

## 相關資源

- [OpenRouter 官網](https://openrouter.ai)：https://openrouter.ai
- [OpenRouter 模型列表](https://openrouter.ai/models)：https://openrouter.ai/models
- [臨時郵箱服務](https://tools.cmdragon.cn/zh/apps/temp-email)：https://tools.cmdragon.cn/zh/apps/temp-email
- [密碼生成器](https://tools.cmdragon.cn/zh/apps/password-generator)：https://tools.cmdragon.cn/zh/apps/password-generator
- [打賞地址](https://tools.cmdragon.cn/zh/sponsor)：https://tools.cmdragon.cn/zh/sponsor
- [聯繫我們](mailto:contact@cmdragon.cn)：mailto:contact@cmdragon.cn

---

**教程完成！** 現在你可以使用配置好的 AI 模型來優化和編輯履歷了。
