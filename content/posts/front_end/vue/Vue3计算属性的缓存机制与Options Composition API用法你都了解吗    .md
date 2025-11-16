---
url: /posts/7d2a07177c928caf0b321b44d00e8b08/
title: Vue3计算属性的缓存机制与Options/Composition API用法你都了解吗
date: 2025-11-16T07:29:58+08:00
lastmod: 2025-11-16T07:29:58+08:00
author: cmdragon
cover: /images/74057a1e940e4e8cae9a816209b7330c~tplv-5jbd59dj06-image.png

summary:
  Vue 3中的计算属性（Computed Property）依赖响应式数据动态计算，具有缓存机制，仅在依赖变化时重新计算。Options API通过`computed`字段定义计算属性，支持函数式和`getter/setter`形式。Composition API使用`computed`函数，适合复杂组件逻辑，支持`getter/setter`。两者核心区别在于语法形式和逻辑组织方式，Composition API更灵活，适合逻辑复用。计算属性常用于生成衍生值，如过滤列表或格式化数据。

categories:
  - vue

tags:
  - 基础入门
  - 计算属性
  - Options API
  - Composition API
  - 缓存机制
  - 响应式数据
  - 实战场景

---

<img src="/images/74057a1e940e4e8cae9a816209b7330c~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、计算属性的基本概念与核心价值

在Vue 3中，**计算属性（Computed Property）**是依赖响应式数据动态计算得出的衍生值，它的核心价值在于**缓存机制**
——只有当依赖的响应式数据发生变化时，计算属性才会重新计算结果；否则直接复用之前的缓存值。这与方法（Method）的本质区别在于：方法每次调用都会重新执行函数体，而计算属性仅在依赖更新时“按需计算”。

举个生活中的类比：计算属性就像你手机里的“今日步数”——它依赖手机传感器的步数数据（响应式依赖），只有当你走路时（依赖变化），步数才会更新；而不是你每次打开APP都重新计算（像方法那样重复执行）。

### 二、Options API：计算属性的传统定义方式

Options API是Vue 2的经典语法，在Vue 3中依然兼容。它通过组件选项中的`computed`字段定义计算属性，语法遵循“选项式”组织逻辑。

#### 1. 基础语法：函数式定义

在`computed`选项中，计算属性以**函数形式**声明，函数的返回值即为计算结果。函数内通过`this`访问组件实例的响应式数据（如
`data`、`props`等）。

```vue

<script>
  export default {
    data() {
      return {
        firstName: 'John', // 响应式数据
        lastName: 'Doe'    // 响应式数据
      }
    },
    computed: {
      // 定义计算属性fullName
      fullName() {
        // this指向当前组件实例，可访问data中的属性
        return this.firstName + ' ' + this.lastName
      }
    }
  }
</script>

<template>
  <p>全名：{{ fullName }}</p> <!-- 渲染结果：John Doe -->
</template>
```

**关键说明**：

- 计算属性会被挂载到组件实例上，模板中可直接通过`{{ fullName }}`访问。
- 当`firstName`或`lastName`变化时，`fullName`会自动重新计算。

#### 2. 进阶：getter与setter

默认情况下，计算属性是**只读**的（仅包含getter）。若需要让计算属性支持**双向绑定**（即可以赋值），可通过`get`和`set`
方法定义“读写型”计算属性。

```vue

<script>
  export default {
    data() {
      return {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    computed: {
      fullName: {
        // getter：读取fullName时执行
        get() {
          return this.firstName + ' ' + this.lastName
        },
        // setter：给fullName赋值时执行
        set(newValue) {
          // 将新值拆分为 firstName 和 lastName
          const [first, last] = newValue.split(' ')
          this.firstName = first
          this.lastName = last
        }
      }
    }
  }
</script>

<template>
  <input v-model="fullName"/> <!-- 输入“Jane Smith”，会触发setter -->
  <p> firstName: {{ firstName }} </p> <!-- 输出：Jane -->
  <p> lastName: {{ lastName }} </p>   <!-- 输出：Smith -->
</template>
```

**关键说明**：

- `get`方法用于计算并返回计算属性的值；
- `set`方法接收赋值的新值，可反向更新依赖的响应式数据。

### 三、Composition API：计算属性的现代定义方式

Composition API是Vue 3的新增语法，通过**函数调用**的方式组织逻辑，更适合复杂组件的逻辑拆分与复用。定义计算属性需使用
`computed`函数（从`vue`中导入）。

#### 1. 基础语法：`computed`函数

`computed`函数接收一个**计算函数**作为参数，返回一个**只读的响应式引用（Ref）**。计算函数内直接引用响应式变量（需通过`.value`
访问`ref`类型的数据）。

```vue

<script setup>
  // 从vue中导入ref（用于定义响应式数据）和computed（用于定义计算属性）
  import {ref, computed} from 'vue'

  // 定义响应式数据（ref包装）
  const firstName = ref('John')
  const lastName = ref('Doe')

  // 定义计算属性fullName
  const fullName = computed(() => {
    // ref类型的数据需通过.value访问其值
    return firstName.value + ' ' + lastName.value
  })
</script>

<template>
  <p>全名：{{ fullName }}</p> <!-- 渲染结果：John Doe -->
</template>
```

**关键说明**：

- `computed`返回的`fullName`是一个`Ref`对象，模板中使用时会自动解包（无需`.value`）；
- 计算函数内的依赖（`firstName.value`、`lastName.value`）会被Vue自动追踪，依赖变化时计算属性更新。

#### 2. 进阶：带setter的计算属性

与Options API类似，`computed`函数也支持通过**对象参数**定义`getter`和`setter`，实现“读写型”计算属性。

```vue

<script setup>
  import {ref, computed} from 'vue'

  const firstName = ref('John')
  const lastName = ref('Doe')

  // 定义带setter的计算属性
  const fullName = computed({
    // getter：读取时执行
    get() {
      return firstName.value + ' ' + lastName.value
    },
    // setter：赋值时执行
    set(newValue) {
      const [first, last] = newValue.split(' ')
      firstName.value = first  // 更新响应式数据
      lastName.value = last   // 更新响应式数据
    }
  })
</script>

<template>
  <input v-model="fullName"/> <!-- 输入“Jane Smith”，触发setter -->
  <p> firstName: {{ firstName }} </p> <!-- 输出：Jane -->
  <p> lastName: {{ lastName }} </p>   <!-- 输出：Smith -->
</template>
```

### 三、Options API vs Composition API：核心差异对比

为了更清晰地理解两种语法的区别，我们通过**表格**总结核心差异：

| **维度**    | **Options API**                          | **Composition API**             |
|-----------|------------------------------------------|---------------------------------|
| **语法形式**  | 组件选项中的`computed`字段，函数声明                  | 调用`computed`函数，参数为计算逻辑          |
| **上下文访问** | 通过`this`访问组件实例的响应式数据                     | 直接引用响应式变量（`ref`/`reactive`）     |
| **逻辑组织**  | 按“选项类型”分类（`data`/`computed`/`methods`分开） | 按“逻辑关注点”组织（相关变量和计算属性放在一起）       |
| **灵活性**   | 适合简单组件，逻辑分散                              | 适合复杂组件，支持逻辑复用（如`useTodoFilter`） |

### 四、实战场景：计算属性的实际运用

计算属性最常用的场景是**基于响应式数据生成衍生值**，比如过滤列表、格式化数据等。以下以“Todo列表过滤”为例，对比两种API的实现：

#### 1. Options API实现

```vue

<script>
  export default {
    data() {
      return {
        todos: [ // 待办列表（响应式数据）
          {text: 'Learn Vue', done: true},
          {text: 'Write Blog', done: false},
          {text: 'Build App', done: true}
        ],
        filter: 'all' // 过滤条件（响应式数据：all/done/active）
      }
    },
    computed: {
      // 计算属性：过滤后的待办列表
      filteredTodos() {
        if (this.filter === 'all') return this.todos
        return this.todos.filter(todo => {
          return todo.done === (this.filter === 'done')
        })
      }
    }
  }
</script>
```

#### 2. Composition API实现

```vue

<script setup>
  import {ref, computed} from 'vue'

  // 待办列表（响应式数据）
  const todos = ref([
    {text: 'Learn Vue', done: true},
    {text: 'Write Blog', done: false},
    {text: 'Build App', done: true}
  ])
  // 过滤条件（响应式数据）
  const filter = ref('all')

  // 计算属性：过滤后的待办列表
  const filteredTodos = computed(() => {
    if (filter.value === 'all') return todos.value
    return todos.value.filter(todo => {
      return todo.done === (filter.value === 'done')
    })
  })
</script>
```

**场景说明**：  
无论是哪种API，计算属性`filteredTodos`都会自动追踪` todos`和`filter`的变化——当用户切换过滤条件（如从`all`到`done`），或待办项的
`done`状态变化时，`filteredTodos`会自动更新，无需手动监听。

### 五、课后Quiz：巩固你的理解

#### 问题1：

在Vue 3中，如何用Composition API定义一个**带setter**的计算属性？要求：

- 依赖两个`ref`变量`a`（初始值1）和`b`（初始值2）；
- 计算属性`sum`的getter返回`a + b`；
- 当给`sum`赋值时，将值平分给`a`和`b`（例如`sum = 4`，则`a = 2`，`b = 2`）。

**答案与解析**：

```vue

<script setup>
  import {ref, computed} from 'vue'

  const a = ref(1)
  const b = ref(2)

  const sum = computed({
    get() {
      return a.value + b.value // getter返回a+b
    },
    set(newValue) {
      const average = newValue / 2 // 平分新值
      a.value = average // 更新a
      b.value = average // 更新b
    }
  })
</script>
```

#### 问题2：

请说明计算属性与方法的**核心区别**，并解释计算属性的“缓存机制”是如何工作的？

**答案与解析**：

- 核心区别：方法每次调用都会重新执行函数体；计算属性仅在依赖的响应式数据变化时重新计算，否则复用缓存值。
- 缓存机制：Vue会自动追踪计算属性的**响应式依赖**（如`firstName`、`lastName`），当依赖变化时，标记计算属性为“脏值”，下次访问时重新计算并缓存新值。

### 六、常见报错与解决方案

#### 1. Options API中计算属性用箭头函数导致`this`错误

**错误示例**：

```javascript
computed: {
    fullName: () => this.firstName + this.lastName // this指向undefined
}
```

**原因**：箭头函数没有自己的`this`，会继承外层作用域的`this`（通常是`window`或`undefined`），而非组件实例。  
**解决方法**：使用普通函数定义计算属性（普通函数的`this`指向组件实例）。  
**正确示例**：

```javascript
computed: {
    fullName()
    {
        return this.firstName + this.lastName
    }
}
```

#### 2. Composition API中忘记访问`ref`的`.value`

**错误示例**：

```javascript
const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed(() => firstName + lastName) // 结果为"[object Object][object Object]"
```

**原因**：`ref`是包装对象，其值存储在`.value`属性中，直接使用`ref`变量会拿到对象本身。  
**解决方法**：在计算函数中通过`.value`访问`ref`的值。  
**正确示例**：

```javascript
const fullName = computed(() => firstName.value + lastName.value)
```

#### 3. 计算属性依赖非响应式数据

**错误示例**：

```javascript
const firstName = 'John' // 非响应式
const lastName = 'Doe'
const fullName = computed(() => firstName + lastName) // 不会更新
```

**原因**：计算属性的缓存机制仅对**响应式数据**有效（`ref`/`reactive`包装的变量）。  
**解决方法**：将非响应式数据改为`ref`或`reactive`。  
**正确示例**：

```javascript
const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed(() => firstName.value + lastName.value)
```

参考链接：https://vuejs.org/guide/essentials/computed.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3计算属性的缓存机制与Options/Composition API用法你都了解吗](https://blog.cmdragon.cn/posts/7d2a07177c928caf0b321b44d00e8b08/)




<details>
<summary>往期文章归档</summary>

- [Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/)
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
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)

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