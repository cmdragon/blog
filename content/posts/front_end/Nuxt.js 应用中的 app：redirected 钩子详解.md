---
url: /posts/0a403b28ba9828265f24d658ed1d54d5/
title: Nuxt.js 应用中的 app：redirected 钩子详解
date: 2024-10-03T00:18:53+08:00
updated: 2024-10-03T00:18:53+08:00
author: cmdragon

summary:
  app:redirected 是 Nuxt.js 中的一个钩子，主要用于处理服务器端渲染（SSR）过程中发生的重定向。该钩子在重定向被执行之前被调用，允许开发者在重定向发生前进行一些操作，比如执行条件检查、日志记录等。

categories:
  - 前端开发

tags:
  - nuxt
  - 重定向
  - SSR
  - 钩子
  - 认证
  - 日志
  - 示例
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_10_03 00_26_35.png" title="2024_10_03 00_26_35.png" alt="2024_10_03 00_26_35.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

`app:redirected` 是 Nuxt.js 中的一个钩子，主要用于处理服务器端渲染（SSR）过程中发生的重定向。该钩子在重定向被执行之前被调用，允许开发者在重定向发生前进行一些操作，比如执行条件检查、日志记录等。

## 目录

1. [概述](#1-概述)
2. [app:redirected 钩子的定义](#2-appredirected-钩子的定义)
3. [调用时机与上下文](#3-调用时机与上下文)
   - 3.1 [触发周期](#31-触发周期)
   - 3.2 [上下文参数](#32-上下文参数)
4. [实际应用示例](#4-实际应用示例)
   - 4.1 [示例1: 根据认证状态重定向](#41-示例1根据认证状态重定向)
   - 4.2 [示例2: 记录重定向日志](#42-示例2记录重定向日志)
5. [注意事项](#5-注意事项)
6. [常见问题与解答](#6-常见问题与解答)
7. [练习题](#7-练习题)
8. [总结](#8-总结)

---

### 1. 概述

`app:redirected` 钩子在发起重定向请求并在服务器端渲染之前被触发。此钩子能够捕捉到所有的重定向逻辑，例如从一个页面重定向到另一个页面。

### 2. 调用时机

- **触发周期**: 当服务器接受到请求并开始渲染页面时，如果在某个 middleware 或页面的 asyncData 中调用了 `redirect()`
  方法，那么会触发 `app:redirected`。
- **底层逻辑**: 该钩子可以帮助处理在执行重定向前的一些逻辑，但重定向实际上不会执行，直到这个钩子执行完毕。

### 3. 上下文参数

该钩子接收以下参数：

- **to**: 目标路由对象，表示用户想要访问的路径。
- **from**: 来源路由对象，表示用户当前访问的路径。
- **next**: 函数，通过调用它，可以控制重定向是否继续或中止（例如，可以执行条件检查）。

### 4. 实际应用示例

#### 示例1: 根据认证状态重定向

在这里，我们将根据用户的认证状态进行重定向：

```javascript
export default {
    setup(app) {
        app.hook('app:redirected', (to, from, next) => {
            // 假设有一个函数可以检查用户是否已登录
            const isAuthenticated = checkUserAuthentication();

            if (!isAuthenticated && to.path !== '/login') {
                // 如果用户没有认证且不是访问登录页，则重定向到登录页
                next({path: '/login'});
            } else {
                // 继续处理重定向
                next();
            }
        });
    }
};
```

在这个示例中，我们首先检查用户是否登录。如果用户未登录且试图访问非登录页面，则重定向用户到 `/login`。

#### 示例2: 记录重定向日志

可以将每次重定向的日志记录到远程服务器：

```javascript
export default {
    setup(app) {
        app.hook('app:redirected', (to, from, next) => {
            // 记录重定向信息
            console.log(`重定向: 从 ${from.fullPath} 到 ${to.fullPath}`);
            // 将重定向信息异步发送到服务器
            fetch('https://your-log-server.com/redirect', {
                method: 'POST',
                body: JSON.stringify({from: from.fullPath, to: to.fullPath}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // 继续重定向
            next();
        });
    }
};
```

在此示例中，我们记录了重定向的来源和目标，并将其发送到日志服务器。

### 5. 注意事项

- **确保重定向条件灵活性**: 在重定向逻辑中，应考虑多种场景，以确保用户体验良好。
- **避免循环重定向**: 确保重定向逻辑不会导致循环（例如，重定向到相同的页面）。
- **错误处理**: 处理任何可能的错误，例如网络请求失败或条件判断不合理。

### 6. 常见问题与解答

- **钩子在客户端是否触发？**
    - `app:redirected` 钩子仅在服务器端渲染期间触发。

- **如何在重定向后获取新的状态？**
    - 可以通过监控目标路由的状态变化，获取新的状态信息。重定向完成后，应用会重新渲染。

### 7. 练习题

1. 修改重定向逻辑，使其根据用户角色重定向到不同的页面。
2. 记录每次重定向的信息到数据库，并确保数据的完整性和安全性。
3. 创建一个中间件，在重定向之前进行某些数据预处理。

### 8. 总结

`app:redirected` 钩子为开发者提供了一个在服务器端处理重定向逻辑的强大工具。通过合理利用这个钩子，开发者可以进行条件依据重定向、记录重定向信息等操作，从而增强应用的管理能力和用户体验。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Nuxt Kit 的使用指南：模块创建与管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4ab50831d8bbee635f407ecba9971360/)
- [使用 nuxi upgrade 升级现有nuxt项目版本 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0e0c114dbed4df069069c50bc4b57510/)
- [如何在 Nuxt 3 中有效使用 TypeScript | cmdragon's Blog](https://blog.cmdragon.cn/posts/3121b9f162f334cf3f36524ef4a0a21c/)
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
