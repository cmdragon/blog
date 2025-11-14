---
url: /posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/
title: Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？
date: 2025-11-14T01:59:18+08:00
lastmod: 2025-11-14T01:59:18+08:00
author: cmdragon
cover: /images/f33ee20a8a074464a43a598f7e4e03fe~tplv-5jbd59dj06-image.png

summary:
  Vue 的响应式系统默认是深层响应式的，但深层代理可能带来性能开销。浅响应式（Shallow Reactivity）通过 `shallowReactive` 和 `shallowRef` 仅跟踪顶层属性的变化，避免递归代理嵌套对象。`shallowReactive` 只响应顶层属性的修改，而 `shallowRef` 仅跟踪 `.value` 的替换操作。浅响应式适用于处理大型对象或外部管理的状态，以减少响应式开销。通过浅响应式，Vue 可以更高效地管理状态，避免不必要的性能损耗。

categories:
  - vue

tags:
  - 基础入门
  - 浅响应式
  - 性能优化
  - 状态管理
  - shallowReactive
  - shallowRef
  - 外部库集成

---

<img src="/images/f33ee20a8a074464a43a598f7e4e03fe~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 浅响应式的概念：与深层响应式的区别

Vue 的响应式系统默认是**深层响应式**的——当你用 `reactive` 或 `ref` 包裹对象时，Vue 会递归地将所有嵌套属性转换为响应式代理。比如：

```javascript
import {ref} from 'vue'

const obj = ref({a: {b: 1}})
obj.value.a.b = 2 // 触发更新（深层响应式）
```

这种行为很方便，但也会带来性能开销：如果对象非常大（比如包含 thousands 条数据的列表），或者内部状态由外部库管理（比如 axios
响应、第三方状态库），深层代理会浪费资源。

**浅响应式**（Shallow Reactivity）就是为了解决这个问题：它只跟踪**顶层属性**的变化，不处理嵌套对象的响应式。Vue 提供了两个
API 实现浅响应式：`shallowReactive`（对应 `reactive`）和 `shallowRef`（对应 `ref`）。

## shallowReactive：只跟踪顶层属性的响应式对象

`shallowReactive` 是 `reactive` 的**浅版本**，它仅将对象的**顶层属性**转换为响应式，嵌套对象不会被代理。也就是说：

- 修改顶层属性（如 `state.a`）会触发更新；
- 修改嵌套属性（如 `state.b.c`）不会触发更新；
- 替换嵌套对象的引用（如 `state.b = { new: 'data' }`）会触发更新（因为 `b` 是顶层属性）。

### 示例代码

```javascript
import {shallowReactive} from 'vue'

// 创建浅响应式对象
const state = shallowReactive({
    a: 1,          // 顶层属性（响应式）
    b: {c: 2}    // 嵌套对象（非响应式）
})

// 1. 响应式变化：修改顶层属性
state.a = 2 // ✅ 触发组件更新

// 2. 非响应式变化：修改嵌套属性
state.b.c = 3 // ❌ 不会触发更新

// 3. 响应式变化：替换嵌套对象引用
state.b = {c: 3} // ✅ 触发更新（因为 b 是顶层属性）
```

## shallowRef：只跟踪.value变化的浅引用

`shallowRef` 是 `ref` 的**浅版本**，它仅跟踪 `ref.value` 的**替换操作**，不处理 `value` 内部的深层响应式。也就是说：

- 替换 `ref.value`（如 `obj.value = { new: 'data' }`）会触发更新；
- 修改 `ref.value` 的内部属性（如 `obj.value.a = 2`）不会触发更新。

### 示例代码

```javascript
import {shallowRef} from 'vue'

// 创建浅引用
const obj = shallowRef({a: 1})

// 1. 响应式变化：替换.value
obj.value = {a: 2} // ✅ 触发更新

// 2. 非响应式变化：修改.value内部属性
obj.value.a = 3 // ❌ 不会触发更新
```

注意：`shallowRef` 的 `.value` 本身是**非响应式**的——即使你用 `reactive` 包裹 `value`，`shallowRef` 也不会跟踪其内部变化。

## 浅响应式的应用场景：性能优化与外部状态管理

浅响应式不是“替代”深层响应式，而是**补充**——当你需要**减少响应式开销**或**不希望Vue跟踪内部状态**时使用：

### 场景1：处理大型对象

如果你的对象包含大量数据（比如表格的 thousands 条记录），但只需要跟踪顶层状态（如 `isLoading`、`currentPage`），用
`shallowReactive` 可以避免递归代理所有嵌套属性：

```javascript
const tableState = shallowReactive({
    isLoading: true,
    currentPage: 1,
    data: [] // 大数组，内部变化无需Vue跟踪
})
```

### 场景2：外部管理的状态

如果对象的内部状态由**外部库**管理（比如 axios 的响应对象、Redux 的 store、第三方组件的状态），Vue 不需要跟踪其内部变化，用浅响应式更合适：

```javascript
import {shallowRef} from 'vue'
import axios from 'axios'

// 用shallowRef包裹axios响应，只跟踪.value的替换
const response = shallowRef(null)

const fetchData = async () => {
    const res = await axios.get('/api/data')
    response.value = res.data // ✅ 触发更新（替换.value）
}
```

## 实践示例：用shallowReactive管理外部API状态

假设你有一个用户详情页，需要：

- 跟踪 `isLoading`（加载状态，顶层属性）；
- 展示用户数据（由API返回，内部变化无需Vue跟踪）。

### 完整组件代码

```vue

<script setup>
  import {shallowReactive} from 'vue'

  // 浅响应式状态：只跟踪顶层属性
  const userState = shallowReactive({
    isLoading: true,
    userData: null // 由API填充，内部变化不触发Vue更新
  })

  // 模拟API请求
  const fetchUser = async () => {
    userState.isLoading = true
    // 假设userData由外部API返回，内部状态无需Vue跟踪
    const res = await fetch('/api/user/1')
    const data = await res.json()
    userState.userData = data // ✅ 触发更新（替换顶层属性userData）
    userState.isLoading = false // ✅ 触发更新（修改顶层属性isLoading）
  }

  // 初始化加载
  fetchUser()
</script>

<template>
  <div class="user-page">
    <!-- 加载状态（响应式） -->
    <div v-if="userState.isLoading" class="loading">加载中...</div>

    <!-- 用户数据（非响应式内部变化） -->
    <div v-else class="user-details">
      <h2>{{ userState.userData.name }}</h2>
      <p>年龄：{{ userState.userData.age }}</p>
      <p>邮箱：{{ userState.userData.email }}</p>
    </div>
  </div>
</template>
```

### 效果说明

- 当 `isLoading` 或 `userData` 变化时（都是顶层属性），组件会更新；
- 如果 `userData` 内部的 `name` 变化（比如 `userState.userData.name = 'Bob'`），组件不会更新——因为这是嵌套属性，浅响应式不跟踪。

## 课后Quiz：巩固浅响应式知识

### 问题1（多选）

以下关于 `shallowReactive` 的描述，正确的是？  
A. `shallowReactive` 会使对象的所有属性（包括嵌套）响应式  
B. `shallowReactive` 只使对象的顶层属性响应式  
C. 修改 `shallowReactive` 对象的嵌套属性会触发更新  
D. 替换 `shallowReactive` 对象的嵌套对象引用会触发更新

**答案**：B、D  
**解析**：`shallowReactive` 仅处理顶层属性，所以 B 正确；替换嵌套对象的引用（如 `state.b = { new: 'data' }`
）是顶层属性的变化，会触发更新，所以 D 正确。

### 问题2（单选）

当使用 `shallowRef` 时，以下哪种操作会触发组件更新？  
A. 修改 `ref.value` 的内部属性（如 `obj.value.a = 2`）  
B. 替换 `ref.value`（如 `obj.value = { a: 2 }`）  
C. 修改 `ref` 的非 `.value` 属性（如 `obj.a = 2`）  
D. 以上都不会

**答案**：B  
**解析**：`shallowRef` 只跟踪 `.value` 的替换操作，所以 B 正确；A 是内部属性变化，不会触发；C 是错误操作（`ref` 没有 `a` 属性，只有
`.value`）。

## 常见报错与解决方案

### 报错场景1：修改shallowRef内部属性不触发更新

**错误代码**：

```vue

<script setup>
  import {shallowRef} from 'vue'

  const user = shallowRef({name: 'Alice'})

  // 修改内部属性，但页面不更新
  const changeName = () => {
    user.value.name = 'Bob'
  }
</script>

<template>
  <p>{{ user.value.name }}</p>
  <button @click="changeName">改名</button>
</template>
```

**原因**：`shallowRef` 不跟踪 `.value` 内部的变化。  
**解决方案**：

1. 改用 `ref`（需要深层响应式时）：
   ```javascript
   import { ref } from 'vue'
   const user = ref({ name: 'Alice' })
   ```
2. 手动触发更新（用 `triggerRef`）：
   ```javascript
   import { shallowRef, triggerRef } from 'vue'
   const user = shallowRef({ name: 'Alice' })

   const changeName = () => {
     user.value.name = 'Bob'
     triggerRef(user) // ✅ 手动触发更新
   }
   ```

### 报错场景2：修改shallowReactive嵌套属性不触发更新

**错误代码**：

```vue

<script setup>
  import {shallowReactive} from 'vue'

  const state = shallowReactive({
    user: {name: 'Alice'}
  })

  // 修改嵌套属性，页面不更新
  const changeName = () => {
    state.user.name = 'Bob'
  }
</script>

<template>
  <p>{{ state.user.name }}</p>
  <button @click="changeName">改名</button>
</template>
```

**原因**：`shallowReactive` 不处理嵌套对象的响应式。  
**解决方案**：

1. 改用 `reactive`（需要深层响应式时）：
   ```javascript
   import { reactive } from 'vue'
   const state = reactive({ user: { name: 'Alice' } })
   ```
2. 替换嵌套对象引用（触发顶层属性变化）：
   ```javascript
   const changeName = () => {
     state.user = { ...state.user, name: 'Bob' } // ✅ 替换引用，触发更新
   }
   ```

## 参考链接

- Vue 官方文档：[Shallow Reactivity](https://vuejs.org/api/reactivity-advanced.html#shallowref)

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？](https://blog.cmdragon.cn/posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/)




<details>
<summary>往期文章归档</summary>

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
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)
- [为什么TDD能让你的FastAPI开发飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c9c1e3bb0fdc15303b9b3b1f20124b0b/)
- [如何用FastAPI玩转多模块测试与异步任务，让代码不再“闹脾气”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbfa0447a5d0d6f9af12e7a6b206f70/)

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