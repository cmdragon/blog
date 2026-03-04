---
url: /posts/5a2ceb52760f72b9ff46358b5f6c26c3/
title: Vue 3 script setup：如何通过自动注册与编译优化实现组件开发效率跃升？
date: 2026-03-04T06:55:24+08:00
lastmod: 2026-03-04T06:55:24+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_d3bc4241-63e6-4f45-abf2-286700218c7a.png

summary:
  Vue 3.2引入的script setup是专为Composition API设计的编译时语法糖，能自动完成组件注册、props/emits声明（通过defineProps/defineEmits）、双向绑定（defineModel），顶层绑定自动暴露模板，减少样板代码，提升开发体验与性能，支持TypeScript类型推断。

categories:
  - vue

tags:
  - 基础入门
  - script setup
  - 组件自动注册
  - Props与Emits
  - 编译宏
  - 实战案例
  - 常见报错解决

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_d3bc4241-63e6-4f45-abf2-286700218c7a.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、script setup语法糖简介

### 1.1 什么是script setup

`script setup`是Vue 3.2版本引入的编译时语法糖，专为Composition
API设计。它就像一个智能助手，能自动帮你处理组件开发中的重复性工作，让你从繁琐的样板代码中解放出来，专注于业务逻辑的实现。

在传统的Vue 3组件中，你需要手动注册组件、return变量和函数、声明props和emits选项，而使用`script setup`
后，这些工作都会自动完成，代码量能减少30%-50%。

### 1.2 设计目标与核心优势

- **减少样板代码**：无需编写`export default`和`setup()`函数，无需return变量和函数
- **更直观的开发体验**：组件、变量、函数直接在模板中使用，符合直觉
- **更好的性能**：编译时直接生成渲染函数，减少运行时代码
- **完美的TypeScript支持**：通过编译宏提供完整的类型推断

## 二、自动注册机制深度解析

### 2.1 组件的自动注册

#### 2.1.1 普通组件自动注册

在`script setup`中，你只需导入组件，就能直接在模板中使用，无需在`components`选项中手动注册。这是因为编译过程中，Vue会自动将导入的组件变量注册为模板可用的组件。

```vue

script setup
  // 导入组件
  import UserAvatar from './UserAvatar.vue'
  import UserInfo from './UserInfo.vue'
</script>

<template>
  <!-- 直接使用组件，无需注册 -->
  <div class="user-card">
    <UserAvatar/>
    <UserInfo/>
  </div>
</template>
```

**原理**：编译时Vue会扫描所有导入的组件变量，自动将它们添加到组件的`components`选项中，相当于帮你完成了
`components: { UserAvatar, UserInfo }`的注册工作。

#### 2.1.2 动态组件的使用方式

在`script setup`中，动态组件不再使用字符串作为组件名，而是直接使用组件变量。通过`:is`绑定实现动态切换：

```vue

script setup
  import UserProfile from './UserProfile.vue'
  import UserSettings from './UserSettings.vue'
  import {ref} from 'vue'

  const activeComponent = ref(UserProfile)
</script>

<template>
  <!-- 使用组件变量作为动态组件 -->
  <component :is="activeComponent"/>

  <button @click="activeComponent = UserProfile">
    查看个人资料
  </button>
  <button @click="activeComponent = UserSettings">
    进入设置
  </button>
</template>
```

#### 2.1.3 递归组件与命名空间组件

- **递归组件**：组件可以通过自身文件名直接引用自己，比如`UserTree.vue`可以在模板中使用`<UserTree />`递归渲染
- **命名空间组件**：可以通过对象属性的方式使用组件，适合从单个文件导入多个组件的场景

```vue

script setup
  // 从单个文件导入多个组件
  import * as Form from './form-components'
</script>

<template>
  <!-- 使用命名空间组件 -->
  <Form.Input>
    <Form.Label>用户名</Form.Label>
  </Form.Input>
  <Form.Button>提交</Form.Button>
</template>
```

### 2.2 Props与Emits的自动处理

#### 2.2.1 defineProps的自动注册与响应式

`defineProps`是`script setup`中的编译宏，无需导入即可使用。它会自动注册组件的props，并返回响应式的props对象。在Vue
3.5及以上版本中，解构后的props变量依然保持响应式。

```vue

script setup
  // 运行时声明props
  const props = defineProps({
    userId: {
      type: String,
      required: true
    },
    userName: String
  })

  // Vue 3.5+ 支持响应式解构
  const {userId, userName} = defineProps(['userId', 'userName'])

  // TypeScript类型声明方式
  const props = defineProps < {
    userId: string
    userName? : string
  } > ()
</script>

<template>
  <div>用户ID: {{ userId }}</div>
  <div>用户名: {{ userName }}</div>
</template>
```

#### 2.2.2 defineEmits的事件声明

`defineEmits`同样是编译宏，用于声明组件触发的事件，返回一个事件触发函数。

```vue

script setup
  // 运行时声明事件
  const emit = defineEmits(['user-click', 'user-delete'])

  // TypeScript类型声明方式
  const emit = defineEmits < {
  (e
  :
  'user-click', userId
  :
  string
  ):
  void
      (e: 'user-delete', userId
  :
  string
  ):
  void
  }>
  ()

  const handleUserClick = () => {
    emit('user-click', props.userId)
  }
</script>

<template>
  <div @click="handleUserClick">
    点击触发事件
  </div>
</template>
```

### 2.3 其他自动注册特性

#### 2.3.1 顶层绑定自动暴露给模板

在`script setup`中，所有顶层声明的变量、函数、导入的内容都会自动暴露给模板，无需手动return：

```vue

script setup
  import {ref} from 'vue'
  import {formatDate} from '../utils'

  // 响应式变量
  const count = ref(0)
  // 普通变量
  const message = 'Hello Vue 3'
  // 函数
  const increment = () => count.value++
</script>

<template>
  <div>{{ message }}</div>
  <div>计数: {{ count }}</div>
  <button @click="increment">+1</button>
  <div>当前时间: {{ formatDate(new Date()) }}</div>
</template>
```

#### 2.3.2 自定义指令的自动注册

自定义指令只需以`v`开头命名，就能自动在模板中使用：

```vue

script setup
  // 自定义指令，自动注册为v-focus
  const vFocus = {
    mounted(el) {
      el.focus()
    }
  }
</script>

<template>
  <!-- 直接使用自定义指令 -->
  <input v-focus placeholder="自动获取焦点"/>
</template>
```

#### 2.3.3 defineModel的双向绑定自动处理

Vue 3.4+引入的`defineModel`编译宏，自动处理双向绑定的prop和事件，简化v-model的实现：

```vue

script setup
  // 自动注册modelValue prop和update:modelValue事件
  const model = defineModel()

  // 自定义prop名
  const count = defineModel('count', {default: 0})
</script>

<template>
  <input v-model="model"/>
  <div>计数: {{ count }}</div>
  <button @click="count.value++">+1</button>
</template>
```

## 三、流程图：script setup编译与自动注册流程

```mermaid
flowchart TD
    A[编写script setup代码] --> B[编译阶段处理]
    B --> C[识别导入的组件]
    B --> D[处理编译宏(defineProps/defineEmits/defineModel)]
    B --> E[扫描顶层绑定与自定义指令]
    C --> F[自动注册组件到模板作用域]
    D --> G[生成对应的props/emits选项与响应式对象]
    E --> H[暴露顶层绑定到模板上下文]
    E --> I[自动注册v开头的自定义指令]
    F --> J[模板中可直接使用组件]
    G --> K[组件实例拥有props与事件能力]
    H --> L[模板中直接使用变量/函数/导入内容]
    I --> M[模板中可使用自定义指令]
```

## 四、实战案例：构建一个用户信息卡片组件

### 4.1 组件结构设计

我们将构建一个完整的用户信息卡片组件，包含以下功能：

- 接收用户基本信息props
- 支持点击触发用户详情事件
- 集成头像组件和信息展示组件
- 支持双向绑定控制卡片显示状态

### 4.2 完整代码实现与注释

```vue
<!-- UserCard.vue -->
script setup
  // 导入子组件
  import UserAvatar from './UserAvatar.vue'
  import UserDetails from './UserDetails.vue'
  import {ref} from 'vue'

  // 1. 自动注册props
  const props = defineProps < {
    userId: string
    userName: string
    userAvatar: string
    userLevel: number
  } > ()

  // 2. 自动注册事件
  const emit = defineEmits < {
  (e
  :
  'view-detail', userId
  :
  string
  ):
  void
  }>
  ()

  // 3. 自动注册双向绑定model
  const isVisible = defineModel < boolean > ({default: true})

  // 4. 顶层函数自动暴露给模板
  const handleViewDetail = () => {
    emit('view-detail', props.userId)
  }
</script>

<template>
  <div v-if="isVisible" class="user-card" @click="handleViewDetail">
    <!-- 直接使用导入的组件 -->
    <UserAvatar :src="userAvatar" :level="userLevel"/>
    <UserDetails :name="userName" :id="userId"/>

    <button @click="isVisible = false">隐藏卡片</button>
  </div>
</template>

<style scoped>
  .user-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .user-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>
```

### 4.3 实际运行效果与解析

- 父组件可以通过v-model控制卡片的显示隐藏
- 点击卡片会触发view-detail事件，传递用户ID
- 所有子组件自动注册，无需手动声明
- props和事件自动处理，无需编写options API代码

## 五、课后Quiz：巩固你的知识

### 5.1 问题1：动态组件在script setup中的正确用法是什么？

**答案解析**：
在`script setup`中，动态组件需要使用组件变量而非字符串，通过`:is`绑定实现：

```vue

script setup
  import Foo from './Foo.vue'
  import Bar from './Bar.vue'
</script>

<template>
  <component :is="Foo"/>
  <component :is="someCondition ? Foo : Bar"/>
</template>
```

### 5.2 问题2：如何在script setup中暴露组件方法给父组件？

**答案解析**：
使用`defineExpose`编译宏显式暴露组件内部属性和方法：

```vue

script setup
  import {ref} from 'vue'

  const count = ref(0)
  const increment = () => count.value++

  // 显式暴露给父组件
  defineExpose({
    count,
    increment
  })
</script>
```

父组件可以通过模板ref访问：

```vue

script setup
  import UserCard from './UserCard.vue'
  import {ref} from 'vue'

  const cardRef = ref()

  const handleIncrement = () => {
    cardRef.value.increment()
  }
</script>

<template>
  <UserCard ref="cardRef"/>
  <button @click="handleIncrement">调用子组件方法</button>
</template>
```

### 5.3 问题3：Vue3.5之后，props解构的响应式有什么变化？

**答案解析**：
在Vue 3.5及以上版本中，从`defineProps`返回值解构的变量会自动保持响应式：

```vue

script setup
  // Vue 3.5+ 支持响应式解构
  const {userId, userName} = defineProps(['userId', 'userName'])

  // 会在userId变化时自动执行
  watchEffect(() => {
    console.log('用户ID变化:', userId)
  })
</script>
```

而在Vue 3.5之前，解构后的变量会失去响应式，需要使用`toRefs`或`toRef`转换。

## 六、常见报错与解决方案

### 6.1 报错："Failed to resolve component"

**原因**：组件未正确导入或导入路径错误，或者组件文件名大小写与模板中使用的不一致。
**解决办法**：

1. 检查组件导入语句是否正确，路径是否存在
2. 确保模板中使用的组件名与导入的变量名一致（推荐PascalCase）
3. 检查webpack/vite的别名配置是否正确

### 6.2 报错："defineProps is not defined"

**原因**：在非`script setup`中使用`defineProps`，或者Vue版本低于3.2。
**解决办法**：

1. 确保使用的是`script setup`标签，而非普通`<script>`
2. 升级Vue到3.2及以上版本
3. 不要手动导入`defineProps`，它是编译宏自动提供的

### 6.3 报错："Cannot destructure property 'foo' of 'defineProps(...)' as it is not reactive"

**原因**：Vue版本低于3.5，解构props变量会失去响应式。
**解决办法**：

1. 升级Vue到3.5及以上版本（推荐）
2. 使用`toRefs`转换：

```vue

script setup
  import {toRefs} from 'vue'

  const props = defineProps(['foo'])
  const {foo} = toRefs(props)
</script>
```

### 6.4 报错："defineProps cannot be used with both runtime and type declarations"

**原因**：同时使用了运行时props声明和类型声明。
**解决办法**：
选择其中一种声明方式：

```vue
// 方式1：运行时声明
const props = defineProps({
foo: String
})

// 方式2：TypeScript类型声明
const props = defineProps<{
foo: string
}>()
```

## 七、参考链接

参考链接：https://vuejs.org/api/sfc-script-setup.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3 script setup：如何通过自动注册与编译优化实现组件开发效率跃升？](https://blog.cmdragon.cn/posts/5a2ceb52760f72b9ff46358b5f6c26c3/)



<details>
<summary>往期文章归档</summary>

- [Vue 3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3生命周期钩子实战指南：如何正确选择onMounted、onUpdated与onUnmounted的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue 3组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
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