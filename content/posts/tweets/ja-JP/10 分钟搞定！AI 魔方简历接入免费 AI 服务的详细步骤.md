---
url: /ja/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10 分で完了！AI マジックレジュメに無料 AI サービスを接続する詳細手順
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  このチュートリアルでは、AI マジックレジュメで OpenRouter などの無料 AI サービスを設定する方法を案内します。

categories:
  - tweets

tags:
  - AI マジックレジュメ
  - cmdragon
  - 無料 AI サービス
  - AI サービスを設定
  - API キー
  - チュートリアルリソース
  - オンラインツール

---

## ステップ 1：AI マジックレジュメにアクセス

AI マジックレジュメのウェブサイトを開きます：  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

左側のナビゲーションバーで**「AI プロバイダー」**オプションを選択します。

![AI プロバイダーを選択](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## ステップ 2：OpenRouter API キーを取得

### 2.1 OpenRouter ウェブサイトを開く（OpenRouter を例として）

AI プロバイダー設定ページで、**「API キーを取得」**ボタンをクリックします。

![API キーを取得するためにクリック](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

システムは新しいタブで OpenRouter 公式サイトを開きます：

![OpenRouter 公式サイト](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 登録/ログイン

- **すでにアカウントがある**：直接ログイン
- **アカウントがない**：登録をクリック

> 💡 **ヒント**
> : 通常のメールを使用したくない場合は、[一時メールサービス](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email を使用できます（OpenRouter が一時メールをサポートしていることを確認してください）。

![一時メールサービス](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![アカウントを登録](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 API キーを作成

ログイン後、次のパスに従います：

1. 上部のナビゲーションバーで**「Settings」**をクリック
2. 左側のメニューから**「API Keys」**を選択
3. **「Create API Key」**ボタンをクリック

![設定ページ](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![API キーを管理](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![API キーを作成](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 API キーをコピー

- `sk-` で始まるキー文字列をコピー
- **重要**：このキーは安全に保存してください。後で完全なキーを再度表示することはできません

---

## ステップ 3：AI マジックレジュメを設定

AI マジックレジュメ設定ページに戻り、次の情報を入力します：

| フィールド          | コンテンツ                           |
|-------------|--------------------------------|
| **API キー** | コピーした `sk-` で始まるキー              |
| **プロバイダー名**   | `openrouter`                   |
| **API エンドポイント**  | `https://openrouter.ai/api/v1` |
| **モデル ID**   | 無料モデルを選択（次のステップを参照）                   |

![設定情報を入力](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## ステップ 4：無料モデルを選択

### 4.1 無料モデルを検索

OpenRouter 公式サイトで、モデル検索ボックスに**`free`**と入力して、すべての無料モデルをフィルタリングします。

![無料モデルを検索](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![モデル ID をコピー](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 モデル ID をコピー

任意の無料モデルを選択し、その完全な ID をコピーします（形式：`google/gemma-3-27b-it:free`）。

> ⚠️ **注意**：無料モデルには使用制限があり、無制限に無料というわけではありません。

---

## ステップ 5：使用を開始

設定が完了したら、AI モデルを使用して履歴書を編集できます。

![設定完了](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![履歴書を編集](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![画像](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![AI 機能を表示](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![生成された結果](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## ステップ 6：履歴書のエクスポートと印刷

### PDF 履歴書をエクスポート

**「履歴書をエクスポート」**ボタンをクリックすると、システムが自動的に標準 PDF 形式の履歴書ファイルを生成します。

![履歴書をエクスポート](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**エクスポート方法**：

- **サーバーエクスポート**：サーバー上で直接 PDF ファイルを生成し、統一された形式と美しいレイアウトを保証し、ダウンロード後すぐに使用可能
  ![画像](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **ブラウザ印刷**：ブラウザのネイティブ印刷機能を呼び出し、プリンターに接続して直接紙のコピーを出力可能
  ![画像](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**使用シナリオ**：

- 📄 **電子版**：オンライン提出、メール送信、WeChat 共有など
- 🖨️ **紙版**：面接、採用フェア、その他のオフラインシナリオ用

**ヒント**：提出前に PDF 効果をプレビューすることをお勧めします。連絡先情報やプロジェクト経験などの重要な情報が正確かつ完全であることを確認します。

---

## よくある質問

### エラーコード 429：リクエストレート制限

次のエラーが発生した場合：

![レート制限](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**エラーの意味**：使用している無料モデルがアクセスレート制限に達しました。

**解決策**：

1. **待ってから再試行**：無料モデルの制限は一時的なものです。通常数分から数時間、またはそれ以上待ちます。
2. **モデルを変更**：他の無料モデルを試す
3. **有料モデルを使用**：モデル ID から `:free` 接尾辞を削除し、有料バージョンを使用する。チャージが必要
4. **独自の API キーをバインド**：OpenRouter 設定で独自の Google AI Studio API キーをバインドし、独立した割り当てを使用

---

## セキュリティのヒント

- **API キーは機密情報です**。他の人と共有しないでください
- API キーは安全な場所（パスワードマネージャーなど）に保存することをお勧めします
- キーの漏洩を疑う場合は、OpenRouter バックエンドで直ちに削除し、再作成してください

---

## 関連リソース

- [OpenRouter 公式サイト](https://openrouter.ai): https://openrouter.ai
- [OpenRouter モデル一覧](https://openrouter.ai/models): https://openrouter.ai/models
- [一時メールサービス](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [パスワードジェネレーター](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [スポンサーアドレス](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [お問い合わせ](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**チュートリアル完了！** これで、設定した AI モデルを使用して履歴書を最適化し、編集できます。
