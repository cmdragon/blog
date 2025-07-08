---
url: /posts/a189c208200be9973a4dd8d9029f2ab2/
title: 使用 $fetch 进行 HTTP 请求
date: 2024-08-02T00:18:53+08:00
updated: 2024-08-02T00:18:53+08:00
author: cmdragon

summary:
  摘要：文章介绍了Nuxt3中使用$fetch进行HTTP请求的方法，它是基于ofetch库，支持SSR和自动缓存。$fetch简化了HTTP请求，支持GET、POST等，可结合useAsyncData或useFetch优化数据获取，避免重复请求，适用于服务器端渲染。

categories:
  - 前端开发

tags:
  - nuxt
  - $fetch
  - HTTP
  - SSR
  - 缓存
  - Vue
  - API
---

<img src="/images/2024_08_02 09_15_07.png" title="2024_08_02 09_15_07.png" alt="2024_08_02 09_15_07.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

在 Nuxt3 中，`$fetch` 是一个强大的工具，用于在 Vue 应用程序和 API 路由中进行 HTTP 请求。它基于 `ofetch` 库，并在 Nuxt
中提供了一些增强功能，如支持服务器端渲染（SSR）和自动缓存。

## 什么是 `$fetch`？

`$fetch` 是 Nuxt3 中全局暴露的一个辅助函数，用于进行 HTTP 请求。它允许您在 Vue 组件和 API 路由中轻松地发送 GET、POST
等请求，并处理响应。与传统的 `axios` 或 `fetch` 相比，`$fetch` 提供了更好的集成和优化，特别是在处理服务器端渲染（SSR）时。

## 为什么使用 `$fetch`？

### 1. 简化 HTTP 请求

`$fetch` 提供了简洁的 API，使得发起 HTTP 请求和处理响应变得更简单。您可以轻松地在 Vue 组件中获取数据或发送请求，而不需要手动管理请求和响应逻辑。

### 2. 支持服务器端渲染（SSR）

在 Nuxt3 中使用 `$fetch` 时，如果在服务器端渲染期间调用，它将直接模拟请求，避免了额外的 API 调用。这样可以提高性能并减少不必要的网络请求。

### 3. 避免重复数据获取

当在组件中使用 `$fetch` 时，若不结合 `useAsyncData` 或 `useFetch`
使用，可能会导致数据在服务器端和客户端两次获取。为了防止这种情况，推荐使用 `useAsyncData` 或 `useFetch`
来确保数据只在服务器端获取，并在客户端进行优化处理。

## 如何使用 `$fetch`？

### 基本用法

`$fetch` 可以用来发送各种类型的 HTTP 请求。以下是一些常见的示例：

**示例 1: 发送 GET 请求**

```vue

<template>
  <div>
    <p>数据：{{ data }}</p>
  </div>
</template>

<script setup lang="ts">
  const data = await $fetch('/api/data');
</script>
```

在这个示例中，我们使用 `$fetch` 发送了一个 GET 请求到 `/api/data`，并将响应数据绑定到组件中的 `data` 变量。

**示例 2: 发送 POST 请求**

```vue

<template>
  <button @click="submitForm">提交</button>
</template>

<script setup lang="ts">
  async function submitForm() {
    const response = await $fetch('/api/submit', {
      method: 'POST',
      body: {name: 'John Doe', email: 'john@example.com'},
    });
    console.log(response);
  }
</script>
```

在这个示例中，我们定义了一个 `submitForm` 函数，它会发送一个 POST 请求到 `/api/submit`，并传递一个 JSON 对象作为请求体。

### 结合 `useAsyncData` 和 `useFetch`

为了优化数据获取，并避免在服务器端和客户端两次请求相同的数据，推荐使用 `useAsyncData` 或 `useFetch`。

**示例 3: 使用 `useAsyncData`**

```vue

<template>
  <div>
    <p>数据：{{ data }}</p>
  </div>
</template>

<script setup lang="ts">

  const {data} = await useAsyncData('item', () => $fetch('/api/item'));
</script>
```

在这个示例中，我们使用 `useAsyncData` 来获取数据。这将确保数据仅在服务器端获取一次，并将其传递到客户端，避免了重复获取。

**示例 4: 使用 `useFetch`**

```vue

<template>
  <div>
    <p>数据：{{ data }}</p>
  </div>
</template>

<script setup lang="ts">

  const {data} = await useFetch('/api/item');
</script>
```

`useFetch` 是 `useAsyncData` 和 `$fetch` 的快捷方式，提供了类似的功能，但更为简洁。

### 使用 `$fetch` 仅在客户端执行

有时候，您可能只希望在客户端执行某些 HTTP 请求。例如，在用户点击按钮时发送请求：

```vue

<template>
  <button @click="contactForm">联系我们</button>
</template>

<script setup lang="ts">
  async function contactForm() {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: {message: 'Hello from the client!'},
    });
    console.log(response);
  }
</script>
```

在这个示例中，`contactForm` 函数仅在客户端触发，通过点击按钮发送一个 POST 请求。

## 参数说明

- **url**: 请求的 URL 地址。
- **options**: 可选的请求选项，如 `method`、`body`、`headers` 等。

## 总结

`$fetch` 是 Nuxt3 中进行 HTTP 请求的推荐方式，它提供了简洁的 API，并支持服务器端渲染（SSR）。通过结合使用 `useAsyncData`
或 `useFetch`，您可以优化数据获取流程，避免重复请求。希望这篇教程能够帮助您更好地理解和使用 `$fetch`。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [使用 useState 管理响应式状态 | cmdragon's Blog](https://blog.cmdragon.cn/posts/760deff1b835b737dc6396ad0e4cc8d4/)
- [使用 useServerSeoMeta 优化您的网站 SEO | cmdragon's Blog](https://blog.cmdragon.cn/posts/c321870c8c6db0d7f51b3f97ad7c1f4f/)
- [使用 useSeoMeta 进行 SEO 配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e7e7cf9c3099aeaf57badb3c4ecbb7f3/)
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
