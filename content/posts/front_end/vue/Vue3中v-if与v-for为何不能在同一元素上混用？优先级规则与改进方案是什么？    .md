---
url: /posts/168572ffa0e618843d6610b0a1f11403/
title: Vue3中v-if与v-for为何不能在同一元素上混用？优先级规则与改进方案是什么？
date: 2025-12-26T07:53:10+08:00
lastmod: 2025-12-26T07:53:10+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_d1e25a8f-59f9-47a5-ab99-4ffe80a11cf4.png

summary:
  Vue3中v-if与v-for结合时，v-if优先级高于v-for，同元素混用会导致每个项都执行条件判断，引发性能与逻辑问题。改进方案：用computed过滤数据后循环（适用于条件依赖循环项），或把v-if移至父元素（适用于条件不依赖循环项）。

categories:
  - vue

tags:
  - 基础入门
  - v-if
  - v-for
  - v-if与v-for结合
  - v-if v-for优先级
  - computed
  - 最佳实践

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_d1e25a8f-59f9-47a5-ab99-4ffe80a11cf4.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/


## v-if 与 v-for 的基础认知
在Vue3的日常开发中，**v-if**和**v-for**是最常用的两个指令：前者是“条件渲染的开关”，决定元素是否出现在DOM中；后者是“列表渲染的工具”，负责循环生成重复的元素。

### v-if：控制渲染的“开关”
`v-if`通过表达式的真假来切换元素的渲染状态。比如：
```vue
<template>
  <!-- 当 showTitle 为 true 时显示标题 -->
  <h1 v-if="showTitle">Vue3 条件渲染指南</h1>
</template>

<script setup>
import { ref } from 'vue'
const showTitle = ref(true) // 控制标题显示
</script>
```
当`showTitle`为`false`时，`<h1>`不会被渲染到DOM中——这是“真正的条件渲染”，会销毁/重建元素及内部的事件监听、子组件。

### v-for：循环列表的“打印机”
`v-for`用于遍历数组或对象，生成重复的元素。比如循环渲染待办列表：
```vue
<template>
  <ul>
    <!-- 循环 todos 数组，每个项生成一个 <li> -->
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'
const todos = ref([
  { id: 1, text: '写博客' },
  { id: 2, text: '改bug' }
])
</script>
```
这里要注意**必须加`key`属性**——Vue通过`key`识别列表项的唯一性，避免重新渲染时的性能问题。


## v-if 与 v-for 结合的隐式优先级陷阱
当我们需要“只显示列表中满足条件的项”时，很容易想到把`v-if`和`v-for`写在同一个元素上。但Vue3的**优先级规则**会在这里设下“陷阱”。

### 优先级规则：Vue3 中 v-if 先于 v-for
Vue官方明确说明：**在Vue3中，`v-if`的优先级高于`v-for`**。当两者写在同一个元素上时，`v-if`会先被评估，再执行`v-for`。

举个例子，假设我们要显示“已完成的待办项”：
```vue
<template>
  <ul>
    <!-- 错误写法：同元素混用 v-if 和 v-for -->
    <li v-for="todo in todos" v-if="todo.done">
      {{ todo.text }}
    </li>
  </ul>
</template>
```
在Vue3中，这段代码的执行逻辑是：**先判断每个`todo`的`done`属性是否为`true`，再渲染这个`li`**。虽然功能能实现，但藏着两个问题：

1. **性能问题**：每个待办项都要执行一次`v-if`判断，当列表很大时，渲染速度会变慢；
2. **逻辑混乱**：模板混合了“数据过滤”和“列表渲染”的逻辑，可读性差，容易埋bug。

### 为什么优先级会导致问题？
再举个极端例子：如果`v-if`的条件不依赖循环项，比如`v-if="showTodos"`：
```vue
<template>
  <ul>
    <li v-for="todo in todos" v-if="showTodos">
      {{ todo.text }}
    </li>
  </ul>
</template>
```
这时Vue3会先判断`showTodos`是否为`true`，再执行`v-for`循环。逻辑上没问题，但**模板不够清晰**——读者会疑惑“`v-if`到底控制的是整个列表还是单个项？”。


## 不推荐同元素使用的原因与改进方案
既然同元素使用有问题，那我们该怎么正确结合`v-if`和`v-for`？核心原则是：**先过滤数据，再循环渲染**。

### 不推荐同元素使用的核心原因
1. **性能开销大**：每个循环项都要执行条件判断，数据量大时渲染慢；
2. **逻辑可读性差**：模板中混杂了业务逻辑（过滤）和渲染逻辑（循环），后期难维护；
3. **优先级隐式性**：新手容易忽略优先级规则，导致逻辑错误。

### 改进方案1：用 computed 过滤数据（推荐）
`computed`是Vue3中处理响应式数据的“神器”——它会缓存计算结果，只有当依赖的响应式数据变化时才重新计算。

用`computed`改进之前的“已完成待办”示例：
```vue
<template>
  <ul>
    <!-- 推荐：循环过滤后的数组 -->
    <li v-for="todo in doneTodos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>

<script setup>
import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, text: '写博客', done: true },
  { id: 2, text: '改bug', done: false },
  { id: 3, text: '测功能', done: true }
])

// 用 computed 过滤“已完成”的待办项
const doneTodos = computed(() => {
  return todos.value.filter(todo => todo.done)
})
</script>
```
这样做的好处：
- **性能优化**：`computed`缓存过滤结果，避免重复计算；
- **逻辑清晰**：模板只负责渲染，过滤逻辑放在JS中，符合“关注点分离”原则；
- **可复用性**：`doneTodos`可以在模板中多次使用，不用重复写过滤逻辑。

### 改进方案2：将 v-if 移至父元素（适用于全局条件）
如果`v-if`的条件**不依赖循环项**（比如控制整个列表是否显示），可以把`v-if`放在`v-for`的父元素上：
```vue
<template>
  <!-- 先判断是否显示整个列表 -->
  <div v-if="showTodos">
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const showTodos = ref(true) // 控制整个列表的显示
</script>
```
这种写法的逻辑更直观：`v-if`控制父元素的显示，`v-for`负责循环子元素，完全避免了优先级问题。


## 实战示例：从错误到最佳实践
我们用一个“电商商品列表”的场景，完整演示从错误到正确的写法。

### 错误用法：同元素混用导致性能问题
需求：显示“有库存的商品”：
```vue
<template>
  <div class="products">
    <!-- 错误：同元素用 v-if 和 v-for -->
    <div v-for="product in products" v-if="product.inStock" :key="product.id">
      {{ product.name }} - {{ product.price }}元
    </div>
  </div>
</template>

<script setup>
const products = ref([
  { id: 1, name: '手机', price: 5000, inStock: true },
  { id: 2, name: '电脑', price: 8000, inStock: false },
  { id: 3, name: '平板', price: 3000, inStock: true }
])
</script>
```
问题：每个商品都要判断`inStock`，当商品数量很大时，渲染速度会变慢。

### 最佳实践：用 computed 过滤后循环
改进后的代码：
```vue
<template>
  <div class="products">
    <!-- 正确：循环过滤后的商品 -->
    <div v-for="product in inStockProducts" :key="product.id">
      {{ product.name }} - {{ product.price }}元
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const products = ref([/* 同上 */])

// 计算有库存的商品
const inStockProducts = computed(() => {
  return products.value.filter(p => p.inStock)
})
</script>
```
这样`v-for`只循环过滤后的`inStockProducts`，不需要每个商品判断，性能提升明显。


## 课后 Quiz：巩固你的理解
问题：在Vue3中，为什么不推荐在同一个元素上同时使用v-if和v-for？请说明优先级规则及两种改进方案。

**答案解析**：
1. **优先级规则**：Vue3中`v-if`的优先级高于`v-for`，同元素使用时`v-if`先被评估；
2. **不推荐原因**：
   - 若`v-if`条件依赖循环项，每个项都要判断，性能差；
   - 模板逻辑混合过滤与循环，可读性低；
3. **改进方案**：
   - 方案1：用`computed`过滤数据，再用`v-for`循环过滤后的结果（适用于条件依赖循环项的场景）；
   - 方案2：将`v-if`移至`v-for`的父元素上（适用于条件不依赖循环项的场景）。


## 常见报错与解决小贴士
### 报错1：v-if与v-for同元素时逻辑不符合预期
- **症状**：循环的列表项显示不全，或条件判断失效；
- **原因**：Vue3中`v-if`优先级更高，同元素使用时`v-if`先评估，若条件依赖循环项，会导致每个项都要判断，逻辑混乱；
- **解决**：用`computed`过滤数据后再循环。

### 报错2：循环列表渲染缓慢
- **症状**：列表数据量大时，渲染时间长；
- **原因**：同元素使用`v-if`和`v-for`，每个项都要执行条件判断，性能开销大；
- **解决**：通过`computed`或方法过滤数据，减少循环的项数。

### 预防建议
- 永远优先用`computed`处理数据过滤，再循环；
- 若条件不依赖循环项，将`v-if`放在父元素上；
- 避免在模板中写复杂条件，尽量把逻辑移到JS部分（`computed`/`methods`）。


参考链接：  
https://vuejs.org/guide/essentials/conditional.html#v-if-with-v-for  
https://vuejs.org/guide/essentials/list.html#v-for-with-v-if

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue3中v-if与v-for为何不能在同一元素上混用？优先级规则与改进方案是什么？](https://blog.cmdragon.cn/posts/168572ffa0e618843d6610b0a1f11403/)



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