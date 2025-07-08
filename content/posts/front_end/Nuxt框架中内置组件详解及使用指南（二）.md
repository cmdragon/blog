---
url: /posts/658c8df0cd7e59fe7606507b14b2c37c/
title: Nuxt框架中内置组件详解及使用指南（二）
date: 2024-07-07T00:18:53+08:00
updated: 2024-07-07T00:18:53+08:00
author: cmdragon

summary:
  摘要：“本文详细介绍了Nuxt 3中<NuxtPage>和<NuxtLayout>组件的使用方法，包括组件的基本概念、属性、自定义属性、获取引用以及完整示例，展示了如何在Nuxt项目中有效利用这两个组件。

categories:
  - 前端开发

tags:
  - nuxt
  - 组件
  - Vue
  - 前端
  - 开发
  - 教程
  - 代码
---

<img src="/images/2024_07_07 16_14_30.png" title="2024_07_07 16_14_30.png" alt="2024_07_07 16_14_30.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


## 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## **Nuxt 3 中`<NuxtPage>`组件的使用指南与示例**

`<NuxtPage>`组件用于显示位于pages/目录中的页面。

### **一、 组件的基本概念**

组件是 Nuxt 内置的，它实际上是对 Vue Router 的 `<RouterView>` 组件的封装。这意味着它承担着根据路由规则来正确显示相应页面内容的重要职责。

### **二、 组件的属性**

1. `name` 属性

    -   类型：字符串
    -   作用：告诉 RouterView 在匹配的路由记录的组件选项中使用对应名称渲染组件。
    -   示例：如果您有多个具有不同名称的页面组件，通过设置 `name` 属性可以准确指定要渲染的组件。

2. `route` 属性

    -   类型：`RouteLocationNormalized`
    -   作用：提供已解析的所有组件的路由位置信息。

3. `pageKey` 属性

    -   类型：可以是字符串或函数

    -   作用：控制 组件何时重新渲染。

    -   示例：

        -   传递 `static` 键， 组件在挂载时只会渲染一次。

        ```vue
        <template>
          <NuxtPage page-key="static" />
        </template>
        
        ```

        -   使用基于当前路由的动态键，如 `route => route.fullPath` 。

        ```vue
        <NuxtPage :page-key="route => route.fullPath" />
        
        ```

需要特别注意的是，在使用 `pageKey` 时，不要使用 `$route` 对象，因为这可能会在 与 一起渲染页面时引发问题。

此外，`pageKey` 还可以通过 `pages` 目录中的 Vue 组件的 `definePageMeta` 来传递。

### **三、获取页面组件的引用**

要获取 组件的引用，可以通过以下方式：

```vue
<template>
  <NuxtPage ref="page" />
</template>

<script setup>
const page = ref()

function logFoo () {
  page.value.pageRef.foo()
}
</script>

```

在上述代码中，我们定义了一个名为 `page` 的引用，并通过 `page.value.pageRef` 来访问页面组件的相关方法或属性。

### **四、自定义属性**

组件还支持自定义属性，您可以根据需要向下传递这些属性。并且可以通过 Nuxt 应用的 `attrs` 来访问这些自定义属性。

例如：

```
<NuxtPage :foobar="123" />

```

在模板中可以使用 `$attrs.foobar` ，或者在脚本中使用 `useAttrs().foobar` 来获取其值。
    
    
### 完整示例：
    
#### 步骤 1: 创建一个 Nuxt.js 项目

首先，你需要安装 Node.js 和 npm。然后，你可以使用以下命令创建一个新的 Nuxt.js 项目：

```
npx create-nuxt-app my-nuxt-project

```

按照提示完成安装和配置。

#### 步骤 2: 创建一个页面组件

在 `pages/` 目录下，创建一个新的页面组件，例如 `about.vue`：

```vue
<template>
  <div>
    <h1>About Page</h1>
    <p>This is the about page.</p>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
/* 在这里添加页面样式 */
</style>
```

#### 步骤 3: 在页面中使用 `<NuxtPage>` 组件

现在，我们可以在父组件中使用 `<NuxtPage>` 来渲染 `about.vue` 页面。在 `pages/index.vue` 中添加以下代码：

```vue
<template>
  <div>
    <h1>Welcome to Nuxt.js</h1>
    <NuxtPage />
  </div>
</template>

<script>
export default {
  name: 'IndexPage'
}
</script>

<style scoped>
/* 在这里添加页面样式 */
</style>
```

在这个例子中，`<NuxtPage>` 会自动加载并渲染 `about.vue` 组件，因为 `index.vue` 是 Nuxt.js 的默认入口页面。

#### 步骤 4: 运行项目并查看结果

在项目根目录下，运行以下命令来启动开发服务器：

```
npm run dev

```

打开浏览器并访问 `http://localhost:3000`，你应该能看到一个欢迎标题和一个由 `<NuxtPage>` 渲染的关于页面。
    
    
    
## **Nuxt 3 中`<NuxtLayout>`组件的使用指南与示例**


Nuxt 提供了 `<NuxtLayout>` 组件来在页面和错误页面上显示布局。    
    
### 基础用法

首先，让我们看看如何在 `app.vue` 或 `error.vue` 中使用 `<NuxtLayout>` 来激活默认布局。

**app.vue 示例：**

```vue
<template>
  <NuxtLayout>
    <!-- 页面内容放在这里 -->
    <div>这是页面内容</div>
  </NuxtLayout>
</template>
```

在上面的代码中，`<NuxtLayout>` 组件被用作包裹页面内容的容器。它会自动使用 `layouts/default.vue` 文件作为布局。

### 指定布局名称

如果你想要使用自定义的布局，可以通过 `name` 属性来指定布局名称。

**pages/index.vue 示例：**

```vue
<script setup>
const layout = 'custom'
</script>

<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>
```

在上面的代码中，我们通过一个响应式引用 `layout` 来指定布局名称为 `custom`，这会渲染 `layouts/custom.vue` 文件。

**注意：**  布局名称会被转换为 kebab-case，所以如果你的布局文件名为 `errorLayout.vue`，那么在传递给 `<NuxtLayout>` 时应该使用 `error-layout`。

### 传递附加 Props

`<NuxtLayout>` 组件还允许你传递额外的 props 给布局文件。

**pages/some-page.vue 示例：**

```vue
<template>
  <div>
    <NuxtLayout name="custom" title="我是一个自定义布局">
      <!-- ... -->
    </NuxtLayout>
  </div>
</template>
```

在上面的代码中，我们传递了一个 `title` 属性给布局。在布局文件中，你可以通过 `$attrs` 或 `useAttrs()` 来访问这个值。

**layouts/custom.vue 示例：**

```vue
<script setup>
const layoutCustomProps = useAttrs()
console.log(layoutCustomProps.title) // 输出: 我是一个自定义布局
</script>

<template>
  <!-- 使用 layoutCustomProps.title -->
</template>
```

### 过渡效果

`<NuxtLayout>` 组件支持过渡效果，它通过 `<slot>` 渲染传入的内容，并将其包装在 Vue 的 `<Transition>` 组件中。

**pages/index.vue 示例：**

```vue
<template>
  <div>
    <NuxtLayout name="custom">
      <template #header>
        页面头部模板内容。
      </template>
    </NuxtLayout>
  </div>
</template>
```

为了使过渡效果按预期工作，建议 `<NuxtLayout>` 不是页面组件的根元素。

### 获取布局组件的 Ref

如果你需要获取布局组件的 ref，可以通过 `ref.value.layoutRef` 来访问。

**app.vue 示例：**

```vue
<script setup>
const layout = ref(null)

function logFoo() {
  if (layout.value) {
    layout.value.layoutRef.foo()
  }
}
</script>

<template>
  <NuxtLayout ref="layout" />
</template>
```

在上面的代码中，我们通过 `ref` 获取了布局组件的引用，并在 `logFoo` 函数中调用布局组件的方法。
    
    
### 完整示例
    
    
#### 创建 Nuxt 3 项目

首先，创建一个新的 Nuxt 3 项目：

```
npx nuxi init my-nuxt3-project
cd my-nuxt3-project
npm install

```

#### 项目结构

Nuxt 3 的项目结构与 Nuxt 2 类似，但有一些变化。以下是一个基本的项目结构：

```
my-nuxt3-project
|-- .nuxt
|-- assets
|-- components
|-- layouts
|-- middleware
|-- pages
|-- plugins
|-- public
|-- stores
|-- app.vue
|-- nuxt.config.ts
|-- package.json
|-- tsconfig.json

```

#### 创建布局组件

在 `layouts` 目录下创建一个新的布局组件 `default.vue`：

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <header>
      <h1>我的布局</h1>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <p>版权所有 © 2023</p>
    </footer>
  </div>
</template>

<script setup>
// 这里可以添加一些逻辑
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
}

header, footer {
  text-align: center;
}
</style>
```

#### 创建页面组件

在 `pages` 目录下创建一个新的页面组件 `index.vue`：

```vue
<!-- pages/index.vue -->
<template>
  <div class="page">
    <h2>这是一个页面</h2>
    <p>这是页面的内容。</p>
  </div>
</template>

<script setup>
// 这里可以添加一些逻辑
</script>

<style scoped>
.page {
  border: 1px solid #ccc;
  padding: 1rem;
}
</style>
```

#### 使用布局

在 `app.vue` 中使用布局组件：

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

#### 配置 Nuxt 3

在 `nuxt.config.ts` 中进行一些基本配置：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 其他配置选项...
  app: {
    head: {
      title: '我的项目',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '这是一个简单的Nuxt 3项目示例' },
      ],
    },
  },
});

```

#### 运行项目

在项目根目录下运行以下命令以启动开发服务器：

```
npm run dev

```

在浏览器中访问 `http://localhost:3000`，你应该能看到包含 `<NuxtLayout>` 的布局和 `index` 页面的内容。

这个示例展示了如何在 Nuxt 3 中使用 `<NuxtLayout>` 组件来创建和应用布局。你可以根据需要调整样式、添加更多组件和逻辑。




## 往期文章归档：

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
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
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
