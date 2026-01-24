---
url: /posts/87586efe60054fbbb53f151d9025f356/
title: 使用 prerenderRoutes 进行预渲染路由
date: 2024-08-20T00:18:53+08:00
updated: 2024-08-20T00:18:53+08:00
author: cmdragon

summary:
  prerenderRoutes 函数是 Nuxt 3 中一个强大的工具，它能够帮助开发者优化页面加载速度和改善用户体验。通过使用 prerenderRoutes，你能够灵活地指定需要预渲染的路由，提升网站性能和 SEO 效果。


categories:
  - 前端开发

tags:
  - 前端
  - Nitro
  - 预渲染
  - SEO
  - 路由
  - 优化
  - 教程
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_08_20 11_28_57.png" title="2024_08_20 11_28_57.png" alt="2024_08_20 11_28_57.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在现代前端开发中，预渲染是提升网站性能和用户体验的一项重要技术。Nitro 的 `prerenderRoutes` 函数允许开发者指定额外需要预渲染的路由，尽管这些路由不一定会在生成的 HTML 中显示。

### 什么是预渲染？

预渲染是指在构建阶段生成静态 HTML 文件的过程，以便在用户请求时直接提供这些文件。这种方法可以显著提高页面加载速度，并且对于 SEO（搜索引擎优化）也有很大的帮助。

### `prerenderRoutes` 的基本用法

`prerenderRoutes` 函数允许你告诉 Nitro 需要预渲染哪些路由，即使这些路由的 HTML 不会直接显示在最终的网页中。

### 基本语法

以下是 `prerenderRoutes` 的基本用法：

```javascript

// 单个路由
prerenderRoutes('/');

// 多个路由
prerenderRoutes(['/', '/about']);
```
在终端窗口中，你可能会看到关于路由预渲染的日志信息。此时，/about 页面应该在你访问主页时已经被预渲染。
### 何时使用 `prerenderRoutes`

使用 `prerenderRoutes` 的场景主要包括：

- 你有某些静态页面需要被预渲染。
- 你想提升特定路由的SEO性能。

请注意，`prerenderRoutes` 只能在服务器端执行，若在浏览器中或其他非预渲染的环境中调用，将不会生效。

### 示例项目

我们将创建一个简单的项目，通过 `prerenderRoutes` 预渲染一些页面。

#### 步骤 1：安装所需依赖

确保你的项目中已安装 Nitro。可以通过以下命令安装：

```bash
npm install nitro
```

#### 步骤 2：项目结构

创建一个简单的项目结构：

```
my-nitro-project/
├── src/
│   ├── pages/
│   │   ├── index.vue
│   │   └── about.vue
│   └── server/
│       └── prerender.js
└── package.json
```

#### 步骤 3：创建页面

在 `src/pages/index.vue` 中添加以下代码：

```vue
<template>
  <div>
    <h1>首页</h1>
    <p>欢迎来到我的网站!</p>
  </div>
</template>
```

在 `src/pages/about.vue` 中添加以下代码：

```vue
<template>
  <div>
    <h1>关于我们</h1>
    <p>这是关于我们的页面。</p>
  </div>
</template>
```

#### 步骤 4：使用 `prerenderRoutes`

在 `src/server/prerender.js` 文件中，添加以下代码：

```javascript
import { defineEventHandler } from 'nitro'

export default defineEventHandler((event) => {
  // 预渲染首页和关于页面
  prerenderRoutes(['/', '/about']);
});
```

#### 步骤 5：构建项目

在项目根目录下，使用以下命令构建项目：

```bash
nitro build
```

#### 步骤 6：启动项目

构建完成后，使用如下命令启动项目：

```bash
nitro start
```

当项目启动后，你将能够访问 `/` 和 `/about` 路由，这些页面将会被预渲染。

### 结论

`prerenderRoutes` 函数是 Nuxt 3 中一个强大的工具，它能够帮助开发者优化页面加载速度和改善用户体验。通过使用 `prerenderRoutes`，你能够灵活地指定需要预渲染的路由，提升网站性能和 SEO 效果。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [使用 preloadRouteComponents 提升 Nuxt 应用的性能 | cmdragon's Blog](https://blog.cmdragon.cn/posts/476d81c3a7972e5b8d84db523437836c/)
- [使用 preloadComponents 进行组件预加载 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b54b94bb4434e506c17b07f68a13bf94/)
- [使用 prefetchComponents 进行组件预取 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a87f935f1fba15457925fce9d47af8f4/)
- [使用 onNuxtReady 进行异步初始化 | cmdragon's Blog](https://blog.cmdragon.cn/posts/838b6733c038fcb291025b2c777b3e8b/)
- [使用 onBeforeRouteUpdate 组合式函数提升应用的用户体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d400882a80839b72cf628a6de608f0e8/)
- [使用 onBeforeRouteLeave 组合式函数提升应用的用户体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ec76c32456eed5c68935b916beb053c2/)
- [使用 navigateTo 实现灵活的路由导航 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f68163dee0a38a46b874f4885c661f48/)
- [使用 Nuxt 3 的 defineRouteRules 进行页面级别的混合渲染 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a067b4aecdd04032860d7102ebcef604/)
- [掌握 Nuxt 3 的页面元数据：使用 definePageMeta 进行自定义配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e0ecc27dccf7a9a8d8bf9a2d4fd3f00b/)
- [使用 defineNuxtRouteMiddleware 创建路由中间件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9820edb9b255785446531ea7b1ac2269/)
- [使用 defineNuxtComponent`定义 Vue 组件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8e9977db3a733bc649877087c3b87e91/)
- [使用 createError 创建错误对象的详细指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/58c4afd983d5e7a26462c4830ef807b5/)
- [清除 Nuxt 状态缓存：clearNuxtState | cmdragon's Blog](https://blog.cmdragon.cn/posts/54aef7263724952013d0fd71fcdcb38e/)
- [清除 Nuxt 数据缓存：clearNuxtData | cmdragon's Blog](https://blog.cmdragon.cn/posts/b14ec150986ae8b8e56d2c37637e04fd/)
- [使用 clearError 清除已处理的错误 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c7681141b499276ec9613c76b8bdb688/)
- [使用 addRouteMiddleware 动态添加中间 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0988eb75d14a8fc3b0db7d072206b8a8/)
- [使用 abortNavigation 阻止导航 | cmdragon's Blog](https://blog.cmdragon.cn/posts/52bba0b4e019da067ec5092a151c2bce/)
- [使用 $fetch 进行 HTTP 请求 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a189c208200be9973a4dd8d9029f2ab2/)
- [使用 useState 管理响应式状态 | cmdragon's Blog](https://blog.cmdragon.cn/posts/760deff1b835b737dc6396ad0e4cc8d4/)
- [使用 useServerSeoMeta 优化您的网站 SEO | cmdragon's Blog](https://blog.cmdragon.cn/posts/c321870c8c6db0d7f51b3f97ad7c1f4f/)
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
