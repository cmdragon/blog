---
url: /posts/d5370e880eaec9085a153caba4961676/
title: Nuxt.js头部魔法：轻松自定义页面元信息，提升用户体验
date: 2024-07-16T00:18:53+08:00
updated: 2024-07-16T00:18:53+08:00
author: cmdragon

summary:
  摘要：“Nuxt.js头部魔法：轻松自定义页面元信息，提升用户体验”介绍如何使用useHead函数在Nuxt应用中编程式设置页面头部信息，包括<title>、<meta>、<link>等标签，以增强SEO和用户体验。通过实例展示了如何配置静态和动态标题、元数据、样式、脚本等，使页面更符合SEO标准和个性化需求。

categories:
  - 前端开发

tags:
  - nuxt
  - useHead
  - SEO优化
  - 页面元信息
  - 前端开发
  - Unhead库
  - 动态标题
---

<img src="/images/2024_07_14 17_05_22.png" title="2024_07_14 17_05_22.png" alt="2024_07_14 17_05_22.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## `useHead` 函数概述

`useHead`是一个用于在 Nuxt 应用中自定义页面头部属性的函数。它由`Unhead`库提供支持，允许开发者以编程和响应式的方式设置每个页面的头部信息。

## `useHead` 函数类型

```
useHead(meta: MaybeComputedRef<MetaObject>): void

```

## `MetaObject` 接口

`MetaObject`接口定义了可以传递给`useHead`的属性类型，如下所示：

```
interface MetaObject {
  title?: string;
  titleTemplate?: string | ((title?: string) => string);
  base?: Base;
  link?: Link[];
  meta?: Meta[];
  style?: Style[];
  script?: Script[];
  noscript?: Noscript[];
  htmlAttrs?: HtmlAttributes;
  bodyAttrs?: BodyAttributes;
}
```

## 参数

### `meta`

**类型**：`MetaObject`

`MetaObject`是`Unhead`库中的一个对象类型，用于封装和管理页面头部的元数据。`Unhead`是一个用于构建动态、可配置的 HTML
头部的库，它允许开发者在 Nuxt.js 应用中灵活地控制页面的元信息。

接受以下头部元数据的对象：

### `title`

`title`属性用于设置页面的静态标题。当用户在浏览器中打开页面时，显示在浏览器标签或书签中的标题就是由这个属性决定的。例如，如果你想为你的页面设置标题为“我的页面”，可以这样设置：

```
useHead({
  title: '我的页面'
});

```

### `titleTemplate`

`titleTemplate`属性允许你使用动态模板来生成标题。这可以是一个字符串模板或者一个函数，该函数接收一个参数（通常是当前的标题）并返回一个新的标题字符串。

**字符串模板**：

```
useHead({
  titleTemplate: '这是我的页面 - {{title}}'
});

```

**函数模板**：

```
const getTitle = (title) => `这是我的页面 - ${title}`;
useHead({
  titleTemplate: getTitle
});

```

### `base`

`base`属性用于设置`<base>`标签的属性，通常用于指定页面中相对链接的基础 URL。例如，如果你的页面是`https://example.com`
，并且你有一个链接指向`/blog`，那么使用`<base href="/blog">`可以确保所有相对链接都从`/blog`开始。

```
useHead({
  base: { href: '/blog' }
});

```

### `link`

`link`属性是一个数组，每个元素都是一个`<link>`标签的配置对象。这些对象通常包含`rel`、`href`、`type`
等属性，用于定义外部样式表、脚本文件或其他资源的链接。

```
useHead({
  link: [
    { rel: 'stylesheet', href: '/styles.css' },
    { rel: 'preload', href: '/fonts/roboto.woff2', as: 'font' }
  ]
});

```

### `meta`

`meta`属性也是一个数组，每个元素都是一个`<meta>`标签的配置对象。这些对象通常包含`name`、`content`、`http-equiv`
等属性，用于定义元信息，如描述、关键词、字符集等。

```
useHead({
  meta: [
    { name: 'description', content: '这是一个关于我的页面的描述' },
    { property: 'og:title', content: '我的页面' }
  ]
});

```

### `style`

`style`属性用于直接在页面上插入 CSS 样式。数组中的每个元素都是一个`<style>`标签的配置对象。

```
useHead({
  style: [
    '<style>body { background-color: #f0f0f0; }</style>',
    '<style id="custom-style">h1 { color: #ff0000; }</style>'
  ]
});

```

### `script`

`script`属性用于插入外部脚本文件或直接插入 JavaScript 代码。数组中的每个元素都是一个`<script>`标签的配置对象。

```
useHead({
  script: [
    '<script src="/js/main.js"></script>',
    '<script id="custom-script">console.log("这是自定义脚本");</script>'
  ]
});

```

### `noscript`

`noscript`属性用于在浏览器不支持脚本时显示的内容。数组中的每个元素都是一个`<noscript>`标签的配置对象。

```
useHead({
  noscript: [
    '<p>您的浏览器不支持脚本，请启用脚本以获取最佳体验。</p>'
  ]
});

```

### `htmlAttrs` 和 `bodyAttrs`

`htmlAttrs`和`bodyAttrs`属性分别用于设置`<html>`和`<body>`标签的属性。例如，你可以设置页面的语言属性：

```
useHead({
  htmlAttrs: { lang: 'zh-CN' },
  bodyAttrs: { class: 'body-class' }
});

```

## 示例：

```
<template>
  <div>
    <h1>我的页面</h1>
  </div>
</template>

<script>
export default {
  setup() {
    // 使用 useHead 函数来设置 MetaObject
    useHead({
      // 设置静态页面标题
      title: '我的页面',
      // 配置动态模板以自定义每个页面的标题
      titleTemplate: 'My Website - %s',
      // 设置 <base> 标签的属性
      base: { href: '/app' },
      // 数组中的每个元素都映射到一个新的 <link> 标签
      link: [
        { rel: 'stylesheet', href: '/styles.css' },
        { rel: 'icon', href: '/favicon.ico' }
      ],
      // 数组中的每个元素都映射到一个新的 <meta> 标签
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '这是我的页面描述' }
      ],
      // 数组中的每个元素都映射到一个新的 <style> 标签
      style: [
        { cssText: 'body { background-color: #f0f0f0; }' }
      ],
      // 数组中的每个元素都映射到一个新的 <script> 标签
      script: [
        { src: '/js/app.js', type: 'text/javascript' }
      ],
      // 设置 <noscript> 标签的内容
      noscript: [
        '本页面需要 JavaScript 来正确显示。请启用 JavaScript 后再试。'
      ],
      // 设置 <html> 标签的属性
      htmlAttrs: {
        lang: 'zh-CN'
      },
      // 设置 <body> 标签的属性
      bodyAttrs: {
        class: 'my-body-class'
      }
    });
  }
};
</script>
```


## 往期文章归档：

- [探索Nuxt.js的useFetch：高效数据获取与处理指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/29ff9113e98725ee69fa0148a47ae735/)
- [Nuxt.js 错误侦探：useError 组合函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b73679558bc672550fbbb72ae295fdf5/)
- [useCookie函数：管理SSR环境下的Cookie | cmdragon's Blog](https://blog.cmdragon.cn/posts/cd361e1a7930614f1aaf46ad35b28958/)
- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
- [使用 `useAppConfig` ：轻松管理应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9e044d4b53eab6a1bec49bb86b4c856c/)
- [Nuxt框架中内置组件详解及使用指南（五） | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff42c6a570627402dbbdd82adbb2ed2a/)
- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
- [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/4807b70f6729c39ff090d7e8ac1e2f6d/)
- [Nuxt3 的生命周期和钩子函数（十） | cmdragon's Blog](https://blog.cmdragon.cn/posts/df209e19c18baa3bc7e0ebfa473099d8/)
- [Nuxt3 的生命周期和钩子函数（九） | cmdragon's Blog](https://blog.cmdragon.cn/2024-07-02/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B9%9D%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
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
