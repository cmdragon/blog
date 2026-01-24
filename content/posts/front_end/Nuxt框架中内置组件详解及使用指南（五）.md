---
url: /posts/ff42c6a570627402dbbdd82adbb2ed2a/
title: Nuxt框架中内置组件详解及使用指南（五）
date: 2024-07-10T00:18:53+08:00
updated: 2024-07-10T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详细介绍了Nuxt框架中<NuxtImg>和<NuxtPicture>组件的使用方法与配置，包括安装、基本用法、属性详解、示例代码以及高级功能如事件处理、自定义图片属性和图片格式回退策略。同时，还简述了<Teleport>组件的功能与基本用法，展示了如何将组件内容传送到DOM中的不同位置，特别是对于模态框和侧边栏等UI元素的布局优化。

categories:
  - 前端开发

tags:
  - NuxtJS
  - 组件
  - 图像
  - 优化
  - 响应
  - 预览
  - 传送
---
<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_10 14_04_16.png" title="2024_07_10 14_04_16.png" alt="2024_07_10 14_04_16.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


## 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## **Nuxt 中`<NuxtErrorBoundary>`组件的使用指南与示例**

Nuxt 提供了一个 <NuxtImg> 组件来处理自动图像优化。

### 安装与配置

首先，确保你已经安装了Nuxt.js，并且你的项目中已经启用了Nuxt Image模块。这通常在项目创建时自动完成，如果没有，你可以按照以下步骤操作：

    npx nuxi@latest module add image
    

### 基本用法

组件可以直接替代原生`<img>`标签，并输出一个原生的img标签，没有任何包装器。以下是如何使用它的基本示例：

    <template>
      <NuxtImg src="/path/to/image.png" />
    </template>

这将创建一个指向`/path/to/image.png`的img标签。

### 属性详解

以下是一些主要的属性及其用法：

*   **src**: 图像文件的路径。应采用目录中静态图像的绝对路径形式。

        <NuxtImg src="/path/to/image.png" />

*   **width / height**: 指定图像的宽度/高度。

        <NuxtImg src="/path/to/image.png" width="200" height="200" />

*   **sizes**: 指定响应大小。

        <NuxtImg src="/path/to/image.png" sizes="sm:200px md:400px lg:600px" />

*   **densities**: 为不同像素密度的屏幕生成特殊图像版本。

        <NuxtImg src="/path/to/image.png" densities="x1 x2" />

*   **placeholder**: 在实际图像完全加载之前显示占位符图像。

        <NuxtImg src="/path/to/image.png" placeholder="./placeholder.png" />

*   **provider**: 使用其他提供程序而不是默认提供程序。

        <NuxtImg provider="cloudinary" src="/remote/image.png" />

*   **preset**: 使用预定义的图像修饰符集。

        <NuxtImg preset="cover" src="/path/to/image.png" />

*   **format**: 指定图像的格式。

        <NuxtImg format="webp" src="/path/to/image.png" />

*   **quality**: 生成图像的质量。

        <NuxtImg src="/path/to/image.jpg" quality="80" />

*   **fit**: 指定图像的尺寸。

        <NuxtImg fit="cover" src="/path/to/image.png" />

*   **modifiers**: 使用提供程序的额外修饰符。

        <NuxtImg src="/path/to/image.png" modifiers="{ roundCorner: '0:100' }" />

*   **preload**: 预加载图像。

        <NuxtImg preload src="/path/to/image.png" />

*   **loading**: 控制图像的加载行为。

        <NuxtImg src="/path/to/image.png" loading="lazy" />

*   **nonce**: 用于内容安全策略的加密随机数。

        <NuxtImg src="/path/to/image.png" :nonce="nonce" />

### 示例

以下是一个使用组件的完整示例，展示了如何结合使用多个属性：

    <template>
      <NuxtImg
        src="/path/to/image.png"
        width="200"
        height="200"
        sizes="sm:100px md:200px lg:400px"
        placeholder="./placeholder.png"
        provider="cloudinary"
        preset="cover"
        format="webp"
        quality="80"
        fit="cover"
        modifiers="{ roundCorner: '0:100' }"
        preload
        loading="lazy"
        :nonce="nonce"
      />
    </template>

在这个示例中，我们使用了多个属性来优化和展示图像。

### 事件

组件支持原生事件，你可以通过监听这些事件来执行特定的操作。例如：

    <template>
      <NuxtImg
        src="/path/to/image.png"
        @load="handleImageLoad"
      />
    </template>

    <script setup>
    function handleImageLoad(event) {
      console.log('Image has been loaded!', event);
    }
    </script>

在这个示例中，当图像加载完成时，`handleImageLoad`函数将被调用。

## **Nuxt 3 中`<NuxtPicture>`组件的使用指南与示例**

### 引入组件

在 Nuxt.js 项目中，您可以直接在页面或组件中引入 `<NuxtPicture>` 和 `<NuxtImg>` 组件。

    import { NuxtPicture, NuxtImg } from '#components';
    

### 示例代码

下面是一个简单的示例，展示如何使用 Nuxt Picture 组件为同一图片提供多种格式：

    <template>
      <NuxtPicture
        format="avif,webp,jpeg"
        src="/nuxt-icon.png"
        alt="Nuxt.js 图标"
      >
        <NuxtImg
          format="avif"
          src="/nuxt-icon.avif"
          alt="Nuxt.js 图标"
        />
        <NuxtImg
          format="webp"
          src="/nuxt-icon.webp"
          alt="Nuxt.js 图标"
        />
        <NuxtImg
          format="jpeg"
          src="/nuxt-icon.jpeg"
          alt="Nuxt.js 图标"
        />
      </NuxtPicture>
    </template>

### 解释

*   `format`: 指定图片的格式，多个格式用逗号分隔。在上面的示例中，我们提供了 AVIF、WebP 和 JPEG 三种格式。
*   `src`: 指定原始图片的路径。
*   `alt`: 提供图片的替代文本，用于屏幕阅读器等辅助设备。

### 高级配置

#### 设置回退格式

您可以使用 `legacyFormat` 属性来指定回退格式。默认情况下，如果原始格式支持透明度（如 PNG 和 GIF），则回退到 PNG；否则回退到 JPEG。

    <NuxtPicture
      format="avif,webp"
      src="/nuxt-icon.png"
      legacyFormat="png"
      alt="Nuxt.js 图标"
    >
      <!-- 图片源 -->
    </NuxtPicture>

#### 自定义图片属性

使用 `imgAttrs` 属性，您可以在 `<NuxtImg>` 元素上设置其他 HTML 属性。

    <NuxtPicture
      src="/nuxt-icon.png"
      alt="Nuxt.js 图标"
    >
      <NuxtImg
        format="avif"
        src="/nuxt-icon.avif"
        alt="Nuxt.js 图标"
        v-bind="imgAttrs"
      />
    </NuxtPicture>

    <script>
    export default {
      data() {
        return {
          imgAttrs: {
            id: 'my-id',
            class: 'my-class',
            style: 'display: block',
            'data-my-data': 'my-value'
          }
        };
      }
    };
    </script>

## **Nuxt 3 中`<Teleport>`组件的使用指南与示例**

`<Teleport>` 组件可以将它的子组件内容渲染到 DOM 的任何位置，而不是紧跟在它的父组件下面。这使得我们能够将模态框、侧边栏等元素放置在页面的任何位置，而不影响其他内容的布局。

### 基本用法

#### 1. 传送到 body

通常情况下，我们可能会将模态框等元素传送到 `body`，这样它们就不会被其他内容遮挡。

以下是一个简单的示例：

```
<template>
  <button @click="openModal = true">
    打开模态框
  </button>
  <Teleport to="body">
    <div v-if="openModal" class="modal">
      <p>来自模态框的问候！</p>
      <button @click="openModal = false">关闭</button>
    </div>
  </Teleport>
</template>

<script>
export default {
  data() {
    return {
      openModal: false
    };
  }
};
</script>

<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>
```

在这个例子中，当点击按钮时，模态框会出现在页面的中心位置。

#### 2. 客户端传送

如果你需要将内容传送到一个特定的元素，比如一个特定的 ID，你需要使用 `<ClientOnly>` 包装器来确保 `<Teleport>` 在客户端渲染时才被处理。

以下是一个客户端传送的示例：

```
<template>
  <ClientOnly>
    <Teleport to="#modal-container">
      <div class="modal">
        <p>这是客户端传送的内容！</p>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script>
export default {
  // 组件逻辑
};
</script>
```

确保你的 HTML 中有一个具有 ID `modal-container` 的元素：

```
<div id="modal-container"></div>

```



## 往期文章归档：

- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
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
