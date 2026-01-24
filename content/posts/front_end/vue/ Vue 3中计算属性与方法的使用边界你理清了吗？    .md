---
url: /posts/a44ac8daed86ce6d69fee6fe54bc14f6/
title: Vue 3中计算属性与方法的使用边界你理清了吗？
date: 2025-11-18T08:14:30+08:00
lastmod: 2025-11-18T08:14:30+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/8976c17d2859400ab16220f738da7226~tplv-5jbd59dj06-image.png

summary:
  Vue 3中的计算属性和方法在处理逻辑时有显著差异。计算属性基于响应式依赖进行缓存，仅在依赖变化时重新计算，适合处理依赖响应式数据的衍生值，如过滤列表或格式化日期。方法则每次调用都会重新执行，适用于事件处理或异步操作。计算属性在依赖稳定时性能更优，避免重复计算；而方法在频繁调用时可能导致性能问题。选择时应根据是否需要缓存结果来决定使用计算属性还是方法。

categories:
  - vue

tags:
  - 基础入门
  - 计算属性
  - 方法
  - 缓存机制
  - 响应式数据
  - 性能优化
  - 事件处理

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/8976c17d2859400ab16220f738da7226~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、计算属性与方法的基本概念

在Vue 3中，**计算属性（Computed）**和**方法（Methods）**都是处理逻辑的常用方式，但它们的设计初衷和工作机制完全不同。我们先从最基础的定义讲起：

#### 1. 计算属性（Computed）

计算属性是**基于响应式依赖的缓存值**——它会根据你指定的“依赖项”（比如`ref`或`reactive`包裹的响应式数据）自动计算结果，并且*
*只在依赖项变化时重新计算**。  
官方文档中对计算属性的核心描述是：*“Computed properties are cached based on their reactive dependencies.”*
（计算属性基于响应式依赖进行缓存）。

#### 2. 方法（Methods）

方法是**可重复执行的函数**——每次调用方法（比如通过事件绑定、模板渲染或手动调用），函数都会**重新执行一遍逻辑**
，没有任何缓存。  
用官方的话说：*“Methods are functions that can be called from templates or other methods. They don’t have caching.”*
（方法是可从模板或其他方法中调用的函数，没有缓存）。

### 二、计算属性与方法的核心区别

要真正掌握两者的使用场景，必须先搞懂它们的**4个核心差异**：

| **维度**   | **计算属性（Computed）** | **方法（Methods）**      |
|----------|--------------------|----------------------|
| **缓存机制** | 依赖不变则复用上次结果        | 每次调用都重新执行函数          |
| **调用方式** | 像“属性”一样直接用（无括号）    | 像“函数”一样调用（必须加括号）     |
| **依赖追踪** | 自动追踪响应式依赖，依赖变化才更新  | 不追踪依赖，调用时执行所有逻辑      |
| **性能影响** | 依赖稳定时性能更优（避免重复计算）  | 频繁调用可能导致性能问题（重复执行逻辑） |

### 三、用示例看差异：缓存 vs 每次执行

我们用一个**实时过滤待办列表**的场景，对比两者的表现：

#### 1. 计算属性实现（带缓存）

```vue

<template>
  <div>
    <input v-model="searchText" placeholder="搜索待办"/>
    <ul>
      <!-- 像属性一样用，无括号 -->
      <li v-for="todo in filteredTodos" :key="todo.id">{{ todo.text }}</li>
    </ul>
  </div>
</template>

<script setup>
  import {ref, computed} from 'vue'

  // 响应式待办列表
  const todos = ref([
    {id: 1, text: '学Vue 3'},
    {id: 2, text: '写博客'},
    {id: 3, text: '做项目'}
  ])
  // 响应式搜索关键词
  const searchText = ref('')

  // 计算属性：过滤待办列表
  const filteredTodos = computed(() => {
    console.log('计算属性执行了！') // 仅依赖变化时打印
    return todos.value.filter(todo =>
        todo.text.toLowerCase().includes(searchText.value.toLowerCase())
    )
  })
</script>
```

**执行结果**：

- 首次渲染时，`filteredTodos`计算一次（打印日志）；
- 当你修改`searchText`或` todos`时，才会重新计算（再次打印）；
- 若反复点击同一搜索词（依赖不变），计算属性不会重复执行。

#### 2. 方法实现（无缓存）

我们把上面的计算属性改成方法：

```vue

<template>
  <div>
    <input v-model="searchText" placeholder="搜索待办"/>
    <ul>
      <!-- 像函数一样调用（必须加括号） -->
      <li v-for="todo in getFilteredTodos()" :key="todo.id">{{ todo.text }}</li>
    </ul>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  const todos = ref([/* 同前 */])
  const searchText = ref('')

  // 方法：过滤待办列表
  function getFilteredTodos() {
    console.log('方法执行了！') // 每次调用都打印
    return todos.value.filter(todo =>
        todo.text.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
</script>
```

**执行结果**：

- 首次渲染时，`getFilteredTodos()`执行一次（打印日志）；
- 当你**点击页面任何元素**（比如输入框聚焦），Vue会重新渲染模板，导致方法**再次执行**；
- 即使`searchText`和` todos`都没变，方法也会反复执行。

### 四、适用场景：该用计算属性还是方法？

记住一个核心原则：
> **需要缓存结果 → 用计算属性；需要每次执行 → 用方法**

具体场景对比：

#### 1. 计算属性的最佳场景

- **依赖响应式数据的“衍生值”**：比如过滤列表、格式化日期（`{{ formattedDate }}`）、计算总价（`totalPrice = quantity * price`）；
- **多次复用结果**：比如同一个过滤后的列表在模板中用了3次，计算属性只会算1次；
- **需要“属性”般的使用体验**：比如像`user.fullName`（结合`firstName`和`lastName`）这样的组合字段。

#### 2. 方法的最佳场景

- **事件处理**：比如`@click="handleClick"`，每次点击都要执行逻辑；
- **异步操作**：比如调用接口获取数据（`async fetchData()`），计算属性不支持异步；
- **不依赖缓存的动态计算**：比如生成随机数（`getRandomNumber()`）、实时获取当前时间（`getCurrentTime()`）——这些场景需要每次调用都返回新值。

### 五、课后Quiz：巩固你的理解

**问题**：  
你正在做一个电商页面，需要根据用户选择的“分类”和“价格区间”实时过滤商品列表，并且要在**商品列表**和**筛选结果计数**
两个地方用到过滤后的列表。此时应该用计算属性还是方法？为什么？

**答案解析**：  
应该用**计算属性**。  
原因：

1. 过滤结果依赖“分类”和“价格区间”这两个响应式数据，计算属性会自动追踪它们的变化；
2. 同一个过滤后的列表要在两个地方复用，计算属性的缓存能避免重复计算（只算1次）；
3. 若用方法，每次渲染这两个地方都会执行2次过滤逻辑，性能更差。

### 六、常见报错与解决

在使用计算属性和方法时，新手常踩这些坑：

#### 1. 计算属性不更新？——依赖了非响应式数据

**报错场景**：

```javascript
// 错误：count是非响应式的！
let count = 0
const double = computed(() => count * 2)

count = 2 // double不会更新为4
```

**原因**：Vue无法追踪非响应式数据（比如`let`定义的变量）的变化。  
**解决**：把数据改成响应式（用`ref`或`reactive`）：

```javascript
const count = ref(0)
const double = computed(() => count.value * 2)

count.value = 2 // double会更新为4
```

#### 2. 计算属性里用了异步，结果不更新？

**报错场景**：

```javascript
// 错误：计算属性不能是异步的！
const asyncData = computed(async () => {
    const res = await fetch('/api/data')
    return res.data
})
```

**原因**：计算属性设计为**同步执行**，无法等待异步结果。  
**解决**：用`watch`监听依赖，或用方法处理异步：

```javascript
const asyncData = ref(null)
// 用watch监听依赖，执行异步操作
watch(() => dependency, async () => {
    asyncData.value = await fetch('/api/data')
})
```

#### 3. 方法调用时没加括号？——模板中不生效

**报错场景**：

```vue
<!-- 错误：方法调用必须加括号！ -->
<button @click="handleClick()">点我</button> <!-- 正确 -->
<button @click="handleClick">点我</button> <!-- 错误（会传递事件对象） -->
```

**原因**：在模板中，`@click="handleClick"`会把`event`对象传给方法，而`handleClick()`才是正常调用。  
**解决**：事件绑定的方法若不需要`event`，必须加括号；若需要`event`，可以不加（Vue会自动传递）。

### 参考链接

- 计算属性官方文档：https://vuejs.org/guide/essentials/computed.html
- 方法官方文档：https://vuejs.org/guide/essentials/event-handling.html#methods

以上内容完全基于Vue 3官方文档的核心内容，结合实际场景帮你理清计算属性与方法的边界。下次写代码时，先想“我需要缓存吗？”——答案会帮你快速选对工具！

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3中计算属性与方法的使用边界你理清了吗？](https://blog.cmdragon.cn/posts/a44ac8daed86ce6d69fee6fe54bc14f6/)



<details>
<summary>往期文章归档</summary>

- [Vue3计算属性如何兼顾模板简化、性能优化与响应式自动更新？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/8bb768094210808e57a6549f08fd7d7a/)
- [Vue3计算属性的缓存机制与Options/Composition API用法你都了解吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/7d2a07177c928caf0b321b44d00e8b08/)
- [Vue 3计算属性的缓存与依赖追踪原理是什么？可写性与历史值功能该如何正确使用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a222db116daaa6c34801f06a9ef13428/)
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