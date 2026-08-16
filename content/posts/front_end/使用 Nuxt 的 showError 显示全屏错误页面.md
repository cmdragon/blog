---
url: /posts/54debfbfcb8e75989b8e0efe82573a86/
title: 使用 Nuxt 的 showError 显示全屏错误页面
date: 2024-08-26T00:18:53+08:00
updated: 2024-08-26T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文介绍Nuxt.js中的showError方法用于显示全屏错误页面，包括其参数类型及使用方式，并演示了如何在页面中捕获并展示错误，还介绍了useError用于管理共享错误状态的方法。

categories:
  - 前端开发

tags:
  - nuxt
  - 组件
  - 处理
  - 错误
  - 页面

---
<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_08_26 08_44_18.png" title="2024_08_26 08_44_18.png" alt="2024_08_26 08_44_18.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

在网页开发中，错误是不可避免的。为了提升用户体验，快速有效地处理错误是非常重要的。在 Nuxt.js
中，提供了一种简单的方法来处理和显示全屏错误页面，那就是使用 `showError` 方法。

## 什么是 `showError`？

`showError` 是 Nuxt.js 提供的一个函数，允许你在页面、组件和插件中快速显示全屏的错误信息。使用这个方法，你可以向用户展示友好的错误页面，使他们知道发生了什么问题。

### 参数说明

`showError` 接受一个参数，能够是以下几种类型：

1. 字符串 - 简单的错误信息，如：
   ```javascript
   showError("😱 哦不，一个错误被抛出了。")
   ```

2. 错误对象 - 你可以使用 JavaScript 的 Error 对象，提供更多的信息。

3. 部分对象 - 你可以传入一个对象，其中包含以下选项：
    - `statusCode`：HTTP 状态码（如 404）
    - `statusMessage`：状态信息（如 "页面未找到"）
    - `message`：错误信息
    - `stack`：错误的堆栈跟踪
    - `name`、`cause`、`data` 等

例如：

```javascript
showError({
    statusCode: 404,
    statusMessage: "页面未找到"
});
```

## 如何使用 `showError`

`showError` 方法可以在你的 Nuxt 应用中非常方便地使用。我们将通过以下步骤展示如何实现一个简单的错误处理机制：

1. **安装 Nuxt**：确保你的项目中安装了 Nuxt。

2. **创建页面**：创建一个示例页面，在该页面中你将故意引发一个错误。

3. **捕获错误**：在页面代码中使用 `showError` 来捕获和显示错误。

### 示例 Demo

在这里，我们将创建一个简单的 Nuxt 应用，在其中模拟一个 API 调用错误并使用 `showError` 来处理。

#### 1. 创建新项目

如果你还没有 Nuxt 项目，可以通过以下命令创建一个：

```bash
npx nuxi@latest init my-nuxt-app
cd my-nuxt-app
```

#### 2. 访问页面

在 `pages/index.vue` 文件中添加以下代码：

```vue

<template>
  <div>
    <h1>欢迎来到我的 Nuxt 应用</h1>
    <button @click="fetchData">获取数据</button>
  </div>
</template>

<script setup>

  const fetchData = async () => {
    try {
      // 模拟一个 API 调用
      throw new Error("模拟的网络错误");
    } catch (error) {
      // 使用 showError 显示错误
      showError(error);
    }
  };
</script>
```

### 3. 运行项目

在终端中运行以下命令启动 Nuxt 应用：

```bash
npm run dev
```

访问 `http://localhost:3000` 并点击“获取数据”按钮，你将看到一个全屏错误页面，显示了模拟的网络错误信息。

## 通过 `useError` 管理共享错误状态

如果你需要在多个组件之间共享错误状态，可以使用 `useError` 函数。通过将错误设置到状态中，你可以创建一个响应式的、支持
SSR（服务端渲染）的共享错误状态。

以下是如何使用 `useError` 的简单示例：

```vue

<template>
  <div>
    <h1>错误示例</h1>
    <button @click="triggerError">触发错误</button>
    <p v-if="error">{{ error.message }}</p>
  </div>
</template>

<script setup>

  const error = ref(null);

  // 触发错误的函数
  const triggerError = () => {
    const {setError} = useError();

    // 模拟错误
    const simulatedError = {
      statusCode: 500,
      statusMessage: "服务器内部错误"
    };

    setError(simulatedError);
    showError(simulatedError);
  };
</script>
```

在这个示例中，我们通过按钮触发了共享错误状态，并调用了 `showError` 来显示错误信息。

## 结论

通过使用 Nuxt.js 的 `showError` 和 `useError` 方法，你可以非常方便地处理应用中的错误，提升用户体验。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [使用 setResponseStatus 函数设置响应状态码 | cmdragon's Blog](https://blog.cmdragon.cn/posts/302e9ee7406d6304cf38978e07b4480c/)
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
