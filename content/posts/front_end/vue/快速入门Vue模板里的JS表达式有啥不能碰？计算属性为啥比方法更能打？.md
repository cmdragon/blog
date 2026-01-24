---
url: /posts/23a2d5a334e15575277814c16e45df50/
title: 快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？
date: 2025-11-02T05:04:25+08:00
lastmod: 2025-11-02T05:04:25+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/b5307cf4608e4f7991eecea059a7d8c6~tplv-5jbd59dj06-image.png

summary:
  Vue 3模板中通过Mustache插值或指令属性嵌入JavaScript表达式，实现动态计算。模板表达式必须是单条JavaScript语句，适用于文本插值和指令属性值，但需避免副作用和流程控制语句。计算属性（computed）用于封装复杂逻辑，具备缓存性和响应性，优于methods的频繁调用。可写计算属性通过getter和setter实现双向绑定，Vue 3.4+还支持访问上一次计算结果。

categories:
  - vue

tags:
  - 基础入门
  - 模板表达式
  - 计算属性
  - JavaScript
  - 前端开发
  - 响应式编程
  - 代码优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/b5307cf4608e4f7991eecea059a7d8c6~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、模板中的JavaScript表达式

在Vue 3的模板语法中，我们可以通过**Mustache插值（双大括号）**或**指令属性（如`v-bind`/`:`）**
嵌入JavaScript表达式，让模板具备动态计算的能力。这是连接组件数据与DOM的核心桥梁。

### 1.1 什么是模板表达式？

模板表达式是Vue允许在模板中写入的**单条JavaScript计算语句**，它会被Vue编译为渲染函数的一部分，并在组件数据变化时自动重新计算。

比如：

```vue

<template>
  <!-- 算术运算：number是组件内的ref变量 -->
  <p>{{ number + 1 }}</p>
  <!-- 三元表达式：根据ok的值显示YES/NO -->
  <p>{{ ok ? 'YES' : 'NO' }}</p>
  <!-- 字符串反转：处理message变量 -->
  <p>{{ message.split('').reverse().join('') }}</p>
  <!-- 动态属性：拼接id生成div的id -->
  <div :id="`list-${id}`"></div>
</template>

<script setup>
  import {ref} from 'vue'

  const number = ref(1)   // 初始值1，表达式结果为2
  const ok = ref(true)    // 结果为YES
  const message = ref('Hello Vue')  // 结果为"euV olleH"
  const id = ref(10)      // 动态id为"list-10"
</script>
```

### 1.2 表达式的使用场景

模板表达式仅能用于两个位置：

- **文本插值**：`{{ 表达式 }}`，替换元素的文本内容；
- **指令属性值**：`v-bind:attr="表达式"`（或简写`:attr="表达式"`），动态绑定HTML属性。

### 1.3 表达式的限制与注意事项

Vue对模板表达式有严格约束，避免滥用导致维护问题：

#### （1）只能是“单表达式”，不能用语句

模板表达式必须是**可求值的代码片段**（能放在`return`后的内容），以下写法均无效：

```vue
<!-- 错误：var是语句，不是表达式 -->
{{ var a = 1 }}
<!-- 错误：if是流程控制，不是表达式 -->
{{ if (ok) { return message } }}
```

如需流程控制，应使用**三元表达式**（`ok ? A : B`）代替`if`，或把逻辑移到`computed`/`methods`中。

#### （2）调用函数时避免“副作用”

模板中的函数调用会**在每次组件更新时重新执行**，因此函数不能修改组件状态（如改变`ref`的值）、发起网络请求或操作DOM。比如：

```vue
<!-- 错误：函数修改了count的值（副作用） -->
{{ incrementCount() }}
```

正确的做法是把修改状态的逻辑放在`methods`中，通过事件触发（如`@click="incrementCount"`）。

#### （3）全局变量访问限制

模板表达式只能访问**有限的全局变量**（如`Math`、`Date`），自定义全局变量需通过`app.config.globalProperties`注册：

```js
// main.js
const app = createApp(App)
app.config.globalProperties.$filters = {
    formatDate(date) {
        return new Date(date).toLocaleDateString()
    }
}
```

之后可在模板中使用：`{{ $filters.formatDate(time) }}`。

## 二、计算属性：更优雅的复杂逻辑处理

当模板中的表达式变得复杂（如多次重复、包含多步计算）时，直接写在模板里会让代码难以阅读和维护。**计算属性（Computed）**
就是为解决这个问题而生——它将复杂逻辑封装为组件的“派生状态”，兼具可读性、缓存性和响应性。

### 2.1 为什么需要计算属性？

看一个例子：我们需要判断作者是否出版过书籍，模板中的表达式是`{{ author.books.length > 0 ? 'Yes' : 'No' }}`
。如果这个逻辑要在模板中重复使用多次，或者逻辑更复杂（比如过滤书籍类型），模板会变得混乱：

```vue
<!-- 混乱的模板：重复的复杂逻辑 -->
<p>Has books: {{ author.books.length > 0 ? 'Yes' : 'No' }}</p>
<p>Book count: {{ author.books.length }}</p>
<p>First book: {{ author.books[0] || 'None' }}</p>
```

这时候，**计算属性**可以把这些逻辑“提取”为组件的一个“虚拟属性”，让模板更简洁。

### 2.2 基础用法：从模板逻辑到 computed

计算属性通过`computed`函数（或选项式API的`computed`对象）定义，返回一个**计算ref**（与`ref`类似，`.value`访问值，模板中自动解包）。

改写上面的例子：

```vue

<template>
  <p>Has published books: {{ publishedBooksMessage }}</p>
  <p>Book count: {{ bookCount }}</p>
  <p>First book: {{ firstBook }}</p>
</template>

<script setup>
  import {reactive, computed} from 'vue'

  const author = reactive({
    name: 'John Doe',
    books: ['Vue 2 - Advanced Guide', 'Vue 3 - Basic Guide']
  })

  // 计算属性1：判断是否有书
  const publishedBooksMessage = computed(() => {
    return author.books.length > 0 ? 'Yes' : 'No'
  })

  // 计算属性2：书籍数量
  const bookCount = computed(() => author.books.length)

  // 计算属性3：第一本书（无则返回None）
  const firstBook = computed(() => author.books[0] || 'None')
</script>
```

模板瞬间变得清晰！计算属性会**自动跟踪依赖**（如`author.books`），当依赖变化时，计算属性会重新计算值。

### 2.3 computed vs methods：缓存的意义

你可能发现，用`methods`也能实现同样的逻辑：

```vue

<template>
  <p>{{ calculateBooksMessage() }}</p>
</template>

<script setup>
  function calculateBooksMessage() {
    return author.books.length > 0 ? 'Yes' : 'No'
  }
</script>
```

但**computed和methods的核心区别是“缓存”**：

- **computed**：只有当依赖的`author.books`变化时，才会重新计算；多次访问`publishedBooksMessage`会直接返回缓存值。
- **methods**：每次组件渲染（如父组件更新、其他数据变化）都会重新调用，即使`author.books`没变化。

**什么时候用computed？**  
当逻辑需要**频繁访问且计算成本高**时（比如遍历1000条数据过滤），缓存能大幅提升性能。

### 2.4 可写计算属性：getter 与 setter

默认情况下，计算属性是**只读**的（只有`getter`）。如果需要“修改”计算属性（如通过`v-model`绑定），可以定义`setter`：

比如“全名”的例子：`fullName = firstName + lastName`，修改`fullName`时自动分割为`firstName`和`lastName`：

```vue

<template>
  <input v-model="fullName" placeholder="Enter full name"/>
  <p>First Name: {{ firstName }}</p>
  <p>Last Name: {{ lastName }}</p>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const firstName = ref('John')
  const lastName = ref('Doe')

  // 可写计算属性：getter拼接，setter分割
  const fullName = computed({
    // getter：读取时返回拼接后的全名
    get() {
      return `${firstName.value} ${lastName.value}`
    },
    // setter：修改时分割输入到firstName和lastName
    set(newValue) {
      const [first, last] = newValue.split(' ')
      firstName.value = first || ''  // 处理空输入
      lastName.value = last || ''
    }
  })
</script>
```

当你在输入框中输入“Alice Smith”，`firstName`会变成“Alice”，`lastName`变成“Smith”——计算属性的`setter`自动处理了分割逻辑。

### 2.5 进阶：获取计算属性的 previous 值（Vue 3.4+）

Vue 3.4+允许计算属性的`getter`访问**上一次的计算结果**（`previous`参数），适用于需要“保留历史值”的场景。比如：当`count`
超过3时，保持`alwaysSmall`为之前的最大值3：

```vue

<template>
  <p>Count: {{ count }}</p>
  <p>Always Small: {{ alwaysSmall }}</p>
  <button @click="count++">Increment</button>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const count = ref(2)

  // 当count <=3时返回当前值，否则返回之前的值
  const alwaysSmall = computed((previous) => {
    if (count.value <= 3) {
      return count.value  // count=2→2，count=3→3
    }
    return previous       // count=4→3，count=5→3
  })
</script>
```

点击按钮递增`count`：

- `count=2`→`alwaysSmall=2`
- `count=3`→`alwaysSmall=3`
- `count=4`→`alwaysSmall=3`（保持之前的3）
- `count=5`→`alwaysSmall=3`

## 课后Quiz：巩固你的理解

### 问题1：模板中的表达式为什么不能使用`var a = 1`？

**答案**：模板表达式必须是“单表达式”（可求值的代码片段），而`var a = 1`是**语句**（用于声明变量），Vue编译时会报错。如需变量声明，应将逻辑移到
`script`中。

### 问题2：computed和methods的核心区别是什么？举一个适合用computed的场景。

**答案**：

- 核心区别：`computed`有缓存，依赖变化才重新计算；`methods`每次渲染都调用。
- 适合场景：一个需要频繁访问的**昂贵计算**（如过滤1000条商品数据中的“折扣商品”），用`computed`缓存结果，避免重复计算。

### 问题3：如何实现可写计算属性？用`fullName`例子说明。

**答案**：通过`get`（读取逻辑）和`set`（修改逻辑）定义：

```js
const fullName = computed({
    get() {
        return `${firstName.value} ${lastName.value}`
    },
    set(newValue) {
        const [first, last] = newValue.split(' ')
        firstName.value = first || ''
        lastName.value = last || ''
    }
})
```

## 常见报错与解决

### 1. 报错："Property or method 'xxx' is not defined..."

- **原因**：模板中使用的`xxx`未在组件中定义（如`{{ xxx }}`中的`xxx`未在`data`/`computed`/`methods`中声明）。
- **解决**：检查变量是否拼写错误，或是否通过`props`传递。

### 2. 报错："Computed property 'xxx' has no setter..."

- **原因**：尝试修改一个“只读计算属性”（只有`getter`），比如`fullName.value = 'Alice'`但`fullName`没有`setter`。
- **解决**：给计算属性添加`set`方法（参考2.4节的`fullName`例子）。

### 3. 报错："Avoid mutating a computed value directly..."

- **原因**：直接修改了计算属性的结果（如`alwaysSmall.value = 5`），但计算属性是“派生状态”，应修改它依赖的源数据（如`count`）。
- **解决**：修改`count.value`而不是`alwaysSmall.value`，让计算属性自动更新。

参考链接：

- 模板表达式：https://vuejs.org/guide/essentials/template-syntax.html#using-javascript-expressions
- 计算属性：https://vuejs.org/guide/essentials/computed.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？](https://blog.cmdragon.cn/posts/23a2d5a334e15575277814c16e45df50/)



<details>
<summary>往期文章归档</summary>

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
- [多环境配置切换机制能否让开发与生产无缝衔接？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/533874f5700b8506d4c68781597db659/)
- [如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)
- [为什么你的单元测试需要Mock数据库才能飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6e69c0eedd8b1e5a74a148d36c85d7ce/)
- [如何在FastAPI中巧妙隔离依赖项，让单元测试不再头疼？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/77ae327dc941b0e74ecc6a8794c084d0/)

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