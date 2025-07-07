---
url: /posts/9032c61e840462c63717de392173b4f5/
title: Nuxt框架中内置组件详解及使用指南（四）
date: 2024-07-09T00:18:53+08:00
updated: 2024-07-09T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详细介绍了Nuxt 3框架中的两个内置组件：<NuxtErrorBoundary>和<NuxtIsland>的使用方法与示例。<NuxtErrorBoundary>用于捕获并处理客户端错误，提供了错误处理和自定义错误展示的功能；而<NuxtIsland>是一个实验性组件，用于渲染无客户端JavaScript的静态内容，以优化页面加载速度。文章包含组件的基本用法、配置步骤以及完整实例代码，有助于开发者高效利用这些组件提升Nuxt应用的性能与用户体验。

categories:
  - 前端开发

tags:
  - nuxt
  - 错误处理
  - 组件
  - 静态内容
  - 前端
  - Vue
  - 实验特性
---

<img src="/images/2024_07_09 19_20_48.png" title="2024_07_09 19_20_48.png" alt="2024_07_09 19_20_48.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


## 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



## **Nuxt 3 中`<NuxtErrorBoundary>`组件的使用指南与示例**

`<NuxtErrorBoundary>`组件用于处理在其默认插槽中发生的客户端错误。NuxtErrorBoundary 在底层使用了 Vue 的 `onErrorCaptured` 钩子。

在模板中，将 NuxtErrorBoundary 组件作为父组件，并将需要捕获错误的组件放入其默认插槽中：

```vue
<template>
  <NuxtErrorBoundary @error="logSomeError">
    <!-- 这里放入可能抛出错误的组件 -->
  </NuxtErrorBoundary>
</template>
```

###  处理错误

在 NuxtErrorBoundary 组件上，我们可以监听 `error` 事件来处理捕获到的错误：

```vue
<script>
export default {
  methods: {
    logSomeError(error) {
      console.error('捕获到错误：', error);
    }
  }
};
</script>

```

### 自定义错误显示

如果需要自定义错误显示内容，可以使用 `#error` 插槽。当错误发生时，插槽会传入一个包含错误信息的对象：

```vue
<template>
  <NuxtErrorBoundary>
    <!-- ... -->
    <template #error="{ error }">
      <p>发生错误：{{ error.message }}</p>
    </template>
  </NuxtErrorBoundary>
</template>
```

### 示例

以下是一个简单的示例，展示了如何使用 NuxtErrorBoundary 来捕获并处理错误：

```vue
<template>
  <div>
    <NuxtErrorBoundary @error="logSomeError">
      <template #error="{ error }">
        <p>发生错误：{{ error.message }}</p>
      </template>
      <div @click="throwError">
        点击这里抛出错误
      </div>
    </NuxtErrorBoundary>
  </div>
</template>

<script>
export default {
  methods: {
    throwError() {
      throw new Error('这是一个错误！');
    },
    logSomeError(error) {
      console.error('捕获到错误：', error);
    }
  }
};
</script>
```

在这个示例中，我们创建了一个按钮，点击按钮会抛出一个错误。NuxtErrorBoundary 组件捕获了这个错误，并通过 `#error` 插槽显示错误信息。



### 完整实例
#### 1. 创建一个页面

在`pages`目录下创建一个新文件，例如`index.vue`，并将你提供的代码粘贴进去：

```vue
<template>
  <NuxtErrorBoundary>
    <!-- 这里放置你的页面内容 -->
    <div>
      <!-- 假设这里有一个可能会抛出错误的组件或代码 -->
      <button @click="doSomething">执行操作</button>
    </div>

    <!-- 自定义错误处理 -->
    <template #error="{ error }">
      <p>发生错误：{{ error }}</p>
    </template>
  </NuxtErrorBoundary>
</template>

<script setup>
import { ref } from 'vue';

// 假设这是一个可能会抛出错误的函数
function doSomething() {
  const randomNumber = Math.random();
  if (randomNumber < 0.5) {
    throw new Error('随机错误发生了！');
  } else {
    console.log('操作成功！');
  }
}
</script>
```

#### 2. 解释代码

-   `<NuxtErrorBoundary>`：这是Nuxt 3提供的一个组件，用于捕获其内部发生的错误。
-   `<template #error="{ error }">`：这是一个命名插槽，用于自定义错误信息的展示方式。`{ error }`是传递给插槽的上下文，其中包含了错误对象。
-   `doSomething`函数：这是一个示例函数，它通过随机数来决定是否抛出错误。

#### 3. 运行应用

在项目根目录下运行以下命令来启动开发服务器：

```
npm run dev

```

打开浏览器并访问`http://localhost:3000`，然后点击“执行操作”按钮。如果`doSomething`函数抛出了错误，`<NuxtErrorBoundary>`将捕获这个错误，并通过自定义的错误插槽显示错误信息。

#### 4. 注意事项

-   确保你的Nuxt 3项目配置正确，并且`nuxt.config.ts`文件中已经配置了`errorBoundary`。
-   你可以根据需要自定义错误插槽的样式和内容，以便更好地适应你的应用程序的设计和用户界面。

通过这种方式，你可以优雅地处理页面中可能发生的错误，并提供给用户更友好的错误反馈。



## **Nuxt 3 中`<NuxtIsland>`组件的使用指南与示例**

`<NuxtIsland>` 是一个实验性组件，它允许开发者渲染一个不包含任何客户端 JavaScript 的非交互式组件。这种组件非常适合用于展示静态内容，因为它不会在客户端下载任何 JavaScript，从而加快页面加载速度。

### 1. 前提条件

在使用 `<NuxtIsland>` 组件之前，你需要确保以下几点：

-   你的项目是基于 Nuxt.js 的。
-   你已经安装了最新版本的 Nuxt.js。
-   你的 `nuxt.config.js` 文件中启用了 `experimental.componentIslands` 选项。

### 2. 配置 Nuxt

首先，打开你的 `nuxt.config.js` 文件，并添加以下配置：

```javascript
export default defineNuxtConfig({
  experimental: {
    componentIslands: true // false 或 'local+remote'
  }
})

```

如果你想要使用远程岛屿，你还需要将 `componentIslands` 设置为 `'local+remote'`。

### 3. 使用 `<NuxtIsland>` 组件

接下来，你可以在你的页面或组件中使用 `<NuxtIsland>` 组件。以下是一个简单的示例：

### 示例：创建一个静态内容NuxtIsland

首先，创建一个新的 Vue 组件 `StaticContent.vue`：

```vue
<template>
  <div class="static-content">
    <h1>静态内容NuxtIsland</h1>
    <p>这是一个不包含任何客户端 JavaScript 的静态内容岛屿。</p>
  </div>
</template>

<script>
export default {
  name: 'StaticContent'
}
</script>

<style scoped>
.static-content {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

然后，在你的页面或另一个组件中，使用 `<NuxtIsland>` 来渲染这个静态内容岛屿：

```vue
<template>
  <div>
    <h2>主页面内容</h2>
    <NuxtIsland name="StaticContent" />
  </div>
</template>
```

#### 属性和插槽

-   `name`：这是必填属性，指定要渲染的组件名称。
-   `lazy`：可选属性，如果设置为 `true`，组件将非阻塞加载。
-   `props`：可选属性，允许你传递额外的属性给岛屿组件。
-   `source`：可选属性，用于指定远程岛屿的源。
-   `#fallback`：插槽，用于指定在岛屿加载之前或无法获取组件时要渲染的内容。

#### 示例：使用插槽

如果你想要在岛屿加载之前显示一些内容，可以使用 `#fallback` 插槽：

```vue
<template>
  <div>
    <h2>主页面内容</h2>
    <NuxtIsland name="StaticContent" #fallback>
      <p>岛屿内容正在加载...</p>
    </NuxtIsland>
  </div>
</template>
```


### 完整实例

#### 步骤 1: 创建岛屿组件

首先，创建一个名为 `StaticIsland.vue` 的新 Vue 组件文件在你的 Nuxt.js 项目的 `components` 目录下：

```vue
<!-- components/StaticIsland.vue -->
<template>
  <div class="static-island">
    <h2>这是岛屿组件</h2>
    <p>这个组件是静态的，不包含任何客户端 JavaScript。</p>
  </div>
</template>

<script>
export default {
  name: 'StaticIsland'
}
</script>

<style scoped>
.static-island {
  background-color: #e9ecef;
  padding: 20px;
  border-radius: 5px;
  margin: 20px;
}
</style>
```

#### 步骤 2: 配置 Nuxt.js

确保你的 `nuxt.config.js` 文件启用了 `experimental.componentIslands`：

```javascript
// nuxt.config.js
export default defineNuxtConfig({
  experimental: {
    componentIslands: true // false 或 'local+remote'
  }
})
```

#### 步骤 3: 在页面中使用 `<NuxtIsland>`

在你的 Nuxt.js 页面文件中，例如 `index.vue`，使用 `<NuxtIsland>` 组件来渲染 `StaticIsland` 组件：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>欢迎来到我的 Nuxt.js 应用</h1>
    <NuxtIsland name="StaticIsland" />
  </div>
</template>

<script>
export default {
  // 你可以在这里导入 StaticIsland 组件，但不是必需的
  // 因为 NuxtIsland 会自动查找组件
}
</script>

<style>
/* 页面的全局样式 */
</style>
```

#### 步骤 4: 运行你的 Nuxt.js 应用

在命令行中运行以下命令来启动你的 Nuxt.js 开发服务器：

```
npm run dev

```

或者如果你使用的是 yarn：

```
yarn dev

```

现在，当你访问你的 Nuxt.js 应用的首页时，你应该会看到页面上有一个静态的岛屿组件，它是由 `<NuxtIsland>` 渲染的。


## 往期文章归档：

- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
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
