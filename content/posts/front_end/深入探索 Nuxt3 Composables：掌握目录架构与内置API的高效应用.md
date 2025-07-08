---
url: /posts/99ad22c410bbc10e48a61f6683002792/
title: 深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用
date: 2024-06-23T00:18:53+08:00
updated: 2024-06-23T00:18:53+08:00
author: cmdragon

summary:
   摘要：“本文深入探讨了Nuxt3 Composables，重点介绍了其目录架构和内置API的高效应用。通过学习本文，读者将能够更好地理解和利用Nuxt3 Composables来构建高效的应用程序。”

categories:
   - 前端开发

tags:
   - nuxt
   - Composables
   - 目录架构
   - 内置API
   - 高效应用程序
   - 构建应用
   - 学习
---

<img src="/images/2024_06_23 15_00_16.png" title="2024_06_23 15_00_16.png" alt="2024_06_23 15_00_16.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

## Nuxt3 Composables

### **1.1 Composables 概述**

Composables 是 Vue 3 中的一种新特性，它允许在组件之间共享可复用的逻辑和计算。Composables 是轻量级的，它们不是真正的组件，而是独立的
JavaScript 文件，通常位于`~/composables`目录下。它们可以包含数据、方法、计算属性等，可以被任何组件导入并使用，从而帮助组织代码，减少重复，并提高代码的可复用性。

### **1.2 安装与配置**

在 Nuxt.js 3 中，由于 Nuxt 本身已经集成了 Vue 3 的 Composables，所以你不需要额外安装。只需在项目中创建一个`~/composables`
文件夹，然后在其中创建`.js`或`.ts`文件来定义你的 Composables。

Nuxt 提供了自动导入和使用 Composables 的支持。在需要使用 Composables 的组件中，只需使用`import`语句导入，例如：

```
// components/MyComponent.vue
import { useMyFunction } from "~/composables/myFunction.js"

export default {
  setup() {
    const result = useMyFunction();
    // ...
  }
}

```

### **1.3 使用 Composables 的基本步骤**

1. **创建 Composables**：在`~/composables`文件夹中，创建一个文件（如`myFunction.js`），定义你的函数或计算逻辑。
2. **导入 Composables**：在需要使用的地方，如组件的`setup`函数中，导入需要的 Composables。
3. **使用 Composables**：在导入后，可以直接使用 Composables 中的变量、方法或计算属性。
4. **更新和响应式**：由于 Vue 3 的响应式系统，当你在 Composables 中修改数据时，依赖于这些数据的组件会自动更新。

### **1.4 Composables 与 Vue 3 的响应式系统**

Composables 中的数据默认是响应式的，因为它们是 Vue 3 组件的一部分。当你在 Composables 中定义一个数据对象或计算属性，并在组件中使用它，Vue
的变更检测系统会在数据变化时自动更新组件。例如：

```
// myFunction.js
export const myData = ref(0);

export function increment() {
  myData.value++;
}

```

在组件中：

```
import { myData, increment } from "~/composables/myFunction.js"

setup() {
  onMounted(() => increment()); // 初始化
  watch(myData, () => console.log('Data updated!')); // 监听数据变化
}

```

当`myData`的值改变时，组件中的`watch`会触发。这就是 Composables 和 Vue 3 响应式系统协同工作的基本方式。

## 核心 Composables

### 2.1 useFetch

`useFetch`是 Nuxt 3 提供的一个核心 Composables，用于简化从 API 获取数据的过程。它封装了异步数据获取的逻辑，使得在组件中获取数据变得简单和直观。

#### **基本用法**

1. **导入 useFetch**：在组件中导入`useFetch`。
2. **使用 useFetch**：在组件的`setup`函数中调用`useFetch`，并传入一个 URL 或一个返回 URL 的函数。

示例代码如下：

```
// components/MyComponent.vue
import { useFetch } from '#app'; // 使用 Nuxt 3 的内置 useFetch

export default {
  setup() {
    const { data, pending, error } = useFetch('/api/data');

    return {
      data,
      pending,
      error
    };
  }
}

```

在这个例子中，`useFetch`被用来获取`/api/data`的数据。`data`包含从 API 返回的数据，`pending`
是一个布尔值，表示请求是否正在进行中，`error`包含任何可能发生的错误。

#### **进阶用法**

`useFetch`也支持更高级的用法，例如自定义请求选项、处理响应和错误等。

1. **自定义请求选项**：可以传递一个对象作为第二个参数，来配置请求，如设置请求方法、头部信息等。

```
setup() {
  const { data, pending, error } = useFetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' } });

  return {
    data,
    pending,
    error
  };
}

```

2. **处理响应和错误**：可以添加额外的逻辑来处理响应数据或错误。

```
setup() {
  const { data, pending, error } = useFetch('/api/data');

  if (error.value) {
    console.error('Error fetching data:', error.value);
  }

  return {
    data,
    pending,
    error
  };
}

```

3. **动态 URL**：可以传递一个返回 URL 的函数，使得 URL 可以根据组件的状态动态变化。

```
setup() {
  const url = computed(() => `/api/data?id=${someId.value}`);
  const { data, pending, error } = useFetch(url);

  return {
    data,
    pending,
    error
  };
}

```

在这个例子中，URL 是根据`someId`的值动态生成的。

通过这些进阶用法，`useFetch`可以适应更复杂的数据获取需求，同时保持代码的清晰和简洁。

### 2.2 useHead

`useHead`是 Nuxt 3 中的一个核心 Composable，用于管理组件的`<head>`元数据，如标题、meta
标签、图标等。它简化了在多个组件中管理头部元数据的过程，确保在整个应用中保持一致性和SEO优化。

#### **基本用法**

1. **导入 useHead**：在组件中导入`useHead`。
1. **使用 useHead**：在组件的`setup`函数中调用`useHead`，返回一个`head`对象，你可以在这个对象上添加或修改头部元数据。

示例代码如下：

```
// components/MyComponent.vue
import { useHead } from '#app';

export default {
  setup() {
    const head = useHead();

    head.title('My Component Title');
    head.meta({ name: 'description', content: 'This is a description for my component' });

    return {
      head
    };
  }
}

```

在这个例子中，`head.title`设置了组件的标题，`head.meta`添加了一个描述元标签。

#### **进阶用法**

1. **动态头部数据**：你可以根据组件的状态动态设置头部元数据。

```
setup() {
  const title = computed(() => `My Component - ${someValue.value}`);
  const head = useHead();

  head.title(title);

  return {
    title,
    head
  };
}

```

2. **预渲染优化**：`useHead`可以配合预渲染（SSR）来设置预渲染时的头部元数据，这对于SEO非常重要。

```
setup() {
  const head = useHead();

  if (process.server) {
    head.title('My Component Title (Server-side)');
  }

  return {
    head
  };
}

```

3. **处理默认头部**：`useHead`会自动处理 Nuxt 的默认头部，你可以覆盖它们，但也可以选择保留默认的。

```
setup() {
  const head = useHead();

  head.meta({ ...head.meta(), name: 'robots', content: 'noindex, nofollow' });

  return {
    head
  };
}

```

在这个例子中，添加了一个新的元标签，同时保留了默认的元标签。

`useHead`提供了一种灵活的方式来管理组件的头部元数据，使得整个应用的SEO优化和元数据一致性变得简单。

### 2.3 useRuntimeConfig

`useRuntimeConfig`是 Nuxt 3 中的一个核心 Composable，用于在应用的运行时获取配置信息。它使得在不同环境（开发、生产）下使用不同的配置变得简单。

#### **基本用法**

1. **导入 useRuntimeConfig**：在组件中导入`useRuntimeConfig`。
1. **使用 useRuntimeConfig**：在组件的`setup`函数中调用`useRuntimeConfig`，返回一个对象，包含了应用的运行时配置。

示例代码如下：

```
// components/MyComponent.vue
import { useRuntimeConfig } from '#app';

export default {
  setup() {
    const config = useRuntimeConfig();

    console.log(config.public.apiBase);

    return {
      config
    };
  }
}

```

在这个例子中，`config.public.apiBase`获取了应用的公共配置信息中的`apiBase`属性。

#### **进阶用法**

1. **区分环境**：你可以根据不同的环境（开发、生产）使用不同的配置。

```
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://myapp.com/api'
    }
  }
});

```

在这个例子中，根据不同的环境设置了不同的`apiBase`值。

2. **私有配置**：你可以在`runtimeConfig`中设置私有配置，这些配置只在服务器端可用。

```
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    secretKey: 'my-secret-key'
  }
});

// components/MyComponent.vue
import { useRuntimeConfig } from '#app';

export default {
  setup() {
    const config = useRuntimeConfig();

    console.log(config.secretKey);

    return {
      config
    };
  }
}

```

在这个例子中，`config.secretKey`获取了应用的私有配置信息中的`secretKey`属性。

3. **使用`defineNuxtConfig`自定义配置**：你可以使用`defineNuxtConfig`函数自定义配置，并在`runtimeConfig`中使用它们。

```
// nuxt.config.ts
export default defineNuxtConfig({
  myCustomConfig: 'my-custom-value',
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://myapp.com/api'
    },
    myCustomConfig: {
      type: String,
      default: 'default-value'
    }
  }
});

// components/MyComponent.vue
import { useRuntimeConfig } from '#app';

export default {
  setup() {
    const config = useRuntimeConfig();

    console.log(config.myCustomConfig);

    return {
      config
    };
  }
}

```

在这个例子中，使用`defineNuxtConfig`自定义了一个名为`myCustomConfig`的配置，并在`runtimeConfig`中使用了它。

`useRuntimeConfig`提供了一种简单、强大的方式来获取应用的运行时配置，同时支持区分环境和自定义配置。

### 2.4 useRequestEvent

基本用法

`useRequestEvent`是 Nuxt 3 提供的一个用于访问 HTTP 请求事件的 Composable。它允许你访问请求对象，这对于处理中间件、分析请求信息或者执行基于请求的自定义逻辑非常有用。

#### **基本用法**

1. **导入 useRequestEvent**：在组件或页面中导入`useRequestEvent`。
2. **使用 useRequestEvent**：在组件的`setup`函数或者页面中直接调用`useRequestEvent`。

示例代码如下：

```
// pages/index.vue
import { useRequestEvent } from '#app';

export default {
  setup() {
    const requestEvent = useRequestEvent();

    console.log(requestEvent.node.req.url); // 输出请求的URL

    return {
      requestEvent
    };
  }
}

```

在这个例子中，`requestEvent.node.req.url`获取了当前请求的 URL。

#### **进阶用法**

1. **监听请求事件**：你可以使用`watch`或`watchEffect`来监听请求事件的变化。

```
// pages/index.vue
import { useRequestEvent, watch } from '#app';

export default {
  setup() {
    const requestEvent = useRequestEvent();

    watch(() => requestEvent.node.req.url, (newUrl, oldUrl) => {
      console.log(`请求URL从 ${oldUrl} 变更为 ${newUrl}`);
    });

    return {
      requestEvent
    };
  }
}

```

在这个例子中，每当请求的 URL 发生变化时，都会打印出变化前后的 URL。

2. **使用请求事件进行条件逻辑**：根据请求事件执行不同的逻辑。

```
// pages/index.vue
import { useRequestEvent } from '#app';

export default {
  setup() {
    const requestEvent = useRequestEvent();

    if (requestEvent.node.req.method === 'POST') {
      // 处理POST请求
    } else {
      // 处理其他类型的请求
    }

    return {
      requestEvent
    };
  }
}

```

在这个例子中，根据请求的方法类型（GET、POST等）来执行不同的逻辑。

3. **结合中间件使用**：在 Nuxt 3 中，你可以使用中间件来处理请求，并在中间件中使用`useRequestEvent`。

```
// middleware/analyze-request.js
export default defineNuxtMiddleware((req, res, next) => {
  const requestEvent = useRequestEvent();

  console.log(requestEvent.node.req.url); // 输出请求的URL

  next();
});

```

在这个例子中，中间件`analyze-request.js`使用`useRequestEvent`来输出请求的 URL，然后调用`next()`以继续处理请求。

`useRequestEvent`是处理 HTTP 请求的一个强大工具，特别是在需要根据请求信息进行逻辑决策或者执行请求相关的操作时。通过上述的基本和进阶用法，你可以更好地利用
Nuxt 3 提供的功能来处理请求事件。

### 2.5 useAppConfig

```


```

5. **在插件中使用配置：**如果你正在编写一个 Nuxt 插件，你可以在插件内部使用`useAppConfig`。

```
export default defineNuxtPlugin(nuxtApp => {
  const { config } = useAppConfig();
  // 使用配置...
});

```

在使用`useAppConfig`时，需要注意的是，任何对配置的修改都会影响整个应用程序的运行时行为。因此，在修改配置时要格外小心，确保这些修改不会导致不可预见的问题。

此外，`useAppConfig`的具体实现可能会随着 Nuxt 3 的版本更新而发生变化，所以建议查阅最新的 Nuxt 3 文档以获取最准确的信息。

### 2.6 useAsyncData

#### **基本用法**

`useAsyncData`的基本用法如下：

```
<script setup>
const { data, pending, error } = useAsyncData('my-key', () =>
  $fetch('https://api.example.com/data')
)
</script>

<template>
  <div v-if="pending">
    数据加载中...
  </div>
  <div v-else-if="error">
    加载数据时出错：{{ error.message }}
  </div>
  <div v-else>
    数据：{{ data }}
  </div>
</template>

```

在这个例子中，`useAsyncData`接收两个参数：

1. `key`: 一个字符串，用于唯一标识这个异步数据请求。
1. `fn`: 一个函数，用于在服务器端和客户端执行异步数据请求。

`useAsyncData`返回一个对象，包含以下属性：

1. `data`: 一个响应式的对象，包含异步数据请求的结果。
1. `pending`: 一个布尔值，表示异步数据请求是否正在进行中。
1. `error`: 一个对象，如果异步数据请求失败，则包含错误信息。

#### **进阶用法**

1. **在服务器端预取数据：**你可以在服务器端预取数据，以提高首次渲染的性能。

```
<script setup>
const { data, pending, error } = useAsyncData('my-key', () =>
  $fetch('https://api.example.com/data'),
  {
    server: true
  }
)
</script>

```

在这个例子中，`{ server: true }`选项表示在服务器端执行异步数据请求。

2. **在组件外部使用`useAsyncData`：**你可以在任何地方使用`useAsyncData`，不仅仅是组件内部。

```
// 例如，在服务器中间件中
export default defineNitroRoute((req, res, next) => {
  const { data, pending, error } = useAsyncData('my-key', () =>
    $fetch('https://api.example.com/data')
  )

  if (pending.value) {
    res.statusCode = 202
    res.setHeader('content-type', 'text/plain')
    res.end('Data is loading...')
  } else if (error.value) {
    res.statusCode = 500
    res.setHeader('content-type', 'text/plain')
    res.end(`Error: ${error.value.message}`)
  } else {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(data.value))
  }
})

```

3. **使用`useAsyncData`的可选参数：**`useAsyncData`接收一个可选的第三个参数，用于配置异步数据请求的选项。

```
<script setup>
const { data, pending, error } = useAsyncData('my-key', () =>
  $fetch('https://api.example.com/data'),
  {
    watch: ['someData'],
    initialCache: true,
    transform: (data) => {
      // 对数据进行转换
      return data
    }
  }
)
</script>

```

在这个例子中，`watch`选项表示在`someData`变化时重新执行异步数据请求。`initialCache`
选项表示在服务器端缓存异步数据请求的结果。`transform`选项表示对异步数据请求的结果进行转换。

4. **使用`ref`和`reactive`与`useAsyncData`结合使用：**你可以使用`ref`和`reactive`与`useAsyncData`结合使用，以更好地控制异步数据请求的行为。

```
<script setup>
import { ref, reactive } from 'vue'

const key = 'my-key'
const data = ref(null)
const error = ref(null)
const loading = ref(true)

const fetchData = async () => {
  try {
    const result = await useAsyncData(key, () =>
      $fetch('https://api.example.com/data')
    )

    data.value = result.data
    error.value = result.error
    loading.value = false
  } catch (err) {
    error.value = err
    loading.value = false
  }
}

const config = reactive({
  // 配置信息
})

fetchData()
</script>

```

在这个例子中，我们使用`ref`和`reactive`分别创建了`data`、`error`和`loading`的响应式变量，并在`fetchData`
函数中执行异步数据请求。这种方式允许我们更好地控制异步数据请求的行为，并在不同的场景下进行更灵活的数据处理。

在使用`useAsyncData`时，需要注意的是，任何对异步数据请求的修改都会影响整个应用程序的行为。因此，在修改异步数据请求时要格外小心，确保这些修改不会导致不可预见的问题。

### 2.7 useCookie

#### **基本用法**

```
<script setup>
import { useCookie } from '@nuxtjs/composition-api'

const getCookieValue = () => {
  const { value } = useCookie('myCookieKey')
  return value
}
</script>

<template>
  <div>
    Cookie value: {{ getCookieValue() }}
  </div>
</template>

```

在这个例子中，`useCookie`接收一个参数，即你想要获取的 cookie 的键。它返回一个对象，包含`value`属性，表示 cookie 的值。如果
cookie 不存在，`value`会是`undefined`。

#### **进阶用法**

1. **设置 cookie：**

```
<script setup>
import { useCookie } from '@nuxtjs/composition-api'

const setCookie = (key, value, options = {}) => {
  useCookie(key, value, {
    ...options,
    expires: 365, // 设置 cookie 的过期时间（单位为天）
    path: '/', // 设置 cookie 的路径
    secure: process.server, // 如果在服务器端，则设置为 secure
    httpOnly: true // 设置为 httpOnly，防止通过 JavaScript 访问
  })
}
</script>

<button @click="setCookie('myCookieKey', 'cookieValue')">Set Cookie</button>

```

在这个例子中，`setCookie`函数接受 cookie 的键、值和可选的选项，用于设置新的 cookie。

2. **删除 cookie：**

```
<script setup>
import { useCookie } from '@nuxtjs/composition-api'

const deleteCookie = (key) => {
  useCookie(key, '', {
    path: '/',
    expires: -1 // 设置过期时间为过去，即立即删除
  })
}
</script>

<button @click="deleteCookie('myCookieKey')">Delete Cookie</button>

```

`deleteCookie`函数接受 cookie 的键，用于删除指定的 cookie。

3. **监听 cookie 变化：**

```
<script setup>
import { useCookie, onMounted } from '@nuxtjs/composition-api'

const cookieValue = ref(null)

onMounted(() => {
  cookieValue.value = useCookie('myCookieKey')
  // 使用 watch 或者自定义事件来监听 cookie 的变化
  watch(() => useCookie('myCookieKey'), (newValue) => {
    cookieValue.value = newValue
  })
})
</script>

```

通过监听`useCookie`的返回值，你可以实时获取并更新 cookie 的值。

4. **处理 cookie 的错误：**

```
<script setup>
import { useCookie } from '@nuxtjs/composition-api'

const getCookieValue = async () => {
  try {
    const { value } = await useCookie('myCookieKey')
    return value
  } catch (error) {
    console.error('Error reading cookie:', error)
    return null
  }
}
</script>

```

在使用`useCookie`时，可以使用 async/await 结构来处理可能的错误。

### 2.8 useError

#### **基本用法**

```
<script setup>
import { useError } from '@nuxtjs/composition-api'

const showError = () => {
  const { show, message } = useError()
  if (show) {
    alert(message)
  }
}
</script>

<button @click="showError()">Show Error</button>

```

在这个例子中，`useError`返回一个对象，包含`show`和`message`属性。`show`是一个布尔值，表示是否有错误，`message`
是错误信息。通过检查`show`，你可以决定是否显示错误提示。

#### **进阶用法**

1. **自定义错误处理：**

```
<script setup>
import { useError } from '@nuxtjs/composition-api'

const handleErrors = async (action) => {
  try {
    await action()
  } catch (error) {
    useError({ show: true, message: error.message })
  }
}

const fetchData = async () => {
  // 异步操作可能会抛出错误
  const response = await fetch('https://api.example.com')
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  // 成功处理数据
}

<button @click="handleErrors(fetchData)">Fetch Data</button>
</script>

```

`handleErrors`函数包裹可能会抛出错误的异步操作，如果发生错误，它会调用`useError`显示错误。

2. **状态管理：**

```
<script setup>
import { useError, ref } from '@nuxtjs/composition-api'

const error = ref(null)

const handleFormSubmit = async () => {
  try {
    // 表单验证和提交逻辑
    const result = await submitForm()
    if (result.success) {
      error.value = null
    } else {
      useError({ show: true, message: result.errorMessage })
    }
  } catch (error) {
    useError({ show: true, message: error.message })
  }
}

<button @click="handleFormSubmit()">Submit Form</button>
</script>

```

在表单提交等需要处理成功和失败情况的操作中，你可以通过`ref`存储错误状态，并在错误发生时更新它。

3. **错误处理组件化：**

```
<script setup>
import { useError } from '@nuxtjs/composition-api'
import ErrorComponent from '@/components/Error.vue'

const showError = () => {
  const { show, message } = useError()
  if (show) {
    return ErrorComponent({ message })
  }
}

</script>

<template>
  <div>
    <button @click="showError()">Show Error</button>
    <template v-if="showError()">{{ showError() }}</template>
  </div>
</template>

```

你可以创建一个专门用于显示错误的组件，并在需要时根据`useError`的状态渲染它。

### 2.9 useHeadSafe

#### **基本用法**

```
<script setup>
import { useHeadSafe } from '@nuxtjs/composition-api'

const title = 'My Page Title'

useHeadSafe({
  title,
})
</script>

```

在这个例子中，`useHeadSafe`接收一个对象，其中包含需要设置的 head 标签。在这里，我们设置了页面标题。

#### **进阶用法**

1. **动态设置 head 标签：**

```
<script setup>
import { useHeadSafe } from '@nuxtjs/composition-api'

const title = ref('My Page Title')

watch(title, (newTitle) => {
  useHeadSafe({
    title: newTitle,
  })
})

// 更新标题
title.value = 'New Page Title'
</script>

```

在这个例子中，我们使用`watch`监听`title`的变化，并在变化时动态更新 head 标签。

2. **设置多个 head 标签：**

```
<script setup>
import { useHeadSafe } from '@nuxtjs/composition-api'

const title = 'My Page Title'
const description = 'My Page Description'

useHeadSafe({
  title,
  meta: [
    { hid: 'description', name: 'description', content: description },
  ],
})
</script>

```

在这个例子中，我们设置了多个 head 标签，包括标题和描述。

3. **条件渲染 head 标签：**

```
<script setup>
import { useHeadSafe } from '@nuxtjs/composition-api'

const showDescription = ref(true)

const title = 'My Page Title'
const description = 'My Page Description'

useHeadSafe({
  title,
  meta: showDescription.value ? [
    { hid: 'description', name: 'description', content: description },
  ] : [],
})

// 切换描述的显示状态
showDescription.value = false
</script>

```

在这个例子中，我们根据`showDescription`的值动态渲染或隐藏描述 head 标签。

### 2.10 useHydration

#### **基本用法**

```
<script setup>
import { useHydration } from '@nuxtjs/composition-api'

const { isHydrated } = useHydration()
</script>

<template>
  <div v-if="isHydrated">
    <!-- 已经被服务器端渲染的部分 -->
  </div>
  <div v-else>
    <!-- 尚未被服务器端渲染的部分 -->
  </div>
</template>

```

在这个例子中，我们使用`useHydration`获取`isHydrated`的值，并在模板中进行条件渲染。如果`isHydrated`为`true`
，则说明该部分已经被服务器端渲染，否则说明尚未被服务器端渲染。

#### **进阶用法**

1. **在组件中使用`useHydration`：**

```
<script setup>
import { useHydration } from '@nuxtjs/composition-api'

const { isHydrated } = useHydration()

function handleClick() {
  if (isHydrated.value) {
    // 已经被服务器端渲染，可以执行客户端操作
  } else {
    // 尚未被服务器端渲染，可以延迟执行操作
  }
}
</script>

<template>
  <button @click="handleClick">
    <!-- 按钮文字 -->
  </button>
</template>

```

在这个例子中，我们在组件中使用`useHydration`获取`isHydrated`的值，并在按钮点击事件中进行条件操作。

2. **在模板中使用`isHydrated`属性：**

```
<script setup>
import { useHydration } from '@nuxtjs/composition-api'

const { isHydrated } = useHydration()
</script>

<template>
  <div :class="{ active: isHydrated }">
    <!-- 根据 isHydrated 的值动态添加 active 类 -->
  </div>
</template>

```

在这个例子中，我们在模板中使用`isHydrated`的值动态添加`active`类。

### 2.11 useLazyAsyncData

`useLazyAsyncData`是 Nuxt 3 提供的一个内置 Composable，用于定义异步数据，该数据在客户端按需加载，而不是在服务器端渲染时立即加载。这在处理大量数据或希望延迟加载数据以优化性能时非常有用。

#### **基本用法**

以下是一个`useLazyAsyncData`的基本用法示例：

```
<script setup>
import { useLazyAsyncData } from '#app/composables'

// 定义一个异步函数来获取数据
const fetchData = async () => {
  const response = await fetch('/api/data')
  return await response.json()
}

// 使用 useLazyAsyncData 来定义异步数据
const lazyData = useLazyAsyncData('lazyData', fetchData)
</script>

<template>
  <div v-if="lazyData.isFetching">加载中...</div>
  <div v-else-if="lazyData.error">出错了：{{ lazyData.error.message }}</div>
  <div v-else>
    <!-- 显示数据 -->
    {{ lazyData.data }}
  </div>
</template>

```

在这个例子中，我们定义了一个名为`fetchData`的异步函数来获取数据，并使用`useLazyAsyncData`
创建了一个响应式引用`lazyData`。`lazyData`包含三个属性：`data`（存储数据）、`isFetching`（表示是否正在获取数据）和`error`
（存储可能发生的错误）。

#### **进阶用法**

1. **条件触发数据加载：**

你可以根据特定条件触发数据的加载，而不是在页面加载时立即加载。

```
const loadLazyData = () => {
  if (!lazyData.data) {
    lazyData.fetch()
  }
}

```

2. **使用 watch 或 watchEffect 触发数据加载：**

如果你想要在某个响应式引用变化时自动加载数据，可以使用`watch`或`watchEffect`。

```
import { watch } from 'vue'

const someCondition = ref(false)

watch(someCondition, (newValue) => {
  if (newValue) {
    loadLazyData()
  }
})

```

3. **自定义加载行为：**

你可以通过传递额外的选项来自定义加载行为，例如设置延迟加载。

```
const lazyDataWithDelay = useLazyAsyncData('lazyDataWithDelay', fetchData, {
  delay: 1000, // 延迟1秒后加载
})

```

4. **在组件外部触发加载：**

如果你需要在组件外部触发数据的加载，可以将`fetch`方法暴露给模板或其他组件。

```
<script setup>
const loadLazyData = () => {
  lazyData.fetch()
}
</script>

<template>
  <button @click="loadLazyData">加载数据</button>
</template>

```

在使用`useLazyAsyncData`时，请注意，它返回的`lazyData`对象是响应式的，因此你可以在模板中直接使用它，并且当数据加载状态变化时，界面会自动更新。

务必参考 Nuxt 3 的官方文档以获取最新的 Composable 使用说明和示例。

### 2.12 useLazyFetch

`useLazyFetch`是 Nuxt 3 中的另一个内置 Composable，它与`useLazyAsyncData`类似，但更专注于处理单个数据请求，通常用于 API
调用。`useLazyFetch`也支持按需加载和错误处理，但更专注于加载单个数据块。

#### **基本用法**

```
<script setup>
import { useLazyFetch } from '#app/composables'

// 定义一个异步函数来获取数据
const fetchData = async () => {
  const response = await fetch('/api/data')
  return await response.json()
}

// 使用 useLazyFetch 获取数据
const lazyFetchData = await useLazyFetch('fetchData', fetchData)
</script>

<template>
  <div v-if="!lazyFetchData.isFetched">加载中...</div>
  <div v-else-if="lazyFetchData.error">出错了：{{ lazyFetchData.error.message }}</div>
  <div v-else>
    <!-- 显示数据 -->
    {{ lazyFetchData.data }}
  </div>
</template>

```

在这个例子中，`useLazyFetch`返回一个 Promise，当数据加载完成时，Promise 解决为一个对象，包含`data`、`isFetched`和`error`属性。

#### **进阶用法**

1. **条件触发加载：**可以根据需要在模板中检查`isFetched`或`error`条件来触发加载。

```
const loadData = () => {
  if (!lazyFetchData.isFetched) {
    lazyFetchData()
  }
}

```

2. **处理分页或无限滚动：**如果数据是分页的，可以在用户滚动到页面底部或点击加载更多时触发`useLazyFetch`。

```
const loadMoreData = () => {
  lazyFetchData({ page: lazyFetchData.page + 1 })
}

```

3. **取消请求：**如果需要在组件卸载或用户取消操作时取消请求，可以使用`lazyFetchData.cancel()`。

```
onBeforeUnmount(() => {
  lazyFetchData.cancel()
})

```

4. **缓存和重试：**可以通过传递额外选项来自定义缓存策略和重试机制。

```
const lazyFetchDataWithCache = await useLazyFetch('fetchData', fetchData, {
  cache: true, // 如果数据未改变，将返回缓存的数据
  retry: 3, // 尝试重试请求的次数
})

```

5. **响应式数据：**`useLazyFetch`返回的对象是响应式的，所以你可以在模板中直接使用它，数据变化时会自动更新。

请确保查阅 Nuxt 3 的最新文档以获取`useLazyFetch`的完整用法和示例，因为官方文档会提供最新的功能和最佳实践。

### 2.13 useNuxtApp

`useNuxtApp`是 Nuxt 3 的一个内置 Composable，用于访问 Nuxt 应用程序的实例。这个 Composable 提供了对 Nuxt
应用程序的核心属性和方法的访问，如配置、插件、中间件等。

#### 基本用法

`useNuxtApp`的基本用法允许你访问和修改 Nuxt 应用程序的状态。

```
<script setup>
import { useNuxtApp } from '#app/composables'

const nuxtApp = useNuxtApp()

// 访问 Nuxt 配置
console.log(nuxtApp.config)

// 修改 Nuxt 配置
nuxtApp.config.globalProperties.myGlobalProperty = 'some value'

// 使用 Nuxt 插件
nuxtApp.hook('vue:beforeMount', () => {
  console.log('Before Vue mount')
})

// 访问 Nuxt 上下文
console.log(nuxtApp.context)
</script>

```

#### 进阶用法

`useNuxtApp`提供了许多高级功能，以下是一些进阶用法：

1. **使用 Nuxt 插件：**你可以注册和使用插件，这些插件在整个应用程序中都是可用的。

```
// 注册插件
nuxtApp.use(MyPlugin, { /* options */ })

// 使用插件
nuxtApp.provide('myPlugin', MyPlugin)

```

2. **访问和应用中间件：**你可以添加或修改中间件，这些中间件将在请求处理过程中被调用。

```
// 添加中间件
nuxtApp.hook('render:route', (url, result, context) => {
  // 你的中间件逻辑
})

// 修改中间件
nuxtApp.hook('render:route', (url, result, context) => {
  // 修改结果或上下文
  result.someProperty = 'newValue'
})

```

3. **使用 Nuxt 上下文：**通过`useNuxtApp`获取的上下文对象，你可以访问和操作当前请求的上下文。

```
const { route, params, query } = nuxtApp.context

console.log(route.name) // 当前路由名称
console.log(params.id) // 路由参数
console.log(query.search) // 查询参数

```

4. **响应式状态：**`useNuxtApp`提供的状态是响应式的，所以任何对状态的更改都会触发视图的更新。

```
// 假设有一个响应式状态
const myState = useState('myState', () => 'initial value')

// 更新状态
nuxtApp.provide('updateMyState', (newValue) => {
  myState.value = newValue
})

```

5. **全局属性和方法：**你可以定义全局属性和方法，这些属性和方法在所有组件中都是可用的。

```
// 定义全局属性
nuxtApp.config.globalProperties.$myGlobalMethod = () => {
  console.log('This is a global method')
}

// 在组件中使用
console.log(this.$myGlobalMethod())

```

`useNuxtApp`是一个非常强大的工具，它允许开发者访问和操作 Nuxt 应用程序的底层功能。在编写插件或需要全局修改应用程序时，这个
Composable 非常有用。

### 2.14 useNuxtData

#### 基本用法

`useNuxtData`是 Nuxt 3 提供的一个组合式 API，用于访问和操作 Nuxt 应用程序的状态数据。这个状态数据可以在服务端渲染期间被填充，并在客户端保持响应式。

基本用法如下：

```
<script setup>
const nuxtData = useNuxtData(); // 获取 Nuxt 应用程序的状态数据

// 假设 Nuxt 应用程序的状态中有一个名为 'user' 的属性
const userData = nuxtData.value.user;
</script>

<template>
  <div>
    <p>User Name: {{ userData.name }}</p>
    <p>User Age: {{ userData.age }}</p>
  </div>
</template>

```

在上面的代码中，`useNuxtData`返回一个响应式引用，其中包含 Nuxt 应用程序的状态数据。你可以像访问普通对象一样访问这些数据。

#### 进阶用法

`useNuxtData`还可以用于更新 Nuxt 应用程序的状态数据。以下是一些进阶用法：

1. **更新状态数据：**

```
<script setup>
const nuxtData = useNuxtData();

// 更新 'user' 属性
nuxtData.value.user = { name: 'Alice', age: 30 };
</script>

```

2. **使用`watch`或`watchEffect`监听状态变化：**

```
<script setup>
const nuxtData = useNuxtData();

watch(() => nuxtData.value.user, (newValue, oldValue) => {
  console.log('User data changed:', newValue);
});
</script>

```

3. **使用`nextTick`确保状态更新后的 DOM 更新：**

```
<script setup>
const nuxtData = useNuxtData();

function updateUser() {
  nuxtData.value.user.age += 1;
  nextTick(() => {
    console.log('DOM updated after state change');
  });
}
</script>

```

4. **使用`useNuxtData`在服务器端预填充状态：**

在 Nuxt 的服务器端渲染 (SSR) 期间，你可以在`getServerSideProps`或`setup`函数中使用`useNuxtData`来预填充状态。

```
<script setup>
import { getServerSideProps } from '#app';

// 在服务器端预填充状态
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.hook('render:route', async (url, result, context) => {
    const nuxtData = useNuxtData();
    nuxtData.value.user = await fetchDataFromServer(url);
  });
});

async function fetchDataFromServer(url) {
  // 从服务器获取数据
  const response = await fetch(`/api/user?url=${url}`);
  return await response.json();
}
</script>

```

请注意，`useNuxtData`主要用于操作和访问 Nuxt 应用程序的全局状态，而不是用于处理组件内部的状态。在组件内部，通常使用`ref`
或`reactive`来管理本地状态。

### 2.15 useRequestHeaders

#### 基本用法

`useRequestHeaders`是 Nuxt 3 提供的一个组合式 API，用于获取当前请求的 HTTP 头部信息。这在处理跨域请求、身份验证或其他需要访问请求头信息的场景中非常有用。

基本用法如下：

```
<script setup>
const headers = useRequestHeaders(['cookie', 'authorization']); // 获取指定的请求头

console.log(headers.cookie); // 输出 cookie 头部的值
console.log(headers.authorization); // 输出 authorization 头部的值
</script>

```

在上面的代码中，`useRequestHeaders`接受一个字符串数组，其中包含你想要获取的头部名称。它返回一个对象，其中包含指定头部的值。

#### 进阶用法

1. **获取所有请求头：**

如果你需要获取所有的请求头，可以不传递任何参数给`useRequestHeaders`：

```
<script setup>
const allHeaders = useRequestHeaders(); // 获取所有请求头

console.log(allHeaders); // 输出所有请求头的键值对
</script>

```

2. **在服务器端使用：**

`useRequestHeaders`也可以在服务器端渲染 (SSR) 期间使用，以获取请求头信息：

```
<script setup>
const headers = useRequestHeaders(['user-agent']); // 在服务器端获取请求头

console.log(headers.user_agent); // 输出 user-agent 头部的值
</script>

```

3. **处理敏感信息：**

在处理包含敏感信息的请求头（如`authorization`）时，应确保这些信息不会被无意中暴露。在服务器端，这些信息通常只在服务器内存中可用，不会被发送到客户端。

4. **动态获取请求头：**

你可以根据应用程序的状态或用户的操作动态获取请求头：

```
<script setup>
const getHeaderValue = (headerName) => {
  const headers = useRequestHeaders([headerName]);
  return headers[headerName];
};

const userAgent = ref(getHeaderValue('user-agent')); // 动态获取 user-agent
</script>

```

5. **结合其他 Nuxt 3 功能使用：**

`useRequestHeaders`可以与其他 Nuxt 3 的组合式 API 结合使用，例如`useFetch`或`useAsyncData`，以在发起请求时自动包含特定的请求头：

```
<script setup>
const { data: userData } = await useFetch('/api/user', { headers: useRequestHeaders(['authorization']) });
</script>

```

在这个例子中，`useFetch`将自动包含从`useRequestHeaders`获取的`authorization`头部，这对于需要身份验证的 API 请求非常有用。

### 2.16 useRequestURL

#### 基本用法

`useRequestURL`是 Nuxt 3 提供的一个组合式 API，用于获取当前请求的 URL。这在需要根据当前 URL 进行路由处理、权限验证或其他基于
URL 的操作时非常有用。

基本用法如下：

```
<script setup>
const url = useRequestURL(); // 获取当前请求的 URL

console.log(url.value); // 输出当前请求的完整 URL
</script>

```

在上面的代码中，`useRequestURL`返回一个响应式引用（ref），其中包含当前请求的完整 URL。

#### 进阶用法

1. **解析 URL 组件：**

你可以使用 JavaScript 的 URL API 来解析`useRequestURL`返回的 URL，以获取其组件（如协议、主机、路径等）：

```
<script setup>
const url = useRequestURL();
const parsedUrl = new URL(url.value);

console.log(parsedUrl.protocol); // 输出协议（如 'https:'）
console.log(parsedUrl.host); // 输出主机（如 'example.com'）
console.log(parsedUrl.pathname); // 输出路径（如 '/path/to/page'）
</script>

```

2. **在服务器端使用：**

`useRequestURL`也可以在服务器端渲染 (SSR) 期间使用，以获取请求的 URL：

```
<script setup>
const url = useRequestURL(); // 在服务器端获取请求的 URL

console.log(url.value); // 输出服务器端请求的完整 URL
</script>

```

3. **动态处理 URL：**

你可以根据应用程序的状态或用户的操作动态处理 URL：

```
<script setup>
const url = useRequestURL();
const redirectTo = computed(() => {
  if (someCondition) {
    return url.value + '/some/path';
  }
  return url.value;
});

console.log(redirectTo.value); // 输出根据条件修改后的 URL
</script>

```

4. **结合其他 Nuxt 3 功能使用：**

`useRequestURL`可以与其他 Nuxt 3 的组合式 API 结合使用，例如`useRoute`或`useRouter`，以在路由处理中使用当前的 URL：

```
<script setup>
const url = useRequestURL();
const route = useRoute();

if (route.path !== url.value) {
  // 处理路由不匹配的情况
}
</script>

```

在这个例子中，我们比较了当前路由的路径和请求的 URL，以处理可能的路由不匹配情况。

5. **构建新的 URL：**

你可以使用`useRequestURL`获取的 URL 作为基础，构建新的 URL 用于重定向或其他操作：

```
<script setup>
const url = useRequestURL();
const newUrl = computed(() => {
  return new URL('/new/path', url.value).href;
});

console.log(newUrl.value); // 输出新的 URL
</script>

```

在这个例子中，我们创建了一个新的 URL，它基于当前请求的 URL，但路径被修改为`/new/path`。

### 2.17 useRoute

#### 基本用法

`useRoute`是 Nuxt 3 提供的一个组合式 API，用于获取当前路由的信息。这个 API 返回一个响应式对象，其中包含了当前路由的参数、查询字符串、路径等信息。

基本用法如下：

```
<script setup>
const route = useRoute();

console.log(route.path); // 输出当前路由的路径，例如 '/about'
console.log(route.query); // 输出当前路由的查询参数，例如 { name: 'John' }
console.log(route.params); // 输出当前路由的动态参数，例如 { id: '123' }
</script>

```

在上面的代码中，`useRoute`返回一个响应式对象，你可以访问它的`path`、`query`和`params`等属性来获取当前路由的信息。

#### 进阶用法

1. **监听路由变化：**

你可以使用 Vue 的`watch`或`watchEffect`函数来监听路由的变化，并执行相应的操作：

```
<script setup>
const route = useRoute();

watch(() => route.path, (newPath, oldPath) => {
  console.log(`路由从 ${oldPath} 变更为 ${newPath}`);
  // 在这里执行路由变化后的操作
});
</script>

```

2. **动态参数处理：**

当路由有动态参数时，你可以根据这些参数执行不同的逻辑：

```
<script setup>
const route = useRoute();

if (route.params.id) {
  // 处理有 id 参数的情况
  fetchSomeData(route.params.id);
}
</script>

```

3. **组合多个路由参数：**

如果你需要根据多个路由参数来执行逻辑，可以组合它们：

```
<script setup>
const route = useRoute();

const fullPath = computed(() => {
  return `${route.path}?${new URLSearchParams(route.query).toString()}`;
});

console.log(fullPath.value); // 输出当前路由的完整路径和查询字符串
</script>

```

4. **使用路由元信息：**

Nuxt 3 允许你在路由定义中添加元信息，这些信息可以通过`useRoute`访问：

```
<script setup>
const route = useRoute();

console.log(route.meta); // 输出当前路由的元信息
</script>

```

5. **结合其他 Nuxt 3 功能使用：**

`useRoute`可以与其他 Nuxt 3 的组合式 API 结合使用，例如`useHead`，来根据路由变化动态更新页面标题：

```
<script setup>
const route = useRoute();
const head = useHead();

watch(() => route.path, (newPath) => {
  head.title = `My App - ${newPath}`;
});
</script>

```

在这个例子中，每当路由路径发生变化时，我们都会更新页面的标题。

6. **在服务器端使用：**

`useRoute`也可以在服务器端渲染 (SSR) 期间使用，以获取当前路由的信息：

```
<script setup>
const route = useRoute();

console.log(route.path); // 在服务器端获取当前路由的路径
</script>

```

在服务器端，`useRoute`将提供与客户端相同的路由信息，允许你在服务器端进行路由相关的处理。

### 2.18 useSeoMeta

#### 基本用法

在 Nuxt 3 中，`useSeoMeta`是一个内置的组合式 API，可以直接在页面组件中使用来设置页面的 SEO 元数据。以下是如何使用它的基本方法：

```
<script setup>
const { title, description, keywords, ogTitle, ogDescription, twitterTitle, twitterDescription } = useSeoMeta()

// 设置基础 SEO 信息
title.value = '我的页面标题'
description.value = '这是我的页面描述'
keywords.value = '关键字1, 关键字2, 关键字3'

// 设置 Open Graph 信息
ogTitle.value = 'Open Graph 标题'
ogDescription.value = 'Open Graph 描述'

// 设置 Twitter 信息
twitterTitle.value = 'Twitter 标题'
twitterDescription.value = 'Twitter 描述'
</script>

```

#### 进阶用法

`useSeoMeta`提供了更多高级功能，允许你设置更复杂的 SEO 信息，如下所示：

```
<script setup>
const { title, description, ogImage, twitterImage } = useSeoMeta()

// 动态设置 SEO 信息
title.value = '动态页面标题'
description.value = '动态页面描述'

// 使用函数动态生成标题
title.value = (prevTitle) => ` ${prevTitle} - 动态后缀`

// 设置 Open Graph 图片
ogImage.value = '/path/to/og-image.jpg'

// 设置 Twitter 图片
twitterImage.value = '/path/to/twitter-image.jpg'

// 使用链式方法一次性设置多个属性
useSeoMeta().update({
  title: '更新的页面标题',
  description: '更新的页面描述',
  ogTitle: '更新的 Open Graph 标题',
  ogDescription: '更新的 Open Graph 描述',
  ogImage: '/path/to/updated-og-image.jpg',
  twitterTitle: '更新的 Twitter 标题',
  twitterDescription: '更新的 Twitter 描述',
  twitterImage: '/path/to/updated-twitter-image.jpg'
})
</script>

```

在进阶用法中，你可以使用链式方法`update`来一次性设置多个 SEO 元数据，这对于动态生成 SEO 信息或在组件的生命周期中更新 SEO
信息非常有用。此外，你可以通过返回函数的方式来动态生成标题，这可以让你根据不同的条件来改变标题内容。

### 2.19 useRouter

#### 基本用法

在 Nuxt 3 中，`useRouter`是一个内置的组合式 API，用于在组件中访问和操作路由。以下是`useRouter`的基本用法：

```
<script setup>
const router = useRouter()

// 获取当前路由信息
console.log(router.currentRoute.value)

// 导航到新页面
router.push('/new-page')

// 替换当前路由
router.replace('/replace-page')

// 返回上一页
router.back()

// 前进或后退指定步数
router.go(-1) // 后退一步
router.go(1)  // 前进一步
</script>

```

在基本用法中，你可以通过`useRouter`获取路由实例，并使用其方法如`push`、`replace`、`back`和`go`
来导航到不同的页面。同时，你可以通过`currentRoute`属性获取当前路由的详细信息。

#### 进阶用法

`useRouter`还提供了一些进阶功能，允许你更细致地控制路由行为：

```
<script setup>
const router = useRouter()

// 监听路由变化
router.currentRoute.value.subscribe((route) => {
  console.log('路由变化了', route)
})

// 使用命名路由
router.push({ name: 'user', params: { userId: 123 } })

// 传递查询参数
router.push({ path: '/search', query: { q: 'nuxt' } })

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/protected' && !isAuthenticated.value) {
    next('/login')
  } else {
    next()
  }
})
</script>

```

在进阶用法中，你可以使用`subscribe`
方法来监听路由的变化，这对于需要在路由变化时执行某些操作的场景非常有用。此外，你可以使用命名路由和查询参数来更精确地控制导航。最后，`beforeEach`
方法允许你设置全局的路由守卫，用于在导航发生前进行权限检查或其他预处理。

### 2.20 useServerSeoMeta

#### 基本用法

`useServerSeoMeta`是 Nuxt 3 中的一个内置组合式 API，用于在服务器端设置和管理 SEO 优化的元数据。基本用法如下：

```
<script setup>
import { useServerSeoMeta } from 'nuxt3'

const { title, meta, description } = useServerSeoMeta()

// 设置SEO元数据
useServerSeoMeta({
  title: 'My Page Title',
  meta: [
    { name: 'description', content: 'This is a description for SEO' },
    { property: 'og:image', content: '/path/to/image.jpg' },
  ],
  description: 'A brief summary of the page content',
})
</script>

```

在基本用法中，你可以通过`useServerSeoMeta`获取或设置页面的标题 (`title`)、`meta`标签（包括`name`和`property`
属性）以及`description`。这些数据会在服务器端被用于构建 SEO 友好的 HTML。

#### 进阶用法

- **动态内容**：你可以根据组件的状态或路由参数动态设置元数据。例如，根据用户登录状态改变标题：

```
const isLoggedIn = ref(true)
useServerSeoMeta((seo) => ({
  title: isLoggedIn.value ? 'Logged In' : 'Login',
  meta: [
    { name: 'description', content: isLoggedIn.value ? 'Your dashboard' : 'Sign up' },
  ],
}))

```

- **异步数据**：如果你的元数据依赖于异步数据，可以使用`onMounted`或`onUnmounted`来确保数据获取后再设置：

```
onMounted(async () => {
  const data = await fetchData()
  useServerSeoMeta((seo) => ({
    title: data.title,
    meta: data.meta,
  }))
})

```

- **预渲染**：在`nuxt.config.js`的`head`配置中，你可以使用`useServerSeoMeta`的结果来预渲染SEO数据：

```
export default {
  head: {
    titleTemplate: '%s - My Website',
    meta: [
      { ...useServerSeoMeta() },
    ],
  },
}

```

通过这些进阶用法，你可以更好地优化你的网站在搜索引擎中的可见性和用户体验。

### 2.21 useState

#### 基本用法

`useState`是 Nuxt 3 中的一个内置组合式 API，用于在组件中创建响应式状态。基本用法如下：

```
<script setup>
import { useState } from 'nuxt3'

// 创建一个响应式状态
const count = useState('count', () => 0)

// 在模板中使用
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
</script>

```

在基本用法中，`useState`接受两个参数：状态的名称和一个初始值。这个状态可以在组件的模板和逻辑中被访问和修改。

#### 进阶用法

- **多个状态**：你可以创建多个状态，每个状态都有自己的名称和初始值：

```
const { count, setCount } = useState('count', () => 0)
const { name, setName } = useState('name', () => 'John')

```

- **状态持久化**：你可以使用 Nuxt 3 的插件系统来持久化状态，例如使用`pinia`或`vuex`：

```
import { createStore } from 'pinia'

const store = createStore({
  state: () => ({
    count: 0,
    name: 'John',
  }),
  actions: {
    increment() {
      this.count++
    },
  },
})

const { count, increment } = useState('count', () => store.state.count)
const { name } = useState('name', () => store.state.name)

```

- **动态状态**：你可以根据组件的状态或路由参数动态设置状态的初始值：

```
const route = useRoute()
const { count } = useState('count', () => route.params.count || 0)

```

- **状态的计算属性**：你可以使用`computed`来创建基于状态的计算属性：

```
const { count } = useState('count', () => 0)
const doubleCount = computed(() => count.value * 2)

```

通过这些进阶用法，你可以更灵活地管理组件的状态，使其更加响应式和可维护。

## **自定义 Composables**

创建自定义 Composables

在 Nuxt 3 中创建自定义 Composables 的过程与 Vue 3 类似，因为 Nuxt 3 是基于 Vue 3 构建的。以下是创建自定义 Composables 的步骤：

1. **创建 Composables 文件夹**：在 Nuxt 3 项目中，通常会在`composables`文件夹下创建自定义的
   Composables。这个文件夹通常位于`src/composables`。

2. **定义自定义 Composable**：在`composables`文件夹中创建一个新的文件，例如`useCustomComposable.ts`，并在其中定义你的
   Composable。

   ```
   // src/composables/useCustomComposable.ts
   import { ref, onMounted } from 'vue'

   export function useCustomComposable() {
     const data = ref(null)

     const fetchData = async () => {
       // 假设这是一个异步函数，用于获取数据
       data.value = await fetchSomeData()
     }

     onMounted(fetchData)

     return { data }
   }

   async function fetchSomeData() {
     // 这里是获取数据的逻辑
     // 例如，从一个 API 获取数据
     const response = await fetch('https://api.example.com/data')
     const result = await response.json()
     return result
   }
   
   ```

3. **在页面或组件中使用 Composable**：在页面或组件中，你可以通过`import`引入自定义 Composable 并使用它。

   ```
   <script setup lang="ts">
   import { useCustomComposable } from '~/composables/useCustomComposable'

   const { data } = useCustomComposable()
   </script>

   <template>
     <div>
       <p v-if="data">Data: {{ data }}</p>
       <p v-else>Loading...</p>
     </div>
   </template>
   ```

4. **类型注解**：如果你使用 TypeScript，确保为 Composable 的返回值提供类型注解，以便获得类型检查和自动补全功能。

   ```
   // src/composables/useCustomComposable.ts
   import { ref, onMounted } from 'vue'

   interface SomeDataType {
     // 定义数据类型的接口
     id: number
     name: string
   }

   export function useCustomComposable() {
     const data = ref<SomeDataType | null>(null)

     // ... 其他代码

     return { data }
   }
   
   ```

通过遵循这些步骤，你可以在 Nuxt 3 中创建并使用自定义 Composables，从而提高代码的可重用性和组织性。

## 附录

A. Nuxt3 Composables 完整列表

在 Nuxt3 中，Composables 是一种用于在多个组件或页面之间共享代码的方式。虽然 Nuxt3 官方文档中没有提供完整的 Composables
列表，但您可以参考以下资源来了解如何使用和创建自定义 Composables：

- [Nuxt3 Composables 文档](https://nuxt.com/docs/guide/directory-structure/composables)
- [Vue 3 Composables 文档](https://vuejs.org/guide/reusability/composables.html)

B. Nuxt3 Composables API 文档

同样，Nuxt3 官方文档中没有提供完整的 Composables API 文档。但是，由于 Nuxt3 基于 Vue 3，因此可以参考 Vue 3 Composables API
文档：

- [Vue 3 Composables API 文档](https://vuejs.org/api/composition-api.html)

C. 常见问题与解答

以下是一些有关 Nuxt3 Composables 的常见问题和解答：

1. **Q**: Composables 与 mixins 有什么区别？**A**: Composables 提供了一种更加模块化和可重用的方式来共享代码，而 mixins
   可能会导致命名冲突和代码可读性问题。
2. **Q**: 我可以在 Nuxt3 中使用 Vue 3 的 Composition API 吗？**A**: 是的，Nuxt3 基于 Vue 3，因此可以使用 Vue 3 的
   Composition API 创建和使用 Composables。
3. **Q**: 我可以在 Nuxt3 中使用第三方 Composables 库吗？**A**: 是的，只要这些库兼容 Vue 3 和 Nuxt3，您可以在项目中使用它们。

如果您有更多关于 Nuxt3 Composables 的问题，可以参考 Nuxt3 和 Vue 3 的官方文档，或在社区论坛和问题跟踪器中寻求帮助。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

### 往期文章归档：

- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
- [探索Web Components | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-15/front_end/%E6%8E%A2%E7%B4%A2web%20components/)
- [Vue微前端架构与Qiankun实践理论指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-14/front_end/vue%E5%BE%AE%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E4%B8%8Eqiankun%E5%AE%9E%E8%B7%B5%E7%90%86%E8%AE%BA%E6%8C%87%E5%8D%97/)
- [Vue 3深度探索：自定义渲染器与服务端渲染 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-13/front_end/vue%203%E6%B7%B1%E5%BA%A6%E6%8E%A2%E7%B4%A2%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%E5%99%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/)
- [Tailwind CSS 响应式设计实战指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-12/front_end/tailwind%20css%20%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E5%AE%9E%E6%88%98%E6%8C%87%E5%8D%97/)

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
