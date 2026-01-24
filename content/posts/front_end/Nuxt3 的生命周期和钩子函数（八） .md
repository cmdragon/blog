---
url: /posts/627bff83be4d55aabeccd96fdb6bab35/
title: Nuxt3 的生命周期和钩子函数（八）
date: 2024-06-30T00:18:53+08:00
updated: 2024-07-02T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文介绍了Nuxt3框架中的一些重要生命周期钩子，如prepare:types用于自定义TypeScript配置和类型声明，listen用于在开发服务器启动时注册自定义事件监听器，schema:extend和schema:resolved用于扩展和处理已解析的模式，以及schema:beforeWrite和schema:written分别在模式写入前后的处理。通过示例代码展示了如何在Nuxt插件中利用这些钩子进行自定义操作。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - TypeScript
  - 服务器监听
  - 模式扩展
  - 数据写入
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_02 15_18_34.png" title="2024_07_02 15_18_34.png" alt="2024_07_02 15_18_34.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`




## prepare:types

### 参数

-   **options**：一个对象，包含对 `tsconfig.json` 的配置选项和对 `nuxt.d.ts` 的自定义引用和声明的相关操作。

### 详细描述

`prepare:types` 钩子在 Nuxt 准备 TypeScript 配置文件 `.nuxt/tsconfig.json` 和类型声明文件 `.nuxt/nuxt.d.ts` 之前被调用。这个钩子允许开发者修改 TypeScript 的配置，添加自定义的类型声明，或者引入额外的类型定义文件，从而扩展或自定义 Nuxt 项目中的 TypeScript 支持。

### Demo

以下是一个示例，展示如何在插件中使用 `prepare:types` 钩子来修改 `tsconfig.json` 选项和在 `nuxt.d.ts` 中添加自定义类型声明：

```javascript
// plugins/prepare-types.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 prepare:types 钩子
  nuxtApp.hook('prepare:types', (options) => {
    // 修改 tsconfig.json 中的选项
    options.tsConfig.compilerOptions.lib.push('DOM');

    // 在 nuxt.d.ts 中添加自定义类型声明
    options.nuxtTypes.push(`type CustomType = { key: string; value: number; };`);
    options.nuxtTypes.push(`interface CustomInterface { customMethod(): void; }`);

    // 如果需要引入自定义的类型定义文件，可以这样做
    // options.nuxtTypes.push(`/// <reference path="path/to/your/declarations.d.ts" />`);

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `prepare:types` 钩子，它会在 Nuxt 准备 TypeScript 配置时被调用。我们通过修改 `options.tsConfig.compilerOptions` 来添加新的库（lib）到 `tsconfig.json` 文件中，同时通过 `options.nuxtTypes` 来添加自定义的类型声明。

注册这个插件后，当 Nuxt 准备 TypeScript 配置时，它将应用这些修改，使得开发者可以自定义 TypeScript 的行为和类型声明，从而满足项目特定的需求。




## listen

### 参数

-   **listenerServer**：开发服务器的实例，通常是一个 `http.Server` 对象。
-   **listener**：监听器函数，用于在开发服务器上注册自定义的事件监听器。

### 详细描述

`listen` 钩子在 Nuxt 开发服务器加载时被调用。这个钩子允许开发者访问开发服务器的实例，并且可以在这个服务器上注册自定义的事件监听器。这对于需要在开发过程中实时处理服务器事件或者执行某些特定操作非常有用。

### Demo

以下是一个示例，展示如何在插件中使用 `listen` 钩子来注册一个自定义的事件监听器：

```javascript
// plugins/listen.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 listen 钩子
  nuxtApp.hook('listen', (listenerServer, listener) => {
    // 注册自定义事件监听器
    listenerServer.on('request', (req, res) => {
      // 自定义请求处理逻辑
      console.log('Received request:', req.url);
      // 注意：这里不要结束响应，否则会干扰正常的请求处理
    });

    // 注册自定义错误监听器
    listenerServer.on('error', (error) => {
      // 自定义错误处理逻辑
      console.error('Server error:', error);
    });

    // 如果需要在服务器启动后执行某些操作，可以在这里监听 'listening' 事件
    listenerServer.on('listening', () => {
      console.log('Server is listening on port:', listenerServer.address().port);
    });

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `listen` 钩子，它会在开发服务器加载时被调用。我们通过访问 `listenerServer` 参数来获取开发服务器的实例，并注册了几个自定义的事件监听器，例如监听请求和错误事件。我们还展示了如何在服务器开始监听端口时执行一些操作。

注册这个插件后，当开发服务器启动时，这些自定义的事件监听器将被激活，允许开发者对服务器事件进行实时处理。




## schema:extend

### 参数

-   **schemas**：要扩展的模式对象。

### 详细描述

`schema:extend` 钩子允许开发者扩展默认的模式。通过这个钩子，你可以向现有的模式中添加新的字段、修改现有字段的属性或定义新的关系。

### Demo

以下是一个示例，展示如何在插件中使用 `schema:extend` 钩子来扩展默认模式：

```javascript
// plugins/schemaExtend.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 schema:extend 钩子
  nuxtApp.hook('schema:extend', (schemas) => {
    // 向模式中添加新字段
    schemas.user.add({
      age: {
        type: Number,
        required: true
      }
    });

    // 修改现有字段的属性
    schemas.user.fields.name.type = String;

    // 定义新的关系
    schemas.user.relations = {
      posts: {
        type: 'hasMany',
        model: 'Post'
      }
    };

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `schema:extend` 钩子，它会在模式扩展时被调用。我们通过访问 `schemas` 参数来获取要扩展的模式对象，并向其中添加了一个新的字段 `age`，修改了现有字段 `name` 的类型，以及定义了一个新的关系 `posts`。

注册这个插件后，当模式被扩展时，这些修改将被应用到默认模式中，从而实现对模式的定制化扩展。






## schema:resolved

### 参数

-   **schema**：已解析的模式对象。

### 详细描述

`schema:resolved` 钩子允许开发者在模式已经被解析并且所有扩展都已经被应用后进行操作。这个钩子可以用来检查或进一步修改模式，确保所有的模式定义都是最终状态。在 Nuxt 中，这个钩子可以用来在应用启动之前确保所有的模式定义都已经完成，并且可以在此基础上进行进一步的逻辑处理。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `schema:resolved` 钩子来处理已解析的模式：

```javascript
// plugins/schemaResolved.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 schema:resolved 钩子
  nuxtApp.hook('schema:resolved', (schema) => {
    // 检查已解析的模式
    console.log('已解析的模式:', schema);

    // 假设我们需要对用户模式中的某个字段做额外处理
    if (schema.has('user')) {
      const userSchema = schema.get('user');

      // 检查是否存在特定的字段
      if (userSchema.has('email')) {
        // 对 email 字段做额外处理
        userSchema.extend({
          emailVerified: {
            type: Boolean,
            default: false
          }
        });
      }
    }

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `schema:resolved` 钩子，它会在模式被解析后调用。我们通过访问 `schema` 参数来获取已解析的模式对象，并打印出来。然后，我们检查用户模式中是否存在 `email` 字段，如果存在，我们为该模式添加一个新的字段 `emailVerified`。

注册这个插件后，当模式被解析时，这个钩子会被触发，允许开发者对模式进行最后的检查和修改。



## schema:beforeWrite

### 参数

-   **schema**：即将被写入的模式对象。

### 详细描述

`schema:beforeWrite` 钩子在模式被写入到文件或数据库之前被调用。这个钩子允许开发者在模式被持久化之前进行检查或修改。在 Nuxt 应用中，这个钩子可以用来在模式最终写入之前确保所有的数据都是正确的，或者根据需要添加额外的数据或验证。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `schema:beforeWrite` 钩子来处理即将写入的模式：

```javascript
// plugins/schemaBeforeWrite.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 schema:beforeWrite 钩子
  nuxtApp.hook('schema:beforeWrite', (schema) => {
    // 在这里可以对即将写入的模式进行检查或修改
    console.log('即将写入的模式:', schema);

    // 假设我们需要在写入前确保所有的用户都有一个角色
    if (schema.has('user')) {
      const userSchema = schema.get('user');

      // 确保 'role' 字段存在
      if (!userSchema.has('role')) {
        // 如果不存在，则添加 'role' 字段
        userSchema.extend({
          role: {
            type: String,
            default: 'user' // 默认角色为 'user'
          }
        });
      }
    }

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `schema:beforeWrite` 钩子，它会在模式即将被写入之前调用。我们首先打印出即将写入的模式对象，然后检查用户模式中是否存在 `role` 字段。如果不存在，我们添加一个默认的 `role` 字段，以确保每个用户都有一个角色定义。

通过这种方式，我们可以在模式被持久化之前确保所有的数据都是符合预期的，并且可以按照需求进行最后的调整。注册这个插件后，当模式即将被写入时，这个钩子会被触发，允许开发者进行最后的检查和修改。







## schema:written

### 参数

-   无特定参数传递，通常通过上下文获取已写入的模式信息。

### 详细描述

`schema:written` 钩子在模式成功写入到文件或数据库之后被调用。这个钩子允许开发者在模式被持久化之后进行后续操作，例如记录日志、发送通知或进行其他依赖于已写入模式数据的处理。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `schema:written` 钩子来处理已写入的模式：

```javascript
// plugins/schemaWritten.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 schema:written 钩子
  nuxtApp.hook('schema:written', () => {
    // 在这里可以对已写入的模式进行后续操作
    console.log('模式已成功写入');

    // 假设我们需要在模式写入后发送一个通知
    // 这里可以调用一个通知服务或记录日志
    sendNotification('模式已成功写入');

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `schema:written` 钩子，它会在模式成功写入之后调用。我们首先打印出一条消息表示模式已成功写入，然后调用一个假设的 `sendNotification` 函数来发送通知。

通过这种方式，我们可以在模式被持久化之后执行任何必要的后续操作。注册这个插件后，当模式成功写入时，这个钩子会被触发，允许开发者进行后续处理。


## 往期文章归档：

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
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
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
