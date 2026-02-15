---
url: /posts/82c2241259e63313c0b82f53f1e0ed76/
title: Vue3中Composable如何解决组件复用中的重复代码问题？
date: 2026-02-15T08:05:38+08:00
lastmod: 2026-02-15T08:05:38+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/aaaaaaaaaaa.png

summary:
  Vue2 Mixins存在属性来源不清等缺陷，Vue3组合式API的Composable通过封装有状态逻辑函数解决复用问题。如useMouse追踪鼠标位置、useFetch处理异步数据，遵循命名、参数处理、返回值设计等最佳实践，通过解构使用，避免代码冗余，提升维护性，优于Mixins。

categories:
  - vue

tags:
  - 基础入门
  - 组合式API
  - 组件复用逻辑
  - 响应式编程
  - useFetch
  - 最佳实践
  - 复用方案对比

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/aaaaaaaaaaa.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、组件复用的痛点与组合式API的诞生

### 1.1 从"重复代码"到"逻辑复用"

在Vue开发中，我们经常会遇到多个组件需要实现相同逻辑的场景：比如多个页面都需要追踪鼠标位置、多个组件都要处理异步数据加载的状态（加载中、成功、失败）。如果每个组件都重复写一遍相同的代码，不仅会导致代码冗余，还会让后续的维护变得异常痛苦——改一个逻辑要改N个地方。

在Vue2中，我们可能会用Mixins来复用逻辑，但Mixins有很多天生的缺陷。而Vue3的组合式API（Composition API）带来了更优雅的解决方案：
**Composable（可组合函数）**，它让我们可以将有状态的逻辑封装成可复用的函数，同时保持清晰的代码结构和明确的依赖关系。

### 1.2 什么是Composable？

在Vue的语境中，Composable是一个利用组合式API封装和复用**有状态逻辑**的函数。这里的"有状态"
指的是逻辑中包含随时间变化的状态（比如鼠标的x/y坐标、异步请求的数据），而不是像工具函数那样只做纯计算。

举个简单的对比：

- 无状态逻辑：比如格式化日期的函数，输入固定值就返回固定结果，没有状态变化。
- 有状态逻辑：比如追踪鼠标位置，鼠标移动时状态会实时更新，这就需要用Composable来封装。

## 二、Composable实战：从简单到复杂

### 2.1 基础示例：鼠标位置追踪

#### 2.1.1 组件内直接实现

先来看如果不使用Composable，在组件内直接实现鼠标追踪的代码：

```vue

<script setup>
  import {ref, onMounted, onUnmounted} from 'vue'

  // 定义响应式状态：鼠标的x、y坐标
  const x = ref(0)
  const y = ref(0)

  // 更新鼠标位置的函数
  function updateMousePosition(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 组件挂载时添加鼠标移动监听
  onMounted(() => window.addEventListener('mousemove', updateMousePosition))
  // 组件卸载时移除监听，避免内存泄漏
  onUnmounted(() => window.removeEventListener('mousemove', updateMousePosition))
</script>

<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
</template>
```

这段代码可以正常工作，但如果另一个组件也需要鼠标追踪功能，你就得把这些代码复制过去——这显然不是最优解。

#### 2.1.2 提取为Composable函数

我们可以把鼠标追踪的核心逻辑提取到一个单独的文件中，变成可复用的Composable：

```javascript
// src/composables/useMouse.js
import {ref, onMounted, onUnmounted} from 'vue'

// 约定：Composable函数名以use开头，采用小驼峰命名
export function useMouse() {
    // 1. 封装内部状态：只有Composable能修改这些状态
    const x = ref(0)
    const y = ref(0)

    // 2. 封装状态更新逻辑
    function updatePosition(event) {
        x.value = event.pageX
        y.value = event.pageY
    }

    // 3. 封装生命周期副作用：组件挂载/卸载时添加/移除监听
    onMounted(() => window.addEventListener('mousemove', updatePosition))
    onUnmounted(() => window.removeEventListener('mousemove', updatePosition))

    // 4. 暴露需要给组件使用的状态
    return {x, y}
}
```

现在，任何组件都可以轻松复用这个逻辑：

```vue

<script setup>
  import {useMouse} from '@/composables/useMouse'

  // 解构获取Composable返回的响应式状态
  const {x, y} = useMouse()
</script>

<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
</template>
```

这样一来，鼠标追踪的逻辑只需要维护一份，所有组件都可以共享。

#### 2.1.3 嵌套Composable：复用事件监听逻辑

Composable的另一个强大之处是可以嵌套使用。我们可以把"添加/移除DOM事件监听"的逻辑也提取成一个Composable，让useMouse变得更简洁：

```javascript
// src/composables/useEventListener.js
import {onMounted, onUnmounted} from 'vue'

export function useEventListener(target, event, callback) {
    // 组件挂载时添加监听
    onMounted(() => target.addEventListener(event, callback))
    // 组件卸载时移除监听
    onUnmounted(() => target.removeEventListener(event, callback))
}
```

然后修改useMouse：

```javascript
// src/composables/useMouse.js
import {ref} from 'vue'
import {useEventListener} from './useEventListener'

export function useMouse() {
    const x = ref(0)
    const y = ref(0)

    // 嵌套调用useEventListener，复用事件监听逻辑
    useEventListener(window, 'mousemove', (event) => {
        x.value = event.pageX
        y.value = event.pageY
    })

    return {x, y}
}
```

这样的分层设计让每个Composable只负责单一职责，代码更加清晰，也更容易维护。

下面是鼠标追踪Composable的调用流程示意图：

```mermaid
graph TD
    A[组件调用useMouse] --> B[useMouse创建响应式状态x,y]
    B --> C[调用useEventListener注册鼠标移动监听]
    C --> D[鼠标移动时触发回调，更新x,y]
    D --> E[组件模板实时渲染x,y]
    F[组件卸载] --> G[useEventListener自动移除监听]
```

### 2.2 进阶示例：异步数据获取

#### 2.2.1 基础版useFetch

异步数据获取是前端开发中非常常见的场景，我们通常需要处理三种状态：加载中、成功、失败。先来看基础版的useFetch：

```javascript
// src/composables/useFetch.js
import {ref} from 'vue'

export function useFetch(url) {
    // 响应式状态：数据、错误信息
    const data = ref(null)
    const error = ref(null)

    // 发起异步请求
    fetch(url)
        .then(res => res.json())
        .then(json => data.value = json)
        .catch(err => error.value = err)

    // 返回状态给组件使用
    return {data, error}
}
```

组件中使用：

```vue

<script setup>
  import {useFetch} from '@/composables/useFetch'

  const {data, error} = useFetch('https://api.example.com/posts')
</script>

<template>
  <div v-if="error">请求失败：{{ error.message }}</div>
  <div v-else-if="data">
    <h2>文章列表</h2>
    <ul>
      <li v-for="post in data" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
  <div v-else>加载中...</div>
</template>
```

#### 2.2.2 支持响应式URL的增强版useFetch

基础版的useFetch只能接收静态URL，如果我们需要URL变化时自动重新请求数据，就需要让useFetch支持响应式输入。这时候可以用
`watchEffect`和`toValue`API：

```javascript
// src/composables/useFetch.js
import {ref, watchEffect, toValue} from 'vue'

export function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    // 封装请求逻辑
    const fetchData = () => {
        // 每次请求前重置状态
        data.value = null
        error.value = null

        // toValue：统一处理静态值、ref、 getter函数
        fetch(toValue(url))
            .then(res => res.json())
            .then(json => data.value = json)
            .catch(err => error.value = err)
    }

    // watchEffect：自动追踪依赖，依赖变化时重新执行
    watchEffect(() => {
        fetchData()
    })

    return {data, error}
}
```

现在useFetch可以支持三种类型的输入：

1. 静态URL字符串：`useFetch('/api/posts')`
2. ref：`const url = ref('/api/posts'); useFetch(url)`
3. getter函数：`useFetch(() => `/api/posts/${props.id}`)`

当URL变化时，watchEffect会自动重新发起请求，非常灵活。

## 三、Composable的约定与最佳实践

### 3.1 命名规范

- Composable函数名必须以`use`开头，采用小驼峰命名（比如`useMouse`、`useFetch`），这是Vue社区的通用约定，让其他开发者一眼就能识别这是一个Composable。

### 3.2 输入参数处理

- 如果Composable需要接收外部参数，推荐用`toValue`来统一处理静态值、ref和getter函数，这样可以让Composable更灵活，同时保持响应式追踪。
- 示例：
  ```javascript
  import { toValue } from 'vue'

  function useFeature(maybeRefOrGetter) {
    const value = toValue(maybeRefOrGetter)
    // 处理值...
  }
  ```

### 3.3 返回值设计

- 推荐Composable返回一个包含多个ref的普通对象，而不是reactive对象。这样组件在解构时可以保持响应式：
  ```javascript
  // 正确：解构后x、y仍然是响应式ref
  const { x, y } = useMouse()
  ```
- 如果需要以对象属性的方式使用，可以用reactive包裹返回值：
  ```javascript
  const mouse = reactive(useMouse())
  // mouse.x会自动解包ref的值
  console.log(mouse.x)
  ```

### 3.4 副作用管理

- Composable中可以执行副作用（比如添加事件监听、发起请求），但必须注意清理：
    - DOM相关的副作用要放在`onMounted`等客户端生命周期钩子中，避免SSR时出错。
    - 所有副作用都要在组件卸载时清理（比如用`onUnmounted`移除事件监听），防止内存泄漏。

### 3.5 使用限制

- Composable只能在`<script setup>`、`setup()`钩子或者其他Composable中同步调用。
- 如果在`await`之后调用Composable，必须在`<script setup>`中，因为编译器会自动恢复组件实例上下文。

## 四、Composable vs 其他复用方案

### 4.1 对比Mixins

Vue2中的Mixins是一种复用逻辑的方式，但有三个明显的缺点：

1. **属性来源不清晰**：多个Mixins注入的属性会混合在一起，很难追踪某个属性来自哪个Mixin。
2. **命名冲突**：不同Mixin可能定义相同的属性名，导致冲突。
3. **隐式依赖**：Mixin之间如果需要通信，只能通过共享属性，导致耦合度高。

而Composable通过解构的方式明确属性来源，支持重命名避免冲突，并且通过函数参数显式传递依赖，完全解决了这些问题。因此Vue3不再推荐使用Mixins。

### 4.2 对比无渲染组件

无渲染组件（Renderless Component）通过作用域插槽复用逻辑和布局，但会产生额外的组件实例开销。而Composable只复用逻辑，没有组件实例的性能损耗。

推荐原则：

- 复用纯逻辑：用Composable
- 复用逻辑+布局：用组件

### 4.3 对比React Hooks

Vue的Composable和React的自定义Hooks看起来很相似，但底层原理不同：

- React Hooks基于函数组件的重新执行模型，依赖调用顺序。
- Vue Composable基于Vue的细粒度响应式系统，不需要关心调用顺序，响应式追踪是自动的。

## 五、课后Quiz

### 问题1：为什么Vue3推荐使用Composable而不是Mixins？

**答案解析**：
Mixins有三个主要缺点：

1. 属性来源不清晰：多个Mixins的属性混合在一起，难以追踪。
2. 命名冲突：不同Mixin可能定义相同的属性名。
3. 隐式依赖：Mixin之间通过共享属性通信，耦合度高。

而Composable通过解构明确属性来源，支持重命名避免冲突，通过函数参数显式传递依赖，解决了这些问题，代码更清晰、更易于维护。

### 问题2：如何让Composable支持响应式的输入参数？

**答案解析**：
可以使用Vue3.3+的`toValue`API结合`watchEffect`：

1. 用`toValue`统一处理静态值、ref和getter函数，将其转换为普通值。
2. 用`watchEffect`包裹逻辑，自动追踪响应式依赖，当依赖变化时重新执行逻辑。

示例：

```javascript
import {ref, watchEffect, toValue} from 'vue'

export function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    const fetchData = () => {
        fetch(toValue(url))
            .then(res => res.json())
            .then(json => data.value = json)
            .catch(err => error.value = err)
    }

    watchEffect(fetchData)

    return {data, error}
}
```

### 问题3：Composable的返回值为什么推荐用ref而不是reactive？

**答案解析**：
如果Composable返回reactive对象，组件在解构时会失去响应式：

```javascript
// 错误：解构后data不再是响应式
const {data} = useFetchReactive()
```

而返回包含ref的普通对象，解构后每个ref仍然保持响应式：

```javascript
// 正确：x、y仍然是响应式ref
const {x, y} = useMouse()
```

如果需要以对象属性的方式使用，可以用reactive包裹返回值，ref会自动解包。

## 六、常见报错与解决方案

### 错误1：在非setup上下文调用Composable

**错误信息**：`Uncaught Error: callHook(...) is called when there is no active component instance to be associated with.`
**产生原因**：Composable需要依赖组件实例上下文来注册生命周期钩子和追踪响应式状态，如果在`setup()`、`<script setup>`
或其他Composable之外调用，就会报错。
**解决办法**：

- 确保Composable只在`<script setup>`、`setup()`钩子或者其他Composable中调用。
- 如果需要在异步操作后调用，必须在`<script setup>`中使用`await`，因为编译器会自动恢复上下文。
  **预防建议**：养成在setup内调用Composable的习惯，不要在全局作用域或普通函数中调用。

### 错误2：副作用未清理导致内存泄漏

**错误表现**：组件卸载后，事件监听仍然存在，或者定时器仍然在运行，导致内存泄漏。
**产生原因**：Composable中执行了副作用（比如添加事件监听），但没有在组件卸载时清理。
**解决办法**：

- 在`onUnmounted`钩子中清理副作用，比如移除事件监听、清除定时器。
- 可以复用`useEventListener`这样的Composable，它已经内置了清理逻辑。
  **预防建议**：编写Composable时，遵循"谁添加谁清理"的原则，所有副作用都要对应清理逻辑。

### 错误3：解构reactive对象失去响应式

**错误表现**：解构reactive返回的对象后，修改属性不会触发视图更新。
**产生原因**：reactive对象的响应式是基于对象本身的，解构后得到的是普通值，不再是响应式的。
**解决办法**：

- 推荐Composable返回包含ref的普通对象，解构后ref仍然保持响应式。
- 如果必须返回reactive对象，不要解构，直接使用对象属性：
  ```javascript
  const mouse = useMouseReactive()
  // 直接使用mouse.x，不要解构
  console.log(mouse.x)
  ```

**预防建议**：遵循Composable的返回值约定，优先返回ref的普通对象。

## 参考链接

https://vuejs.org/guide/reusability/composables.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3中Composable如何解决组件复用中的重复代码问题？](https://blog.cmdragon.cn/posts/82c2241259e63313c0b82f53f1e0ed76/)



<details>
<summary>往期文章归档</summary>

- [Vue组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)
- [Vue3组件化开发中，Props与Emits如何实现数据流转与事件协作？](https://blog.cmdragon.cn/posts/8cff7d2df113da66ea7be560c4d1d22a/)
- [Vue 3模板引用如何与其他特性协同实现复杂交互？](https://blog.cmdragon.cn/posts/331bf75d114ab09116eadfcdca602b58/)
- [Vue 3 v-for中模板引用如何实现高效管理与动态控制？](https://blog.cmdragon.cn/posts/cb380897ddc3578b180ecf8843c774c1/)
- [Vue 3的defineExpose：如何突破script setup组件默认封装，实现精准的父子通讯？](https://blog.cmdragon.cn/posts/202ae0f4acde7128e0e31baf63732fb5/)
- [Vue 3模板引用的生命周期时机如何把握？常见陷阱该如何避免？](https://blog.cmdragon.cn/posts/7d2a0f6555ecbe92afd7d2491c427463/)
- [Vue 3模板引用如何实现父组件与子组件的高效交互？](https://blog.cmdragon.cn/posts/3fb7bdd84128b7efaaa1c979e1f28dee/)
- [Vue中为何需要模板引用？又如何高效实现DOM与组件实例的直接访问？](https://blog.cmdragon.cn/posts/23f3464ba16c7054b4783cded50c04c6/)
- [Vue 3 watch与watchEffect如何区分使用？常见陷阱与性能优化技巧有哪些？](https://blog.cmdragon.cn/posts/68a26cc0023e4994a6bc54fb767365c8/)
- [Vue3侦听器实战：组件与Pinia状态监听如何高效应用？](https://blog.cmdragon.cn/posts/fd4695f668d64332dda9962c24214f32/)
- [Vue 3中何时用watch，何时用watchEffect？核心区别及性能优化策略是什么？](https://blog.cmdragon.cn/posts/cdbbb1837f8c093252e61f46dbf0a2e7/)
- [Vue 3中如何有效管理侦听器的暂停、恢复与副作用清理？](https://blog.cmdragon.cn/posts/09551ab614c463a6d6ca69818e8c2d52/)
- [Vue 3 watchEffect：如何实现响应式依赖的自动追踪与副作用管理？](https://blog.cmdragon.cn/posts/b7bca5d20f628ac09f7192ad935ef664/)
- [Vue 3 watch如何利用immediate、once、deep选项实现初始化、一次性与深度监听？](https://blog.cmdragon.cn/posts/2c6cdb100a20f10c7e7d4413617c7ea9/)
- [Vue 3中watch如何高效监听多数据源、计算结果与数组变化？](https://blog.cmdragon.cn/posts/757a1728bc1b9c0c8b317b0354d85568/)
- [Vue 3中watch监听ref和reactive的核心差异与注意事项是什么？](https://blog.cmdragon.cn/posts/8e70552f0f61e0dc8c7f567a2d272345/)
- [Vue3中Watch与watchEffect的核心差异及适用场景是什么？](https://blog.cmdragon.cn/posts/dde70ab90dc5062c435e0501f5a6e7cb/)
- [Vue 3自定义指令如何赋能表单自动聚焦与防抖输入的高效实现？](https://blog.cmdragon.cn/posts/1f5ed5047850ed52c0fd0386f76bd4ae/)
- [Vue3中如何优雅实现支持多绑定变量和修饰符的双向绑定组件？](https://blog.cmdragon.cn/posts/e3d4e128815ad731611b8ef29e37616b/)
- [Vue 3表单验证如何从基础规则到异步交互构建完整验证体系？](https://blog.cmdragon.cn/posts/7d1caedd822f70542aa0eed67e30963b/)
- [Vue3响应式系统如何支撑表单数据的集中管理、动态扩展与实时计算？](https://blog.cmdragon.cn/posts/3687a5437ab56cb082b5b813d5577a40/)
- [Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？](https://blog.cmdragon.cn/posts/ad67c4eb6d76cf7707bdfe6a8146c34f/)
- [Vue3表单事件处理：v-model如何实现数据绑定、验证与提交？](https://blog.cmdragon.cn/posts/1c1e80d697cca0923f29ec70ebb8ccd1/)
- [Vue应用如何基于DOM事件传播机制与事件修饰符实现高效事件处理？](https://blog.cmdragon.cn/posts/b990828143d70aa87f9aa52e16692e48/)
- [Vue3中如何在调用事件处理函数时同时传递自定义参数和原生DOM事件？参数顺序有哪些注意事项？](https://blog.cmdragon.cn/posts/b44316e0866e9f2e6aef927dbcf5152b/)
- [从捕获到冒泡：Vue事件修饰符如何重塑事件执行顺序？](https://blog.cmdragon.cn/posts/021636c2a06f5e2d3d01977a12ddf559/)
- [Vue事件处理：内联还是方法事件处理器，该如何抉择？](https://blog.cmdragon.cn/posts/b3cddf7023ab537e623a61bc01dab6bb/)
- [Vue事件绑定中v-on与@语法如何取舍？参数传递与原生事件处理有哪些实战技巧？](https://blog.cmdragon.cn/posts/bd4d9607ce1bc34cc3bda0a1a46c40f6/)
- [Vue 3中列表排序时为何必须复制数组而非直接修改原始数据？](https://blog.cmdragon.cn/posts/a5f2bacb74476fd7f5e02bb3f1ba6b2b/)
- [Vue虚拟滚动如何将列表DOM数量从万级降至十位数？](https://blog.cmdragon.cn/posts/d3b06b57fb7f126787e6ed22dce1e341/)
- [Vue3中v-if与v-for直接混用为何会报错？计算属性如何解决优先级冲突？](https://blog.cmdragon.cn/posts/3100cc5a2e16f8dac36f722594e6af32/)
- [为何在Vue3递归组件中必须用v-if判断子项存在？](https://blog.cmdragon.cn/posts/455dc2d47c38d12c1cf350e490041e8b/)
- [Vue3列表渲染中，如何用数组方法与计算属性优化v-for的数据处理？](https://blog.cmdragon.cn/posts/3f842bbd7ba0f9c91151b983bf784c8b/)
- [Vue v-for的key：为什么它能解决列表渲染中的“玄学错误”？选错会有哪些后果？](https://blog.cmdragon.cn/posts/1eb3ffac668a743843b5ea1738301d40/)
- [Vue3中v-for与v-if为何不能直接共存于同一元素？](https://blog.cmdragon.cn/posts/138b13c5341f6a1fa9015400433a3611/)
- [Vue3中v-if与v-show的本质区别及动态组件状态保持的关键策略是什么？](https://blog.cmdragon.cn/posts/0242a94dc552b93a1bc335ac4fc33db5/)
- [Vue3中v-show如何通过CSS修改display属性控制条件显示？与v-if的应用场景该如何区分？](https://blog.cmdragon.cn/posts/97c66a18ae0e9b57c6a69b8b3a41ddf6/)
- [Vue3条件渲染中v-if系列指令如何合理使用与规避错误？](https://blog.cmdragon.cn/posts/8a1ddfac64b25062ac56403e4c1201d2/)
- [Vue3动态样式控制：ref、reactive、watch与computed的应用场景与区别是什么？](https://blog.cmdragon.cn/posts/218c3a59282c3b757447ee08a01937bb/)
- [Vue3中动态样式数组的后项覆盖规则如何与计算属性结合实现复杂状态样式管理？](https://blog.cmdragon.cn/posts/1bab953e41f66ac53de099fa9fe76483/)
- [Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/)
- [Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be04b02d2723994632de0d4ca22a3391/)
- [Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be04b02d2723994632de0d4ca22a3391/)
- [Vue3响应式系统中，对象新增属性、数组改索引、原始值代理的问题如何解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a0af08dd60a37b9a890a9957f2cbfc9f/)
- [Vue 3中watch侦听器的正确使用姿势你掌握了吗？深度监听、与watchEffect的差异及常见报错解析 - cmdragon's Blog](https://blog.cmdragon.cn/posts/bc287e1e36287afd90750fd907eca85e/)
- [Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/654b9447ef1ba7ec1126a1bc26a4726d/)
- [Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/654b9447ef1ba7ec1126a1bc26a4726d/)
- [为什么Vue 3需要ref函数？它的响应式原理与正确用法是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c405a8d9950af5b7c63b56c348ac36b6/)
- [Vue 3中reactive函数如何通过Proxy实现响应式？使用时要避开哪些误区？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a7e9abb9691a81e4404d9facabe0f7c3/)
- [Vue3响应式系统的底层原理与实践要点你真的懂吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bd995ea45161727597fb85b62566c43d/)
- [Vue 3模板如何通过编译三阶段实现从声明式语法到高效渲染的跨越 - cmdragon's Blog](https://blog.cmdragon.cn/posts/53e3f270a80675df662c6857a3332c0f/)
- [快速入门Vue模板引用：从收DOM“快递”到调子组件方法，你玩明白了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbce4f2a23aa72c96b1c0473900321e/)
- [快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/23a2d5a334e15575277814c16e45df50/)
- [快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6be38de6382e31d282659b689c5b17f0/)
- [快速入门Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/60ce517684f4a418f453d66aa805606c/)
- [快速入门Vue3的v-指令：数据和DOM的“翻译官”到底有多少本事？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e4ae7d5e4a9205bb11b2baccb230c637/)
- [快速入门Vue3，插值、动态绑定和避坑技巧你都搞懂了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/999ce4fb32259ff4fbf4bf7bcb851654/)
- [想让PostgreSQL快到飞起？先找健康密码还是先换引擎？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a6997d81b49cd232b87e1cf603888ad1/)
- [想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)
- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
- [PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)
- [复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)
- [只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)
- [B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)
- [想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)
- [PostgreSQL的“时光机”MVCC和锁机制是怎么搞定高并发的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)
- [PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)
- [大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么“分类”才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)
- [PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)
- [PostgreSQL里的子查询和CTE居然在性能上“掐架”？到底该站哪边？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c096347d18e67b7431faacd2c4757093/)
- [PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)
- [PostgreSQL新手SQL总翻车？这7个性能陷阱你踩过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/068ecb772a87d7df20a8c9fb4b233f8e/)
- [PostgreSQL索引选B-Tree还是GiST？“瑞士军刀”和“多面手”的差别你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)
- [想知道数据库怎么给查询“算成本选路线”？EXPLAIN能帮你看明白？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)
- [PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)
- [PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)
- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的“仓库-房间-货架”游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
- [PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ba1f545a3410144552fbdbfcf31b5265/)
- [能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b5474d1480509c5072085abc80b3dd9f/)
- [给接口加新字段又不搞崩老客户端？FastAPI的多版本API靠哪三招实现？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/cc098d8836e787baa8a4d92e4d56d5c5/)
- [流量突增要搞崩FastAPI？熔断测试是怎么防系统雪崩的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/46d05151c5bd31cf37a7bcf0b8f5b0b8/)
- [FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/65ce343cc5df9faf3a8e2eeaab42ae45/)
- [FastAPI的CI流水线怎么自动测端点，还能让Allure报告美到犯规？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/eed6cd8985d9be0a4b092a7da38b3e0c/)
- [如何用GitHub Actions为FastAPI项目打造自动化测试流水线？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6157d87338ce894d18c013c3c4777abb/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [快图设计 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/quick-image-design)
- [高级文字转图片转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-image-advanced)
- [RAID 计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/raid-calculator)
- [在线PS - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/photoshop-online)
- [Mermaid 在线编辑器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/mermaid-live-editor)
- [数学求解计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/math-solver-calculator)
- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
- [歌词生成工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/lyrics-generator)
- [网盘资源聚合搜索 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/cloud-drive-search)
- [ASCII字符画生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ascii-art-generator)
- [JSON Web Tokens 工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/jwt-tool)
- [Bcrypt 密码工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/bcrypt-tool)
- [GIF 合成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-composer)
- [GIF 分解器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-decomposer)
- [文本隐写术 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-steganography)
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
- [IP归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)

</details>