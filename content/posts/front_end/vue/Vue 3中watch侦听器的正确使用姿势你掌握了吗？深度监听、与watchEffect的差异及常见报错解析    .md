---
url: /posts/bc287e1e36287afd90750fd907eca85e/
title: Vue 3中watch侦听器的正确使用姿势你掌握了吗？深度监听、与watchEffect的差异及常见报错解析
date: 2025-11-10T01:48:00+08:00
lastmod: 2025-11-10T01:48:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/e69b2e3bc4a645ac8e4ac7602cd0591d~tplv-5jbd59dj06-image.png

summary:
  Vue 3中的侦听器（`watch`）用于响应式跟踪数据源变化，允许在数据改变时执行自定义副作用。通过`ref`或`reactive`创建响应式数据，`watch`可以监听单个或多个数据源的变化，并通过回调函数处理新旧值。高级选项如`deep`和`immediate`支持深度监听和立即执行。`watchEffect`则自动跟踪依赖，适合无需旧值的场景。侦听器常用于网络请求、表单验证等场景，需注意常见报错如旧值相同、深度监听不生效等。

categories:
  - vue

tags:
  - 基础入门
  - 侦听器
  - watch API
  - watchEffect
  - 响应式数据
  - 深度监听
  - 副作用

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/e69b2e3bc4a645ac8e4ac7602cd0591d~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 侦听器的基本用法

侦听器（`watch`）是Vue 3中用于**响应式跟踪数据源变化**的核心API，它允许你在响应式数据改变时执行自定义副作用（如发请求、更新DOM、日志记录等）。其核心逻辑是：
**明确指定要监听的“源”，并定义“变化时的回调”**。

#### 1.1 监听单个ref源

`ref`是Vue 3中最基础的响应式包装器，监听`ref`的语法非常直观——直接将`ref`对象作为`watch`的第一个参数：

```vue

<script setup>
  import {ref, watch} from 'vue'

  // 响应式数据：计数器
  const count = ref(0)

  // 侦听器：监听count的变化
  watch(count, (newValue, oldValue) => {
    console.log(`计数器从 ${oldValue} 变到了 ${newValue}`)
    // 这里可以执行任何副作用，比如更新页面标题
    document.title = `Count: ${newValue}`
  })
</script>

<template>
  <button @click="count++">点击增加（当前：{{ count }}）</button>
</template>
```

**关键说明**：

- `watch`的第一个参数是**监听源**（这里是`count`）；
- 第二个参数是**变化回调**，接收两个参数：`newValue`（变化后的值）、`oldValue`（变化前的值）；
- 点击按钮时，`count`变化会触发回调，修改页面标题。

#### 1.2 监听reactive对象的属性

对于`reactive`创建的响应式对象，**不能直接监听整个对象的属性**（会丢失响应式跟踪），需要用**getter函数**返回要监听的属性：

```vue

<script setup>
  import {reactive, watch} from 'vue'

  // 响应式对象：用户状态
  const user = reactive({
    name: 'Alice',
    age: 25
  })

  // 侦听器：监听user.name的变化
  watch(
      () => user.name, // getter函数：返回要监听的属性
      (newName, oldName) => {
        console.log(`用户名从 ${oldName} 改为 ${newName}`)
      }
  )
</script>

<template>
  <input v-model="user.name" placeholder="修改用户名"/>
</template>
```

**为什么要用getter？**  
`reactive`对象的属性是“响应式代理”，直接写`user.name`会返回原始值，无法被`watch`跟踪。getter函数会让Vue感知到“这个属性需要被跟踪”。

#### 1.3 监听多个源

`watch`支持同时监听**多个响应式源**，只需将源包装成数组即可。回调函数的参数会对应数组的新值和旧值：

```vue

<script setup>
  import {ref, reactive, watch} from 'vue'

  const count = ref(0)
  const user = reactive({name: 'Alice'})

  // 监听count和user.name两个源
  watch(
      [count, () => user.name], // 源数组
      ([newCount, newName], [oldCount, oldName]) => { // 新值数组、旧值数组
        console.log(`计数器：${oldCount} → ${newCount}；用户名：${oldName} → ${newName}`)
      }
  )
</script>
```

### 2. 侦听器的高级选项

`watch`还支持通过**选项对象**（第三个参数）配置更灵活的行为，常见选项有`deep`（深度监听）、`immediate`（立即执行）。

#### 2.1 深度监听（`deep: true`）

当监听的源是**嵌套对象**时，默认情况下`watch`只会跟踪“对象引用”的变化，不会跟踪“嵌套属性”的变化。需要开启`deep: true`
来监听嵌套属性：

```vue

<script setup>
  import {reactive, watch} from 'vue'

  // 嵌套响应式对象：商品信息
  const product = reactive({
    id: 1,
    info: {
      name: 'Vue 3 实战',
      price: 99 // 嵌套属性
    }
  })

  // 深度监听product.info的变化
  watch(
      () => product.info,
      (newInfo, oldInfo) => {
        console.log(`商品信息更新：价格从 ${oldInfo.price} 变为 ${newInfo.price}`)
      },
      {deep: true} // 开启深度监听
  )
</script>

<template>
  <input v-model.number="product.info.price" placeholder="修改价格"/>
</template>
```

**注意**：深度监听会遍历对象的所有嵌套属性，性能开销较大，尽量只在必要时使用（比如确实需要跟踪嵌套变化）。

#### 2.2 立即执行（`immediate: true`）

默认情况下，`watch`只会在**源第一次变化时**执行回调。如果需要**初始挂载时就执行一次**（比如初始化时拉取数据），可以加
`immediate: true`：

```vue

<script setup>
  import {ref, watch} from 'vue'

  const keyword = ref('Vue')

  // 立即执行：页面加载时先查一次“Vue”的搜索结果
  watch(
      keyword,
      async (newKeyword) => {
        const res = await fetch(`https://api.example.com/search?q=${newKeyword}`)
        const data = await res.json()
        console.log('搜索结果：', data)
      },
      {immediate: true}
  )
</script>
```

**应用场景**：初始化时根据默认值加载数据（比如搜索页的默认关键词）。

### 3. watch vs watchEffect：核心差异与选择

Vue 3还提供了`watchEffect`，它和`watch`的核心差异在于**依赖跟踪的方式**，选择哪个取决于你的需求：

#### 3.1 核心差异对比

| 特性   | `watch`             | `watchEffect`     |
|------|---------------------|-------------------|
| 依赖跟踪 | 手动指定监听源（显式）         | 自动跟踪回调中使用的所有源（隐式） |
| 初始执行 | 默认不执行（需`immediate`） | 挂载时立即执行一次         |
| 旧值获取 | 支持（回调参数有`oldValue`） | 不支持（只关注当前值）       |
| 适用场景 | 需要明确控制监听源、需要旧值      | 只需响应依赖变化、无需旧值     |

#### 3.2 代码示例对比

```vue

<script setup>
  import {ref, watch, watchEffect} from 'vue'

  const count = ref(0)
  const message = ref('Hello')

  // 使用watch：显式监听count
  watch(count, (newVal, oldVal) => {
    console.log(`count从 ${oldVal} 变到 ${newVal}`)
  })

  // 使用watchEffect：自动跟踪count和message
  watchEffect(() => {
    console.log(`当前count：${count.value}，message：${message.value}`)
  })
</script>
```

**执行结果**：

- 页面加载时，`watchEffect`立即执行，输出`当前count：0，message：Hello`；
- 点击按钮修改`count`，`watch`和`watchEffect`都会触发；
- 修改`message`，只有`watchEffect`触发（因为它自动跟踪了`message`）。

### 4. 实践中的应用场景

侦听器的价值在于**将“数据变化”与“副作用”解耦**，以下是几个常见的实际场景：

#### 4.1 数据变化时发起网络请求

比如用户选择城市后，自动加载该城市的天气：

```vue

<script setup>
  import {ref, watch} from 'vue'

  const city = ref('北京')
  const weather = ref('')

  // 监听city变化，加载天气
  watch(city, async (newCity) => {
    const res = await fetch(`https://api.example.com/weather?city=${newCity}`)
    const data = await res.json()
    weather.value = data.weather
  })
</script>

<template>
  <select v-model="city">
    <option value="北京">北京</option>
    <option value="上海">上海</option>
    <option value="广州">广州</option>
  </select>
  <p>当前天气：{{ weather }}</p>
</template>
```

#### 4.2 表单输入的实时验证

比如注册页的密码强度校验：

```vue

<script setup>
  import {ref, watch} from 'vue'

  const password = ref('')
  const passwordError = ref('')

  // 实时验证密码强度
  watch(password, (newPwd) => {
    if (newPwd.length < 6) {
      passwordError.value = '密码必须至少6位'
    } else if (!/[A-Z]/.test(newPwd)) {
      passwordError.value = '密码必须包含大写字母'
    } else {
      passwordError.value = ''
    }
  })
</script>

<template>
  <input type="password" v-model="password" placeholder="输入密码"/>
  <p class="error" v-if="passwordError">{{ passwordError }}</p>
</template>
```

### 5. 课后Quiz

通过以下问题巩固所学知识（答案基于Vue官网文档）：

#### 问题1：如何监听reactive对象中的嵌套属性（如`state.user.address.city`）？请写出代码示例。

**答案**：使用getter函数返回嵌套属性（显式指定监听源）：

```javascript
const state = reactive({
    user: {
        address: {
            city: 'Beijing'
        }
    }
})

// 正确写法：用getter返回嵌套属性
watch(
    () => state.user.address.city,
    (newCity, oldCity) => {
        console.log(`城市从 ${oldCity} 改为 ${newCity}`)
    }
)
```

**错误写法**：直接写`state.user.address.city`（会丢失响应式跟踪）。

#### 问题2：`watch`和`watchEffect`的核心区别是什么？请列举两点。

**答案**：

1. **依赖跟踪方式**：`watch`需要手动指定监听源（显式），`watchEffect`自动跟踪回调中使用的所有源（隐式）；
2. **初始执行时机**：`watch`默认不执行（需`immediate`选项），`watchEffect`挂载时立即执行一次。

### 6. 常见报错与解决方案

#### 报错1：监听reactive对象时，旧值与新值相同

**现象**：修改`reactive`对象的属性后，`watch`回调中的`oldValue`和`newValue`完全一样。  
**原因**：`reactive`返回的是**代理对象**，修改属性不会改变对象的引用，因此`oldValue`和`newValue`指向同一个对象。  
**解决方法**：

- 若需监听单个属性，用`getter`函数返回属性（如`() => state.count`），此时`oldValue`会是原始值；
- 若需监听整个对象，手动保存旧值（适用于简单场景）：
  ```javascript
  const state = reactive({ count: 0 })
  let oldCount = state.count // 手动保存旧值

  watch(
    () => state.count,
    (newCount) => {
      console.log(`旧值：${oldCount}，新值：${newCount}`)
      oldCount = newCount // 更新旧值
    }
  )
  ```

#### 报错2：深度监听不生效

**现象**：修改`reactive`对象的嵌套属性，`watch`回调不触发。  
**原因**：未开启`deep: true`选项，`watch`默认只跟踪对象的**引用变化**，不跟踪嵌套属性。  
**解决方法**：在`watch`的选项中添加`deep: true`：

```javascript
watch(
    () => state.user,
    (newUser, oldUser) => {
        console.log('用户信息更新：', newUser)
    },
    {deep: true} // 必须加！
)
```

#### 报错3：`immediate: true`时旧值为`undefined`

**现象**：开启`immediate`后，第一次执行回调时`oldValue`是`undefined`。  
**原因**：`immediate`让回调在**挂载时立即执行**，此时还没有“旧值”（第一次执行）。  
**解决方法**：

- 若不需要旧值，忽略即可；
- 若需要初始值，手动处理（比如用`ref`保存初始值）：
  ```javascript
  const keyword = ref('Vue')
  const initialKeyword = keyword.value // 保存初始值

  watch(
    keyword,
    (newKeyword, oldKeyword) => {
      if (oldKeyword === undefined) {
        console.log(`初始关键词：${initialKeyword}`)
      } else {
        console.log(`关键词从 ${oldKeyword} 改为 ${newKeyword}`)
      }
    },
    { immediate: true }
  )
  ```

### 参考链接

- Vue官网：侦听器基础 → https://vuejs.org/guide/essentials/watchers.html
- Vue官网：`watch` vs `watchEffect` → https://vuejs.org/guide/essentials/watchers.html#watcheffect
- Vue官网：侦听器选项 → https://vuejs.org/guide/essentials/watchers.html#watcher-options

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3中watch侦听器的正确使用姿势你掌握了吗？深度监听、与watchEffect的差异及常见报错解析](https://blog.cmdragon.cn/posts/bc287e1e36287afd90750fd907eca85e/)



<details>
<summary>往期文章归档</summary>

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