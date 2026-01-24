---
url: /posts/4c7fb169913298de59cbe19fcbaac8d3/
title: 如何在 Nuxt 中动态设置页面布局
date: 2024-08-24T00:18:53+08:00
updated: 2024-08-24T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文介绍如何在Nuxt框架中通过设置setPageLayout函数动态调整页面布局，包括安装Nuxt、创建不同布局文件及中间件，并通过示例演示如何根据不同路径设置相应布局。

categories:
  - 前端开发

tags:
  - Nuxt
  - 布局
  - 动态
  - 设置
  - 中间件
  - 路由
  - 页面
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_08_24 09_28_57.png" title="2024_08_24 09_28_57.png" alt="2024_08_24 09_28_57.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

在使用 Nuxt 框架开发应用时，页面的布局往往是固定的，但有时我们可能需要根据不同的页面或条件来动态调整布局。

## 1. 什么是页面布局

在 Nuxt 中，页面布局是指页面的整体外观和结构，比如头部、导航、侧边栏以及底部等。使用布局可以帮助我们更好地管理页面样式和结构。

## 2. 使用 setPageLayout

`setPageLayout` 是一个用于动态设置页面布局的函数。需要注意的是，此函数只能在组件的 `setup`
函数、插件或路由中间件中使用。例如，我们可以根据用户的访问路径来设置不同的布局。

## 3. 基本使用方法

### 安装 Nuxt

首先，确保你已经安装了 Nuxt。你可以使用以下命令创建一个新的 Nuxt 项目：

```bash
npx nuxi@latest init nuxt-dynamic-layout
cd nuxt-dynamic-layout
npm install
```

### 创建布局文件

在 `layouts` 文件夹中创建两个布局文件，它们将用于不同的页面布局：

**layouts/default.vue**

```vue

<template>
  <div>
    <header>默认布局的头部</header>
    <nuxt/>
    <footer>默认布局的底部</footer>
  </div>
</template>
```

**layouts/other.vue**

```vue

<template>
  <div>
    <header>其它布局的头部</header>
    <nuxt/>
    <footer>其它布局的底部</footer>
  </div>
</template>
```

### 创建中间件

接下来，我们将创建一个中间件来动态设置布局。首先，在 `middleware` 文件夹中创建一个新的文件 `custom-layout.ts`。

**middleware/custom-layout.ts**

```typescript
export default defineNuxtRouteMiddleware((to) => {
    // 根据访问的路径设置布局
    if (to.path === '/other') {
        setPageLayout('other');
    } else {
        setPageLayout('default');
    }
});
```

### 创建页面

现在我们需要创建两个页面，分别使用默认布局和其他布局。在 `pages` 文件夹中创建两个新的页面：

**pages/index.vue**

```vue

<template>
  <div>
    <h1>首页</h1>
    <nuxt-link to="/other">前往其它页面</nuxt-link>
  </div>
</template>
```

**pages/other.vue**

```vue

<template>
  <div>
    <h1>其它页面</h1>
    <nuxt-link to="/">返回首页</nuxt-link>
  </div>
</template>
```

### 配置中间件

最后一步是在 `nuxt.config.ts` 中配置我们的中间件，使其在路由导航时被调用。

**nuxt.config.ts**

```typescript
export default defineNuxtConfig({
    router: {
        middleware: ['custom-layout']
    }
});
```

## 4. 运行项目

完成以上步骤后，你可以通过以下命令启动 Nuxt 项目：

```bash
npm run dev
```

打开浏览器，访问 `http://localhost:3000`。你会看到首页使用的是默认布局，点击链接进入其它页面时，页面布局将变为其它布局。

## 5. 结论

通过上述步骤，你已经了解到如何在 Nuxt 项目中动态设置页面布局。掌握这一功能可以使你的应用更加灵活，能够根据用户的需求展示不同的页面布局。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [使用 abortNavigation 阻止导航 | cmdragon's Blog](https://blog.cmdragon.cn/posts/52bba0b4e019da067ec5092a151c2bce/)
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
