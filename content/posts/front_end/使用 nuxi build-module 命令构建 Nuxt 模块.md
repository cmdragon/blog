---
url: /posts/7a131f2e511146460683c0b6d2c4e911/
title: 使用 nuxi build-module 命令构建 Nuxt 模块
date: 2024-08-31T00:18:53+08:00
updated: 2024-08-31T00:18:53+08:00
author: cmdragon

summary:
   nuxi build-module 命令是构建 Nuxt 模块的核心工具，它将你的模块打包成适合生产环境的格式。通过使用 --stub 选项，你可以在开发过程中加快模块构建速度，但在发布之前最好进行最终构建以确保模块的生产质量。理解和掌握这些选项将帮助你更好地控制模块的构建过程，并确保模块能够顺利地发布和分发。


categories:
   - 前端开发
  
tags:
   - Nuxt模块
   - 构建工具
   - nuxi命令
   - 生产构建
   - 模块打包
   - TypeScript支持
   - ESM支持
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_08_31 12_50_41.png" title="2024_08_31 12_50_41.png" alt="2024_08_31 12_50_41.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



如果你正在开发一个 Nuxt 模块并希望在发布之前将其构建为生产版本，那么 `nuxi build-module` 命令将是你不可或缺的工具。

## 什么是 `nuxi build-module`？

`nuxi build-module` 命令用于构建你的 Nuxt 模块。在发布模块之前，运行这个命令会生成一个名为 `dist` 的目录，该目录包含了构建后的模块文件，准备好用于发布和分发。这个命令使用了 `@nuxt/module-builder` 工具，它可以自动生成符合最新模块规范的构建配置，并支持 TypeScript 和 ESM（ECMAScript 模块）。

### 基本用法

```bash
npx nuxi build-module [--stub] [rootDir]
```

### 参数说明

- **rootDir**：要打包的模块的根目录，默认为当前目录 (`.`)。如果你的模块位于不同的目录，可以指定其他路径。
- **--stub**：使用 `jiti` 对你的模块进行存根处理。这个选项主要用于开发目的，可以加快开发过程，但可能会影响模块的生产构建。

## 如何使用 `nuxi build-module` 命令

### 1. 准备你的 Nuxt 模块

在构建你的模块之前，需要确保模块已经正确创建和配置。如果你还没有创建模块，可以按照以下步骤创建一个简单的模块：

1. **创建模块目录**：

   ```bash
   mkdir my-nuxt-module
   cd my-nuxt-module
   ```

2. **初始化 npm 项目**：

   ```bash
   npm init -y
   ```

3. **安装必要的依赖**：

   ```bash
   npm install nuxt @nuxt/module-builder
   ```

4. **创建模块文件**：

   在模块目录中，创建一个 `index.js` 文件，写入你的模块代码。例如：

   ```javascript
   export default function MyModule(moduleOptions) {
     this.addPlugin({
       src: require.resolve('./plugin.js'),
       fileName: 'my-module.js',
       options: moduleOptions
     })
   }
   ```

   然后，创建一个 `plugin.js` 文件，例如：

   ```javascript
   export default function ({ app }, inject) {
     // 在这里添加你的插件逻辑
     inject('myModule', 'Hello from my module!')
   }
   ```

### 2. 运行 `nuxi build-module` 命令

在你的模块目录中，运行以下命令来构建模块：

```bash
npx nuxi build-module
```

这个命令将会生成一个名为 `dist` 的目录，其中包含构建后的模块文件。这个 `dist` 目录准备好用于发布和分发。

### 3. 使用 `--stub` 选项

如果你正在开发模块，并希望使用 `jiti` 对模块进行存根处理，以加快开发过程，可以使用 `--stub` 选项：

```bash
npx nuxi build-module --stub
```

请注意，`--stub` 选项主要用于开发目的，它可以加快模块的开发过程，但在发布之前最好去掉这个选项进行最终构建。

## 示例

假设你已经创建了一个名为 `my-nuxt-module` 的模块，并希望构建这个模块。以下是如何使用 `nuxi build-module` 命令的示例：

1. **基本构建**：

   在 `my-nuxt-module` 目录中运行以下命令：

   ```bash
   npx nuxi build-module
   ```

   这个命令会在 `my-nuxt-module` 目录下生成一个 `dist` 目录，其中包含构建后的模块文件，准备好用于发布。

2. **使用 `--stub` 选项**：

   如果你正在开发模块并希望使用存根处理来加快开发速度，可以运行：

   ```bash
   npx nuxi build-module --stub
   ```

   这会使用 `jiti` 对模块进行存根处理，适合开发期间使用。

## 总结

nuxi build-module 命令是构建 Nuxt 模块的核心工具，它将你的模块打包成适合生产环境的格式。通过使用 --stub 选项，你可以在开发过程中加快模块构建速度，但在发布之前最好进行最终构建以确保模块的生产质量。理解和掌握这些选项将帮助你更好地控制模块的构建过程，并确保模块能够顺利地发布和分发。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [使用 nuxi build 命令构建你的 Nuxt 应用程序 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bc2bfb4e25c5fe348c22bcd59db71579/)
- [使用 nuxi analyze 命令分析 Nuxt 应用的生产包 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2e9061a0c24ee58d41b70de7b45040d5/)
- [使用 nuxi add 快速创建 Nuxt 应用组件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/917849288e8e1cc200cdd37a60e48387/)
- [使用 updateAppConfig 更新 Nuxt 应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/870198cdff2bbd91a5af2182da7662a8/)
- [使用 Nuxt 的 showError 显示全屏错误页面 | cmdragon's Blog](https://blog.cmdragon.cn/posts/54debfbfcb8e75989b8e0efe82573a86/)
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
