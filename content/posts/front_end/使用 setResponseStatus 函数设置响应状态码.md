---
url: /posts/302e9ee7406d6304cf38978e07b4480c/
title: 使用 setResponseStatus 函数设置响应状态码
date: 2024-08-25T00:18:53+08:00
updated: 2024-08-25T00:18:53+08:00
author: cmdragon

summary:
  通过 setResponseStatus 函数，你可以轻松地在 Nuxt.js 中设置响应的状态码。这不仅能帮助用户更好地理解发生了什么，还能在需要时显示自定义的错误页面。在实际应用中，合理使用状态码对于提升用户体验至关重要。


categories:
  - 前端开发

tags:
  - nuxt
  - 响应码
  - SSR
  - 404页面
  - Vue.js
  - 状态码
  - Web开发
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_08_25 11_04_08.png" title="2024_08_25 11_04_08.png" alt="2024_08_25 11_04_08.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在开发应用时，我们常常需要根据不同的情况返回不同的响应状态码。在 Nuxt.js 中，`setResponseStatus` 函数让你能够方便地设置服务器端的响应状态码，特别是在进行服务器端渲染（SSR）时。

### 什么是响应状态码？

HTTP 响应状态码是服务器向客户端返回的数字代码，表明请求的处理结果。常见的状态码包括：


1. **1xx（信息性状态码）** ：

    -   这类状态码主要用于表示请求已被接收，服务器正在处理。其内容通常不会影响客户端的行为。

    -   例如：

        -   **100 Continue**：客户端应继续请求。
        -   **101 Switching Protocols**：服务器正在切换协议。

2. **2xx（成功状态码）** ：

    -   表示请求已成功被服务器接收、理解并处理。

    -   例如：

        -   **200 OK**：请求成功，通常返回所请求的资源。
        -   **201 Created**：请求成功并创建了新的资源。
        -   **204 No Content**：请求成功，但没有返回内容。

3. **3xx（重定向状态码）** ：

    -   表示请求的资源已被移动到其他位置，客户端需要进一步操作以完成请求。

    -   例如：

        -   **301 Moved Permanently**：请求的资源已被永久移动到新位置，返回的响应中会包含新位置的 URL。
        -   **302 Found**：请求的资源临时被移动。

4. **4xx（客户端错误状态码）** ：

    -   表示请求存在问题，导致服务器无法处理。大多数情况下是由于客户端的错误引起的。

    -   例如：

        -   **400 Bad Request**：请求格式不正确。
        -   **401 Unauthorized**：需要身份验证，用户未提供有效凭据。
        -   **403 Forbidden**：服务器拒绝请求，客户端没有权限访问此资源。
        -   **404 Not Found**：请求的资源未找到，通常是页面不存在。

5. **5xx（服务器错误状态码）** ：

    -   表示服务器在处理请求时发生了错误。通常是由于服务器内部的问题。

    -   例如：

        -   **500 Internal Server Error**：服务器发生了未知错误，无法完成请求。
        -   **502 Bad Gateway**：服务器作为网关或代理时，接收到无效响应。
        -   **503 Service Unavailable**：服务器当前无法处理请求，通常是因为过载或正在维护。

### Nuxt.js 中的 `setResponseStatus` 

Nuxt.js 提供了 `setResponseStatus` 函数，你可以在服务器端使用它来设置响应的状态码。有时，我们不仅希望设置状态码，还希望传递一条消息，以便给用户更好的反馈。

#### 基本用法

以下是 `setResponseStatus` 函数的基本使用示例：

```javascript
// 导入 Nuxt 中的组合式函数
const event = useRequestEvent()

// 设置状态码为 404
setResponseStatus(event, 404)

// 如果需要，也可以传递状态消息
setResponseStatus(event, 404, '页面未找到')
```

在这里，我们首先通过 `useRequestEvent()` 获取当前请求的事件对象，然后使用 `setResponseStatus` 来设置响应状态码。

### 创建自定义404页面的示例

下面我们将创建一个自定义 404 页面，当用户访问不存在的页面时，显示该页面及其状态信息。

#### 步骤 1: 创建404页面

在 `pages` 目录下创建一个 `404.vue` 文件，内容如下：

```vue
<template>
  <div>
    <h1>404 - 页面未找到</h1>
    <p>抱歉，您访问的页面不存在。</p>
  </div>
</template>

<script setup>

const event = useRequestEvent()
setResponseStatus(event, 404, '页面未找到')
</script>

<style scoped>
h1 {
  color: red;
}
</style>
```

在这个 `404.vue` 页面中，我们使用 `useRequestEvent()` 获取请求事件，并调用 `setResponseStatus` 函数将状态码设置为 404 并附带状态消息。

#### 步骤 2: 测试404页面

启动 Nuxt 应用：

```bash
npm run dev
```

然后尝试访问一个不存在的页面，例如 `http://localhost:3000/不存在的页面`。你应该能够看到自定义的 404 页面以及相应的状态码。

### 总结

通过 `setResponseStatus` 函数，你可以轻松地在 Nuxt.js 中设置响应的状态码。这不仅能帮助用户更好地理解发生了什么，还能在需要时显示自定义的错误页面。在实际应用中，合理使用状态码对于提升用户体验至关重要。


余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [如何在 Nuxt 中动态设置页面布局 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4c7fb169913298de59cbe19fcbaac8d3/)
- [使用 reloadNuxtApp 强制刷新 Nuxt 应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f47b024ff8b1e13c71741951067ae579/)
- [使用 refreshNuxtData 刷新 Nuxt应用 中的数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1d66580f8a7e8510b9f9af6272aecc2e/)
- [使用 prerenderRoutes 进行预渲染路由 | cmdragon's Blog](https://blog.cmdragon.cn/posts/87586efe60054fbbb53f151d9025f356/)
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
