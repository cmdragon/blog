---
url: /posts/be04b02d2723994632de0d4ca22a3391/
title: Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？
date: 2025-11-12T06:00:47+08:00
lastmod: 2025-11-12T06:00:47+08:00
author: cmdragon
cover: /images/43242a92560c46959ded6fa224bf9eff~tplv-5jbd59dj06-image.png

summary:
  Vue 3的组合式API中，`ref()`和`reactive()`是创建响应式数据的核心工具。`ref()`可包裹任意值类型，通过`.value`访问，模板中自动解包；`reactive()`仅支持对象/数组，直接访问属性，但替换整个对象会丢失响应式。`ref()`更灵活，推荐优先使用，避免`reactive()`的解构和替换陷阱。`toRefs()`可将`reactive()`对象的属性转为`ref()`，保持响应式。浅响应式工具如`shallowRef()`和`shallowReactive()`适用于优化大型对象性能。

categories:
  - vue

tags:
  - 基础入门
  - 组合式API
  - ref()
  - reactive()
  - 响应式数据
  - 最佳实践
  - 常见报错

---

<img src="/images/43242a92560c46959ded6fa224bf9eff~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 组合式API的核心响应式工具：ref()与reactive()

在Vue 3的组合式API中，**ref()**和**reactive()**是创建响应式数据的两大核心工具。它们基于Vue的 Proxy 响应式系统，但适用场景和使用方式有明显区别。

#### 1.1 ref()：包裹一切值的响应式容器

`ref()`是组合式API中最常用的响应式工具，它可以包裹**任意值类型**（基本类型如`number`、`string`，或对象、数组等复杂类型），返回一个
**ref对象**。ref对象通过`.value`属性访问或修改内部值，而在模板中会**自动解包**（无需写`.value`）。

**基础使用示例**：

```vue

<script setup>
  // 1. 从vue导入ref
  import {ref} from 'vue'

  // 2. 用ref包裹初始值0，count是ref对象
  const count = ref(0)

  // 3. 修改ref的值：必须通过.value访问
  function increment() {
    count.value++ // 触发响应式更新
  }
</script>

<template>
  <!-- 4. 模板中自动解包，直接用count -->
  <button @click="increment">Count: {{ count }}</button>
</template>
```

**关键特性**：

- 支持所有值类型：无论是`count = ref(0)`（基本类型）还是`user = ref({ name: 'Alice' })`（对象），都能保持响应式。
- 可传递性：ref对象可以安全地传递给函数或组件，不会丢失响应式（因为传递的是对象引用）。
- 模板自动解包：在`<template>`中使用ref时，Vue会自动读取`.value`，无需手动写。

#### 1.2 reactive()：对象的响应式代理

`reactive()`用于将**对象或数组**转换为响应式代理。它会递归地将对象的所有嵌套属性转为响应式（深响应式），但**仅支持对象类型**
（不能包裹基本类型如`reactive(0)`）。

**基础使用示例**：

```vue

<script setup>
  import {reactive} from 'vue'

  // 1. 用reactive创建响应式对象
  const form = reactive({
    name: 'Alice',
    email: 'alice@example.com'
  })

  // 2. 直接修改对象属性，触发响应式
  function updateName() {
    form.name = 'Bob' // 无需.value，直接改属性
  }
</script>

<template>
  <div>Name: {{ form.name }}</div>
  <button @click="updateName">Update Name</button>
</template>
```

**关键特性**：

- 深响应式：修改嵌套属性（如`form.address.city = 'Beijing'`）或数组（如`form.tags.push('Vue')`）都会触发更新。
- Proxy 特性：返回的是原对象的 Proxy 代理，**原对象本身不会变成响应式**（修改原对象不会触发更新）。

#### 1.3 ref() vs reactive()：核心区别

| 特性     | ref()                 | reactive()      |
|--------|-----------------------|-----------------|
| 支持的值类型 | 所有类型（基本+对象）           | 仅对象/数组          |
| 值访问方式  | 需`.value`（脚本中）        | 直接访问属性          |
| 替换整个值  | 支持（`count.value = 1`） | 不支持（替换对象会丢失响应式） |
| 解构的影响  | 解构后仍保持响应式（用toRefs）    | 解构后丢失响应式        |

### 响应式数据的最佳实践

掌握ref和reactive的区别后，我们可以总结出**组合式API中响应式数据的最佳实践**，避免常见陷阱。

#### 2.1 优先使用ref()：更灵活，更少陷阱

`ref()`的灵活性远超`reactive()`，几乎可以覆盖所有场景：

- 对于**基本类型**（如计数器、开关），ref是唯一选择；
- 对于**对象/数组**，用`ref()`包裹（如`const form = ref({ name: '' })`）比`reactive()`更安全——因为可以直接替换整个对象（
  `form.value = { name: 'Bob' }`），而不会丢失响应式。

**反例（不推荐）**：

```javascript
// 用reactive创建对象，替换后丢失响应式
let form = reactive({name: 'Alice'})
form = reactive({name: 'Bob'}) // 错误：原form的响应式连接断开
```

**正例（推荐）**：

```javascript
// 用ref包裹对象，替换整个值仍保持响应式
const form = ref({name: 'Alice'})
form.value = {name: 'Bob'} // 正确：响应式保留
```

#### 2.2 处理嵌套数据：深响应式与浅响应式

Vue默认对ref和reactive对象进行**深响应式处理**——修改嵌套属性或数组元素都会触发更新。但在某些场景下（如大型对象、外部库管理的状态），我们可以用
**浅响应式**优化性能：

- `shallowRef()`：仅跟踪`.value`的变化，不跟踪内部属性（如`const largeObj = shallowRef({ ... })`）；
- `shallowReactive()`：仅跟踪对象的顶层属性，不跟踪嵌套属性。

**示例（shallowRef的使用）**：

```javascript
import {shallowRef} from 'vue'

// 大型对象，无需跟踪内部变化
const largeData = shallowRef({
    // 假设这里有1000个属性
    id: 1,
    details: {...}
})

// 修改.value会触发更新
largeData.value = {id: 2, details: {...}}
// 修改内部属性不会触发更新（浅响应式）
largeData.value.details.name = 'Bob' // 无响应
```

#### 2.3 避免reactive()的两大陷阱

`reactive()`有两个常见陷阱，需用`ref()`或`toRefs()`解决：

##### 陷阱1：解构reactive对象会丢失响应式

当你解构reactive对象的属性时，得到的是**普通值**，修改这些值不会触发更新：

```javascript
const user = reactive({name: 'Alice', age: 30})
const {name, age} = user // 解构得到普通变量

name = 'Bob' // 无效：不会触发DOM更新
```

**解决方案**：用`toRefs()`将reactive对象的属性转为ref：

```javascript
import {reactive, toRefs} from 'vue'

const user = reactive({name: 'Alice', age: 30})
const {name, age} = toRefs(user) // 解构得到ref对象

name.value = 'Bob' // 有效：触发更新
```

##### 陷阱2：替换reactive对象会丢失响应式

如前所述，`reactive()`返回的是Proxy代理，替换整个对象会断开响应式连接。**解决方案**：用`ref()`包裹对象，通过`.value`替换。

### 实际案例：从基础到复杂场景

结合最佳实践，我们用三个案例展示如何在实际开发中使用响应式数据。

#### 3.1 案例1：基础计数器（ref的典型使用）

```vue

<script setup>
  import {ref} from 'vue'

  // 用ref包裹计数器初始值
  const count = ref(0)

  //  increment函数修改.count.value
  function increment() {
    count.value++
  }
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

**说明**：计数器是典型的基本类型场景，ref是最优选择，模板自动解包简化代码。

#### 3.2 案例2：复杂表单（ref包裹对象 vs reactive）

**需求**：处理一个包含嵌套字段的表单（如用户信息+地址）。
**推荐方案**：用`ref()`包裹对象，避免reactive的替换陷阱：

```vue

<script setup>
  import {ref} from 'vue'

  // 用ref包裹表单对象，支持替换整个表单
  const form = ref({
    user: {name: 'Alice', email: 'alice@example.com'},
    address: {city: 'Shanghai', zip: '200000'}
  })

  // 修改嵌套属性：需通过.value访问
  function updateCity() {
    form.value.address.city = 'Beijing'
  }

  // 替换整个表单：保持响应式
  function resetForm() {
    form.value = {
      user: {name: '', email: ''},
      address: {city: '', zip: ''}
    }
  }
</script>

<template>
  <div>City: {{ form.address.city }}</div>
  <button @click="updateCity">Update City</button>
  <button @click="resetForm">Reset Form</button>
</template>
```

#### 3.3 案例3：DOM更新时机与nextTick

Vue的DOM更新是**异步的**——修改响应式数据后，Vue会将DOM更新缓冲到“下一个tick”，确保组件只更新一次。如果需要在DOM更新后执行操作（如访问更新后的DOM元素），需用
`nextTick()`。

**示例**：

```vue

<script setup>
  import {ref, nextTick} from 'vue'

  const count = ref(0)
  const countEl = ref(null) // 绑定到DOM元素

  async function increment() {
    count.value++
    // 此时DOM未更新，countEl的textContent还是0
    console.log(countEl.value.textContent) // 输出0
    // 等待DOM更新完成
    await nextTick()
    // 现在DOM已更新，输出1
    console.log(countEl.value.textContent) // 输出1
  }
</script>

<template>
  <button @click="increment">Increment</button>
  <!-- 将span元素绑定到countEl -->
  <span ref="countEl">{{ count }}</span>
</template>
```

### 课后Quiz：巩固所学知识

#### 问题1：ref和reactive的主要区别是什么？

**答案**：

- ref支持所有值类型（基本+对象），需通过`.value`访问；reactive仅支持对象/数组，直接访问属性。
- ref可以替换整个值（`count.value = 1`）；reactive不能替换整个对象（否则丢失响应式）。
- ref在模板中自动解包；reactive需通过属性访问。

#### 问题2：如何解决reactive对象解构后丢失响应式的问题？

**答案**：使用`toRefs()`函数将reactive对象的属性转换为ref。例如：

```javascript
const user = reactive({name: 'Alice'})
const {name} = toRefs(user) // name是ref对象
name.value = 'Bob' // 有效
```

#### 问题3：为什么修改ref的值需要用`.value`？

**答案**：ref返回的是**包装对象**，`.value`是其内部值的访问器。Vue通过劫持`.value`的`get`和`set`方法实现响应式跟踪——只有通过
`.value`访问或修改，才能触发 reactivity。

### 常见报错与解决方案

#### 报错1：Uncaught TypeError: Cannot read properties of undefined (reading 'value')

**原因**：在脚本中忘记用`.value`访问ref的值，或ref对象未正确初始化。
**示例**：

```javascript
const count = ref(0)
count++ // 错误：count是对象，不能直接递增
```

**解决**：添加`.value`：

```javascript
count.value++ // 正确
```

#### 报错2：修改reactive对象后DOM不更新

**原因**：替换了整个reactive对象，导致原Proxy代理丢失。
**示例**：

```javascript
let form = reactive({name: 'Alice'})
form = reactive({name: 'Bob'}) // 错误：替换对象
```

**解决**：用ref包裹对象，修改`.value`：

```javascript
const form = ref({name: 'Alice'})
form.value = {name: 'Bob'} // 正确
```

#### 报错3：解构reactive对象的属性后修改不触发更新

**原因**：解构得到的是普通值，丢失响应式连接。
**示例**：

```javascript
const user = reactive({name: 'Alice'})
const {name} = user // name是普通变量
name = 'Bob' // 无效
```

**解决**：用`toRefs()`转换：

```javascript
const {name} = toRefs(user) // name是ref
name.value = 'Bob' // 有效
```

参考链接：https://vuejs.org/guide/essentials/reactivity-fundamentals.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？](https://blog.cmdragon.cn/posts/be04b02d2723994632de0d4ca22a3391/)




<details>
<summary>往期文章归档</summary>

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
- [如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)
- [如何在FastAPI中优雅地模拟多模块集成测试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be553dbd5d51835d2c69553f4a773e2d/)

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