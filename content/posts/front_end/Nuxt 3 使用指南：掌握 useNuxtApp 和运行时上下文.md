---
url: /posts/074b9dedf36fca34d1469e455c71d583/
title: Nuxt 3 使用指南：掌握 useNuxtApp 和运行时上下文
date: 2024-07-21T00:18:53+08:00
updated: 2024-07-21T00:18:53+08:00
author: cmdragon

summary:
  摘要：“Nuxt 3 使用指南：掌握 useNuxtApp 和运行时上下文”介绍了Nuxt 3中useNuxtApp的使用，包括访问Vue实例、运行时钩子、配置变量和SSR上下文。文章详细说明了provide和hook函数的应用，以及如何在插件和组件中利用这些功能。同时，探讨了vueApp属性、ssrContext和payload的使用场景，以及isHydrating和runWithContext方法的作用。

categories:
  - 前端开发

tags:
  - nuxt
  - VueJS
  - SSR
  - 插件
  - 组件
  - 钩子
  - 上下文
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_21 14_12_43.png" title="2024_07_21 14_12_43.png" alt="2024_07_21 14_12_43.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


在 Nuxt 应用的开发过程中，`useNuxtApp` 是一个极其关键的内置可组合函数，它为开发者提供了访问 Nuxt 共享运行时上下文的重要途径。无论是在客户端还是服务器端，`useNuxtApp` 都发挥着不可或缺的作用。  


## 什么是 `useNuxtApp`？

  


`useNuxtApp` 是一个内置的组合式函数，它让你可以访问以下内容：
-   **Vue 应用程序实例**：你可以通过 `useNuxtApp` 获取全局的 Vue 应用程序实例，进而使用 Vue 的相关功能，如注册全局组件和指令等。
-   **运行时钩子**：你可以使用 `hook` 方法来注册自定义的钩子，以便在特定的生命周期事件中执行代码。例如，你可以在页面开始渲染时执行某些操作。
-   **运行时配置变量**：你可以访问 Nuxt 应用的配置变量，这些变量可以在应用的不同部分共享。
-   **内部状态**：你可以访问与服务器端渲染（SSR）相关的上下文信息，如 `ssrContext` 和 `payload`。这些信息对于处理服务器端请求和响应非常重要。

###  使用示例

以下是如何在 Nuxt 应用中使用 `useNuxtApp` 的示例：

#### 在插件中使用

```
// plugins/my-plugin.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 提供一个全局函数
  nuxtApp.provide('greet', (name) => `Hello, ${name}!`);

  // 注册一个钩子
  nuxtApp.hook('page:start', () => {
    console.log('Page is starting...');
  });
});

```

#### 在组件中使用

```
<template>
  <div>{{ greeting }}</div>
</template>

<script setup>
const nuxtApp = useNuxtApp(); // 获取 nuxtApp 实例
const greeting = nuxtApp.$greet('World'); // 调用提供的函数
</script>
```


## 方法

`provide` 函数是 Nuxt.js 中用于扩展运行时上下文的一个重要功能。通过这个函数，你可以将值和辅助方法提供给 Nuxt 应用中的所有组合函数和组件，使它们能够共享这些值和方法。

### 1. `provide` 函数

`provide` 函数接受两个参数：

-   **name**：一个字符串，表示你要提供的值的名称。
-   **value**：你要提供的值或函数。

###  使用示例

以下是如何使用 `provide` 函数创建 Nuxt 插件并在应用中使用它的示例：

#### 创建插件

首先，你需要创建一个插件文件，在其中使用 `provide` 函数：

```
// plugins/my-plugin.js
export default defineNuxtPlugin((nuxtApp) => {
  // 使用 provide 函数提供一个自定义方法
  nuxtApp.provide('hello', (name) => `Hello ${name}!`);
});

```

#### 在组件中使用

接下来，你可以在任何组件中使用 `useNuxtApp` 来访问这个提供的方法：

```
<template>
  <div>{{ greeting }}</div>
</template>

<script setup>
const nuxtApp = useNuxtApp(); // 获取 nuxtApp 实例

// 调用提供的 hello 方法
const greeting = nuxtApp.$hello('World'); // 输出 "Hello World!"
</script>
```

在上面的示例中，`$hello` 成为 `nuxtApp` 上下文的一个新的自定义部分。你可以在任何可以访问 `nuxtApp` 的地方使用这个方法。


### 2. `hook` 函数

`hook` 函数用于在 Nuxt 应用的生命周期中注册钩子。它接受两个参数：

-   **name**：一个字符串，表示钩子的名称。
-   **cb**：一个回调函数，当钩子被触发时执行。

####  使用示例

以下是如何在 Nuxt 插件中使用 `hook` 函数的示例：

##### 创建插件

你可以创建一个插件文件，并在其中使用 `hook` 函数来注册钩子。例如，下面的代码在页面开始渲染时和 Vue.js 发生错误时添加自定义逻辑：

```
// plugins/test.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 注册一个钩子，在页面开始渲染时触发
  nuxtApp.hook('page:start', () => {
    console.log('页面开始渲染');
    // 在这里添加你的代码，例如记录日志、初始化状态等
  });

  // 注册一个钩子，当 Vue.js 发生错误时触发
  nuxtApp.hook('vue:error', (..._args) => {
    console.log('捕获到 Vue 错误:', ..._args);
    // 可以在这里进行错误处理，例如发送错误报告
    // if (process.client) {
    //   console.log(..._args);
    // }
  });
});

```

#### 可用的运行时钩子

Nuxt.js 提供了一些内置的运行时钩子，你可以在应用中使用它们。以下是一些常用的钩子：

-   `page:start`：在页面开始渲染时触发。
-   `vue:error`：在 Vue.js 发生错误时触发。
-   `app:mounted`：在应用挂载后触发。
-   `app:error`：在应用发生错误时触发。
-   [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/693a389ead2d/)



### 3. `callHook` 函数

`callHook` 函数接受两个参数：

-   **name**：一个字符串，表示要调用的钩子的名称。
-   **...args**：可选的参数，可以传递给钩子的回调函数。

####  使用示例

以下是如何使用 `callHook` 函数的示例：

##### 创建插件并调用钩子

假设你有一个插件需要在初始化时调用一个名为 `my-plugin:init` 的钩子，你可以这样实现：

```
// plugins/myPlugin.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 注册一个钩子
  nuxtApp.hook('my-plugin:init', () => {
    console.log('我的插件初始化钩子被调用');
    // 在这里可以执行初始化逻辑
  });

  // 调用钩子
  nuxtApp.callHook('my-plugin:init').then(() => {
    console.log('钩子调用完成');
  }).catch((error) => {
    console.error('钩子调用出错:', error);
  });
});

```

#### 异步调用钩子

由于 `callHook` 返回一个 Promise，你可以使用 `async/await` 语法来简化异步调用的处理：

```
// plugins/myPlugin.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  // 注册一个钩子
  nuxtApp.hook('my-plugin:init', () => {
    console.log('我的插件初始化钩子被调用');
    // 在这里可以执行初始化逻辑
  });

  // 使用 async/await 调用钩子
  try {
    await nuxtApp.callHook('my-plugin:init');
    console.log('钩子调用完成');
  } catch (error) {
    console.error('钩子调用出错:', error);
  }
});
```


## 属性

### 1. `vueApp` 属性

`vueApp` 是全局的 Vue.js 应用程序实例，你可以通过 `nuxtApp` 访问它。以下是一些有用的方法：

#### 1.1 `component()`

-   **功能**：注册全局组件或检索已注册的组件。

-   **用法**：

    -   注册组件：

        ```
        nuxtApp.vueApp.component('MyComponent', MyComponent);
        
        ```

    -   检索组件：

        ```
        const MyComponent = nuxtApp.vueApp.component('MyComponent');
        
        ```

#### 1.2 `directive()`

-   **功能**：注册全局自定义指令或检索已注册的指令。

-   **用法**：

    -   注册指令：

        ```
        nuxtApp.vueApp.directive('my-directive', {
          // 指令定义
          beforeMount(el, binding) {
            // 指令逻辑
          }
        });
        
        ```
        
    -   检索指令：

        ```
        const myDirective = nuxtApp.vueApp.directive('my-directive');
        
        ```

#### 1.3 `use()`

-   **功能**：安装一个 Vue.js 插件。

-   **用法**：

    ```
    nuxtApp.vueApp.use(MyPlugin);
    
    ```

####  1.4 使用示例

下面是一个示例，展示如何在 Nuxt.js 插件中使用 `useNuxtApp()` 来注册组件和指令：

```
// plugins/myPlugin.ts
import { defineNuxtPlugin } from '#app';
import MyComponent from '@/components/MyComponent.vue';

export default defineNuxtPlugin((nuxtApp) => {
  // 注册全局组件
  nuxtApp.vueApp.component('MyComponent', MyComponent);

  // 注册自定义指令
  nuxtApp.vueApp.directive('my-directive', {
    beforeMount(el, binding) {
      el.style.color = binding.value; // 设置元素颜色
    }
  });

  // 安装 Vue.js 插件
  nuxtApp.vueApp.use(SomeVuePlugin);
});
```



### `ssrContext` 属性

`ssrContext` 提供了以下几个重要属性：

#### 1.  **url（字符串）**

    -   **描述**：表示当前请求的 URL。

    -   **用法**：

        ```
        const currentUrl = ssrContext.url;
        console.log('当前请求的URL:', currentUrl);
        
        ```

#### 2.  **event（unjs/h3请求事件）**

    -   **描述**：表示访问当前路由的请求和响应事件。这个事件对象可以用来处理请求和响应的相关逻辑。

    -   **用法**：

        ```
        const { req, res } = ssrContext.event;
        // 处理请求和响应
        req.on('data', chunk => {
          // 处理请求数据
        });
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World');
        
        ```

#### 3.  **payload（对象）**

    -   **描述**：表示 NuxtApp 的负载对象，通常用于在服务器端传递数据到客户端。

    -   **用法**：

        ```
        ssrContext.payload = {
          message: 'Hello from server!',
          data: [1, 2, 3]
        };
        
        ```

#### 4. **使用示例**

下面是一个示例，展示如何在 Nuxt.js 的中间件或插件中使用 `ssrContext`：

```
// middleware/myMiddleware.js
export default function (context) {
  const { ssrContext } = context;

  // 打印当前请求的 URL
  console.log('当前请求的URL:', ssrContext.url);

  // 访问请求事件
  const { req, res } = ssrContext.event;

  // 处理请求
  req.on('data', chunk => {
    console.log('接收到的数据:', chunk.toString());
  });

  // 设置负载对象
  ssrContext.payload = {
    message: 'Hello from server-side middleware!',
    timestamp: Date.now()
  };
}
```



### `payload` 

`payload` 对象通常包含以下几个键：

#### 1.  **serverRendered（布尔值）**

    -   **描述**：指示响应是否是服务器端渲染的。

    -   **用法**：

        ```
        if (payload.serverRendered) {
          console.log('这是一个服务器端渲染的响应');
        }
        
        ```

#### 1.  **data（对象）**

    -   **描述**：当你使用 `useFetch` 或 `useAsyncData` 从 API 端点获取数据时，可以通过 `payload.data` 访问结果负载。这些数据会被缓存，避免重复请求相同的数据。

    -   **示例**：

        ```
        // server/api/count.ts
        export default defineEventHandler(async (event) => {
          return { count: 1 };
        });

        // 在组件中使用
        const { data } = await useAsyncData('count', () => $fetch('/api/count'));
        console.log(data.value); // 访问 { count: 1 }
        
        ```

#### 1.  **state（对象）**

    -   **描述**：当你使用 `useState` 在 Nuxt 中设置共享状态时，可以通过 `payload.state.[name-of-your-state]` 访问该状态数据。

    -   **示例**：

        ```
        // plugins/my-plugin.ts
        export const useColor = () => useState<string>('color', () => 'pink');

        export default defineNuxtPlugin((nuxtApp) => {
          if (process.server) {
            const color = useColor();
            console.log('服务器端的颜色:', color.value); // 访问状态
          }
        });
        
        ```

#### 自定义类型和辅助函数

你还可以使用更高级的类型，如 `ref`、`reactive`、`shallowRef`、`shallowReactive` 和 `NuxtError` 来管理状态。此外，Nuxt 还提供了特殊的插件辅助函数来添加自定义类型。

##### 自定义负载插件示例

```
// plugins/custom-payload.ts
/**
 * 这种类型的插件在Nuxt生命周期的早期运行，早于负载的恢复。
 * 你将无法访问到路由器或其他Nuxt注入的属性。
 */
export default definePayloadPlugin((nuxtApp) => {
  // 定义负载的转换器
  definePayloadReducer('BlinkingText', data => data === '<blink>' && '_');
  definePayloadReviver('BlinkingText', () => '<blink>');
});
```


### `isHydrating`

使用`nuxtApp.isHydrating`（布尔值）检查Nuxt应用程序是否在客户端进行水合。


```
export default defineComponent({
  setup (_props, { slots, emit }) {
    const nuxtApp = useNuxtApp()
    onErrorCaptured((err) => {
      if (process.client && !nuxtApp.isHydrating) {
        // ...
      }
    })
  }
})
```



### `  runWithContext `

你可能会遇到“Nuxt实例不可用”的消息，所以才会来到这里。请尽量少使用此方法，并报告导致问题的示例，以便最终在框架层面解决。

`runWithContext`方法用于调用一个函数并为其提供一个显式的Nuxt上下文。通常情况下，Nuxt上下文会在组件之间隐式传递，无需担心。然而，在中间件/插件中处理复杂的`async`/`await`场景时，可能会遇到异步调用后当前实例已被取消设置的情况。


```
export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp()
  let user
  try {
    user = await fetchUser()
    // Vue/Nuxt编译器在这里丢失了上下文，因为try/catch块中进行了操作。
  } catch (e) {
    user = null
  }
  if (!user) {
    // 将正确的Nuxt上下文应用于我们的`navigateTo`调用。  
    return nuxtApp.runWithContext(() => navigateTo('/auth'))
  }
})
```


```
const result = nuxtApp.runWithContext(() => functionWithContext())
```

-   `functionWithContext`：任何需要当前Nuxt应用程序上下文的函数。此上下文将自动正确应用。

`runWithContext`将返回`functionWithContext`返回的任何内容。


## 往期文章归档：

- [使用 useLazyFetch 进行异步数据获取 | cmdragon's Blog](https://blog.cmdragon.cn/posts/382133fd6ac27845d845a7fa96e5ba43/)
- [使用 useLazyAsyncData 提升数据加载体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/954e473bea4ec122949c8c7d84d32c95/)
- [Nuxt.js 中使用 useHydration 实现数据水合与同步 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c7ddeca4690387e7e08c83e6c482a576/)
- [useHeadSafe：安全生成HTML头部元素 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a1ca5111c82292bda5de4994f537d6f8/)
- [Nuxt.js头部魔法：轻松自定义页面元信息，提升用户体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d5370e880eaec9085a153caba4961676/)
- [探索Nuxt.js的useFetch：高效数据获取与处理指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/29ff9113e98725ee69fa0148a47ae735/)
- [Nuxt.js 错误侦探：useError 组合函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b73679558bc672550fbbb72ae295fdf5/)
- [useCookie函数：管理SSR环境下的Cookie | cmdragon's Blog](https://blog.cmdragon.cn/posts/cd361e1a7930614f1aaf46ad35b28958/)
- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
- [使用 `useAppConfig` ：轻松管理应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9e044d4b53eab6a1bec49bb86b4c856c/)
- [Nuxt框架中内置组件详解及使用指南（五） | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff42c6a570627402dbbdd82adbb2ed2a/)
- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
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
