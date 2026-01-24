---
url: /posts/e7e7cf9c3099aeaf57badb3c4ecbb7f3/
title: 使用 useSeoMeta 进行 SEO 配置
date: 2024-07-30T00:18:53+08:00
updated: 2024-07-30T00:18:53+08:00
author: cmdragon 

summary:
  摘要：本文介绍了Nuxt3中的useSeoMeta组合函数，用于简化和优化网站的SEO配置。通过这个工具，开发者可以在Nuxt3项目中方便地设置页面元标签，包括标题、描述以及Open Graph和Twitter Card标签等，支持静态与动态元数据配置，提升网站在搜索引擎和社交媒体上的表现。

categories:
  - 前端开发

tags:
  - SEO优化
  - nuxt
  - Web开发
  - 代码示例
  - 元标签
  - 动态配置
  - 前端技术
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_30 17_59_07.png" title="2024_07_30 17_59_07.png" alt="2024_07_30 17_59_07.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

在创建现代网站时，搜索引擎优化（SEO）是不可忽视的一个环节。良好的 SEO 配置不仅能提升你的网站在搜索引擎中的排名，还能在社交媒体上更好地展示你的内容。Nuxt3
提供了一个强大的工具 `useSeoMeta` 来帮助你实现这一目标。

### 什么是 `useSeoMeta`？

`useSeoMeta` 是 Nuxt3 提供的一个组合函数（composable），用于定义网站的 SEO 元标签。通过使用 `useSeoMeta`
，你可以以类型安全的方式指定各种元标签，包括标题、描述、Open Graph 标签等。这有助于避免常见的错误，如拼写错误或使用错误的属性名，同时确保你的标签配置符合标准并具有
XSS 安全性。

### 如何使用 `useSeoMeta`

#### 1. 安装 Nuxt3

首先，你需要有一个 Nuxt3 项目。如果还没有项目，可以使用以下命令创建一个新的 Nuxt3 项目：

```bash
npx nuxi@latest init my-nuxt3-app
cd my-nuxt3-app
npm install
```

#### 2. 配置 `useSeoMeta`

在 Nuxt3 项目中，你通常会在页面组件中配置 SEO 元标签。以下是一个简单的 `app.vue` 文件示例，展示了如何使用 `useSeoMeta`
来设置页面的元标签。

##### 示例 1: 静态元标签

在这个示例中，我们设置了一些静态的 SEO 元标签：

```vue

<template>
  <div>
    <h1>欢迎来到我的网站</h1>
  </div>
</template>

<script setup lang="ts">

  useSeoMeta({
    title: '我的神奇网站',
    ogTitle: '我的神奇网站',
    description: '这是我的神奇网站，让我告诉你关于它的一切。',
    ogDescription: '这是我的神奇网站，让我告诉你关于它的一切。',
    ogImage: 'https://example.com/image.png',
    twitterCard: 'summary_large_image',
  });
</script>
```

在上面的代码中，我们使用 `useSeoMeta` 来设置以下元标签：

- `title`: 网页的标题
- `ogTitle`: Open Graph 的标题，用于社交媒体分享
- `description`: 网页的描述
- `ogDescription`: Open Graph 的描述，用于社交媒体分享
- `ogImage`: Open Graph 的图像 URL，用于社交媒体分享
- `twitterCard`: Twitter 卡片的类型，如 `summary_large_image`

##### 示例 2: 动态元标签

有时候，你可能需要根据组件的状态动态生成元标签。以下是如何使用计算属性来实现这一点：

```vue

<template>
  <div>
    <h1>{{ title }}</h1>
    <input v-model="title" placeholder="修改标题"/>
  </div>
</template>

<script setup lang="ts">

  const title = ref('我的标题');

  useSeoMeta({
    title,
    description: computed(() => `这是 ${title.value} 的描述`),
  });
</script>
```

在这个示例中，我们使用 `ref` 来创建一个响应式的标题，并且通过 `computed` 来动态生成描述。这样，当标题发生变化时，描述也会自动更新。

### 参数列表

`useSeoMeta` 支持超过 100 个参数，用于定义各种元标签。以下是一些常见的参数：

#### **基本元标签**

- **title**: 页面标题
- **description**: 页面描述
- **keywords**: 页面关键词
- **robots**: 指示搜索引擎爬虫如何处理页面（如`index, follow`,`noindex, nofollow`）

#### **Open Graph 标签**

- **ogTitle**: Open Graph 标题
- **ogDescription**: Open Graph 描述
- **ogImage**: Open Graph 图像 URL
- **ogImageAlt**: Open Graph 图像替代文本
- **ogType**: Open Graph 类型（如`website`,`article`,`profile`）
- **ogUrl**: 当前页面的 URL
- **ogSiteName**: 网站名称
- **ogLocale**: Open Graph 语言区域（如`en_US`）

#### **Twitter Card 标签**

- **twitterCard**: Twitter 卡片类型（如`summary`,`summary_large_image`,`app`,`player`）
- **twitterTitle**: Twitter 标题
- **twitterDescription**: Twitter 描述
- **twitterImage**: Twitter 图像 URL
- **twitterImageAlt**: Twitter 图像替代文本
- **twitterSite**: Twitter 账户用户名（通常是`@`开头）
- **twitterCreator**: 内容作者的 Twitter 账户用户名（通常是`@`开头）
- **twitterPlayer**: Twitter 播放器 URL（用于视频卡片）

#### **Facebook 和其他社交平台标签**

- **fbAppId**: Facebook 应用 ID
- **fbPages**: Facebook 页面 URL（如果有多个，使用逗号分隔）

#### **结构化数据**

- **schema**: JSON-LD 格式的结构化数据（如`schema.org`类型）

    - **@context**: JSON-LD 上下文
    - **@type**: 数据类型（如`WebPage`,`Product`,`Article`）
    - **name**: 名称
    - **description**: 描述
    - **url**: URL
    - **image**: 图像 URL
    - **author**: 作者信息
    - **publisher**: 发布者信息
    - **datePublished**: 发布日期
    - **dateModified**: 修改日期

#### **链接相关标签**

- **canonical**: 规范化 URL
- **alternate**: 指定其他语言版本的 URL（如`hrefLang`）
- **rel**: 链接关系（如`nofollow`,`noopener`）

#### **视口和移动设备标签**

- **viewport**: 视口设置（如`width=device-width, initial-scale=1`）
- **appleMobileWebAppTitle**: iOS 应用的标题
- **appleMobileWebAppCapable**: 是否允许全屏模式（`yes`或`no`）
- **appleMobileWebAppStatusBarStyle**: 状态栏样式（如`black-translucent`）

#### **网站图标和徽标**

- **favicon**: 网站图标（通常在`<link rel="icon">`中设置）
- **appleTouchIcon**: iOS 应用图标（`<link rel="apple-touch-icon" href="/path/to/icon.png">`）
- **msapplicationTileImage**: Windows 8/10 触摸屏图标
- **themeColor**: 移动设备浏览器工具栏的主题颜色

#### **安全和隐私相关标签**

- **Content-Security-Policy**: 内容安全策略
- **X-Content-Type-Options**: 防止 MIME 类型嗅探
- **X-Frame-Options**: 防止点击劫持（如`DENY`,`SAMEORIGIN`）
- **X-XSS-Protection**: 启用或禁用 XSS 保护

#### **预加载和预渲染**

- **preload**: 预加载资源（如`<link rel="preload" href="/path/to/resource" as="script">`）
- **prefetch**: 预取资源（如`<link rel="prefetch" href="/path/to/resource">`）
- **prerender**: 预渲染页面（如`<link rel="prerender" href="/path/to/page">`）

#### **图像优化**

- **imageSrcSet**: 图像的不同分辨率（用于响应式设计）
- **imageSizes**: 图像的大小（用于响应式设计）

#### **自定义元数据**

- **applicationName**: 应用程序名称
- **themeColor**: 浏览器的主题颜色
- **ogVideo**: Open Graph 视频 URL
- **ogVideoType**: Open Graph 视频类型（如`video/mp4`）

更多参数可以参阅官方文档或源代码中的参数列表。[SEO Starter HTML Tags · HTML Tag Collections · zhead](https://zhead.dev/collection/seo)

### 总结

使用 `useSeoMeta` 是在 Nuxt3 中设置 SEO 元标签的一种推荐方式。它不仅支持
TypeScript，并且通过类型安全的配置避免了许多常见错误。无论是静态还是动态的元标签配置，`useSeoMeta` 都能提供清晰的 API
来帮助你完成任务。


## 往期文章归档：

- [Nuxt.js必读：轻松掌握运行时配置与 useRuntimeConfig | cmdragon's Blog](https://blog.cmdragon.cn/posts/bbb706a14f541c1932c5a42b4cab92a6/)
- [Nuxt.js 路由管理：useRouter 方法与路由中间件应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2426831b3d48fe56fd7997565dde6857/)
- [useRoute 函数的详细介绍与使用示例 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f78b155dac56741becfa07c51c38dc0f/)
- [使用 useRequestURL 组合函数访问请求URL | cmdragon's Blog](https://blog.cmdragon.cn/posts/06f3f8268aaa2d02d711d8e895bb2bc9/)
- [Nuxt.js 环境变量配置与使用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/53eb62f578931146081c71537fd0c013/)
- [服务端渲染中的数据获取：结合 useRequestHeaders 与 useFetch | cmdragon's Blog](https://blog.cmdragon.cn/posts/c88fddf7a8ad9112ff80c9a25cda09d2/)
- [使用 useRequestEvent Hook 访问请求事件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7f6aeaffdd673a716b7f013f59aa69af/)
- [使用 useNuxtData 进行高效的数据获取与管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5097e3f618f180282a847588006a51d8/)
- [Nuxt 3 使用指南：掌握 useNuxtApp 和运行时上下文 | cmdragon's Blog](https://blog.cmdragon.cn/posts/074b9dedf36fca34d1469e455c71d583/)
- [使用 useLazyFetch 进行异步数据获取 | cmdragon's Blog](https://blog.cmdragon.cn/posts/382133fd6ac27845d845a7fa96e5ba43/)
- [使用 useLazyAsyncData 提升数据加载体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/954e473bea4ec122949c8c7d84d32c95/)
- [Nuxt.js 中使用 useHydration 实现数据水合与同步 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c7ddeca4690387e7e08c83e6c482a576/)
- [useHeadSafe：安全生成HTML头部元素 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a1ca5111c82292bda5de4994f537d6f8/)
- [Nuxt.js头部魔法：轻松自定义页面元信息，提升用户体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d5370e880eaec9085a153caba4961676/)
- [探索Nuxt.js的useFetch：高效数据获取与处理指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/29ff9113e98725ee69fa0148a47ae735/)
- [Nuxt.js 错误侦探：useError 组合函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b73679558bc672550fbbb72ae295fdf5/)
- [useCookie函数：管理SSR环境下的Cookie | cmdragon's Blog](https://blog.cmdragon.cn/posts/cd361e1a7930614f1aaf46ad35b28958/)
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
