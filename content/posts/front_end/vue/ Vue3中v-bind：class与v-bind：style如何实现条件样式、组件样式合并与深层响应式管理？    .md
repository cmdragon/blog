---
url: /posts/38b84e85cfb8988407145f189457af6e/
title: Vue3中v-bind:class与v-bind:style如何实现条件样式、组件样式合并与深层响应式管理？
date: 2025-12-12T05:31:22+08:00
lastmod: 2025-12-12T05:31:22+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/budbo_00028_.png

summary:
  Vue3提供`v-bind:class`和`v-bind:style`实现动态样式。`class`支持字符串、对象、数组语法，可混合静态/动态类名，组件类名自动合并；`style`以对象/数组形式绑定，属性名支持驼峰式或短横线式。Vue3通过Proxy实现深层响应式，无需额外操作即可更新样式。

categories:
  - vue

tags:
  - 基础入门
  - 动态样式绑定
  - v-bind:class
  - v-bind:style
  - 响应式优化
  - 前端开发
  - 内联样式

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/budbo_00028_.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

在前端开发中，动态控制元素样式是高频需求——小到按钮点击后的高亮状态，大到根据数据状态切换组件的整体外观。Vue3 提供的
`v-bind:class`（简写 `:class`）和 `v-bind:style`（简写 `:style`）指令，让我们能以**声明式**
的方式轻松实现这些需求。今天我们就深入学习它们的基础概念、语法逻辑，以及 Vue3 带来的响应式优化。

## 一、`v-bind:class`——动态切换类名

`v-bind:class` 的核心是**根据条件添加/移除 CSS 类名**，支持**字符串、对象、数组**三种语法，覆盖了几乎所有动态类名的场景。

### 1. 基础语法：从简单到复杂

#### （1）字符串语法：单一动态类名

适合类名完全由变量控制的场景（无需条件判断）。比如：

```html

<template>
    <!-- 根据currentType切换类名：info/warning/error -->
    <div class="alert" :class="currentType">
        {{ message }}
    </div>
</template>

<script setup>
    import {ref} from 'vue'
    // 响应式变量：控制警示框类型
    const currentType = ref('info')
    const message = ref('这是一条提示信息')
</script>

<style>
    .alert {
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }

    .info {
        background-color: #d3eafd;
        border: 1px solid #90caf9;
    }

    .warning {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
    }

    .error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
    }
</style>
```

当 `currentType` 从 `info` 改为 `warning` 时，元素会自动切换到 `warning` 类对应的样式——**无需手动操作 DOM**。

#### （2）对象语法：条件控制类名（最常用）

对象语法的核心是**「类名: 布尔值」**的键值对：当布尔值为 `true` 时，类名被添加；为 `false` 时移除。比如实现一个「点击切换激活状态」的按钮：

```html

<template>
    <button
            class="btn"
            :class="{ active: isActive, disabled: isDisabled }"
            @click="toggleActive"
    >
        {{ isActive ? '已激活' : '未激活' }}
    </button>
</template>

<script setup>
    import {ref} from 'vue'
    // 响应式状态：控制激活/禁用
    const isActive = ref(false)
    const isDisabled = ref(false)

    // 点击事件：切换状态
    const toggleActive = () => {
        isActive.value = !isActive.value
        isDisabled.value = isActive.value // 激活时禁用按钮
    }
</script>

<style>
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .active {
        background-color: #42b983;
        color: white;
    }

    .disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
```

这段代码的逻辑很清晰：

- `isActive` 为 `true` 时，添加 `active` 类（绿色背景）；
- `isDisabled` 为 `true` 时，添加 `disabled` 类（半透明+禁止指针）；
- 点击按钮会翻转 `isActive` 的值，从而动态修改类名。

#### （3）数组语法：组合多个动态类名

当需要**同时控制多个动态类名**时，用数组语法。比如一个组件需要同时添加「主题类」和「大小类」：

```html

<template>
    <div class="card" :class="[themeClass, sizeClass]">
        组合动态类名
    </div>
</template>

<script setup>
    import {ref} from 'vue'
    // 主题类：light/dark
    const themeClass = ref('light')
    // 大小类：small/medium/large
    const sizeClass = ref('medium')
</script>

<style>
    .card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 16px;
    }

    .light {
        background-color: #fff;
        color: #333;
    }

    .dark {
        background-color: #333;
        color: #fff;
    }

    .small {
        font-size: 12px;
    }

    .medium {
        font-size: 16px;
    }

    .large {
        font-size: 20px;
    }
</style>
```

数组中的每个元素都可以是**字符串变量**或**对象语法**（混合条件判断）。比如：

```html
<!-- 混合对象语法：条件添加active类 -->
<div :class="[themeClass, { active: isActive }]">...</div>
```

### 2. 组件中的 `v-bind:class`：类名合并

当你在**子组件**上使用 `:class` 时，Vue 会自动将父组件的类名**合并**到子组件的根元素上。比如：

```vue
<!-- 子组件：MyButton.vue -->
<template>
  <!-- 子组件自身的类名：btn -->
  <button class="btn">{{ label }}</button>
</template>

<style>
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
  }
</style>
```

```html
<!-- 父组件使用 -->
<template>
    <!-- 父组件添加的类名：primary -->
    <MyButton :class="{ primary: isPrimary }" label="主要按钮"/>
</template>

<script setup>
    import MyButton from './MyButton.vue'
    import {ref} from 'vue'

    const isPrimary = ref(true)
</script>

<style>
    .primary {
        background-color: #2196f3;
        color: white;
    }
</style>
```

最终子组件的按钮会有 **`btn primary`** 两个类名——父组件的类名不会覆盖子组件的类名，而是**合并**。

## 二、`v-bind:style`——动态内联样式

`v-bind:style` 用于**直接设置元素的内联样式**，语法与 `:class` 类似，但更贴近 CSS 的原生写法。

### 1. 对象语法：直接绑定样式对象

最常用的方式——键是 **CSS 属性名**（驼峰式或短横线式），值是**动态变量**。比如实现一个「可调整字体大小」的文本：

```html

<template>
    <div
            :style="{ 
      color: textColor, 
      fontSize: `${fontSize}px`, 
      'background-color': bgColor 
    }"
    >
        动态内联样式示例
    </div>
    <button @click="increaseFontSize">放大字体</button>
</template>

<script setup>
    import {ref} from 'vue'
    // 响应式变量：控制样式
    const textColor = ref('#333')   // 文字颜色
    const fontSize = ref(16)        // 字体大小（带单位）
    const bgColor = ref('#f0f0f0')  // 背景色（短横线式属性）

    // 点击事件：字体放大2px
    const increaseFontSize = () => {
        fontSize.value += 2
    }
</script>
```

注意事项：

- CSS 属性名可以用**驼峰式**（如 `fontSize` 对应 `font-size`）或**短横线式**（如 `'background-color'`，需要引号包裹）；
- 数值类属性（如 `fontSize`）需要手动加单位（如 `px`），否则会无效。

### 2. 数组语法：组合多个样式对象

当需要**合并多个样式对象**时，用数组语法。比如一个组件需要同时应用「基础样式」和「主题样式」：

```html

<template>
    <div :style="[baseStyle, themeStyle]">组合样式示例</div>
</template>

<script setup>
    import {ref} from 'vue'
    // 基础样式：固定属性
    const baseStyle = ref({
        padding: '16px',
        border: '1px solid #eee',
        border-radius
    :
    '8px'
    })
    // 主题样式：动态属性
    const themeStyle = ref({
        backgroundColor: '#d3eafd',
        color: '#2196f3'
    })
</script>
```

## 三、Vue2 到 Vue3：语法延续与响应式优化

Vue3 的 `:class` 和 `:style` 语法**几乎完全继承 Vue2**，但响应式系统的升级让样式更新更高效。

### 1. 语法延续性：无缝迁移

Vue2 中的代码几乎可以直接复制到 Vue3 中使用，只是**响应式数据的定义方式**变了：

```javascript
// Vue2：data() 中的响应式数据
export default {
    data() {
        return {
            isActive: false,
            fontSize: 16
        }
    }
}

// Vue3：用 ref/reactive 定义响应式数据
import {ref} from 'vue'

const isActive = ref(false)
const fontSize = ref(16)
```

### 2. Vue3 的响应式优化：更聪明的更新

Vue3 用 **Proxy** 代替了 Vue2 的 `Object.defineProperty`，带来两个关键提升：

- **深层响应式**：修改对象的深层属性（如 `obj.user.info.age`）会自动触发更新，无需 `Vue.set`；
- **数组直接修改**：直接修改数组元素（如 `arr[0] = 'new value'`）或长度（如 `arr.length = 0`）会触发更新，无需 `splice`。

比如修改深层样式对象：

```html

<template>
    <div :style="boxStyle">动态深层样式</div>
    <button @click="changeBgColor">切换背景</button>
</template>

<script setup>
    import {reactive} from 'vue'
    // 用 reactive 定义深层响应式对象
    const boxStyle = reactive({
        container: {
            backgroundColor: '#f0f0f0',
            padding: '20px',
            border: '1px solid #eee'
        }
    })

    // 直接修改深层属性，触发更新
    const changeBgColor = () => {
        boxStyle.container.backgroundColor =
                boxStyle.container.backgroundColor === '#f0f0f0'
                        ? '#d3eafd'
                        : '#f0f0f0'
    }
</script>
```

在 Vue2 中，修改 `boxStyle.container.backgroundColor` 不会触发更新（需要 `Vue.set`），但 Vue3 用 Proxy 直接拦截了属性修改，*
*无需额外操作**。

## 四、课后 Quiz：巩固你的理解

### 问题1

如何用 `v-bind:class` 同时添加**静态类名**和**条件类名**？请写出示例代码。

### 问题2

`v-bind:style` 的对象语法中，CSS 属性名可以用哪些形式？请举例说明。

### 答案解析

#### 问题1：混合静态与条件类名

用**数组语法**或**对象语法**都可以。比如：

```html

<template>
    <!-- 数组语法：静态类名 + 条件类名 -->
    <div class="card" :class="[ 'shadow', { active: isActive } ]">
        静态+条件类名
    </div>
</template>

<script setup>
    import {ref} from 'vue'

    const isActive = ref(true)
</script>

<style>
    .card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 16px;
    }

    .shadow {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .active {
        border-color: #2196f3;
    }
</style>
```

#### 问题2：CSS 属性名的两种形式

- **驼峰式**：对应 CSS 的短横线命名（如 `fontSize` → `font-size`，`backgroundColor` → `background-color`）；
- **短横线式**：需要用引号包裹（如 `'font-size'`，`'background-color'`）。

示例：

```html

<div :style="{ 
  fontSize: '16px',        // 驼峰式
  'background-color': '#f0f0f0' // 短横线式（需引号）
}">...
</div>
```

## 五、常见报错解决方案

### 1. 报错：`[Vue warn]: Property "isActive" was accessed during render but is not defined on instance.`

- **原因**：绑定的变量（如 `isActive`）未在组件中声明，Vue 找不到该变量；
- **解决**：用 `ref` 或 `reactive` 声明响应式变量：
  ```javascript
  import { ref } from 'vue'
  const isActive = ref(false) // 必须声明！
  ```

### 2. 问题：修改变量后样式不更新

- **原因**：变量不是**响应式**的（用 `let` 声明的普通变量，不是 `ref`/`reactive`）；
- **解决**：用 Vue3 的响应式 API 包裹变量：
  ```javascript
  // 错误：let fontSize = 16;
  // 正确：
  const fontSize = ref(16)
  ```

### 3. 报错：`[Vue warn]: Invalid value for dynamic directive argument (expected string or null): undefined`

- **原因**：绑定的类名/样式属性名是 `undefined`（如 `{ [className]: isActive }` 中 `className` 未定义）；
- **解决**：给变量设置初始值，或用**可选链**处理：
  ```javascript
  const className = ref('active') // 初始值
  // 或用可选链
  :class="{ [className || '']: isActive }"
  ```

## 参考链接

- Vue3 官方文档：Class and Style Binding https://vuejs.org/guide/essentials/class-and-style.html
- Vue3 官方文档：响应式基础 https://vuejs.org/guide/essentials/reactivity-fundamentals.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3中v-bind:class与v-bind:style如何实现条件样式、组件样式合并与深层响应式管理？](https://blog.cmdragon.cn/posts/38b84e85cfb8988407145f189457af6e/)



<details>
<summary>往期文章归档</summary>

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
- [如何用Git Hook和CI流水线为FastAPI项目保驾护航？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/fc4ef84559e04693a620d0714cb30787/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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