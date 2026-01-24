---
url: /posts/69206ab91972c7972002993cb26f8c19/
title: Vue3中如何从臃肿的模板条件逻辑升级为可维护的优雅渲染方案？
date: 2025-12-27T18:09:23+08:00
lastmod: 2025-12-27T18:09:23+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_8663e6c0-a5e5-44cc-a229-686bcfe08d2f.png

summary:
  Vue3复杂条件渲染处理，基础指令含v - if（销毁重建）、v - show（CSS隐藏）及v - if包裹多元素。复杂条件推荐计算属性封装逻辑、工具函数复用、组件拆分或动态组件。常见问题：v - else需紧跟v - if/else - if，v - show不用于template，频繁切换用v - show。

categories:
  - vue

tags:
  - 基础入门
  - 条件渲染
  - v-if
  - v-show
  - 复杂条件
  - 计算属性
  - 组件化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_8663e6c0-a5e5-44cc-a229-686bcfe08d2f.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 复杂条件逻辑的处理：Vue3条件渲染进阶指南

在日常Vue开发中，我们经常遇到这样的场景：根据用户权限显示不同的功能按钮，根据订单状态展示不同的操作界面，或者根据多个条件的组合决定是否显示某块内容。这些场景里的条件逻辑往往不只是简单的
`true/false`判断，而是多个因素的叠加——这时候，如何优雅地处理复杂条件渲染，让代码既清晰又可维护？今天我们就来聊聊Vue3中复杂条件逻辑的处理方法。

## 一、先理清楚：条件渲染的基础工具

在讲复杂逻辑前，我们得先回顾Vue3中条件渲染的**基础指令**——这些是处理复杂逻辑的“积木”，用对了才能为后续进阶铺路。

### 1.1 `v-if`：最基础的条件判断

`v-if`是Vue中最常用的条件渲染指令，它会根据表达式的**真值**决定是否渲染元素。比如：

```vue

<template>
  <h1 v-if="isVueAwesome">Vue 太香了！</h1>
</template>

<script setup>
  import {ref} from 'vue'

  const isVueAwesome = ref(true) // 真值，所以h1会渲染
</script>
```

如果需要“否则”的情况，可以用`v-else`：

```vue

<template>
  <button @click="toggle">切换态度</button>
  <h1 v-if="isVueAwesome">Vue 太香了！</h1>
  <h1 v-else>嗯...再想想？</h1>
</template>

<script setup>
  const isVueAwesome = ref(true)
  const toggle = () => {
    isVueAwesome.value = !isVueAwesome.value
  }
</script>
```

如果有多个条件分支，可以用`v-else-if`链式判断：

```vue

<template>
  <div v-if="type === 'A'">我是类型A</div>
  <div v-else-if="type === 'B'">我是类型B</div>
  <div v-else>我是其他类型</div>
</template>
```

### 1.2 `v-if` vs `v-show`：选对工具做对事

很多同学会混淆`v-if`和`v-show`，但它们的**核心差异**直接决定了适用场景：

- **`v-if`**：“真·条件渲染”——条件不满足时，元素会被**完全从DOM中移除**（组件会被销毁，事件监听会被移除）；
- **`v-show`**：“假·条件渲染”——元素始终存在于DOM中，只是通过**CSS的`display: none`**隐藏。

举个例子：

- 如果你有一个**频繁切换**的弹窗（比如用户点击按钮展示/隐藏），用`v-show`更高效——因为它只切换CSS，不用反复销毁重建组件；
- 如果你有一个**只有管理员能看到**的设置面板，用`v-if`更合适——大部分用户不会用到，初始化时不渲染能节省性能。

### 1.3 `v-if` on `<template>`：包裹多个元素

有时候我们需要切换**多个元素**（比如一块包含标题、段落和按钮的内容），但`v-if`只能绑定在**单个元素**上——这时候可以用
`<template>`作为“隐形包裹器”：

```vue

<template v-if="isAuthorized">
  <h2>管理员控制台</h2>
  <p>这里是只有授权用户才能看的内容</p>
  <button>删除数据</button>
</template>
```

最终渲染的结果不会包含`<template>`标签，只会渲染里面的内容。

## 二、复杂条件逻辑：从“臃肿模板”到“优雅代码”

当条件逻辑变得复杂（比如需要同时满足“是管理员+有编辑权限+账号未被封禁”），直接把所有条件写在模板里会让代码变得**臃肿难读**
——比如：

```vue
<!-- 反例：模板里堆了一堆条件 -->
<button v-if="isAdmin && hasEditPermission && !isBlocked">删除</button>
```

这时候，我们需要把逻辑“移出去”，让模板回归简洁。以下是四种常用的处理方法：

### 2.1 用计算属性封装逻辑

**计算属性**是处理复杂条件的“神器”——它能把多个条件的组合封装成一个可读性高的变量，模板里只需要引用这个变量即可。

比如上面的“删除按钮”例子，我们可以用计算属性重构：

```vue

<template>
  <!-- 模板里只需要用计算属性的结果 -->
  <button v-if="canDelete">删除</button>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const isAdmin = ref(true)          // 是否是管理员
  const hasEditPermission = ref(true)// 是否有编辑权限
  const isBlocked = ref(false)       // 账号是否被封禁

  // 计算属性：组合所有条件
  const canDelete = computed(() => {
    return isAdmin.value && hasEditPermission.value && !isBlocked.value
  })
</script>
```

这样做的好处：

- **模板更简洁**：不用写一堆逻辑表达式；
- **逻辑可维护**：如果以后条件变了（比如要加“内容未被锁定”），只需要修改计算属性，不用动模板；
- **性能优化**：计算属性会缓存结果，只有依赖的响应式数据变化时才会重新计算。

### 2.2 用方法/工具函数复用逻辑

如果条件逻辑更复杂（比如需要处理多个状态的组合），或者逻辑需要**跨组件复用**，可以把它抽到**方法**或**工具函数**里。

比如判断“用户是否能编辑文章”的逻辑：

```vue

<template>
  <button v-if="canEditArticle(article)">编辑文章</button>
</template>

<script setup>
  import {ref} from 'vue'
  import {checkEditPermission} from '@/utils/permission' // 导入工具函数

  const user = ref({id: 1, isAdmin: false})
  const article = ref({authorId: 1, isPublished: false})

  // 方法：调用工具函数判断权限
  const canEditArticle = (article) => {
    return checkEditPermission(user.value, article)
  }
</script>
```

工具函数`permission.js`的内容：

```javascript
// utils/permission.js
export const checkEditPermission = (user, article) => {
    // 条件1：是管理员，或者是文章作者
    // 条件2：文章未被发布
    return (user.isAdmin || user.id === article.authorId) && !article.isPublished
}
```

这样做的好处是**逻辑复用**——如果其他组件也需要判断“能否编辑文章”，直接导入工具函数就行，不用重复写代码。

### 2.3 组件化拆分：让每个组件只做一件事

当不同条件对应的**内容块很大**时（比如订单的“未支付”“已支付”“已退款”状态），把它们拆成**子组件**
是更好的选择。父组件只负责“条件判断”，子组件负责“内容渲染”。

比如订单状态的例子：

```vue
<!-- 父组件：OrderStatus.vue -->
<template>
  <div class="order-status">
    <UnpaidComponent v-if="status === 'unpaid'"/>
    <PaidComponent v-else-if="status === 'paid'"/>
    <RefundedComponent v-else-if="status === 'refunded'"/>
  </div>
</template>

<script setup>
  import {ref} from 'vue'
  import UnpaidComponent from './UnpaidComponent.vue'   // 未支付组件
  import PaidComponent from './PaidComponent.vue'       // 已支付组件
  import RefundedComponent from './RefundedComponent.vue' // 已退款组件

  const status = ref('unpaid') // 订单状态
</script>
```

每个子组件负责自己的逻辑：

- `UnpaidComponent`：显示“去支付”按钮和倒计时；
- `PaidComponent`：显示支付时间、金额和“查看详情”按钮；
- `RefundedComponent`：显示退款原因和到账时间。

这样拆分后，每个组件的**职责单一**，代码更易维护——比如要修改“未支付”的界面，只需要改`UnpaidComponent`，不会影响其他状态的代码。

### 2.4 动态组件：应对多状态切换

如果条件对应的组件更多（比如 tabs 切换），可以用**动态组件**`<component :is="currentComponent" />`——它能根据`is`
属性的值动态渲染不同的组件。

比如 tabs 组件的例子：

```vue

<template>
  <div class="tabs">
    <button @click="activeTab = 'Home'">首页</button>
    <button @click="activeTab = 'Articles'">文章</button>
    <button @click="activeTab = 'Settings'">设置</button>

    <!-- 动态组件：根据activeTab渲染对应的组件 -->
    <component :is="currentComponent"/>
  </div>
</template>

<script setup>
  import {ref, computed} from 'vue'
  import Home from './Home.vue'         // 首页组件
  import Articles from './Articles.vue' // 文章组件
  import Settings from './Settings.vue' // 设置组件

  const activeTab = ref('Home')

  // 计算属性：根据activeTab返回对应的组件
  const currentComponent = computed(() => {
    switch (activeTab.value) {
      case 'Home':
        return Home
      case 'Articles':
        return Articles
      case 'Settings':
        return Settings
      default:
        return Home
    }
  })
</script>
```

这种方式适合**需要频繁切换组件**的场景，比写一堆`v-if/v-else-if`更简洁。

## 三、课后小测：巩固一下

**问题**：如果需要根据多个条件的组合判断是否显示某块内容，且这个逻辑需要在模板中**多次使用**，你会选择哪种方式？为什么？

**答案解析**：  
选**计算属性**。原因有三：

1. **性能优化**：计算属性会缓存结果，多次使用不会重复计算；
2. **逻辑集中**：所有条件逻辑都在`script`部分，模板更简洁；
3. **可维护性**：如果条件变了，只需要修改计算属性，不用改模板里的多个地方。

## 四、常见问题&解决方法

在处理条件渲染时，你可能会遇到以下问题，这里给出具体的解决思路：

### 4.1 报错：`v-else`必须紧跟`v-if`或`v-else-if`

**原因**：`v-else`没有直接跟在`v-if`或`v-else-if`后面（中间插入了其他元素）。  
**解决**：把`v-else`直接放在`v-if`的下一个元素，或用`<template>`包裹中间内容。  
**错误示例**：

```vue

<div v-if="ok">通过</div>
<p>温馨提示</p> <!-- 中间插入了p标签 -->
<div v-else>不通过</div> <!-- 报错！ -->
```

**正确示例**：

```vue

<template v-if="ok">
  <div>通过</div>
  <p>温馨提示</p>
</template>
<div v-else>不通过</div>
```

### 4.2 `v-show`用在`<template>`上没效果

**原因**：`v-show`是通过修改元素的`display`属性控制显示的，而`<template>`不会渲染到DOM中，无法操作它的样式。  
**解决**：用`div`代替`<template>`，或改用`v-if`在`<template>`上。

### 4.3 频繁切换的元素用`v-if`导致卡顿

**原因**：`v-if`每次切换都会销毁/重建组件，性能开销大。  
**解决**：换成`v-show`——它只切换CSS`display`属性，切换成本低。

## 参考链接

参考链接：https://vuejs.org/guide/essentials/conditional.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3中如何从臃肿的模板条件逻辑升级为可维护的优雅渲染方案？](https://blog.cmdragon.cn/posts/69206ab91972c7972002993cb26f8c19/)



<details>
<summary>往期文章归档</summary>

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