---
url: /posts/654b9447ef1ba7ec1126a1bc26a4726d/
title: Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗
date: 2025-11-08T06:25:19+08:00
lastmod: 2025-11-08T06:25:19+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/ebee77ea9207422cbcfd2bb08e4436b2~tplv-5jbd59dj06-image.png

summary:
  Options API和Composition API是Vue 3中声明和操作响应式数据的两种方式。Options API通过`data`选项声明响应式状态，Vue 3使用Proxy实现响应式，需通过`this`访问代理对象。Composition API推荐使用`ref`和`reactive`，`ref`用于包裹基本类型或对象，需通过`.value`访问，`reactive`用于对象类型，直接操作属性。`nextTick`用于等待DOM更新完成。`reactive`对象不能直接替换引用，解构会丢失响应式，需用`toRefs`转换。

categories:
  - vue

tags:
  - 基础入门
  - 响应式系统
  - Options API
  - Composition API
  - ref
  - reactive
  - DOM更新

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/ebee77ea9207422cbcfd2bb08e4436b2~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、Options API中的响应式声明与操作

Options API是Vue 2的经典写法，Vue 3保留了它的兼容性。在Options API中，响应式状态的核心是`data`选项。

#### 1.1 用`data`选项声明响应式状态

`data`选项必须是一个**返回对象的函数**（避免组件复用时光享状态），Vue会将返回对象的所有顶级属性包裹进响应式系统。这些属性会被代理到组件实例（
`this`）上，可通过`this`访问或修改：

```js
export default {
    data() {
        return {
            count: 1, // 声明响应式属性count
            user: {name: 'Alice', age: 20} // 嵌套对象也会被深层响应式处理
        }
    },
    mounted() {
        console.log(this.count) // 1（通过this访问响应式数据）
        this.count = 2 // 修改响应式数据，触发DOM更新
        this.user.age = 21 // 深层修改嵌套对象，同样触发更新
    }
}
```

**关键注意事项**：

- **必须预声明所有属性**：若后期通过`this.newProp = 'new'`添加属性，`newProp`不会是响应式的（因为Vue无法追踪未预声明的属性）。如需动态添加，可先在
  `data`中用`null/undefined`占位（如`newProp: null`）。
- **避免覆盖`this`的内置属性**：Vue用`$`（如`this.$emit`）和`_`（如`this._uid`）作为内置API的前缀，不要用这些字符开头命名
  `data`属性。

#### 1.2 响应式代理与原始对象的区别

Vue 3用**JavaScript Proxy**实现响应式（取代Vue 2的Object.defineProperty）。代理对象与原始对象是**不同的引用**
，修改原始对象不会触发响应式更新：

```js
export default {
    data() {
        return {
            someObject: {}
        }
    },
    mounted() {
        const newObject = {}
        this.someObject = newObject // 将代理指向newObject
        console.log(newObject === this.someObject) // false（this.someObject是代理）
        newObject.foo = 'bar' // 修改原始对象，不会触发DOM更新
        this.someObject.foo = 'bar' // 修改代理对象，触发更新
    }
}
```

**结论**：始终通过`this`访问响应式数据（即操作代理对象），而非原始对象。

### 二、Composition API中的响应式声明与操作

Composition API是Vue 3的推荐写法，更灵活、更适合复杂逻辑复用。核心API是`ref`和`reactive`。

#### 2.1 `ref()`：包裹任意值的响应式容器

`ref`用于包裹**基本类型**（如`number`、`string`）或**需要替换的对象**，返回一个带`value`属性的响应式对象。

##### 基本用法

```vue

<script setup>
  import {ref} from 'vue'

  // 声明ref：初始值0，count是一个ref对象
  const count = ref(0)

  // 修改ref的值：必须通过.value（JavaScript中）
  function increment() {
    count.value++
  }
</script>

<template>
  <!-- 模板中自动解包，不用写.value -->
  <button @click="increment">{{ count }}</button>
</template>
```

##### 关键细节

- **.value的作用**：Vue通过`ref.value`的`getter/setter`追踪响应式（`getter`时记录依赖，`setter`时触发更新）。
- **自动解包场景**：
    - 模板中的**顶级ref**（如上面的`count`）会自动解包；
    - 作为**响应式对象的属性**时（如`const state = reactive({ count })`，`state.count`会自动解包为`count.value`）。
- **非自动解包场景**：
    - 数组/集合中的ref（如`const books = reactive([ref('Vue Guide')])`，需用`books[0].value`访问）；
    - 嵌套对象中的ref（如`const obj = { id: ref(1) }`，模板中`{{ obj.id + 1 }}`不会解包，需解构`const { id } = obj`后使用
      `{{ id + 1 }}`）。

#### 2.2 `reactive()`：让对象本身变响应式

`reactive`用于将**对象类型**（对象、数组、Map/Set）转换为响应式代理，无需`value`属性即可直接修改：

```vue

<script setup>
  import {reactive} from 'vue'

  // 声明reactive对象：state是响应式代理
  const state = reactive({
    count: 0,
    user: {name: 'Bob'}
  })

  // 修改响应式数据：直接操作属性
  function increment() {
    state.count++
    state.user.name = 'Charlie' // 深层修改嵌套对象
  }
</script>

<template>
  <button @click="increment">{{ state.count }} - {{ state.user.name }}</button>
</template>
```

##### 局限性与规避方法

`reactive`有3个关键局限：

1. **不能包裹基本类型**：`reactive(1)`无效，需用`ref(1)`；
2. **不能替换整个对象**：若`state = reactive({ count: 1 })`，替换`state = { count: 2 }`会丢失响应式（代理引用被切断），需用
   `ref`包裹对象（`const state = ref({ count: 0 })`，修改`state.value = { count: 2 }`）；
3. **解构丢失响应式**：`const { count } = state`会将`count`变成普通变量，修改`count`不会触发更新。需用`toRefs`将`reactive`
   对象转为ref集合：
   ```js
   import { reactive, toRefs } from 'vue'
   const state = reactive({ count: 0 })
   const { count } = toRefs(state) // count是ref，保留响应式
   count.value++ // 触发更新
   ```

#### 2.3 深层响应式与浅响应式

`ref`和`reactive`默认会**深层递归**处理所有嵌套对象（即修改嵌套属性也会触发响应式）：

```js
const obj = ref({nested: {count: 0}, arr: ['foo']})
obj.value.nested.count++ // 触发更新
obj.value.arr.push('bar') // 触发更新
```

若需**优化性能**（如大对象无需深层响应式），可使用：

- `shallowRef`：仅追踪`.value`的变化（不处理嵌套对象）；
- `shallowReactive`：仅追踪对象的**顶级属性**变化（不处理嵌套对象）。

### 三、DOM更新的时机与`nextTick`

Vue修改响应式数据后，**DOM更新是异步的**（缓冲到“下一个tick”，避免多次修改导致重复更新）。若需等待DOM更新完成后操作DOM，需用
`nextTick`：

```vue

<script setup>
  import {ref, nextTick} from 'vue'

  const count = ref(0)

  async function increment() {
    count.value++
    // 等待DOM更新完成
    await nextTick()
    // 此时可安全访问更新后的DOM
    console.log(document.querySelector('.count').textContent) // 输出1
  }
</script>

<template>
  <span class="count">{{ count }}</span>
  <button @click="increment">Increment</button>
</template>
```

### 课后Quiz

#### 1. 为什么在Composition API中修改ref的值需要用`.value`？

**答案解析**：  
`ref`是一个**包裹值的对象**，Vue通过`ref.value`的`getter/setter`实现响应式：

- `getter`：当访问`ref.value`时，Vue记录当前组件作为依赖；
- `setter`：当修改`ref.value`时，Vue通知所有依赖组件重新渲染。  
  模板中`ref`会自动解包（即隐式访问`.value`），但JavaScript中必须显式写`.value`。

#### 2. 用`reactive`声明的对象，为什么不能直接替换整个引用？

**答案解析**：  
`reactive`返回的是**原始对象的代理**，Vue的响应式追踪基于这个代理的**属性访问**。若替换整个对象（如`state = { count: 1 }`
），新对象不是代理，Vue无法追踪其变化，导致DOM不更新。  
**解决方法**：用`ref`包裹对象（`const state = ref({ count: 0 })`），修改`state.value = { count: 1 }`（`ref.value`的变化会被追踪）。

#### 3. 修改响应式数据后，立即访问DOM得到旧值，如何解决？

**答案解析**：  
Vue的DOM更新是**异步缓冲**的（批量处理所有状态变化，避免重复渲染）。需用`nextTick`等待DOM更新完成：

```js
async function update() {
    count.value++
    await nextTick() // 等待下一个DOM更新周期
    // 此时DOM已更新
}
```

### 常见报错解决方案

#### 报错1：修改数据后DOM不更新

- **可能原因**：
    1. 数据未在响应式系统中声明（如`let count = 0`，未用`ref`包裹）；
    2. 替换了`reactive`对象的整个引用（如`state = { count: 1 }`）；
    3. 修改了未预声明的属性（如Options API中`this.newProp = 'new'`）。
- **解决方法**：
    1. 用`ref`/`reactive`声明所有响应式数据；
    2. 用`ref`包裹需要替换的对象（修改`ref.value`）；
    3. 在`data`中预声明属性（如`newProp: null`）。

#### 报错2：ref在模板中显示`[object Object]`

- **可能原因**：ref嵌套在对象中，且不是文本插值的**最终值**（如`{{ object.id + 1 }}`，`object.id`是ref）。
- **解决方法**：
    1. 解构ref为顶级属性（`const { id } = object`，然后`{{ id + 1 }}`）；
    2. 显式访问`.value`（不推荐，如`{{ object.id.value + 1 }}`）。

#### 报错3：解构`reactive`对象后，修改数据不触发更新

- **可能原因**：解构会将`reactive`属性转为普通变量（如`const { count } = state`，`count`是普通number）。
- **解决方法**：用`toRefs`将`reactive`对象转为ref集合：
  ```js
  import { reactive, toRefs } from 'vue'
  const state = reactive({ count: 0 })
  const { count } = toRefs(state) // count是ref，保留响应式
  count.value++ // 触发更新
  ```

参考链接：https://vuejs.org/guide/essentials/reactivity-fundamentals.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗](https://blog.cmdragon.cn/posts/654b9447ef1ba7ec1126a1bc26a4726d/)




<details>
<summary>往期文章归档</summary>

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
- [如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)

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