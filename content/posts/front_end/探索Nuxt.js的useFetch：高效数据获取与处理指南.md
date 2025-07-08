---
url: /posts/29ff9113e98725ee69fa0148a47ae735/
title: 探索Nuxt.js的useFetch：高效数据获取与处理指南
date: 2024-07-15T00:18:53+08:00
updated: 2024-07-15T00:18:53+08:00
author: cmdragon

summary:
  摘要：“探索Nuxt.js的useFetch：高效数据获取与处理指南”详述了Nuxt.js中useFetch函数的使用，包括基本用法、动态参数获取、拦截器使用，及参数详解。文章通过示例展示了如何从API获取数据，处理动态参数，自定义请求和响应，以及useFetch和useAsyncData的参数选项，帮助开发者掌握异步数据加载技巧。

categories:
  - 前端开发

tags:
  - nuxt
  - useFetch
  - API
  - 数据
  - 异步
  - Vue.js
  - SSR
---


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

在构建现代Web应用时，数据获取是关键的一环。Nuxt.js，作为Vue.js的服务器渲染框架，提供了一系列强大的工具来简化数据获取流程。其中，`useFetch`
可组合函数是用于从API端点获取数据的高级封装，旨在与Nuxt的服务器端渲染（SSR）兼容。这个可组合函数提供了一个方便的封装，包装了[`useAsyncData`]()
和[`$fetch`]()。它根据URL和fetch选项自动生成一个键，根据服务器路由提供请求URL的类型提示，并推断API响应类型。

## `useFetch`的使用场景

`useFetch`主要用于在Nuxt应用中从API获取数据。它提供了一个方便的API，使得开发者能够以简洁的方式获取、处理和更新数据。这个函数可以用于任何需要从外部API获取数据的场景，如获取文章列表、用户信息、产品数据等。

### 示例：获取文章列表

假设我们有一个API端点`https://api.example.com/articles`，我们可以使用`useFetch`来获取文章列表：

```
<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul>
        <li v-for="article in articles" :key="article.id">
          {{ article.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const { data, pending, error, refresh } = useFetch(`https://api.example.com/articles/${route.params.slug}`);

    onMounted(() => {
      // 刷新数据以确保获取最新的文章列表
      refresh();
    });

    return { data, pending, error, refresh };
  },
};
</script>
```

#### 使用`useFetch`获取动态参数

假设API端点需要动态参数，如文章ID：

```
<script>
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const param1 = ref('value1');
    const { data, pending, error, refresh } = useFetch('https://api.example.com/articles', {
      query: { param1, param2: 'value2' }
    });

    return { data, pending, error, refresh };
  },
};
</script>
```

#### 使用拦截器

拦截器允许开发者在请求和响应阶段进行自定义操作，如设置请求头、处理请求错误、存储令牌等：

```
<script>

export default {
  setup() {
    const { data, pending, error, refresh } = useFetch('/api/auth/login', {
      onRequest({ request, options }) {
        options.headers.authorization = 'Bearer ' + localStorage.getItem('token');
      },
      onResponse({ request, response, options }) {
        localStorage.setItem('token', response.data.token);
      }
    });

    return { data, pending, error, refresh };
  },
};
</script>
```

在Nuxt.js中，`useFetch`是一个强大的可组合函数，它允许你从不同的API端点异步获取数据。以下是对`useFetch`接收的参数的详细解释：

## 参数

### 1. URL

- **类型**：`string`
- **描述**：这是你想要从API获取数据的URL。它可以是绝对路径或相对路径。相对路径将相对于当前页面的URL解析。

### 2. Options

- **类型**：`object`

- **描述**：这是一个对象，包含了从`unjs/ofetch`和`AsyncDataOptions`扩展而来的各种选项。以下是一些常见的选项：

    - **method**：`string`- 请求方法，如`'GET'`、`'POST'`、`'PUT'`、`'DELETE'`等。
    - **query**：`object`-
      一个对象，其键和值将被转换为查询字符串并附加到URL上。例如，`{ param1: 'value1', param2: 'value2' }`
      将生成`?param1=value1&param2=value2`。
    - **params**：`object`- 与`query`类似，也是用于添加查询参数的对象。`params`是`query`的别名。
    - **body**：`any`- 请求体，可以是对象、数组或其他任何可以被转换为字符串的值。如果传递的是对象，它将被自动转换为JSON字符串。
    - **headers**：`object`- 一个对象，包含了要发送的HTTP请求头。
    - **baseURL**：`string`- 请求的基本URL，所有请求都将相对于这个URL发送。

#### 示例代码

以下是一个使用`useFetch`的示例，展示了如何使用这些参数：

```
async function fetchData() {
  const { data, pending, error, refresh } = await useFetch('https://api.example.com/data', {
    method: 'GET',
    query: { userId: 123 },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token'
    },
    body: {
      key1: 'value1',
      key2: 'value2'
    },
    baseURL: 'https://api.example.com'
  });

  // 处理数据
  if (!pending && !error) {
    console.log(data);
  }
}

```

在这个例子中，我们向`https://api.example.com/data`发送了一个 GET 请求，其中包含查询参数`userId`
，请求头，以及一个请求体。`baseURL`被设置为`'https://api.example.com'`，这意味着所有的请求都将相对于这个URL发送。

#### 注意事项

- 如果同时提供了`query`和`params`，`useFetch`会将它们视为相同的选项。
- `body`中的对象将被自动转换为JSON字符串，除非显式设置`Content-Type`请求头。
- `baseURL`是可选的，如果未提供，则使用`URL`参数中的值。

## `useAsyncData` 参数详解

`useAsyncData`是 Nuxt 3 提供的一个用于异步加载数据的可组合函数。以下是对`useAsyncData`接收的参数的详细解释：

### 1. key

- **类型**：`string`或`symbol`
- **描述**：一个唯一的键，用于确保数据获取可以在请求之间正确去重。如果未提供，`useAsyncData`将根据使用它的静态代码位置生成一个键。

### 2. server

- **类型**：`boolean`
- **描述**：是否在服务器上获取数据。默认值为`true`。如果设置为`false`，则数据只会在客户端获取。

### 3. lazy

- **类型**：`boolean`
- **描述**：是否在加载路由后解析异步函数，而不是阻止客户端导航。默认值为`false`。如果设置为`true`，则异步数据获取将不会阻塞路由导航。

### 4. immediate

- **类型**：`boolean`
- **描述**：如果设置为`false`，将阻止立即发出请求。默认值为`true`，意味着异步函数会在组件初始化时立即执行。

### 5. default

- **类型**：`() => any`（工厂函数）
- **描述**：一个工厂函数，用于设置数据的默认值，在异步函数解析之前使用。通常与`lazy: true`或`immediate: false`选项一起使用。

### 6. transform

- **类型**：`(data) => any`
- **描述**：在解析后可以用于更改处理函数结果的函数。这个函数接收原始数据作为参数，并返回转换后的数据。

### 7. pick

- **类型**：`string[]`
- **描述**：仅从处理函数结果中选择指定的键。这允许你从响应中提取特定的数据片段。

### 8. watch

- **类型**：`boolean | Array`
- **描述**：监听一组响应式源，并在它们发生变化时自动刷新获取的结果。默认情况下，会监听`fetch`选项和`URL`
  。通过设置`watch: false`，可以完全忽略响应式源。结合`immediate: false`，可以实现完全手动的数据获取。

### 9. deep

- **类型**：`boolean`
- **描述**：以深层 ref 对象的形式返回数据。默认值为`true`。如果设置为`false`，则数据将在浅层 ref 对象中返回，这可以在不需要深层响应式数据时提高性能。

### 示例代码

以下是一个使用`useAsyncData`的示例：

```
async function fetchData() {
  const { data, pending, error } = await useAsyncData('uniqueKey', () =>
    $fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }),
    {
      server: true,
      lazy: false,
      immediate: true,
      default: () => ({ message: 'Loading...' }),
      transform: (原始数据) => {
        // 对数据进行转换
        return {
          ...原始数据,
          modifiedData: 'Modified'
        };
      },
      pick: ['id', 'name'],
      watch: ['query'],
      deep: false
    }
  );

  // 处理数据
  if (!pending && !error) {
    console.log(data.value);
  }
}

```

在这个例子中，我们使用`useAsyncData`来获取数据，并设置了一些选项来控制数据获取的行为。我们定义了一个唯一的键`uniqueKey`
，设置了默认值，并指定了数据转换和选择的字段。我们还设置了`watch`选项来监听特定的响应式源。

## 返回值

`useFetch`是 Nuxt 3
中用于处理异步数据加载的一个组合式函数，它返回一个对象，其中包含了异步数据操作的相关信息。以下是`useFetch`返回值的详细解释：

### 1. data

- **类型**：`any`
- **描述**：传入的异步函数（handler）的结果。当异步操作成功完成时，这个值将包含异步函数返回的数据。

### 2. pending

- **类型**：`boolean`
- **描述**：一个布尔值，指示数据是否仍在获取中。当数据正在加载时，这个值将为`true`
  ；当数据加载完成时，无论成功或失败，这个值都将变为`false`。

### 3. refresh/execute

- **类型**：`function`
- **描述**：一个可以用于刷新 handler 函数返回的数据的函数。调用这个函数将重新执行 handler 函数，并更新`data`和`pending`状态。

### 4. error

- **类型**：`Error`或`null`
- **描述**：如果数据获取失败，则为错误对象。如果数据获取成功，这个值将为`null`。

### 5. status

- **类型**：`string`

- **描述**：表示数据请求的状态的字符串，可以是以下之一：

    - `"idle"`：没有数据请求正在进行。
    - `"pending"`：数据请求正在进行中。
    - `"success"`：数据请求成功完成。
    - `"error"`：数据请求失败。

### 默认行为

- **Nuxt 等待 refresh 完成**：默认情况下，Nuxt 会等待`refresh`完成后才能再次执行。这意味着如果你尝试再次调用`refresh`
  ，它将不会重新执行 handler 函数，直到之前的`refresh`完成并返回新数据。
- **server: false 时的行为**：如果您没有在服务器上获取数据（例如，通过设置`server: false`
  ），那么直到组件融合（hydration）完成之前，数据将不会被获取。这意味着即使在客户端上等待`useFetch`，`data`也会保持为`null`。

### 示例代码

以下是如何使用`useFetch`返回值的示例：

```
<script setup>

const { data, pending, error, status, refresh } = useFetch('key', () =>
  fetch('https://api.example.com/data').then(response => response.json())
);

watch(pending, (isPending) => {
  if (isPending) {
    console.log('数据正在加载...');
  } else {
    if (error.value) {
      console.error('数据加载失败:', error.value);
    } else {
      console.log('数据加载成功:', data.value);
    }
  }
});

// 刷新数据
refresh();
</script>

```

在这个例子中，我们使用`useFetch`来获取数据，并通过`watch`来监听数据加载的状态。我们还展示了如何调用`refresh`函数来重新加载数据。


## 往期文章归档：

- [Nuxt.js 错误侦探：useError 组合函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b73679558bc672550fbbb72ae295fdf5/)
- [useCookie函数：管理SSR环境下的Cookie | cmdragon's Blog](https://blog.cmdragon.cn/posts/cd361e1a7930614f1aaf46ad35b28958/)
- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
- [使用 `useAppConfig` ：轻松管理应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9e044d4b53eab6a1bec49bb86b4c856c/)
- [Nuxt框架中内置组件详解及使用指南（五） | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff42c6a570627402dbbdd82adbb2ed2a/)
- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
- [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/4807b70f6729c39ff090d7e8ac1e2f6d/)
- [Nuxt3 的生命周期和钩子函数（十） | cmdragon's Blog](https://blog.cmdragon.cn/posts/df209e19c18baa3bc7e0ebfa473099d8/)
- [Nuxt3 的生命周期和钩子函数（九） | cmdragon's Blog](https://blog.cmdragon.cn/2024-07-02/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B9%9D%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（七） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%83%EF%BC%89/)
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
