---
url: /posts/372acc3d3dcd47da62c48c4cf6ad9d5c/
title: 为什么Vue 3的计算属性能解决模板臃肿、性能优化和双向同步三大痛点？
date: 2025-11-09T07:04:22+08:00
lastmod: 2025-11-09T07:04:22+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/7154a68f242348718aea62198c272e52~tplv-5jbd59dj06-image.png

summary:
  计算属性（Computed）是Vue 3中用于派生状态的核心API，能够将复杂逻辑从模板中抽离，提升代码简洁性和可维护性。计算属性通过缓存机制优化性能，仅在依赖的响应式数据变化时重新计算，而方法则每次调用都会执行。可写计算属性允许通过getter和setter实现双向同步，Vue 3.4+还支持获取计算属性的之前值，用于保留历史状态。使用时应保持getter无副作用，避免直接修改计算属性值。

categories:
  - vue

tags:
  - 基础入门
  - 计算属性
  - Options API
  - Composition API
  - 缓存机制
  - 可写计算属性
  - 最佳实践

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/7154a68f242348718aea62198c272e52~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、计算属性的基本使用

计算属性（Computed）是Vue 3中用于**派生状态**的核心API，它能将复杂的逻辑从模板中抽离，让代码更简洁、可维护。

#### 1.1 为什么需要计算属性？

模板表达式（如`{{ author.books.length > 0 ? 'Yes' : 'No' }}`）适合简单逻辑，但如果逻辑复杂或需要重复使用，直接写在模板里会有两个问题：

- **模板臃肿**：大量逻辑会让模板难以阅读；
- **代码冗余**：同一逻辑重复写多次，维护成本高。

计算属性的作用就是**将派生逻辑封装成“虚拟属性”**，让模板只负责展示，逻辑交给计算属性处理。

#### 1.2 Options API 中的计算属性

在Options API中，计算属性通过`computed`选项定义，它是一个对象，键是计算属性名，值是**getter函数**（用于计算值）。

示例：判断作者是否有出版书籍

```javascript
export default {
    data() {
        return {
            author: {
                name: 'John Doe',
                books: ['Vue 2 - Advanced Guide', 'Vue 3 - Basic Guide', 'Vue 4 - The Mystery']
            }
        }
    },
    computed: {
        // 计算属性的getter函数
        publishedBooksMessage() {
            // this 指向组件实例，自动追踪author.books的变化
            return this.author.books.length > 0 ? 'Yes' : 'No'
        }
    }
}
```

模板中直接使用计算属性，和普通data属性一样：

```vue

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span>
</template>
```

#### 1.3 Composition API 中的计算属性（`<script setup>`）

在Composition API中，使用`computed()`函数创建计算属性，返回的是**computed ref**（可响应的引用类型）。

示例（与上面功能一致）：

```vue

<script setup>
  import {reactive, computed} from 'vue'

  // 响应式数据：作者信息
  const author = reactive({
    name: 'John Doe',
    books: ['Vue 2 - Advanced Guide', 'Vue 3 - Basic Guide', 'Vue 4 - The Mystery']
  })

  // 计算属性：判断是否有书籍
  const publishedBooksMessage = computed(() => {
    // 依赖author.books，自动追踪变化
    return author.books.length > 0 ? 'Yes' : 'No'
  })
</script>

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span> <!-- 自动解包，无需.value -->
</template>
```

**注意**：

- `computed()`函数接收一个**getter函数**，返回的`publishedBooksMessage`是`ComputedRef`类型；
- 在模板中，computed ref会**自动解包**（不用写`.value`）；
- 在`<script>`中访问时，需要用`.value`（如`publishedBooksMessage.value`）。

### 二、计算属性的缓存机制：与方法的本质区别

计算属性和方法都能实现逻辑复用，但**缓存机制**是它们的核心区别。

#### 2.1 缓存的意义：性能优化

计算属性的结果会**基于依赖自动缓存**——只有当依赖的响应式数据变化时，才会重新计算；否则直接返回缓存值。

而方法**没有缓存**，每次调用（如模板渲染、函数调用）都会重新执行逻辑。

示例：对比计算属性和方法

```javascript
// 计算属性：缓存结果
const expensiveComputed = computed(() => {
    console.log('计算属性执行了')
    return heavyCalculation() // 假设这是一个耗时操作
})

// 方法：无缓存
function expensiveMethod() {
    console.log('方法执行了')
    return heavyCalculation()
}
```

- 当依赖不变时，多次访问`expensiveComputed.value`，只会打印一次“计算属性执行了”；
- 多次调用`expensiveMethod()`，每次都会打印“方法执行了”。

#### 2.2 依赖追踪：只更新必要的计算

Vue会自动**追踪计算属性的依赖**（即getter函数中用到的响应式数据），只有依赖变化时，计算属性才会重新计算。

反例：依赖非响应式数据

```javascript
const now = computed(() => Date.now()) // Date.now()不是响应式数据
```

无论过多久，`now.value`都不会更新——因为Vue无法追踪`Date.now()`的变化。

### 三、可写计算属性：处理双向逻辑

默认情况下，计算属性是**只读**的（只有getter），但在某些场景下，我们需要**通过计算属性反向修改源数据**（如`fullName`同步
`firstName`和`lastName`），这时可以用**可写计算属性**（同时定义getter和setter）。

#### 3.1 场景需求：双向同步

比如，我们有`firstName`和`lastName`两个响应式数据，希望通过`fullName`（如“John Doe”）同时读取和修改它们：

- 读取`fullName`时，返回`firstName + ' ' + lastName`；
- 修改`fullName`时，将新值拆分成`firstName`和`lastName`。

#### 3.2 可写计算属性的实现

可写计算属性需要同时定义`get`（读取逻辑）和`set`（修改逻辑）。

**Options API 写法**：

```javascript
export default {
    data() {
        return {
            firstName: 'John',
            lastName: 'Doe'
        }
    },
    computed: {
        fullName: {
            // getter：组合firstName和lastName
            get() {
                return this.firstName + ' ' + this.lastName
            },
            // setter：拆分新值到firstName和lastName
            set(newValue) {
                [this.firstName, this.lastName] = newValue.split(' ')
            }
        }
    }
}
```

**Composition API 写法**：

```vue

<script setup>
  import {ref, computed} from 'vue'

  const firstName = ref('John')
  const lastName = ref('Doe')

  const fullName = computed({
    // getter：组合firstName和lastName
    get() {
      return firstName.value + ' ' + lastName.value
    },
    // setter：拆分新值到firstName和lastName
    set(newValue) {
      [firstName.value, lastName.value] = newValue.split(' ')
    }
  })
</script>
```

**使用示例**：

```javascript
// 修改fullName，会同步更新firstName和lastName
fullName.value = 'Jane Smith'
console.log(firstName.value) // Jane
console.log(lastName.value)  // Smith
```

### 四、获取计算属性的之前值

Vue 3.4新增了**获取计算属性之前值**的能力，通过`computed()`函数的`previous`参数实现。这在需要**保留历史状态**
的场景中很有用（如“只能减小不能超过某个值”）。

#### 4.1 应用场景：保留历史状态

比如，我们希望`alwaysSmall`始终返回`count`的值，但当`count`超过3时，保持之前的最大值（3）：

```vue

<script setup>
  import {ref, computed} from 'vue'

  const count = ref(2)
  const alwaysSmall = computed((previous) => {
    if (count.value <= 3) {
      return count.value // 当count≤3时，返回当前值
    }
    return previous // 当count>3时，返回之前的value（最大是3）
  })
</script>
```

**效果**：

- 当`count`从2→3→4时，`alwaysSmall.value`依次是2→3→3；
- 当`count`从4→2时，`alwaysSmall.value`变回2。

### 五、计算属性的最佳实践

为了避免踩坑，使用计算属性时需遵循以下规则：

#### 5.1 保持 getter 无副作用

计算属性的`getter`应该是**纯函数**——只依赖输入计算输出，不修改任何外部状态（如修改其他响应式数据、发送请求、操作DOM）。

反例（错误写法）：

```javascript
const badComputed = computed(() => {
    this.author.name = 'Jane' // 错误：修改了其他状态
    return this.author.books.length > 0 ? 'Yes' : 'No'
})
```

这样会导致逻辑混乱，因为`getter`的职责是**计算值**，而不是**修改状态**。修改状态的操作应该放在`methods`或`watch`中。

#### 5.2 不要直接修改计算属性的值

计算属性是**派生状态**（由源数据计算而来），直接修改计算属性的值是没有意义的——因为它会被下一次计算覆盖。

反例（错误写法）：

```javascript
// publishedBooksMessage是计算属性（无setter）
publishedBooksMessage.value = 'No' // 错误：只读属性
```

正确的做法是**修改源数据**（如`author.books = []`），让计算属性自动更新。

### 六、课后 Quiz：巩固你的理解

#### 问题1：计算属性和方法的核心区别是什么？

**答案**：  
计算属性基于**依赖缓存**，只有依赖变化时才重新计算；方法**无缓存**，每次调用都重新执行。  
**解析**：缓存是计算属性的核心优势，适合需要重复使用且依赖稳定的逻辑（如过滤列表）；方法适合不需要缓存的场景（如事件处理）。

#### 问题2：如何创建一个可写的计算属性？

**答案**：  
通过同时定义`get`（读取逻辑）和`set`（修改逻辑）实现：

- Options API：在`computed`选项中写`{ get() {}, set(newValue) {} }`；
- Composition API：调用`computed({ get() {}, set(newValue) {} })`。  
  **示例**：参考“三、可写计算属性”中的`fullName`例子。

#### 问题3：为什么计算属性中使用`Date.now()`不会更新？

**答案**：  
因为`Date.now()`不是**响应式依赖**，Vue无法追踪它的变化。计算属性只会在依赖的响应式数据变化时重新计算。  
**拓展**：如果需要实时获取时间，应该用`setInterval`或`watch`，而不是计算属性。

### 七、常见报错及解决方案

#### 报错1：计算属性返回`undefined`

**原因**：`getter`函数没有返回值（忘记写`return`）。  
**示例**：

```javascript
const badComputed = computed(() => {
    author.books.length > 0 ? 'Yes' : 'No' // 忘记return
})
```

**解决**：确保`getter`函数有`return`语句。

#### 报错2：无法修改只读计算属性

**报错信息**：`Set operation on key "xxx" failed: computed value is readonly`  
**原因**：尝试修改**无setter**的计算属性（默认是只读的）。  
**解决**：

- 如果需要修改，给计算属性添加`setter`（参考“三、可写计算属性”）；
- 不要直接修改计算属性，改为修改源数据。

#### 报错3：计算属性不随数据更新

**原因**：

1. 依赖了**非响应式数据**（如普通变量，不是`ref`/`reactive`）；
2. `getter`函数中没有用到响应式数据（即无依赖）。  
   **解决**：

- 将数据转为响应式（用`ref`或`reactive`包裹）；
- 确保`getter`函数中用到了响应式数据。

### 参考链接

https://vuejs.org/guide/essentials/computed.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[为什么Vue 3的计算属性能解决模板臃肿、性能优化和双向同步三大痛点？](https://blog.cmdragon.cn/posts/372acc3d3dcd47da62c48c4cf6ad9d5c/)




<details>
<summary>往期文章归档</summary>

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
- [多环境配置切换机制能否让开发与生产无缝衔接？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/533874f5700b8506d4c68781597db659/)

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