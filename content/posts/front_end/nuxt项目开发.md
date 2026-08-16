---
url: /posts/1b603ec387c047de7e0eb7f961ae4b2c/
title: nuxt开发
date: 2024-05-23T19:37:34+08:00
lastmod: 2024-05-23T19:37:34+08:00
categories:
  - 前端开发

tags:
  - 状态管理
  - 响应式系统
  - 组件开发
  - 路由配置
  - 框架对比

---
## 创建Nuxt.js项目

### 步骤 1: 安装 Node.js 和 NPM

确保你的计算机上安装了 Node.js 和 NPM。你可以从 [Node.js 官网](https://nodejs.org/) 下载并安装。

### 步骤 2: 创建 Nuxt.js 项目

打开命令行工具，运行以下命令来创建一个新的 Nuxt.js 项目：

```bash
npx nuxi@latest init <project-name>
```

在这个过程中，你可以选择服务器框架、UI框架等。按照提示完成项目的基本配置。

### 步骤 3: 安装 TwindCSS 和 其它modules

进入你的 Nuxt.js 项目目录：

```bash
cd my-nuxt-project
npm i
```

安装 Twind 和相关依赖：

```bash
npm install --save-dev @nuxtjs/tailwindcss
npx tailwindcss init

// https://nuxt.com.cn/modules
```

> npm 更偏向于包的长期管理和依赖控制，而 npx 则专注于简化包的临时使用和执行，特别是在需要快速运行或测试一个包的命令行工具时更为方便。

### 步骤 4：安装 ESLint 和 Prettier

#### 1. 安装 ESLint 和 Prettier 以及它们的相关插件：

```bash
npm install --save-dev eslint eslint-plugin-nuxt prettier eslint-plugin-prettier eslint-config-prettier @nuxtjs/eslint-config-typescript
   
```

#### 2. 配置 ESLint

在项目根目录下创建 `.eslintrc.js` 文件，并添加以下内容：

```js
module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: [
        '@nuxtjs',
        'plugin:nuxt/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    rules: {
        // 在这里添加自定义的 ESLint 规则
        semi: 0
    },
}

```

#### 3. 配置 Prettier

在项目根目录下创建 `.prettierrc.js` 文件，并添加以下内容：

```js
module.exports = {
    semi: false,
    tabWidth: 2,
    useTabs: false,
    /*打印宽度，超过后，会将属性换行*/
    printWidth: 120,
    /*禁止使用尾随逗号,对象和数组最后一个逗号去掉*/
    trailingComma: "none",
    /*在对象字面量中的括号之间添加空格*/
    bracketSpacing: true,
    /*使用单引号而不是双引号来定义字符串*/
    singleQuote: true,
    /*当箭头函数只有一个参数时，省略参数前后的括号*/
    arrowParens: "avoid",
    /*script和style标签中间的内容缩进*/
    vueIndentScriptAndStyle: true,
    // 将>多行 HTML（HTML、JSX、Vue、Angular）元素放在最后一行的末尾，而不是单独放在下一行（不适用于自闭合元素
    bracketSameLine: false
}

```

#### 4. 创建格式化脚本

在 `package.json` 中添加脚本命令：

```bash
"lint": "eslint --ext .js,.vue --ignore-path .gitignore .",
"format": "prettier --write \\"**/*.{js,jsx,ts,tsx,json,css,scss,vue}\\""
```

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
