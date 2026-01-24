---
url: /posts/214c7ef07a7b90e1787f10ea626320e3/
title: Nuxt框架中内置组件详解及使用指南（一）
date: 2024-07-06T00:18:53+08:00
updated: 2024-07-06T00:18:53+08:00
author: cmdragon

summary:
  本文详细介绍了Nuxt框架中的两个内置组件<ClientOnly>和<NuxtClientFallback>的使用方法与功能。<ClientOnly>确保包裹的内容仅在客户端渲染，适用于处理浏览器特定功能或异步数据加载。而<NuxtClientFallback>是一个实验性组件，用于在SSR过程中遇到子组件错误时，在客户端渲染备选内容，提高应用稳定性。文章通过示例代码展示了这两个组件的具体应用方式和相关属性配置。

categories:
  - 前端开发

tags:
  - Nuxt
  - SSR
  - 客户端渲染
  - 内置组件
  - 异步加载
  - 错误处理
  - 前端开发
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_06 15_23_11.png" title="2024_07_06 15_23_11.png" alt="2024_07_06 15_23_11.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


## 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## **Nuxt 3 中`<ClientOnly>`组件的使用指南与示例**

在 Nuxt 3 中，`<ClientOnly>`组件是一个非常有用的工具，它允许开发者确保某些组件或内容只在客户端渲染。这在处理需要客户端特定环境的功能时特别有用，比如与浏览器直接交互的功能或者需要异步加载的数据。

### 1. `<ClientOnly>` 组件简介

`<ClientOnly>`组件的主要作用是确保其包裹的内容只在客户端渲染，而不是在服务器端渲染（SSR）。这对于避免在服务器端执行不必要或无法执行的操作非常有用。

### 2. 如何使用 `<ClientOnly>`

#### 2.1 安装和设置

确保你的项目已经安装了 Nuxt 3。如果没有，可以按照 Nuxt 官方文档进行安装。

#### 2.2 在模板中使用 `<ClientOnly>`

以下是如何在 Nuxt 页面或组件中使用`<ClientOnly>`的基本步骤：

```vue

<template>
  <div>
    <Sidebar/>
    <ClientOnly fallback-tag="span" fallback="加载评论中...">
      <Comment/>
    </ClientOnly>
  </div>
</template>

```

在上面的代码中，`<Comment>`组件将只在客户端渲染。如果服务器端尝试渲染这个组件，将显示`fallback`属性指定的内容，即 "
加载评论中..."，并且使用`fallback-tag`指定的标签（这里是`<span>`）。

### 3. 使用 `<ClientOnly>` 的 Props 和 Slots

`<ClientOnly>`组件支持一些 Props 和 Slots，以提供更多的灵活性。

#### 3.1 Props

- `placeholderTag`: 指定在服务器端渲染的标签，默认为`div`。
- `fallbackTag`: 指定在服务器端渲染的标签，默认为`div`。
- `placeholder`: 指定在服务器端渲染的内容，默认为空字符串。
- `fallback`: 指定在服务器端渲染的内容，默认为空字符串。

#### 3.2 Slots

- `#fallback`: 指定在服务器端显示的内容。

### 4. Demo 示例

下面是一个完整的示例，展示如何在 Nuxt 页面中使用`<ClientOnly>`组件：

#### 4.1 创建 `Sidebar` 组件

首先，创建一个简单的`Sidebar`组件：

```vue
<!-- components/Sidebar.vue -->
<template>
  <div class="sidebar">
    <h2>侧边栏</h2>
    <p>这是侧边栏内容。</p>
  </div>
</template>

<style scoped>
  .sidebar {
    background-color: #f4f4f4;
    padding: 20px;
  }
</style>
```

#### 4.2 创建 `Comment` 组件

接着，创建一个`Comment`组件：

```vue
<!-- components/Comment.vue -->
<template>
  <div class="comment">
    <h3>评论</h3>
    <p>这是评论内容。</p>
  </div>
</template>

<style scoped>
  .comment {
    background-color: #fff;
    padding: 20px;
  }
</style>
```

#### 4.3 在页面中使用 `<ClientOnly>`

最后，在页面中使用`<ClientOnly>`组件：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <Sidebar/>
    <ClientOnly fallback-tag="span" fallback="加载评论中...">
      <Comment/>
    </ClientOnly>
  </div>
</template>

<script>
  import Sidebar from '~/components/Sidebar.vue';
  import Comment from '~/components/Comment.vue';

  export default {
    components: {
      Sidebar,
      Comment
    }
  };
</script>

<style>
  /* 页面样式 */
</style>
```

在这个示例中，`<Sidebar>`组件将在服务器端和客户端都渲染，而`<Comment>`组件将只在客户端渲染。如果服务器端尝试渲染`<Comment>`
组件，将显示 "加载评论中..." 文本。

## **Nuxt 中`<NuxtClientFallback>`组件的使用指南与示例**

在 Nuxt 中，`<NuxtClientFallback>`
是一个实验性组件，它允许开发者在服务器端渲染（SSR）过程中，如果遇到子组件触发错误时，在客户端渲染指定的后备内容。这个功能对于那些在服务器端无法正常工作但在客户端可以正常运行的组件非常有用。

### 1. `<NuxtClientFallback>` 组件简介

`<NuxtClientFallback>`组件用于处理在 SSR 过程中出现的错误，它允许你指定一个后备内容，在遇到错误时在客户端显示。

### 2. 如何使用 `<NuxtClientFallback>`

#### 2.1 启用实验性功能

要使用`<NuxtClientFallback>`组件，你需要在`nuxt.config`文件中启用`clientFallback`选项：

```javascript
// nuxt.config.js
export default {
    experimental: {
        clientFallback: true
    }
};

```

#### 2.2 在模板中使用 `<NuxtClientFallback>`

以下是如何在 Nuxt 页面或组件中使用`<NuxtClientFallback>`的基本步骤：

```vue

<template>
  <NuxtClientFallback @ssr-error="logSomeError">
    <!-- 这里放置可能触发SSR错误的组件 -->
    <BrokeInSsr/>
  </NuxtClientFallback>
</template>

<script>
  export default {
    methods: {
      logSomeError(error) {
        console.error('SSR错误:', error);
      }
    }
  };
</script>

```

在上面的代码中，如果`<BrokeInSsr>`组件在 SSR 过程中触发错误，`@ssr-error`事件将被触发，并且`logSomeError`方法将被调用。

### 3. `<NuxtClientFallback>` 的属性和事件

`<NuxtClientFallback>`支持以下属性和事件：

- `placeholderTag | fallbackTag`: 指定一个后备标签，在插槽无法渲染时将其渲染。类型为`string`，默认值为`div`。
- `placeholder | fallback`: 指定后备内容，在插槽无法渲染时将其渲染。类型为`string`。
- `keepFallback`: 如果后备内容在服务器端无法渲染，是否保留后备内容。类型为`boolean`，默认值为`false`。
- `@ssr-error`: 当子组件在 SSR 中触发错误时，触发的事件。请注意，这只会在服务器端触发。

### 4. Demo 示例

下面是一个完整的示例，展示如何在 Nuxt 页面中使用`<NuxtClientFallback>`组件：

#### 4.1 创建可能触发错误的组件

首先，创建一个可能会在 SSR 中触发错误的组件：

```vue
<!-- components/BrokeInSsr.vue -->
<template>
  <div>
    <!-- 这里有一些可能会在SSR中出错的代码 -->
  </div>
</template>

<script>
  export default {
    mounted() {
      // 假设这里有代码在SSR中无法执行
      throw new Error('SSR错误');
    }
  };
</script>
```

#### 4.2 在页面中使用 `<NuxtClientFallback>`

接着，在页面中使用`<NuxtClientFallback>`组件：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <NuxtClientFallback fallback-tag="span" fallback="Hello world">
      <BrokeInSsr/>
    </NuxtClientFallback>
  </div>
</template>

<script>
  import BrokeInSsr from '~/components/BrokeInSsr.vue';

  export default {
    components: {
      BrokeInSsr
    }
  };
</script>
```

在这个示例中，如果`<BrokeInSsr>`组件在 SSR 过程中触发错误，将显示 "Hello world" 文本。

### 5. 使用插槽指定后备内容

你也可以使用`<template #fallback>`插槽来指定后备内容：

```vue

<template>
  <NuxtClientFallback>
    <BrokeInSsr/>
    <template #fallback>
      <!-- 如果默认插槽在SSR中无法渲染，将在服务器端渲染这段内容 -->
      <p>Hello world</p>
    </template>
  </NuxtClientFallback>
</template>

```

通过这个指南和示例，你应该能够理解并开始在 Nuxt 项目中使用`<NuxtClientFallback>`
组件。请记住，这是一个实验性功能，可能在未来的版本中发生变化。如果你遇到任何问题，可以查阅 Nuxt 官方文档或向社区寻求帮助。


## 往期文章归档：

- [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/4807b70f6729c39ff090d7e8ac1e2f6d/)
- [Nuxt3 的生命周期和钩子函数（十） | cmdragon's Blog](https://blog.cmdragon.cn/posts/df209e19c18baa3bc7e0ebfa473099d8/)
- [Nuxt3 的生命周期和钩子函数（九） | cmdragon's Blog](https://blog.cmdragon.cn/2024-07-02/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B9%9D%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（七） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%83%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（六） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AD%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（五） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-28/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%94%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（四） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-27/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%9B%9B%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（三） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-26/front_end/%20nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%89%EF%BC%89/#%E5%BE%80%E6%9C%9F%E6%96%87%E7%AB%A0%E5%BD%92%E6%A1%A3%EF%BC%9A)
- [Nuxt3 的生命周期和钩子函数（二） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-25/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%8C%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（一） | cmdragon’s Blog](https://blog.cmdragon.cn/2024-06-24/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%80%EF%BC%89/)
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
- [深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-22/front_end/%E6%B7%B1%E5%85%A5%E6%8E%A2%E7%B4%A2%20nuxt3%20composables%EF%BC%9A%E6%8E%8C%E6%8F%A1%E7%9B%AE%E5%BD%95%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%86%85%E7%BD%AEapi%E7%9A%84%E9%AB%98%E6%95%88%E5%BA%94%E7%94%A8/)
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
