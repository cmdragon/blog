---
url: /posts/bbb706a14f541c1932c5a42b4cab92a6/
title: Nuxt.js必读：轻松掌握运行时配置与 useRuntimeConfig
date: 2024-07-29T00:18:53+08:00
updated: 2024-07-29T00:18:53+08:00
author: cmdragon

summary:
  本文详细介绍了Nuxt.js中的运行时配置功能，包括定义和使用运行时配置的方法，以及如何通过useRuntimeConfig访问配置。同时，讲解了环境变量与.env文件的使用，特别是在不同环境下的配置管理。

categories:
  - 前端开发

tags:
  - nuxt
  - 运行时配置
  - Vue.js
  - SSR
  - 环境变量
  - .env文件
  - useRuntimeConfig
---

<img src="/images/2024_07_29 17_49_17.png" title="2024_07_29 17_49_17.png" alt="2024_07_29 17_49_17.png"/>


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

Nuxt.js 是一个基于 Vue.js 的框架，它极大地简化了服务端渲染（SSR）和静态站点生成的开发过程。在 Nuxt.js 中，运行时配置是一个强大的功能，允许开发者根据不同的环境（如开发、生产等）动态地调整配置。


## 一、什么是运行时配置？

运行时配置是 Nuxt.js 中的一个特性，它允许你在不同的环境下使用不同的配置。例如，你可能需要在一个环境中使用一个 API 基础 URL，而在另一个环境中使用另一个 URL。运行时配置可以让你轻松实现这一点。

## 二、如何定义运行时配置？

在 Nuxt.js 中，你可以在 `nuxt.config.ts` 文件中定义运行时配置。以下是一个简单的例子：

```
export default defineNuxtConfig({
  runtimeConfig: {
    // 私有密钥，仅在服务器端可用
    apiSecret: '123',

    // 公共密钥，可以在客户端和服务器端访问
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  }
})

```
在这个例子中，`apiSecret` 是一个私有密钥，仅在服务器端可用。`apiBase` 是一个公共密钥，可以在客户端和服务器端访问。

## 三、如何使用 `useRuntimeConfig`？

`useRuntimeConfig` 是一个组合函数，用于在组件或 API 接口中访问运行时配置。以下是如何在组件中使用它的示例：

```
<template>
  <div>
    <h1>API Base URL: {{ config.public.apiBase }}</h1>
  </div>
</template>

<script>
export default {
  setup() {
    const config = useRuntimeConfig()
    return {
      config
    }
  }
}
</script>
```

在服务器端 API 中，你可以这样使用 `useRuntimeConfig`：

```
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  // 使用配置
})
```


## 四、环境变量与 `.env` 文件

你可以在 `.env` 文件中设置环境变量，以便在开发和构建过程中访问它们。例如：

```
NUXT_PUBLIC_API_BASE = "https://api.localhost:5555"
NUXT_API_SECRET = "123"

```

这些变量可以通过 `process.env` 在 Nuxt 应用中访问。

> 在**生产运行时**中，你应该使用平台的环境变量配置，而不是使用 `.env` 文件。**在构建完成后**，当你运行服务器时，`.env` 文件将不会被读取。具体如何设置环境变量取决于你的环境。


## 五、`  app ` 命名空间

在Nuxt.js中，app命名空间是用于存储一些特定的运行时配置的，这些配置通常与应用的全局行为和设置相关。在app命名空间中，有两个重要的键：baseURL和cdnURL。


### 1. app.baseURL

**作用**：`app.baseURL` 是一个用于存储应用的根URL的键。默认情况下，这个值被设置为`'/'`。这个键主要用于在应用中统一处理URL的前缀，例如在API调用、路由链接、静态资源访问等场景中。

**如何使用**：

```
// 在你的组件中访问baseURL
export default {
  setup() {
    const config = useRuntimeConfig()
    console.log('Base URL:', config.app.baseURL)
  }
}

```

### 2. app.cdnURL

**作用**：`app.cdnURL` 是一个用于存储CDN（内容分发网络）URL的键。这个键主要用于在生产环境中，当应用使用CDN来加速静态资源的加载时，提供一个自定义的CDN URL。在开发环境中，这个值通常被设置为空字符串或者默认值。

**如何使用**：

```
// 在你的API服务中访问cdnURL
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const cdnURL = config.app.cdnURL
  console.log('CDN URL:', cdnURL)
})

```

### 设置环境变量

为了在运行时自定义这些值，你可以通过设置环境变量来实现。例如，为了改变`app.baseURL`，你可以在`.env`文件中添加：

```
NUXT_APP_BASE_URL=https://your-custom-base-url.com
```

对于`app.cdnURL`，你可以在`.env`文件中添加：

```
NUXT_APP_CDN_URL=https://your-custom-cdn-url.com
```

### 示例代码

假设你有一个`plugins/my-plugin.ts`文件，你想要在其中使用`app.baseURL`：

```
export default defineNuxtPlugin((NuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.app.baseURL
  console.log('Using base URL:', baseURL)
})

```

对于`server/api/foo.ts`中的`app.cdnURL`：

```
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const cdnURL = config.app.cdnURL
  console.log('Using CDN URL:', cdnURL)
})

```

通过这种方式，你可以确保在不同的环境（如开发、测试、生产）中，应用能够使用不同的配置，从而提高应用的灵活性和可维护性。


## 往期文章归档：

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
- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
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
