---
url: /posts/0988eb75d14a8fc3b0db7d072206b8a8/
title: 使用 addRouteMiddleware 动态添加中间
date: 2024-08-04T00:18:53+08:00
updated: 2024-08-04T00:18:53+08:00
author: cmdragon

summary:
  摘要：文章介绍了Nuxt3中addRouteMiddleware的使用方法，该功能允许开发者动态添加路由中间件，以实现诸如权限检查、动态重定向及路由变化时的特定操作。内容涵盖路由中间件的概念、addRouteMiddleware的语法、参数、使用示例（包括匿名中间件、命名中间件、全局中间件、覆盖现有中间件）及调试技巧。强调了此功能为Nuxt3应用带来的灵活性和便利性。

categories:
  - 前端开发

tags:
  - nuxt
  - 中间件
  - 路由
  - 动态
  - 权限
  - 重定向
  - 导航
---

<img src="/images/2024_08_04 10_01_31.png" title="2024_08_04 10_01_31.png" alt="2024_08_04 10_01_31.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


在 Nuxt3 中，`addRouteMiddleware` 允许开发者在应用程序中动态添加路由中间件。这为你提供了灵活性，可以在不同情况下执行导航守卫，例如处理权限、重定向，以及在路由变化时执行特定操作。
## 什么是路由中间件？

路由中间件是一个函数，可以在用户导航到特定路由前执行某些操作。它通常用于：

- 检查用户权限
- 动态重定向用户
- 登录或加载数据

在 Nuxt3 中，所有中间件通常位于 `middleware/` 目录中，但通过使用 `addRouteMiddleware`，你可以在运行时动态添加它们。

## `addRouteMiddleware` 语法与参数

### 语法

```javascript
addRouteMiddleware(name: string | RouteMiddleware, middleware?: RouteMiddleware, options: AddRouteMiddlewareOptions = {})
```

### 参数
- **name**: (string | RouteMiddleware)  
  - 可以是字符串（用于命名中间件）或一个路由中间件函数，类型为 `RouteMiddleware`。

- **middleware**: (RouteMiddleware)  
  - 这是一个函数，接受两个参数：
    - `to`: 目标路由对象，包含用户要访问的路由信息。
    - `from`: 源路由对象，包含用户当前所在的路由信息。

- **options**: (AddRouteMiddlewareOptions)  
  - 一个可选的对象，用来设置中间件的额外选项。当前可以设置的选项是：
    - `global`: (boolean) 如果设置为 `true`，则该中间件为全局中间件，默认为 `false`。

## 使用 `addRouteMiddleware`

### 1. 匿名路由中间件

在你需要简单的逻辑处理时，创建匿名路由中间件非常方便。

**示例：禁止访问特定页面**

```typescript
// plugins/my-plugin.ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware((to, from) => {
    // 如果用户尝试访问 /forbidden 路径，则阻止导航
    if (to.path === '/forbidden') {
      console.log('访问被阻止：用户尝试访问从未授权的路径：', to.path);
      return false; // 阻止导航
    }
  });
});
```

#### 解释：

在上述示例中，如果用户尝试访问 `/forbidden` 页面，导航将被阻止并输出日志。

### 2. 命名路由中间件

命名路由中间件可以用字符串命名，便于后续调用和覆盖。

**示例：记录每次导航日志**

```typescript
// plugins/my-plugin.ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware('logger-middleware', (to, from) => {
    console.log('用户从', from.path, '导航到', to.path);
  });
});
```

#### 解释：

在这个示例中，我们为中间件命名为 `logger-middleware`。这个中间件将在每次导航时输出用户的导航日志。可以通过 `addRouteMiddleware` 的方式再次覆盖同名中间件。

### 3. 全局路由中间件

全局中间件在每次路由变更时都会执行，适用于需要在每个路由之间共享逻辑的场景。

**示例：全局访问控制检查**

```typescript
// plugins/my-plugin.ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth-check', (to, from) => {
    const isAuthorized = false; // 假设这里是你的认证逻辑

    if (!isAuthorized) {
      console.warn('用户未授权，重定向到登录页面');
      return navigateTo('/login'); // 重定向到登录页面
    }
  }, { global: true });
});
```

#### 解释：

在这个示例中，我们创建了一个全局中间件 `auth-check`，每次路由更改时都会检查用户是否被授权。如果用户未授权，则重定向到 `/login` 页面。

### 4. 覆盖现有中间件

当使用命名的中间件时，新的中间件将覆盖已有的同名中间件。如下所示：

```typescript
// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  // 原有逻辑
});

// 然后在 plugins 中添加覆盖
// plugins/my-plugin.ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth', (to, from) => {
    console.log('覆盖了旧的 auth 中间件');
    // 新的逻辑
  });
});
```

在这个例子中，`plugins/my-plugin.ts` 中的中间件将覆盖 `middleware/auth.js` 中的内容。这样的特性可以帮助我们在特定条件下修改原有逻辑。

## 进行中间件调试

在开发过程中，调试中间件是个重要步骤。可以使用简单的 `console.log` 输出调试信息，帮助理解中间件的执行流程。例如：

```typescript
// plugins/my-plugin.ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware((to, from) => {
    console.log('[Middleware Debug]', 'From:', from.path, 'To:', to.path);
  });
});
```

这可以帮助你确认中间件的执行顺序和路径变更。

## 总结

通过使用 `addRouteMiddleware`，你可以灵活地在 Nuxt3 应用中添加、覆盖和管理路由中间件。这为实现复杂的导航逻辑、访问控制和数据处理提供了必要工具。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [使用 abortNavigation 阻止导航 | cmdragon's Blog](https://blog.cmdragon.cn/posts/52bba0b4e019da067ec5092a151c2bce/)
- [使用 $fetch 进行 HTTP 请求 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a189c208200be9973a4dd8d9029f2ab2/)
- [使用 useState 管理响应式状态 | cmdragon's Blog](https://blog.cmdragon.cn/posts/760deff1b835b737dc6396ad0e4cc8d4/)
- [使用 useServerSeoMeta 优化您的网站 SEO | cmdragon's Blog](https://blog.cmdragon.cn/posts/c321870c8c6db0d7f51b3f97ad7c1f4f/)
- [使用 useSeoMeta 进行 SEO 配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e7e7cf9c3099aeaf57badb3c4ecbb7f3/)
- [Nuxt.js必读：轻松掌握运行时配置与 useRuntimeConfig | cmdragon's Blog](https://blog.cmdragon.cn/posts/bbb706a14f541c1932c5a42b4cab92a6/)
- [Nuxt.js 路由管理：useRouter 方法与路由中间件应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2426831b3d48fe56fd7997565dde6857/)
- [useRoute 函数的详细介绍与使用示例 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f78b155dac56741becfa07c51c38dc0f/)
- [使用 useRequestURL 组合函数访问请求URL | cmdragon's Blog](https://blog.cmdragon.cn/posts/06f3f8268aaa2d02d711d8e895bb2bc9/)
- [Nuxt.js 环境变量配置与使用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/53eb62f578931146081c71537fd0c013/)
- [服务端渲染中的数据获取：结合 useRequestHeaders 与 useFetch | cmdragon's Blog](https://blog.cmdragon.cn/posts/c88fddf7a8ad9112ff80c9a25cda09d2/)
- [使用 useRequestEvent Hook 访问请求事件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7f6aeaffdd673a716b7f013f59aa69af/)
- [使用 useNuxtData 进行高效的数据获取与管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5097e3f618f180282a847588006a51d8/)
- [Nuxt 3 使用指南：掌握 useNuxtApp 和运行时上下文 | cmdragon's Blog](https://blog.cmdragon.cn/posts/074b9dedf36fca34d1469e455c71d583/)
- [使用 useLazyFetch 进行异步数据获取 | cmdragon's Blog](https://blog.cmdragon.cn/posts/382133fd6ac27845d845a7fa96e5ba43/)
- [使用 useLazyAsyncData 提升数据加载体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/954e473bea4ec122949c8c7d84d32c95/)
- [Nuxt.js 中使用 useHydration 实现数据水合与同步 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c7ddeca4690387e7e08c83e6c482a576/)
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
