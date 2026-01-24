---
url: /posts/29cac3fa837d4b767f01a77d6adc60e1/
title: Nuxt.js 应用中的 vite：serverCreated 事件钩子
date: 2024-11-18T00:18:53+08:00
updated: 2024-11-18T00:18:53+08:00
author: cmdragon

summary:
   通过使用 vite:serverCreated 钩子，开发者可以在 Vite 服务器创建时执行特定的操作，包括添加中间件和自定义配置。这使得在开发环境中能够快速响应请求及调整服务器行为，从而提升开发效率和用户体验。

categories:
   - 前端开发

tags:
   - Nuxt
   - Vite
   - 钩子
   - 中间件
   - 日志
   - 跨域
   - 开发
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_11_17 14_10_07.png" title="2024_11_17 14_10_07.png" alt="2024_11_17 14_10_07.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在 Nuxt 3 中，`vite:serverCreated` 钩子允许开发者在 Vite 服务器创建完成后执行自定义逻辑。这一钩子的使用能够让开发者对服务器的行为进行动态调整，从而增强开发体验和系统的灵活性。

## 文章大纲

1. [定义与作用](#1-定义与作用)
2. [调用时机](#2-调用时机)
3. [参数说明](#3-参数说明)
4. [示例用法](#4-示例用法)
5. [应用场景](#5-应用场景)
    - [5.1 服务器中间件的添加](#51-服务器中间件的添加)
    - [5.2 自定义日志功能](#52-自定义日志功能)
    - [5.3 开发环境中的特殊处理](#53-开发环境中的特殊处理)
    - [5.4 处理跨域请求](#54-处理跨域请求)
6. [注意事项](#6-注意事项)
    - [6.1 性能考虑](#61-性能考虑)
    - [6.2 中间件的执行顺序](#62-中间件的执行顺序)
    - [6.3 适应性处理](#63-适应性处理)
7. [总结](#7-总结)

## 1. 定义与作用

- **`vite:serverCreated`** 是 Vite 的一个钩子，允许开发者在 Vite 服务器创建后立即执行某些操作。
- 通过这个钩子，您可以访问到服务器实例并进行自定义配置、增加中间件等操作。

## 2. 调用时机

`vite:serverCreated` 钩子在 Vite 服务器实例创建之后、开始监听请求之前调用。这一时机非常适合对服务器进行初始化或配置操作。

## 3. 参数说明

钩子接收两个参数：

1. **`viteServer`**: 当前创建的 Vite 服务器实例，包含了许多用于操作服务器的方法和属性。
2. **`env`**: 当前的环境变量，允许根据不同的环境采取不同的操作。

## 4. 示例用法

以下是如何使用 `vite:serverCreated` 钩子的基本示例，展示了如何在 Vite 服务器创建时添加自定义逻辑。

### 在 `plugins/viteServerCreated.js` 文件中的实现

```javascript
// plugins/viteServerCreated.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:serverCreated', (viteServer, env) => {
    // 输出当前环境
    console.log('当前环境:', env.NODE_ENV);

    // 在服务器创建时添加自定义中间件
    viteServer.middlewares.use((req, res, next) => {
      console.log('请求路径:', req.url);
      next(); // 继续处理请求
    });
  });
});
```

## 5. 应用场景

### 5.1 服务器中间件的添加

通过 `vite:serverCreated` 钩子，您可以轻松向 Vite 服务器添加自定义中间件，处理特定的请求或响应。

```javascript
viteServer.middlewares.use((req, res, next) => {
  if (req.url === '/api/special') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('这是一个特殊的 API 响应');
  } else {
    next(); // 繼續替換為下一个中间件或处理器
  }
});
```

### 5.2 自定义日志功能

在开发过程中，捕捉并打印请求日志是一种常见需求。使用 `vite:serverCreated` 钩子，您可以轻松实现请求日志功能，记录请求的时间、方法和路径。

```javascript
viteServer.middlewares.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 请求方法: ${req.method} | 请求路径: ${req.url}`);
  next(); // 继续处理请求
});
```

### 5.3 开发环境中的特殊处理

您可以根据不同的环境变量，在开发环境中添加一些特定的处理逻辑。例如，您可能希望在开发模式下启用调试信息：

```javascript
if (env.NODE_ENV === 'development') {
  viteServer.middlewares.use((req, res, next) => {
    console.log('开发模式下的请求:', req.url);
    next(); // 继续处理请求
  });
}
```

### 5.4 处理跨域请求

在开发阶段，前端和后端通常运行在不同的端口上，这会导致跨域请求的问题。您可以通过添加 CORS 中间件来解决这个问题：

```javascript
viteServer.middlewares.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有域名进行访问
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 允许的请求方法
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头
  if (req.method === 'OPTIONS') {
    // 处理预检请求
    res.writeHead(204); // 无内容
    return res.end();
  }
  next();
});
```

## 6. 注意事项

### 6.1 性能考虑

在添加中间件时，需考虑对性能的影响。尽量避免在请求处理中进行阻塞操作，如复杂的计算或 I/O 操作。这些可能导致请求延迟或卡顿。

### 6.2 中间件的执行顺序

中间件的执行顺序会影响请求的处理方式。确保在设计中间件时明确运行顺序，避免逻辑冲突，如果一个中间件没有调用 `next()`，后续中间件将无法执行。

### 6.3 适应性处理

在编写中间件时，根据不同的环境变量进行适应性处理是必要的。例如，开发环境可以启用更多的调试信息，而生产环境则应保持简洁。通过 `env` 参数，您可以方便地实现此功能。

## 7. 总结

通过使用 `vite:serverCreated` 钩子，开发者可以在 Vite 服务器创建时执行特定的操作，包括添加中间件和自定义配置。这使得在开发环境中能够快速响应请求及调整服务器行为，从而提升开发效率和用户体验。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [Nuxt.js 应用中的 vite：configResolved 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2d9f94579481d38e0e9a7569cdfc31cb/)
- [Nuxt.js 应用中的 vite：extendConfig 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6bbb5474e945ea9d9a79c6cfcb6ec585/)
- [Nuxt.js 应用中的 schema：written 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bbc449caa5e31f1084aed152323c2758/)
- [Nuxt.js 应用中的 schema：beforeWrite 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9303f1529d95797ca3241f21e2fbc34d/)
- [Nuxt.js 应用中的 schema：resolved 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0a60978d2ce7bbcd5b86f9de0e5c99e2/)
- [Nuxt.js 应用中的 vite：extendConfig 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7f2f4ee1ef433b4a19daa99da7bd9f07/)
- [Nuxt.js 应用中的 vite：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cdba81aa5bb32dcc233a8bd29adee923/)
- [Nuxt.js 应用中的 schema：extend事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b1d6a0b2258a699dc8415d298eecab45/)
- [Nuxt.js 应用中的 listen 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/59f320ae722d9803c0c4eb42ccb295b2/)
- [Nuxt.js 应用中的 prepare：types 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/68419c6dd94db64cbb46673ab19a5146/)
- [Nuxt.js 应用中的 build：error 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4a5e09829cf63001943fc481d69e01e0/)
- [Nuxt.js 应用中的 prerender：routes 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7a11deaf9e3d140fd18d7ad3cde4b9d7/)
- [Nuxt.js 应用中的 nitro：build：public-assets 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/271508b42bc005f41e4fa31830a84e83/)
- [Nuxt.js 应用中的 nitro：build：before 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a2820600faa85b49967d91cb7617c284/)
- [Nuxt.js 应用中的 nitro：init 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a8d7636d5643bafcee2bcc1767dcfa3b/)
- [Nuxt.js 应用中的 nitro：config 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/927aa434dc4886c8c357c9000e072b19/)
- [Nuxt.js 应用中的 components：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1189b069abd2cfe9869abbbb4f7f340b/)
- [Nuxt.js 应用中的 components：dirs 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/06467028093d81da701fced5b84150cb/)
- [Nuxt.js 应用中的 imports：dirs 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d59459d9a47584d99ecdca9732024835/)
- [Nuxt.js 应用中的 imports：context 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e94c7e1071e2541e95713c53eafd79ef/)
- [Nuxt.js 应用中的 imports：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1d6dcd3025621c288fddb7d17465133c/)
- [Nuxt.js 应用中的 imports：sources 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cf392e5071f22b4179114cece7e0e8b1/)
- [Nuxt.js 应用中的 server：devHandler 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e3271aac91ec30fc15176811b001ed48/)
- [Nuxt.js 应用中的 pages：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/22eb7478a08b6f78043cd5fae24c7ad4/)
- [Nuxt.js 应用中的 builder：watch 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4cfe5f35f1a903646731a6c05a54d1dc/)
- [Nuxt.js 应用中的 builder：generateApp 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1191139984bd4df519af6d16a616949e/)
- [Nuxt.js 应用中的 build：manifest 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d69fdaae50601566d6f15c4e837c7cf3/)
- [Nuxt.js 应用中的 build：done 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7b79085749b7f156ed36cf16fca42310/)
- [Nuxt.js 应用中的 build：before 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/81e5857d6d3ff5e375f0f6734e25daac/)
- [Nuxt.js 应用中的 app：templatesGenerated 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3c565b88d4290c513e7c55ef934ec509/)
- [Nuxt.js 应用中的 app：templates 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/628fd1621bd298e33c2182dc18d36ea8/)
-


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
