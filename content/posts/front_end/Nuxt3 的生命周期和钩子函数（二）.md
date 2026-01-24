---
url: /posts/035ad4b6880c8ceb996e156237ce5d89/
title: Nuxt3 的生命周期和钩子函数（二）
date: 2024-06-26T00:18:53+08:00
updated: 2024-06-26T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文深入介绍了Nuxt.js框架中几个关键的生命周期钩子函数，包括app:redirected（SSR环境下重定向前触发）、app:beforeMount（CSR下应用挂载前）、app:mounted（CSR下Vue应用在浏览器挂载时）、app:suspense:resolve（CSR中Suspense组件解析子组件完成时）以及link:prefetch（CSR中NuxtLink预取链接时）和page:start（CSR页面渲染启动时）。通过代码示例展示了如何利用defineNuxtPlugin定义插件并借助nuxtApp.hook监听这些钩子以执行特定任务，强调了各钩子的应用场景及在客户端和服务器端的不同行为。

categories:
  - 前端开发

tags:
  - nuxt
  - SSR
  - CSR
  - 钩子函数
  - 生命周期
  - Vue.js
  - 页面渲染
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_26 20_25_22.png" title="2024_06_26 20_25_22.png" alt="2024_06_26 20_25_22.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## app:redirected

参数：无
环境：服务器端（Server-Side Rendering, SSR）

描述：

在 Nuxt.js 中，`app:redirected`是一个钩子函数，它会在服务器端渲染（SSR）重定向（redirect）之前被调用。

详细解释：

在 Nuxt.js 应用程序中，可以使用钩子函数来在特定的生命周期事件中执行自定义的 JavaScript 代码。`app:redirected`
钩子函数在服务器端渲染（SSR）期间，在重定向（redirect）发生前被调用。

使用示例：

可以使用`export default defineNuxtPlugin()`的方式来使用此钩子函数，如下所示：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:redirected', () => {
    // 在这里编写重定向前需要执行的代码
    console.log('重定向前执行的代码...')
  })
})

```

在上面的示例中，我们使用`defineNuxtPlugin()`函数来注册一个插件，并在插件函数中使用`nuxtApp.hook()`
函数来注册`app:redirected`钩子函数。在钩子函数中，我们可以编写重定向前需要执行的代码。

需要注意的是，`app:redirected`钩子函数只会在服务器端渲染（SSR）期间被调用，因此在客户端渲染（Client-Side Rendering,
CSR）期间是不会被调用的。

## app:beforeMount

参数：`vueApp`

环境：客户端端（Client-Side Rendering, CSR）

描述：

在 Nuxt.js 中，`app:beforeMount`是一个钩子函数，它会在应用程序挂载之前被调用，仅在客户端端调用。

详细解释：

在 Nuxt.js 应用程序中，可以使用钩子函数来在特定的生命周期事件中执行自定义的 JavaScript 代码。`app:beforeMount`
钩子函数会在应用程序挂载之前被调用，且仅在客户端端（Client-Side Rendering, CSR）调用。

使用示例：

可以使用`export default defineNuxtPlugin()`的方式来使用此钩子函数，如下所示：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', (vueApp) => {
    // 在这里编写应用程序挂载前需要执行的代码
    console.log('应用程序挂载前执行的代码...')
    console.log(vueApp)
  })
})

```

在上面的示例中，我们使用`defineNuxtPlugin()`函数来注册一个插件，并在插件函数中使用`nuxtApp.hook()`
函数来注册`app:beforeMount`钩子函数。在钩子函数中，我们可以编写应用程序挂载前需要执行的代码，并可以通过`vueApp`参数获取
Vue.js 应用程序实例。

需要注意的是，`app:beforeMount`钩子函数仅在客户端端渲染（Client-Side Rendering, CSR）期间被调用，因此在服务器端渲染（Server-Side
Rendering, SSR）期间是不会被调用的。

## app:mounted

参数：`vueApp`

环境：客户端端（Client-Side Rendering, CSR）

描述：

在 Nuxt.js 中，`app:mounted`是一个钩子函数，它会在 Vue 应用程序初始化并在浏览器中挂载时调用，仅在客户端端调用。

详细解释：

在 Nuxt.js 应用程序中，可以使用钩子函数来在特定的生命周期事件中执行自定义的 JavaScript 代码。`app:mounted`钩子函数会在 Vue
应用程序初始化并在浏览器中挂载时被调用，且仅在客户端端（Client-Side Rendering, CSR）调用。

使用示例：

可以使用`export default defineNuxtPlugin()`的方式来使用此钩子函数，如下所示：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', (vueApp) => {
    // 在这里编写 Vue 应用程序初始化并在浏览器中挂载时需要执行的代码
    console.log('Vue 应用程序初始化并在浏览器中挂载时执行的代码...')
    console.log(vueApp)
  })
})

```

在上面的示例中，我们使用`defineNuxtPlugin()`函数来注册一个插件，并在插件函数中使用`nuxtApp.hook()`函数来注册`app:mounted`
钩子函数。在钩子函数中，我们可以编写 Vue 应用程序初始化并在浏览器中挂载时需要执行的代码，并可以通过`vueApp`参数获取 Vue.js
应用程序实例。

需要注意的是，`app:mounted`钩子函数仅在客户端端渲染（Client-Side Rendering, CSR）期间被调用，因此在服务器端渲染（Server-Side
Rendering, SSR）期间是不会被调用的。

## app:suspense:resolve

参数：`appComponent`

环境：客户端端（Client-Side Rendering, CSR）

描述：

在 Nuxt.js 应用程序中，`app:suspense:resolve`是一个钩子函数，它会在`Suspense`组件解析其子组件时调用。此钩子仅在客户端端（CSR）执行。

详细解释：

`Suspense`是 Vue 3 引入的一个用于处理异步组件和异步依赖的组件。在 Nuxt.js 中，你可以使用`app:suspense:resolve`
钩子来监听`Suspense`组件解析其子组件的事件。当`Suspense`组件的子组件全部解析完成时，此钩子会被触发。

使用示例：

以下是如何使用`export default defineNuxtPlugin()`方式注册`app:suspense:resolve`钩子的示例代码：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', (appComponent) => {
    // 在这里编写当 Suspense 解析事件发生时需要执行的代码
    console.log('Suspense 组件解析完成，子组件已准备就绪...')
    console.log(appComponent)
  })
})

```

在上面的代码中，我们注册了一个插件并在插件内部使用`nuxtApp.hook()`方法来监听`app:suspense:resolve`事件。当`Suspense`
组件解析其子组件时，会调用这个钩子函数，并传入`appComponent`参数，该参数是解析完成的组件实例。

案例 Demo：

以下是一个简单的 Nuxt.js 页面示例，展示了如何使用`Suspense`和`app:suspense:resolve`钩子：

```vue
<template>
  <div>
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
</template>

<script>
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', (appComponent) => {
    console.log('Suspense 解析完成:', appComponent);
  });
});

// 假设这是一个异步组件
const AsyncComponent = defineAsyncComponent(() =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        template: `<div>Async Component</div>`,
      });
    }, 2000);
  })
);
</script>
```

在这个示例中，`AsyncComponent`是一个异步组件，它会在 2 秒后解析。`Suspense`组件包裹了`AsyncComponent`
，并提供了一个`#fallback`插槽用于在组件加载期间显示加载提示。当异步组件解析完成后，`app:suspense:resolve`
钩子会被触发，并打印出解析完成的组件实例。

## link:prefetch

参数：`to`

环境：客户端端（Client-Side Rendering, CSR）

描述：

在 Nuxt.js 应用程序中，`link:prefetch`是一个钩子函数，它会在当观察到`<NuxtLink>`被预取时调用。此钩子仅在客户端端（CSR）执行。

详细解释：

当 Nuxt.js 应用程序中的`<NuxtLink>`组件被点击或在其附近滚动时，Nuxt.js
会自动预取链接指向的页面。在这个过程中，`link:prefetch`钩子会被触发，并传入`to`参数，其中包含了当前正在预取的链接的目标路由。

使用示例：

以下是如何使用`export default defineNuxtPlugin()`方式注册`link:prefetch`钩子的示例代码：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('link:prefetch', (to) => {
    // 在这里编写当 <NuxtLink> 被预取时需要执行的代码
    console.log('正在预取链接:', to.path);
  });
});

```

在上面的代码中，我们注册了一个插件并在插件内部使用`nuxtApp.hook()`方法来监听`link:prefetch`事件。当`<NuxtLink>`
被预取时，会调用这个钩子函数，并传入`to`参数，其中包含了当前正在预取的链接的目标路由。

案例 Demo：

以下是一个简单的 Nuxt.js 页面示例，展示了如何使用`link:prefetch`钩子：

```vue
<template>
  <div>
    <NuxtLink to="/about">About</NuxtLink>
  </div>
</template>

<script>
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('link:prefetch', (to) => {
    console.log('正在预取链接:', to.path);
  });
});
</script>
```

在这个示例中，我们在页面中添加了一个`<NuxtLink>`组件，指向`/about`路由。当这个链接被预取时，`link:prefetch`
钩子会被触发，并在控制台中打印出当前正在预取的链接的路径。

## page:start

参数：`pageComponent`

环境：客户端端（Client-Side Rendering, CSR）

描述：

`page:start`是 Nuxt.js 中的一个钩子，它在客户端页面渲染（包括 Suspense 挂起时）开始时被调用。当页面组件（`pageComponent`
）开始加载时，这个钩子会被触发。`pageComponent`参数通常是一个 Vue 组件实例，代表即将渲染的页面。

详细解释：

在 Nuxt.js 中，`page:start`钩子主要用于在页面开始加载时执行一些初始化操作，例如数据预加载、路由守卫（如
beforeRouteEnter）的执行，或者在 Suspense 挂起期间进行一些异步操作的初始化，以提高用户体验。

使用示例：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:start', async (pageComponent) => {
    // 在这里执行页面加载开始时的逻辑
    console.log('页面开始加载:', pageComponent.$options.name);
    if (pageComponent.$options.name === 'suspensePage') {
      // 对于 Suspense 挂起的页面，可以在这里做额外处理
      await someAsyncFunction();
    }
  });
});

```

在上面的代码中，我们注册了一个插件，当页面开始加载时，`page:start`钩子会被调用。如果页面组件是`suspensePage`
，则执行异步函数`someAsyncFunction()`，以在 Suspense 挂起期间进行初始化。

案例 Demo（简化版）：

```vue
<!-- pages/suspensePage.vue -->
<template>
  <Suspense>
    <div v-if="dataLoaded">Suspense 解除后的内容</div>
    <div v-else>Loading...</div>
  </Suspense>
</template>

<script>
export default {
  data() {
    return { dataLoaded: false };
  },
  async mounted() {
    await this.fetchData();
  },
  async fetchData() {
    // 异步获取数据
    // ...
    this.dataLoaded = true;
  },
};
</script>
```

在这个示例中，`suspensePage.vue`是一个 Suspense 挂起的页面。当页面开始加载时，`page:start`钩子会检查是否为`suspensePage`
，然后在`fetchData`方法中进行数据加载，确保数据在 Suspense 解除后显示。如果在`page:start`
钩子中执行了`await someAsyncFunction()`，则会在数据加载完成之前挂起页面，直到数据准备好。


往期文章推荐：

### 往期文章归档：

- [Nuxt3 的生命周期和钩子函数（一） | cmdragon’s Blog](https://blog.cmdragon.cn/2024-06-24/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%80%EF%BC%89/)
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
- [深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-22/front_end/%E6%B7%B1%E5%85%A5%E6%8E%A2%E7%B4%A2%20nuxt3%20composables%EF%BC%9A%E6%8E%8C%E6%8F%A1%E7%9B%AE%E5%BD%95%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%86%85%E7%BD%AEapi%E7%9A%84%E9%AB%98%E6%95%88%E5%BA%94%E7%94%A8/)
- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
- [探索Web Components | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-15/front_end/%E6%8E%A2%E7%B4%A2web%20components/)
- [Vue微前端架构与Qiankun实践理论指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-14/front_end/vue%E5%BE%AE%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E4%B8%8Eqiankun%E5%AE%9E%E8%B7%B5%E7%90%86%E8%AE%BA%E6%8C%87%E5%8D%97/)
- [Vue 3深度探索：自定义渲染器与服务端渲染 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-13/front_end/vue%203%E6%B7%B1%E5%BA%A6%E6%8E%A2%E7%B4%A2%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%E5%99%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/)
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
