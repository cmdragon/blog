---
url: /posts/d86a35cfb808722da2a6383da93c4a16/
title: Nuxt.js 应用中的 page：finish 钩子详解
date: 2024-10-09T00:18:53+08:00
updated: 2024-10-09T00:18:53+08:00
author: cmdragon

summary:
   page:finish 是 Nuxt.js 中用于处理页面加载完成事件的钩子，特别是与 Suspense机制相关。这个钩子允许开发者在页面加载完成后执行自定义操作，以优化用户体验或进行统计分析。

categories:
   - 前端开发

tags:
   - nuxt
   - page:finish
   - 钩子
   - Suspense
   - 用户体验
   - 性能分析
   - 状态更新
---

<img src="/images/2024_10_09 11_33_58.png" title="2024_10_09 11_33_58.png" alt="2024_10_09 11_33_58.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

`page:finish` 是 Nuxt.js 中用于处理页面加载完成事件的钩子，特别是与 Suspense
机制相关。这个钩子允许开发者在页面加载完成后执行自定义操作，以优化用户体验或进行统计分析。

---

## 目录

1. [概述](#1-概述)
2. [page:finish 钩子的详细说明](#2-pagefinish-钩子的详细说明)
    - 2.1 [钩子的定义与作用](#21-钩子的定义与作用)
    - 2.2 [调用时机](#22-调用时机)
    - 2.3 [返回值与异常处理](#23-返回值与异常处理)
3. [具体使用示例](#3-具体使用示例)
    - 3.1 [基本用法示例](#31-基本用法示例)
    - 3.2 [与其他钩子结合使用](#32-与其他钩子结合使用)
4. [应用场景](#4-应用场景)
5. [实际开发中的最佳实践](#5-实际开发中的最佳实践)
6. [注意事项](#6-注意事项)
7. [关键要点](#7-关键要点)
8. [练习题](#8-练习题)
9. [总结](#9-总结)

---

### 1. 概述

`page:finish` 是一个钩子，在页面加载完成并且 Suspense 状态解析后被调用。它允许开发者在页面渲染完成后执行一些必要的操作，比如隐藏加载指示器、记录日志或进行状态更新等。

### 2. page:finish 钩子的详细说明

#### 2.1 钩子的定义与作用

`page:finish` 钩子的主要功能包括：

- 隐藏加载指示器
- 执行分析或统计
- 更新组件的状态或 UI

#### 2.2 调用时机

- **执行环境**: 该钩子仅在客户端执行。
- **挂载时机**: 当页面完成加载并且 Suspense 状态被解析时，`page:finish` 被触发。这通常是在用户成功导航到新的页面时。

#### 2.3 返回值与异常处理

钩子没有返回值。开发者应该在钩子内妥善处理任何可能的异常，以确保应用不会因错误而中断。

### 3. 具体使用示例

#### 3.1 基本用法示例

假设我们希望在页面加载完成后，移除加载动画，可以通过 `page:finish` 来实现：

```javascript
// plugins/loadingIndicatorPlugin.js
export default defineNuxtPlugin({
    hooks: {
        'page:finish'() {
            console.log('Page loading finished');
            // 隐藏加载动画
            document.body.classList.remove('loading');
        }
    }
});
```

在这个示例中，我们在页面加载完成时移除了显示的加载样式。

#### 3.2 与其他钩子结合使用

可以与 `page:start` 等其他钩子结合使用，提供更流畅的用户体验：

```javascript
// plugins/loadingPlugin.js
export default defineNuxtPlugin({
    hooks: {
        'page:start'() {
            console.log('Page loading started');
            document.body.classList.add('loading');
        },
        'page:finish'() {
            console.log('Page loading finished');
            document.body.classList.remove('loading');
        }
    }
});
```

这个示例展示了如何在页面开始加载时显示加载指示器，并在加载完成时移除它，从而呈现出良好的用户反馈。

### 4. 应用场景

1. **用户反馈**: 在此钩子中执行逻辑以告知用户页面已经加载完成。
2. **性能分析**: 记录页面加载时间，帮助进行性能优化。
3. **状态更新**: 更新应用的状态以适应新页面的内容。

### 5. 实际开发中的最佳实践

1. **用户体验优化**: 在 `page:finish` 中实现简单明了的用户交互反馈。
2. **资源管理**: 确保在钩子内的操作不会引起性能问题。
3. **异常处理**: 在此钩子内处理可能发生的错误，以维持应用的健壮性。

### 6. 注意事项

- **性能监控**: 在页面完成后可能需要进行性能监测或分析，注意避免影响用户体验。
- **兼容性测试**: 不同浏览器对于页面完成的处理可能存在差异，确保功能在各大主流浏览器上均能正常工作。
- **用户流畅体验**: 尽量减少在 `page:finish` 中的复杂逻辑，以确保用户获得良好的交互体验。

### 7. 关键要点

- `page:finish` 钩子在页面加载完成时调用，主要用于执行后续逻辑。
- 该钩子适合用于隐藏加载动画和进行状态更新。
- 只在客户端执行，注意处理钩子内可能的异常。

### 8. 练习题

1. **加载时间记录**: 在 `page:finish` 钩子中实现代码，记录从页面开始加载到完成的时间。
2. **状态更新**: 在页面加载完成后更新特定组件的状态，例如显示“加载成功”消息。
3. **数据统计**: 实现一个方案，在 `page:finish` 钩子中统计用户通过哪个链接进入了新页面。

### 9. 总结

`page:finish` 是一个重要的钩子，可以帮助开发者在页面加载完成时执行必要的后续操作。通过合理地使用这个钩子，能够有效提升用户体验，为用户提供顺畅的页面导航感受。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [Nuxt.js 应用中的 page：start 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/818748d467c0a22bfb87002939acb642/)
- [Nuxt.js 应用中的 link：prefetch 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c9630bf715f84414f544802edae0e77a/)
- [Nuxt.js 应用中的 app：suspense：resolve 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/54de24a29ea32b400bc29f8b0b6a46b1/)
- [Nuxt.js 应用中的 app：mounted 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0655a1f20f3c7d66e6b41c961df3103e/)
- [Nuxt.js 应用中的 app：beforeMount 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a84be8813f0e28c0d673fcfc005a023e/)
- [Nuxt.js 应用中的 app：redirected 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0a403b28ba9828265f24d658ed1d54d5/)
- [Nuxt.js 应用中的 app：rendered 钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff851c9049725c29ffd402e2d1f008e2/)
- [应用中的错误处理概述 | cmdragon's Blog](https://blog.cmdragon.cn/posts/10c446738808a151ce640ad92307cece/)
- [理解 Vue 的 setup 应用程序钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6ed51fb844f1329c26155ff2a6ea4cd2/)
- [深入理解 Nuxt.js 中的 app：data：refresh 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/64d5872b7beb55312b9d4537c9366d2b/)
- [深入理解 Nuxt.js 中的 app：error：cleared 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b77d43b884a1b04d68230c5963b5e15a/)
- [深入理解 Nuxt.js 中的 app：error 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cb374534e888fe4a800e013eda896737/)
- [深入理解 Nuxt 中的 app created 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1e03ef2ae917ee8f6e9c9e63cdb6174d/)
- [Nuxt Kit 实用工具的使用示例 | cmdragon's Blog](https://blog.cmdragon.cn/posts/da99cebfd9827341b9b542b233ed4a09/)
- [使用 Nuxt Kit 的构建器 API 来扩展配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bdeb7bbd58b884c871d4a545bab57769/)
- [Nuxt Kit 使用日志记录工具 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fab35b7214614128957a0da96b8705ed/)
- [Nuxt Kit API ：路径解析工具 | cmdragon's Blog](https://blog.cmdragon.cn/posts/68b1b6f9d726f331612d5dcf9dc96914/)
- [Nuxt Kit中的 Nitro 处理程序 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d192f328c97955dd3e3ed3f1cb0c54fa/)
- [Nuxt Kit 中的模板处理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/65413519c80ce2a292bf056178a0d195/)
- [Nuxt Kit 中的插件：创建与使用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cb753641cae33519dd339d523c5afa32/)
- [Nuxt Kit 中的布局管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b4ffad87d300777dc9674a9251b6dc1e/)
- [Nuxt Kit 中的页面和路由管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ca15f62138ac0f090f2b9c215756b50a/)
- [Nuxt Kit 中的上下文处理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a1f6b30121d27466cf8fd474dd962eda/)
- [Nuxt Kit 组件管理：注册与自动导入 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c5f0133bf1d896616b703a00c560fb9b/)
- [Nuxt Kit 自动导入功能：高效管理你的模块和组合式函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5640663d513476298fbd449f82a67e09/)
- [使用 Nuxt Kit 检查模块与 Nuxt 版本兼容性 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b80a57c1b7ed8f18b9d72567e3bc9d71/)
- [Nuxt Kit 的使用指南：从加载到构建 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a19304accfa8f913a68caae99dfa8a68/)
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
