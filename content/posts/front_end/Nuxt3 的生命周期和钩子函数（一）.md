---
url: /posts/5fa69707f657db97640ee64788afbd03/
title: Nuxt3 的生命周期和钩子函数（一）
date: 2024-06-25T00:18:53+08:00
updated: 2024-06-25T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文是关于Nuxt3的系列文章之一，主要探讨Nuxt3的生命周期和钩子函数，引导读者深入了解其在前端开发中的应用。文章提供了往期相关文章链接，涉及Nuxt中间件、Composables、状态管理、路由系统、组件开发等多个方面，帮助读者全面掌握Nuxt3框架的特性和实践技巧。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - 前端开发
  - Web框架
  - Vue.js
  - 应用教程
---
<img src="/images/2024_06_25 16_36_08.png" title="2024_06_25 16_36_08.png" alt="2024_06_25 16_36_08.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## app:created

-   **描述**：在初始 Vue 应用实例创建时调用。这个钩子是在 Nuxt 应用启动时，Vue 应用实例被创建之后立即触发的。
-   **服务器端**：✅
-   **客户端**：✅

### 用法

`app:created` 钩子可以在 `nuxt.config.ts` 文件中的 `plugins` 或者在页面组件中使用。

### 示例代码

在 `nuxt.config.ts` 中的插件中使用：

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  plugins: [
    {
      src: '~/plugins/my-plugin',
      mode: 'client', // 或者 'server' 或 'all'
    },
  ],
})

// plugins/my-plugin.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    console.log('Vue 应用实例已创建');
    // 这里可以执行一些初始化逻辑
  });
});

```

在页面组件中使用：

```vue
<template>
  <div>页面内容</div>
</template>

<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  // 这个钩子会在 'app:created' 之后调用
  console.log('页面组件即将挂载');
})

const nuxtApp = useNuxtApp()

nuxtApp.hook('app:created', () => {
  console.log('Vue 应用实例已创建 - 页面级别');
});
</script>
```

在这个示例中，`app:created` 钩子被用于在 Vue 应用实例创建时输出一条消息。这可以用于执行一些全局的初始化任务，比如设置全局变量或状态，注册全局组件等。需要注意的是，在服务器端渲染 (SSR) 的上下文中，这个钩子会在服务器上为每个请求调用一次。在客户端，这个钩子只在应用初始化时调用一次。



## app:error err 服务器端和客户端 在发生致命错误时调用。

### 详细解释

`app:error` 是 Nuxt 3 的一个全局生命周期钩子，它在服务器端和客户端发生未捕获的致命错误时被调用。这个钩子允许你定义一个自定义的错误处理函数，以便在发生错误时执行特定的逻辑，比如记录错误信息、发送错误报告、显示错误消息或者重定向到错误页面。

### 用法

在 Nuxt 3 应用中，你可以通过在 `defineNuxtPlugin` 函数中注册 `app:error` 钩子来使用它。

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err, ctx) => {
    // 自定义错误处理逻辑
  });
});

```

### 案例Demo

```javascript
// plugins/error-handler.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (err, ctx) => {
    console.error('An error occurred:', err.message);
    
    // 如果是客户端错误，可以显示一个错误消息给用户
    if (process.client) {
      alert('An error occurred: ' + err.message);
    }
    
    // 如果是服务器端错误，可以记录到日志文件或发送到错误追踪服务
    if (process.server) {
      // 例如，使用 winston 或其他日志库记录错误
      // logger.error('Server error:', err);
      
      // 或者发送错误到错误追踪服务，如 Sentry
      // Sentry.captureException(err);
    }
    
    // 可以根据错误类型决定是否重定向
    if (err.statusCode === 404) {
      // 重定向到404页面
      ctx.redirect('/404');
    }
  });
});

```

在这个案例中，我们定义了一个 `app:error` 钩子，当发生错误时，它会打印错误信息到控制台。如果是客户端错误，它会弹出一个包含错误信息的警告框。如果是服务器端错误，它可以记录错误日志或发送错误到错误追踪服务。此外，如果错误是一个特定的状态码（例如404），我们可以重定向用户到一个特定的页面。




## app:error:cleared { redirect? } 服务器端和客户端 在致命错误被清除后调用。

### 详细解释

`app:error:cleared` 是 Nuxt 3 的一个全局生命周期钩子，它在服务器端和客户端的致命错误被清除后调用。这个钩子允许你在错误被处理后执行后续操作，比如重定向用户到另一个页面。这个钩子接收一个可选的 `redirect` 参数，它允许你指定一个重定向的路径。

### 用法

在 Nuxt 3 应用中，你可以通过在 `defineNuxtPlugin` 函数中注册 `app:error:cleared` 钩子来使用它。

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error:cleared', (redirect, ctx) => {
    // 自定义错误清除后的逻辑
  });
});

```

### 案例Demo

```javascript
// plugins/error-clear-handler.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error:cleared', (redirect, ctx) => {
    // 如果提供了重定向路径，则进行重定向
    if (redirect) {
      ctx.redirect(redirect);
    }
    
    // 可以在这里执行其他清理工作，例如清除错误状态
    // 或者通知用户错误已经被处理
    if (process.client) {
      // 例如，更新UI来反映错误已经被处理
      // updateErrorState(false);
    }
    
    // 如果是服务器端，可能需要清除服务器状态或发送通知
    if (process.server) {
      // 清理服务器状态或发送通知
      // serverCleanup();
    }
  });
});

```

在这个案例中，我们定义了一个 `app:error:cleared` 钩子，当致命错误被清除后，它会检查是否提供了重定向路径，如果提供了，则执行重定向。此外，它还可以执行其他清理工作，例如在客户端更新UI状态以反映错误已经被处理，或者在服务器端清理服务器状态或发送通知。这个钩子是处理错误后恢复应用状态的有用工具。

## app:data:refresh keys? 服务器端和客户端 (内部)

### 详细解释

`app:data:refresh` 是 Nuxt 3 中的一个内部生命周期钩子，主要用于数据刷新。它在需要重新获取数据时被触发，通常发生在用户刷新页面或者在某些情况下数据更新后。`keys` 参数是可选的，它是一个数组，包含需要刷新的数据的键名，如果不提供，会刷新所有数据。

### 用法

在 Nuxt 3 中，你通常不会直接在 `defineNuxtPlugin` 中使用这个钩子，因为它是内部调用的。然而，如果你需要在插件中影响数据刷新行为，可以通过监听相关事件来间接使用。

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.on('dataRefresh', (keys) => {
    // 在这里处理数据刷新操作，例如更新缓存、请求新数据等
    if (keys) {
      // 如果提供了keys，只刷新指定的数据
      keys.forEach((key) => {
        nuxtApp.$store.dispatch('refreshData', key);
      });
    } else {
      // 否则刷新所有数据
      nuxtApp.$store.dispatch('refreshAllData');
    }
  });
});

```

### 案例Demo

```javascript
// plugins/data-refresh.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.on('dataRefresh', async (keys) => {
    if (keys) {
      const promises = keys.map(async (key) => {
        const freshData = await fetchNewData(key);
        nuxtApp.$store.commit('updateData', { key, data: freshData });
      });
      await Promise.all(promises);
    } else {
      const allData = await fetchAllData();
      nuxtApp.$store.commit('updateAllData', { data: allData });
    }
  });
});

// 在 store 中定义 mutation
export const mutations = {
  updateData(state, { key, data }) {
    state[key] = data;
  },
  updateAllData(state, { data }) {
    state = data;
  },
};

```

在这个案例中，我们创建了一个插件，监听 `dataRefresh` 事件。当事件触发时，我们根据提供的 `keys` 刷新指定的数据，或者刷新所有数据。然后，我们更新 Vuex 存储中的数据。注意，实际的 `fetchNewData` 和 `fetchAllData` 需要你根据你的应用逻辑来实现。


## vue:setup - 服务器端和客户端 (内部)

### 详细解释

`vue:setup` 是 Nuxt 3 中的一个生命周期钩子，它在每个 Vue 组件的 setup 阶段被调用。这个钩子主要用于在组件的初始化阶段进行数据处理、依赖注入、API 设置等操作。由于它是基于 Vue 的，所以它在客户端和服务器端都会执行，但服务器端渲染时，它主要作用于预渲染阶段。

### 用法

在 Nuxt 3 中，`vue:setup` 通常用于创建自定义组件，它会接收一个 `app` 对象，你可以通过这个对象访问 Nuxt 应用实例。例如，你可以注入 `$store` 或 `$router`，并定义组件的局部状态和方法。

```javascript
export default defineComponent({
  setup() {
    const store = inject('store');
    const router = inject('router');

    // 在这里定义组件的局部状态和方法
    const count = ref(0);
    const increment = () => {
      count.value++;
    };

    // 使用store和router
    watch(() => router.currentRoute.value.name, () => {
      // 当路由改变时执行某些操作
    });

    return {
      count,
      increment,
    };
  },
});

```

### 案例Demo

```javascript
// components/MyComponent.vue
export default defineComponent({
  setup() {
    const { $store } = inject();
    const myData = ref($store.state.myData);

    // 在setup中获取并使用store中的数据
    useEffect(() => {
      async function fetchData() {
        const newData = await fetchMyData();
        myData.value = newData;
      }
      fetchData();
    }, []);

    // 示例方法，使用store数据
    const updateData = (newValue) => {
      myData.value = newValue;
      $store.commit('updateMyData', newValue);
    };

    return {
      myData,
      updateData,
    };
  },
});

// 在store/index.js中定义mutation
export const mutations = {
  updateMyData(state, newData) {
    state.myData = newData;
  },
};

```

在这个案例中，我们在 `vue:setup` 中注入 `$store`，获取并使用存储中的数据。当组件挂载时，我们会从服务器获取数据并更新组件状态。同时，我们定义了一个 `updateData` 方法，用于更新 store 中的数据。在客户端和服务器端，这个组件都会执行这些操作。

## vue:error - err, target, info - 服务器端和客户端 - 当 Vue 错误传播到根组件时调用。了解更多。

### 详细解释

`vue:error` 是 Nuxt 3 中的一个生命周期钩子，它在 Vue 应用程序的错误处理过程中起作用。当 Vue 错误传播到根组件时，这个钩子会被调用。这个钩子可以用于在服务器端和客户端记录和处理错误。

### 用法

在 Nuxt 3 中，`vue:error` 通常用于在插件中处理应用程序中的错误。你可以在这个钩子中记录错误，并在服务器端和客户端进行相应的错误处理。

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err, target, info) => {
    // 记录和处理错误
    console.error('Error:', err);
    console.error('Target:', target);
    console.error('Info:', info);

    // 在这里进行错误处理，例如重定向到错误页面
    if (process.server) {
      // 服务器端错误处理
    } else {
      // 客户端错误处理
    }
  });
});

```

### 案例Demo

```javascript
// plugins/errorHandler.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err, target, info) => {
    // 记录和处理错误
    console.error('Error:', err);
    console.error('Target:', target);
    console.error('Info:', info);

    if (process.server) {
      // 服务器端错误处理
      nuxtApp.callHook('server:route', {
        path: '/error',
        statusCode: 500,
      });
    } else {
      // 客户端错误处理
      nuxtApp.router.push('/error');
    }
  });
});

```

在这个案例中，我们在一个插件中使用 `vue:error` 钩子来记录和处理错误。当 Vue 错误传播到根组件时，这个钩子会被调用。在服务器端，我们使用 `callHook` 函数重定向到一个错误页面。在客户端，我们使用 `router.push` 函数重定向到一个错误页面。这样，我们可以在服务器端和客户端都进行错误处理。

## app:rendered - renderContext - 服务器端 - 在 SSR 渲染完成时调用

### 详细解释

`app:rendered` 是 Nuxt 3 中的一个生命周期钩子，它在服务器端渲染 (SSR) 的过程中起作用。当 Nuxt 应用的客户端渲染完成并返回给用户时，这个钩子会被触发。`renderContext` 参数包含了渲染上下文，可以用来访问和操作渲染结果。

### 用法

在 Nuxt 3 中，你可以使用这个钩子在 SSR 完成后执行特定的逻辑，例如添加额外的元数据、修改页面内容或执行异步操作。

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', async (renderContext) => {
    // 修改渲染结果
    renderContext.body = '<div id="additional-content">Rendered on server</div>';

    // 执行异步操作
    const asyncData = await someAsyncFunction();
    renderContext.data = { ...renderContext.data, asyncData };

    // 返回更新后的渲染上下文
    return renderContext;
  });
});

```

### 案例Demo

```javascript
// plugins/modify SSR output.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', async (renderContext) => {
    // 添加元数据
    if (process.server) {
      renderContext.meta.title = 'Custom Title';
    }

    // 返回渲染上下文
    return renderContext;
  });
});

```

在这个案例中，我们在插件中使用 `app:rendered` 钩子来修改 SSR 渲染完成后的页面内容。在服务器端，我们添加了一个自定义的元数据标题。然后，我们返回更新后的渲染上下文，确保这些更改在客户端渲染时也会生效。



## app:rendered

-   **钩子**: `app:rendered`
-   **参数**: `renderContext`
-   **环境**: 服务器端
-   **描述**: 在 SSR 渲染完成时调用。

#### 用法

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', (renderContext) => {
    // 在这里可以访问和修改 renderContext
  });
});

```

#### 案例Demo

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', (renderContext) => {
    console.log('SSR 渲染完成，可以获取或修改生成的 HTML。');
    // 例如，输出生成的 HTML 的长度
    console.log(`Generated HTML length: ${renderContext.html.length}`);
  });
});

```


## 钩子：app:redirected

### 参数：

-   `url`：即将重定向到的目标URL字符串。
-   `status`：即将使用的HTTP状态码，通常为301（永久重定向）或302（临时重定向）。

### 环境：

-   服务器端（SSR，Server-Side Rendering）

### 描述：

`app:redirected` 是 Nuxt.js 的一个内置钩子，它在服务器端渲染（SSR）过程中，当Nuxt.js应用准备进行重定向之前被调用。这个钩子允许开发者在重定向发生之前执行自定义逻辑，比如修改重定向的目标URL或者状态码，或者根据特定条件取消重定向。

### 详细解释：

在服务器端渲染过程中，如果Nuxt.js决定对请求进行重定向，它会在实际发送重定向响应之前触发 `app:redirected` 钩子。钩子的回调函数接收即将重定向到的URL和状态码作为参数。开发者可以基于这些参数进行逻辑处理，例如检查URL的有效性，或者根据用户的认证状态决定是否应该进行重定向。

### 用法示例：

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:redirected', (url, status) => {
    // 检查重定向的URL是否满足特定条件
    if (url.startsWith('/forbidden')) {
      // 如果不满足条件，可以修改URL或状态码
      url = '/error';
      status = 403;
    }

    // 可以选择取消重定向，返回null
    if (shouldCancelRedirect(url)) {
      return null;
    }

    // 返回修改后的URL和状态码，或直接返回原始值
    return { url, status };
  });
});

// 辅助函数：决定是否取消重定向
function shouldCancelRedirect(url) {
  // 根据URL或其他条件决定是否取消重定向
  // ...
  return false; // 示例中默认不取消重定向
}

```

### 案例demo：

在下面的示例中，我们假设如果重定向到 `/forbidden` 开头的URL，则应该将状态码改为403，并重定向到 `/error` 页面。同时，我们提供了一个辅助函数 `shouldCancelRedirect` 来决定是否应该取消重定向。

这个钩子的使用可以帮助开发者更精细地控制应用的重定向行为，确保应用的导航逻辑符合预期。



往期文章推荐：

### 往期文章归档：

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
