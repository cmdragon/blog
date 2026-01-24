---
url: /posts/89cac727dc9ef0b595e8feeac10dc501/
title: Vue3使用Composition API实现响应式
date: 2024-05-29T8:10:24+08:00
lastmod: 2024-05-29T8:10:24+08:00
categories:
   - 前端开发

tags:
   - Vue3
   - Composition
   - Refs
   - Reactive
   - Watch
   - Lifecycle
   - Debugging
---


<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_05_29 20_15_53.png" title="2024_05_29 20_15_53.png" alt="2024_05_29 20_15_53.png"/>

## 1. 介绍

Composition API是Vue.js 3中新增的一组API，用于在组件中组合逻辑和功能。它可以让你更好地组织和重用代码，使组件更易于理解和维护。在使用Composition
API时，你可以使用`<script setup>`语法或`setup()`函数，两种方式都可以使用Composition API中的响应式API、生命周期钩子、模板引用和自定义渲染函数等特性。

## 2. 基本响应式

在Vue.js 3中，Composition API提供了几种创建响应式数据的方法，包括`ref`、`reactive`、`readonly`、`shallowReactive`
和`shallowReadonly`。

### 2.1 ref

`ref`函数用于创建一个响应式的ref对象，其值可以通过`.value`
属性获取或设置。当ref对象的值发生变化时，Vue.js会自动更新视图。AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>
```

### 2.2 reactive

`reactive`函数用于创建一个响应式的对象，其所有属性都是响应式的。当对象的属性发生变化时，Vue.js会自动更新视图。

```vue
<template>
  <div>
    <p>name: {{ user.name }}</p>
    <p>age: {{ user.age }}</p>
    <button @click="incrementAge">+1</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const user = reactive({
  name: 'Alice',
  age: 20
});

function incrementAge() {
  user.age++;
}
</script>
```

### 2.3 readonly

`readonly`函数用于创建一个只读的响应式对象，其所有属性都是只读的。当试图修改只读对象的属性时，会抛出一个错误。

```vue
<template>
  <div>
    <p>name: {{ user.name }}</p>
    <p>age: {{ user.age }}</p>
  </div>
</template>

<script setup>
import { reactive, readonly } from 'vue';

const user = reactive({
  name: 'Alice',
  age: 20
});

const readonlyUser = readonly(user);

// 会抛出一个错误
readonlyUser.age = 21;
</script>
```

### 2.4 shallowReactive

`shallowReactive`函数用于创建一个浅响应式的对象，其所有属性都是响应式的，但其子对象的属性不是响应式的。
AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)

```vue
<template>
  <div>
    <p>name: {{ user.name }}</p>
    <p>age: {{ user.age }}</p>
    <p>address: {{ user.address }}</p>
    <button @click="incrementAge">+1</button>
    <button @click="changeAddress">改变地址</button>
  </div>
</template>

<script setup>
import { shallowReactive } from 'vue';

const user = shallowReactive({
  name: 'Alice',
  age: 20,
  address: {
    province: 'Beijing',
    city: 'Beijing'
  }
});

function incrementAge() {
  user.age++;
}

function changeAddress() {
  user.address = {
    province: 'Shanghai',
    city: 'Shanghai'
  };
}
</script>
```

### 2.5 shallowReadonly

`shallowReadonly`函数用于创建一个浅只读的响应式对象，其所有属性都是只读的，但其子对象的属性不是只读的。

```vue
<template>
  <div>
    <p>name: {{ user.name }}</p>
    <p>age: {{ user.age }}</p>
    <p>address: {{ user.address }}</p>
    <!-- 会抛出一个错误 -->
    <button @click="changeAddress">改变地址</button>
  </div>
</template>

<script setup>
import { shallowReactive, shallowReadonly } from 'vue';

const user = shallowReactive({
  name: 'Alice',
  age: 20,
  address: {
    province: 'Beijing',
    city: 'Beijing'
  }
});

const readonlyUser = shallowReadonly(user);

// 会抛出一个错误
readonlyUser.age = 21;
</script>
```

## 3. 响应式API

Composition API提供了几种响应式API，包括`watchEffect`、`watch`、`computed`和`provide/inject`。


### 3.1 watchEffect

`watchEffect`函数用于创建一个响应式的副作用函数，当响应式数据发生变化时，副作用函数会自动重新执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const count = ref(0);

watchEffect(() => {
  console.log(`count is ${count.value}`);
});

function increment() {
  count.value++;
}
</script>
```


### 3.2 watch

`watch`函数用于创建一个响应式的监听器，当响应式数据发生变化时，监听器会自动执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`);
});

function increment() {
  count.value++;
}
</script>
```


### 3.3 computed

`computed`函数用于创建一个响应式的计算属性，其值是根据响应式数据计算得出的。当响应式数据发生变化时，计算属性会自动重新计算。
AD：[漫画首页](https://comic.cmdragon.cn:2087/)

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <p>doubleCount: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const count = ref(0);

const doubleCount = computed(() => {
  return count.value * 2;
});

function increment() {
  count.value++;
}
</script>
```


### 3.4 provide/inject

`provide`和`inject`函数用于在组件树中传递数据。`provide`函数用于在父组件中提供数据，`inject`函数用于在子组件中注入数据。

```vue
<template>
  <div>
    <ChildComponent />
  </div>
</template>

<script setup>
import { provide } from 'vue';
import ChildComponent from './ChildComponent.vue';

provide('message', 'Hello, world!');
</script>
```

```vue
<template>
  <div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const message = inject('message');
</script>
```


## 4. 生命周期钩子

Composition
API提供了几种生命周期钩子，包括`setup()`、`onBeforeMount()`、`onMounted()`、`onBeforeUpdate()`、`onUpdated()`、`onBeforeUnmount()`、`onUnmounted()`、`onErrorCaptured()`、`onRenderTracked()`
和`onRenderTriggered()`。


### 4.1 setup()

`setup()`函数是Composition API的入口点，用于在组件创建之前执行一些初始化操作。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.2 onBeforeMount()

`onBeforeMount()`函数在组件挂载之前执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onBeforeMount(() => {
      console.log('before mount');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.3 onMounted()

`onMounted()`函数在组件挂载之后执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onMounted(() => {
      console.log('mounted');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.4 onBeforeUpdate()

`onBeforeUpdate()`函数在组件更新之前执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onBeforeUpdate(() => {
      console.log('before update');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.5 onUpdated()

`onUpdated()`函数在组件更新之后执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onUpdated(() => {
      console.log('updated');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.6 onBeforeUnmount()

`onBeforeUnmount()`函数在组件卸载之前执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onBeforeUnmount(() => {
      console.log('before unmount');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.7 onUnmounted()

`onUnmounted()`函数在组件卸载之后执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onUnmounted(() => {
      console.log('unmounted');
    });

    return {
      count,
      increment
    };
  }
};
</script>
```


### 4.8 onErrorCaptured()

`onErrorCaptured()`函数在组件捕获到错误时执行。

```vue
<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    onErrorCaptured((error, instance, info) => {
      console.error(error);
      return false;
    });

    return {
      count,
      increment
    };
  }
};
</script>
```

### 4.9 `onRenderTracked` 和 `onRenderTriggered` 

`onRenderTracked`和`onRenderTriggered`是两个生命周期钩子，它们与Vue的响应式系统和编译器有关。这两个钩子是在Vue
3.x版本中引入的，主要用于调试目的，帮助开发者了解组件渲染过程中的跟踪和触发情况。

1. `onRenderTracked`钩子：

    - 当组件的响应式依赖项被追踪时，即响应式系统开始跟踪一个依赖项时，这个钩子会被调用。
    - 它主要用于调试，可以帮助开发者了解何时响应式系统开始关注某个依赖项。
    - `onRenderTracked`钩子接收两个参数：`dep`和`context`。`dep`是依赖项对象，`context`是当前组件的上下文对象。

1. `onRenderTriggered`钩子：

    - 当组件的响应式依赖项被触发时，即响应式系统因为某个依赖项的变化而触发了重新渲染时，这个钩子会被调用。
    - 它主要用于调试，可以帮助开发者了解何时响应式系统因为某个依赖项的变化而重新渲染组件。
    - `onRenderTriggered`钩子也接收两个参数：`dep`和`context`，含义与`onRenderTracked`相同。

示例代码：

```javascript
export default {
    setup() {
        // 定义一个响应式数据
        const count = ref(0);

        // 监听 count 的变化
        watch(count, (newValue, oldValue) => {
            console.log(`count changed from ${oldValue} to ${newValue}`);
        });

        // 使用 onRenderTracked 和 onRenderTriggered 进行调试
        onRenderTracked((dep, context) => {
            console.log(`onRenderTracked: ${dep}`);
        });

        onRenderTriggered((dep, context) => {
            console.log(`onRenderTriggered: ${dep}`);
        });

        return {
            count
        };
    }
};

```

在这个示例中，我们定义了一个响应式数据`count`，并使用了`watch`来监听它的变化。同时，我们使用了`onRenderTracked`
和`onRenderTriggered`来打印调试信息。当响应式系统开始跟踪或触发重新渲染时，我们会得到相应的提示。这些钩子可以帮助开发者更好地理解Vue组件的渲染过程和响应式系统的运作。

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
