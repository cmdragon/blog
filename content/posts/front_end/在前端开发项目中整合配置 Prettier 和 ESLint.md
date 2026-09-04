---
url: /posts/33ce05adf3c0a1a7228901f9f265dedb/
title: 在前端开发项目中整合配置 Prettier 和 ESLint
date: 2024-02-04T1:55:24+08:00
lastmod: 2024-02-04T1:55:24+08:00
categories:
  - 前端开发
tags:
  - 开发者工具
  - TypeScript
  - Prettier
  - ESLint

---
引言：
在前端开发中，代码的格式化和规范是非常重要的。Prettier和ESLint是两个常用的工具，可以帮助我们自动格式化代码和检查代码规范。本文将介绍如何在前端开发项目中整合和配置Prettier和ESLint，以提高代码质量和开发效率。

在项目中整合配置 Prettier 和 ESLint 是一种常见的前端开发实践，旨在确保代码风格一致性和遵循编码规范。以下是一个简化的步骤教程，适用于一个基于
Node.js、npm 及其支持 JavaScript 或 TypeScript 的前端项目：

## 1. 初始化项目与安装依赖

首先，确保你已在项目根目录下初始化 package.json 文件：

```Bash
npm init -y 
```

接下来，安装 ESLint、Prettier 及相关插件：

```Bash
# 安装 ESLint 和基础插件
npm install --save-dev eslint

# 安装 Prettier
npm install --save-dev prettier

# 安装用于集成 Prettier 到 ESLint 的插件
npm install --save-dev eslint-config-prettier eslint-plugin-prettier

```

## 2. 配置 ESLint

创建 .eslintrc.js 或 .eslintrc.json 文件以配置 ESLint：

```json5
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    // 如果你的项目使用 TypeScript，请添加如下内容：
    // "parser": "@typescript-eslint/parser",
    // "plugins": ["@typescript-eslint"],
    // "extends": ["plugin:@typescript-eslint/recommended"],

    // 添加自定义规则或覆盖默认规则
  }
}

```

如果你的项目使用 TypeScript，记得添加对应的 TypeScript 支持。

## 3. 配置 Prettier

创建 .prettierrc.json 文件来配置 Prettier：

```json5
// .prettierrc.json
{
  "semi": true,
  // 使用分号结尾
  "tabWidth": 2,
  // 使用2个空格缩进
  "singleQuote": true,
  // 使用单引号
  "printWidth": 80,
  // 每行最大字符数
  "trailingComma": "all"
  // 在对象和数组末尾添加逗号
  // 其他 Prettier 配置项...
}
```

## 4. 添加 npm 脚本

在 package.json 中添加脚本来自动格式化和检查代码：

```json5
"scripts": {
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "lint": "eslint .",
  "lint-fix": "eslint --fix ."
},

```

- "format" 脚本会使用 Prettier 格式化所有支持的文件。
- "lint" 脚本运行 ESLint 进行代码检查。
- "lint-fix" 脚本尝试自动修复可自动修复的 ESLint 错误。

## 5. 使用 IDE/编辑器插件

为了在编写代码时实时应用 Prettier 和 ESLint 的规则，你需要在你的 IDE 或文本编辑器中安装相应的插件。例如，在 VSCode 中可以安装
ESLint 和 Prettier - Code formatter 插件。

现在，你已经在项目中成功整合了 Prettier 和 ESLint。每次提交代码前，执行 `npm run lint` 和 `npm run format` 来确保代码符合规范和风格要求。如果项目是
TypeScript 项目，别忘了在 ESLint 配置中启用 TypeScript 相关插件和规则

## 6. 总结：
通过整合和配置Prettier和ESLint，我们可以在前端开发项目中自动格式化代码和检查代码规范。这有助于提高代码质量、统一团队的代码风格，并提高开发效率。通过本文的教程，你可以轻松地在你的项目中使用Prettier和ESLint，并根据个人需求进行定制。记住，在提交代码之前运行`npm run lint`
和`npm run format`命令来确保代码的质量和规范性。

## 免费好用的热门在线工具

- [CMDragon 在线工具 - 高级AI工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现1000+提升效率与开发的AI工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)
- [CMDragon 更新日志 - 最新更新、功能与改进 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/changelog)
- [支持我们 - 成为赞助者 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/sponsor)
- [AI文本生成图像 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-to-image-ai)
- [临时邮箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/temp-email)
- [二维码解析器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/qrcode-parser)
- [文本转思维导图 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-to-mindmap)
- [正则表达式可视化工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/regex-visualizer)
- [文件隐写工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/steganography-tool)
- [IPTV 频道探索器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/iptv-explorer)
- [快传 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/snapdrop)
- [随机抽奖工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/lucky-draw)
- [动漫场景查找器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/anime-scene-finder)
- [时间工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/time-toolkit)
- [网速测试 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/speed-test)
- [AI 智能抠图工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/background-remover)
- [背景替换工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/background-replacer)
- [艺术二维码生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)
- [Open Graph 元标签生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/open-graph-generator)
- [图像对比工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-comparison)
- [图片压缩专业版 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-compressor)
- [密码生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/password-generator)
- [SVG优化器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/svg-optimizer)
- [调色板生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/color-palette)
- [在线节拍器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/online-metronome)
- [IP归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [CSS网格布局生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/css-grid-layout)
- [邮箱验证工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/email-validator)
- [书法练习字帖 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/calligraphy-practice)
- [金融计算器套件 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/finance-calculator-suite)
- [中国亲戚关系计算器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/chinese-kinship-calculator)
- [Protocol Buffer 工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/protobuf-toolkit)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)
