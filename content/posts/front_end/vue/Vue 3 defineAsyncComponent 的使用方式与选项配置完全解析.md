---
url: /posts/a2s3y4n5c6c7o8m9p0a1b2c3d4e5f6a7/
title: Vue 3 defineAsyncComponent 的使用方式与选项配置完全解析
date: 2026-05-09
lastmod: 2026-05-09
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/2026年5月12日 13_10_43.png
summary: 详细讲解 Vue 3 defineAsyncComponent 的两种调用方式（函数式和对象式），深入分析各配置项的作用和使用场景。
categories:
  - vue
tags:
  - 异步组件
  - defineAsyncComponent
  - 组件配置
  - 懒加载
  - 代码分割
  - 性能优化
  - 组合式API
  - 前端优化
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2026年5月12日 13_10_43.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## defineAsyncComponent 的两种打开方式：简配版和豪华版

上一章我们搞清楚了异步组件是干什么的。这一章咱们来详细看看 `defineAsyncComponent` 这个函数到底怎么用、有哪些可以配置的选项。

其实这个函数接收参数的方式只有两种，但差别挺大的。你可以把它理解成买车：**简配版**就是给个能跑的车，**豪华版**可以加装各种配置——加载中显示的组件、加载失败显示的组件、延迟时间、超时时间等等。

### 第一种：函数式调用（简配版）

这是最简单也最常用的写法。你只需要传一个函数进去，这个函数返回一个 Promise，Promise 的 resolve 回调里拿到组件就行了：

```javascript
import { defineAsyncComponent } from "vue";

const MyAsyncComponent = defineAsyncComponent(
  () => import("./components/MyComponent.vue"),
);
```

这种写法就一行代码，简洁得很。它的工作原理是这样的：

```
页面需要渲染 MyAsyncComponent
    ↓
调用 () => import('./components/MyComponent.vue')
    ↓
返回一个 Promise
    ↓
Promise 解析后拿到组件定义
    ↓
渲染组件
```

因为 `import('./xxx.vue')` 本身就返回一个 Promise，所以直接写在箭头函数里就行。大多数情况下，这么一行代码就够用了。

### 第二种：对象式调用（豪华版）

当你需要对加载过程做更多控制的时候，就得用对象形式了。你可以传入一个配置对象，里面可以写很多选项：

```javascript
import { defineAsyncComponent } from "vue";

const MyAsyncComponent = defineAsyncComponent({
  // 加载函数（必填）
  loader: () => import("./components/MyComponent.vue"),

  // 加载中显示的组件
  loadingComponent: LoadingSpinner,

  // 展示加载组件前的延迟时间，默认 200ms
  delay: 200,

  // 加载失败后显示的组件
  errorComponent: ErrorDisplay,

  // 超时时间，超过这个时间还没加载完就算失败
  timeout: 3000,
});
```

这种写法看起来复杂了不少，但每个选项都有它的用处。咱们一个一个来看。

### 配置项逐一拆解

#### 1. loader（加载函数）—— 必填项

这个选项告诉 Vue 去哪里加载组件。它必须是一个返回 Promise 的函数：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
});
```

这和第一种简写方式传的内容其实是一模一样的，只不过现在要放在 `loader` 属性里。

你也可以不用动态导入，自己手动返回一个 Promise，甚至从远程 API 获取组件定义：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => {
    return new Promise((resolve, reject) => {
      // 比如从远程 API 获取组件
      fetch("/api/component-definition")
        .then((res) => res.json())
        .then((componentDef) => resolve(componentDef))
        .catch((err) => reject(err));
    });
  },
});
```

不过这种场景比较少见，大多数时候直接用动态导入就够了。

#### 2. loadingComponent（加载组件）—— 让用户知道"正在加载"

网络不好的时候，组件可能要加载好几秒。如果这段时间页面上什么都不显示，用户会以为页面卡死了。这时候就可以放一个"加载中"的提示：

```vue
<!-- LoadingSpinner.vue -->
<template>
  <div class="loading">
    <div class="spinner"></div>
    <p>正在加载，请稍候...</p>
  </div>
</template>

<style>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
```

然后在异步组件配置里用上它：

```javascript
import { defineAsyncComponent } from "vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";

const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/HeavyComponent.vue"),
  loadingComponent: LoadingSpinner,
});
```

当组件正在加载的时候，页面上就会显示那个转圈圈的加载动画，而不是空白一片。

#### 3. delay（延迟时间）—— 防止闪烁的小细节

你可能注意到上面 `delay` 的默认值是 200ms。这个设置看起来有点奇怪：加载组件为什么要延迟显示？

原因其实很贴心：**如果网络很快，组件一下子就加载完了，这时候加载组件刚显示出来就被替换成真正的组件，反而会在页面上闪一下，看着更不舒服。**

所以 Vue 默认等 200ms，如果 200ms 内组件加载完了，就不显示加载组件了；如果超过 200ms 还没加载完，才显示加载组件。

用时间线来理解：

```
t=0ms     开始加载异步组件
t=100ms   加载完成！→ 直接显示，不闪加载动画
t=200ms   延迟时间到达，如果还在加载中 → 显示加载组件
t=3000ms  还在加载... → 用户已经看到加载提示好一会儿了
```

如果你觉得 200ms 太长或太短，可以自己调：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  loadingComponent: LoadingSpinner,
  delay: 100, // 100ms 后就显示加载提示
});
```

设成 0 就是立刻显示：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  loadingComponent: LoadingSpinner,
  delay: 0, // 不等待，立刻显示
});
```

#### 4. errorComponent（错误组件）—— 加载失败兜底

网络不稳定或者服务器出问题的时候，组件可能加载失败。这时候如果什么都不显示，用户又会觉得页面坏了。errorComponent 就是在加载失败时显示的兜底组件：

```vue
<!-- ErrorDisplay.vue -->
<template>
  <div class="error-box">
    <p>😵 组件加载失败</p>
    <button @click="$emit('retry')">重试</button>
  </div>
</template>

<style>
.error-box {
  padding: 20px;
  text-align: center;
  color: #f56c6c;
  border: 1px solid #f56c6c;
  border-radius: 4px;
}
</style>
```

```javascript
import { defineAsyncComponent } from "vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import ErrorDisplay from "./components/ErrorDisplay.vue";

const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  timeout: 3000,
});
```

#### 5. timeout（超时时间）—— 别让等待无止尽

有些时候网络特别差，一个组件可能加载十几秒甚至更久。总不能让用户一直等下去吧？timeout 就是用来设置一个最大等待时间的：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  timeout: 5000, // 5秒内加载不完就显示错误组件
});
```

超过这个时间还没加载完，Vue 就会认为加载失败了，会切换到 errorComponent。

如果不想设置超时，可以不写这个选项（或者设为 `Infinity`），这样就会一直等下去：

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  timeout: Infinity, // 永远等待（不推荐）
});
```

### 配置项之间的关系：一张图搞懂

用流程图来展示这些配置项是怎么配合工作的：

```
异步组件开始加载
    ↓
调用 loader()
    ↓
    ├─ 加载成功？
    │   ├─ 是 → 渲染异步组件 ✅
    │   │
    │   └─ 否 → 加载出错
    │           ↓
    │       有 errorComponent？
    │           ├─ 有 → 渲染错误组件
    │           └─ 无 → 什么都不显示
    │
    └─ 加载时间超过 timeout？
        ├─ 是 → 等同于加载出错
        └─ 否 → 继续等待
            ↓
        等待超过 delay 时间？
            ├─ 是 → 显示 loadingComponent
            └─ 否 → 继续等待
```

### Props 和 Slots 的透传

你可能会问：异步组件能不能接收父组件传过来的 props 和插槽？

答案是：**完全没问题，跟普通组件一模一样。**

`defineAsyncComponent` 返回的外壳组件会自动把接收到的 props 和插槽传递给内部的实际组件。所以你可以放心地替换普通组件为异步组件，不需要改模板里的任何东西。

```vue
<!-- 父组件 -->
<template>
  <AsyncComp :title="title" :data="dataList" @update="handleUpdate">
    <template #header>
      <h2>插槽内容</h2>
    </template>
  </AsyncComp>
</template>

<script setup>
import { defineAsyncComponent, ref } from "vue";

const title = ref("标题");
const dataList = ref([1, 2, 3]);
const handleUpdate = () => {};

const AsyncComp = defineAsyncComponent(
  () => import("./components/AsyncComp.vue"),
);
</script>
```

```vue
<!-- AsyncComp.vue 内部组件 -->
<script setup>
defineProps(["title", "data"]);
defineEmits(["update"]);
</script>

<template>
  <div>
    <slot name="header"></slot>
    <p>{{ title }}</p>
    <ul>
      <li v-for="item in data" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
```

所有 props、事件、插槽都正常传递，外壳组件就是一个"透明中间人"。

### 何时用简配版，何时用豪华版？

| 场景                       | 推荐方式       | 理由                                |
| -------------------------- | -------------- | ----------------------------------- |
| 简单页面，加载很快         | 函数式（简配） | 一行代码搞定，不用多写              |
| 组件比较大，可能要加载几秒 | 对象式（豪华） | 加上 loadingComponent 让用户不焦虑  |
| 网络环境不稳定的场景       | 对象式（豪华） | 加上 errorComponent 和 timeout 兜底 |
| 对用户体验要求高的项目     | 对象式（豪华） | 可以精细控制 delay、timeout 等参数  |

**我的建议是：** 刚开始用函数式简写就行。如果发现加载过程用户体验不好，再逐步加上加载组件和错误组件。没必要一上来就配置一大堆东西。

## 课后 Quiz：检验你的理解程度

### 问题 1：delay 选项的作用是什么？

A. 延迟加载组件的开始时间  
B. 延迟显示加载组件的时间，防止闪烁  
C. 延迟超时计时的开始  
D. 延迟错误组件的显示

**答案解析：**

正确答案是 B。

`delay` 控制的是**什么时候显示 loadingComponent**。默认值是 200ms，意思是：如果 200ms 内组件加载完了，就不显示加载提示了；如果超过 200ms 还在加载，才显示加载组件。这样做的目的是防止加载太快时，加载提示一闪而过反而更碍眼。

### 问题 2：timeout 超时后会触发什么？

A. 页面直接崩溃  
B. 触发加载错误，显示 errorComponent（如果有配置的话）  
C. 继续等待，什么都不发生  
D. 重新尝试加载组件

**答案解析：**

正确答案是 B。

当加载时间超过 `timeout` 设定的毫秒数后，Vue 会认为加载失败了。此时：

- 如果配置了 `errorComponent`，就会切换到错误组件
- 如果没配置，就什么都不显示

它不会自动重试，也不会让页面崩溃。如果需要在错误组件里添加重试功能，得自己写逻辑。

### 问题 3：异步组件的 props 传递需要特殊处理吗？

A. 需要用 defineAsyncComponent 的 props 选项声明  
B. 需要用 $attrs 手动转发  
C. 不需要，外壳组件会自动透传  
D. 只能在对象式配置中传递

**答案解析：**

正确答案是 C。

`defineAsyncComponent` 返回的外壳组件会自动把所有接收到的 props、事件监听器和插槽传递给内部的实际组件。这就是为什么你可以直接用异步组件替换普通组件，模板里完全不需要改动。选项 A、B、D 都不需要。

## 常见报错解决方案

### 报错 1：对象式配置传入简写函数的形式

**报错现象：**
类型错误或配置不生效

**产生原因：**

混淆了两种调用方式，在对象式配置中把函数直接当第一个参数传了：

```javascript
// ❌ 错误：把函数当成简写方式传入
const AsyncComp = defineAsyncComponent(
  () => import("./components/MyComponent.vue"),
  {
    loadingComponent: LoadingSpinner,
  },
);
```

**解决办法：**

函数式和对象式是两种完全独立的调用方式，不能混在一起：

```javascript
// ✅ 函数式
const AsyncComp = defineAsyncComponent(
  () => import("./components/MyComponent.vue"),
);

// ✅ 对象式
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
  loadingComponent: LoadingSpinner,
});
```

**预防建议：**

记住：传函数就是简配版，传对象就是豪华版，二选一。

### 报错 2：loader 函数没有返回 Promise

**报错现象：**
组件无法加载，控制台报类型错误

**产生原因：**

loader 必须返回一个 Promise。如果忘了 return 或者返回了其他类型：

```javascript
// ❌ 错误：没有 return
const AsyncComp = defineAsyncComponent({
  loader: () => {
    import("./components/MyComponent.vue"); // 没有 return
  },
});
```

**解决办法：**

确保 loader 返回了 Promise：

```javascript
// ✅ 正确
const AsyncComp = defineAsyncComponent({
  loader: () => import("./components/MyComponent.vue"),
});

// ✅ 也正确（显式 return）
const AsyncComp = defineAsyncComponent({
  loader: () => {
    return import("./components/MyComponent.vue");
  },
});
```

**预防建议：**

使用箭头函数的简写形式（不加花括号）可以自动 return，不容易忘。

参考链接：https://cn.vuejs.org/guide/components/async.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 defineAsyncComponent 的使用方式与选项配置完全解析](https://blog.cmdragon.cn/posts/a2s3y4n5c6c7o8m9p0a1b2c3d4e5f6a7/)
