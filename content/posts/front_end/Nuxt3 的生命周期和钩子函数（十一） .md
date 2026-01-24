---
url: /posts/1229fdac282a0baba2576f73c41b4f0e/
title: Nuxt3 的生命周期和钩子函数（十一）
date: 2024-07-05T00:18:53+08:00
updated: 2024-07-05T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详细介绍了Nuxt3中几个关键的生命周期钩子和它们的使用方法，包括webpack:done用于Webpack编译完成后执行操作，webpack:progress监听编译进度，render:response和render:html分别在响应发送前后修改响应内容，以及render:island针对岛屿组件的HTML渲染前的修改，提供了具体的示例代码和应用情景。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - Webpack
  - 渲染过程
  - 响应修改
  - 前端开发
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_05 18_04_41.png" title="2024_07_05 18_04_41.png" alt="2024_07_05 18_04_41.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

## 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## webpack:done

### 参数

-   无参数

### 详细描述

`webpack:done` 钩子在 WebpackBar 的 `allDone` 事件上被调用。这个钩子用于在 Webpack 编译完成后执行一些操作，例如清理资源、输出编译结果等。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `webpack:done` 钩子：

```javascript
// plugins/webpackDone.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('webpack:done', () => {
    // 在这里可以执行一些编译完成后的操作
    console.log('Webpack 编译完成');
  });
});

```

在这个示例中，我们注册了一个 `webpack:done` 钩子，当 Webpack 编译完成后，钩子函数会被调用，并输出编译完成的信息。这样，开发者可以得知 Webpack 编译已经结束，并可以进行一些后续的操作。

通过使用 `webpack:done` 钩子，开发者可以在 Webpack 编译完成后执行一些自定义操作，例如清理临时文件、输出编译结果等。



## webpack:progress

### 参数

-   `statesArray`: 一个包含当前编译状态的数组。

### 详细描述

`webpack:progress` 钩子在 WebpackBar 的 `progress` 事件上被调用。这个钩子用于监听 Webpack 编译的进度，它提供了一个包含编译状态的数组，可以用来显示编译进度或者执行与进度相关的操作。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `webpack:progress` 钩子：

```javascript
// plugins/webpackProgress.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('webpack:progress', (statesArray) => {
    // statesArray 包含了当前编译的进度信息
    statesArray.forEach((state) => {
      // 例如，我们可以输出每个编译阶段的百分比
      console.log(`编译进度：${state.percent} %`);
    });
  });
});

```

在这个示例中，我们注册了一个 `webpack:progress` 钩子，当 Webpack 编译过程中发生进度变化时，钩子函数会被调用，并传入一个包含当前编译状态的数组。在这个数组中，我们可以访问每个阶段的进度信息，例如当前完成的百分比。

通过使用 `webpack:progress` 钩子，开发者可以实时获取 Webpack 编译的进度，并根据需要执行一些操作，比如更新 UI 来显示编译进度条。



## render:response

### 参数

-   `response`: 当前请求的响应对象。
-   `{ event }`: 一个包含事件信息的对象。

### 详细描述

`render:response` 钩子在发送响应之前被调用。这个钩子允许开发者在响应被发送回客户端之前对其进行修改或添加额外的逻辑。`response` 参数是当前请求的响应对象，而 `event` 参数包含了与请求相关的事件信息。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `render:response` 钩子：

```javascript
// plugins/renderResponse.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('render:response', (response, { event }) => {
    // 在这里，我们可以访问和修改响应对象
    // 例如，我们可以添加一个自定义的响应头
    response.headers['X-Custom-Header'] = 'Custom Value';

    // 我们也可以根据事件信息执行一些操作
    // 例如，记录请求的URL
    console.log(`请求URL：${event.req.url}`);
  });
});

```

在这个示例中，我们注册了一个 `render:response` 钩子，当 Nuxt 准备发送响应时，钩子函数会被调用。我们通过修改 `response` 对象的 `headers` 属性来添加一个自定义的响应头。同时，我们也可以通过 `event` 对象访问请求的详细信息，例如请求的 URL。

通过使用 `render:response` 钩子，开发者可以在响应发送之前执行一些必要的数据处理，或者根据请求的不同进行特定的逻辑处理。



## render:html

### 参数

-   `html`: 即将发送给客户端的 HTML 字符串。
-   `{ event }`: 一个包含事件信息的对象，例如请求对象。

### 详细描述

`render:html` 钩子在构建 HTML 并在发送给客户端之前被调用。这个钩子允许开发者在 HTML 字符串被渲染到页面之前对其进行操作，比如注入额外的脚本或样式，修改 HTML 内容等。`html` 参数是即将发送的 HTML 字符串，而 `event` 参数包含了与请求相关的事件信息。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `render:html` 钩子：

```javascript
// plugins/renderHtml.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('render:html', (html, { event }) => {
    // 在这里，我们可以修改即将发送的 HTML 字符串
    // 例如，我们可以向 HTML 中注入一个自定义的 script 标签
    const scriptInjection = `<script>console.log('自定义脚本注入');</script>`;
    html = html.replace('<!-- 自定义脚本注入位置 -->', scriptInjection);

    // 我们也可以根据事件信息执行一些操作
    // 例如，记录请求的URL
    console.log(`请求URL：${event.req.url}`);

    // 返回修改后的 HTML 字符串
    return html;
  });
});

```

在这个示例中，我们注册了一个 `render:html` 钩子，当 Nuxt 准备发送 HTML 到客户端时，钩子函数会被调用。我们通过替换 HTML 字符串中的特定注释位置来注入自定义的 script 标签。此外，我们还可以通过 `event` 对象访问请求的详细信息，例如请求的 URL。

使用 `render:html` 钩子可以让我们对最终的 HTML 输出进行控制，这对于添加分析代码、跟踪代码或者其他需要在页面加载前就存在的脚本非常有用。


## render:island

### 参数

-   `islandResponse`: 表示land的响应对象，包含land的 HTML 内容。
-   `{ event }`: 包含事件信息的对象，例如请求对象。
-   `islandContext`: 包含land上下文信息的对象，例如岛屿的名称和属性。

### 详细描述

`render:island` 钩子在构建岛屿（island）HTML 之前被调用。岛屿是 Nuxt 中的一个概念，允许开发者将某些组件或部分页面作为独立的岛屿来渲染，以便于优化性能，例如通过懒加载。这个钩子允许开发者在岛屿 HTML 被渲染之前对其进行操作，比如修改岛屿内容或添加额外的脚本和样式。

`islandResponse` 参数包含了岛屿的 HTML 内容，可以通过这个对象来修改岛屿的输出。`event` 参数提供了与请求相关的事件信息，而 `islandContext` 参数提供了关于岛屿本身的信息。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `render:island` 钩子：

```javascript
// plugins/renderIsland.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('render:island', (islandResponse, { event }, islandContext) => {
    // 在这里，我们可以修改岛屿的 HTML 内容
    // 例如，我们可以向岛屿 HTML 中添加额外的 class
    islandResponse.html = islandResponse.html.replace('<div', '<div class="custom-class"');

    // 我们也可以根据事件信息执行一些操作
    // 例如，记录请求的URL和岛屿的名称
    console.log(`请求URL：${event.req.url}`);
    console.log(`岛屿名称：${islandContext.name}`);

    // 返回修改后的岛屿响应对象
    return islandResponse;
  });
});

```

在这个示例中，我们注册了一个 `render:island` 钩子，当 Nuxt 准备渲染一个岛屿时，钩子函数会被调用。我们通过修改 `islandResponse.html` 来给岛屿的根元素添加了一个自定义的 class。此外，我们还通过 `event` 和 `islandContext` 对象来记录请求的 URL 和岛屿的名称。

使用 `render:island` 钩子可以让我们对页面中的各个岛屿进行细粒度的控制，这对于优化页面加载性能和实现特定的页面功能非常有帮助。


## 往期文章归档：

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
- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
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
