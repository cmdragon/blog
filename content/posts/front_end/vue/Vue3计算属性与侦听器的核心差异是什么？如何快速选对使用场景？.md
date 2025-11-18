---
url: /posts/a3f61c0d0716076afa903acea2d5a9bf/
title: Vue3计算属性与侦听器的核心差异是什么？如何快速选对使用场景？
date: 2025-11-19T00:16:25+08:00
lastmod: 2025-11-19T00:16:25+08:00
author: cmdragon
cover: /images/43babac6b1694cb6a249bd46f9e42c7b~tplv-5jbd59dj06-image.png

summary:
  Vue3中，计算属性（Computed）用于生成衍生值并缓存结果，适合处理字符串拼接、数值计算等场景，依赖变化时自动更新。侦听器（Watch/WatchEffect）用于执行副作用操作，如异步请求、DOM修改等，`watch`精准控制触发时机，`watchEffect`自动追踪依赖并立即执行。两者核心区别在于计算属性生成衍生值且有缓存，侦听器执行副作用且无缓存。选择策略：需要衍生值用计算属性，需要副作用用侦听器。

categories:
  - vue

tags:
  - 基础入门
  - 计算属性
  - 侦听器
  - 响应式数据
  - 缓存机制
  - 副作用操作
  - 性能优化

---

<img src="/images/43babac6b1694cb6a249bd46f9e42c7b~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 计算属性：响应式数据的“衍生咖啡机”

在Vue3中，计算属性（Computed）是处理**衍生值**
的“神器”——它基于响应式依赖自动计算结果，并缓存这个结果。只有当依赖的响应式数据发生变化时，计算属性才会重新计算；否则，它会直接复用之前的缓存结果，避免不必要的性能消耗。

#### 核心特性：缓存与依赖追踪

计算属性的本质是**纯函数**（输入相同则输出相同，无副作用），它的缓存机制是其与普通方法的核心区别。比如，我们需要将用户的
`firstName`和`lastName`合并为完整姓名：

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John') // 响应式依赖1
const lastName = ref('Doe')   // 响应式依赖2

// 计算属性：基于依赖衍生完整姓名
const fullName = computed(() => {
  console.log('计算fullName...') // 仅当依赖变化时打印
  return `${firstName.value} ${lastName.value}`
})
</script>

<template>
  <p>{{ fullName }}</p> <!-- 首次渲染时计算，之后依赖不变则复用缓存 -->
  <p>{{ fullName }}</p> <!-- 复用缓存，不重新计算 -->
</template>
```

运行这段代码，你会发现`console.log`只执行一次——即使模板中多次使用`fullName`，计算属性也不会重复计算。而如果用普通方法（
`function getFullName() { ... }`），每次渲染都会执行函数，当页面复杂时会明显影响性能。

#### 典型场景：需要缓存的衍生值

计算属性适合以下场景：

- 字符串拼接（如`fullName`）
- 数值计算（如购物车总价`totalPrice`）
- 列表过滤（如`filteredList`，但注意：如果列表是大型数组，过滤操作本身的性能消耗可能超过缓存的收益，此时需权衡）

### 侦听器：响应式数据的“变化报警器”

如果说计算属性是“安静的衍生者”，侦听器（Watch/WatchEffect）就是“活跃的响应者”——它专门处理**副作用操作**
（如异步请求、DOM修改、日志记录等非纯函数操作）。当监听的响应式数据变化时，侦听器会触发预先定义的回调函数，执行这些副作用。

Vue3提供两种侦听器：`watch`（精准监听）和`watchEffect`（自动追踪）。

#### `watch`：精准控制的“定点报警器”

`watch`是**惰性**的——默认情况下，只有当监听的数据源发生变化时才会执行回调。它适合需要**明确控制触发时机**的场景，比如：

- 监听用户输入并发起搜索请求（避免初始空请求）
- 验证密码一致性（仅当确认密码变化时触发）

```vue
<script setup>
import { ref, watch } from 'vue'

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

// 监听confirmPassword的变化，验证密码一致性
watch(confirmPassword, (newVal, oldVal) => {
  if (newVal !== password.value) {
    passwordError.value = '两次密码不一致'
  } else {
    passwordError.value = ''
  }
})
</script>

<template>
  <input v-model="password" type="password" placeholder="密码" />
  <input v-model="confirmPassword" type="password" placeholder="确认密码" />
  <p class="error">{{ passwordError }}</p>
</template>
```

`watch`的进阶用法：

- **监听多个数据源**：`watch([a, b], (newValues, oldValues) => { ... })`
- **深度监听对象**：`watch(() => user.value.address, (newAddr) => { ... }, { deep: true })`（监听对象内部属性变化）
- **立即执行**：`watch(..., { immediate: true })`（初始化时就执行一次回调）

#### `watchEffect`：自动追踪的“智能报警器”

`watchEffect`是**立即执行**的，并且会自动追踪回调函数中的响应式依赖。它适合需要**快速响应多个依赖**的场景，比如：

- 监听窗口尺寸变化并更新页面标题
- 监听表单输入并实时保存草稿

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

// 自动追踪width和height的变化，更新页面标题
watchEffect(() => {
  document.title = `窗口尺寸：${width.value}x${height.value}`
})

// 监听窗口resize事件，更新响应式数据
window.addEventListener('resize', () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
})
</script>
```

`watchEffect`的优势是**简洁**——不需要显式指定监听的数据源，Vue会自动收集回调中的响应式依赖。但它的缺点也很明显：无法直接获取旧值（因为依赖是自动追踪的），且无法精准控制监听的数据源。

### 计算属性 vs 侦听器：清晰的功能边界

很多初学者会混淆计算属性和侦听器，其实它们的核心区别在于**“做什么”**，而非**“怎么用”**。我们可以用一张表格明确两者的边界：

| **维度**   | **计算属性（Computed）**                  | **侦听器（Watch/WatchEffect）**         |
|----------|-------------------------------------|------------------------------------|
| **核心目标** | 生成**衍生值**（如`fullName`、`totalPrice`） | 执行**副作用**（如异步请求、DOM操作）             |
| **函数性质** | 纯函数（无副作用、输入决定输出）                    | 非纯函数（有副作用、可能依赖外部环境）                |
| **缓存机制** | 有缓存（依赖不变则复用结果）                      | 无缓存（每次触发都执行回调）                     |
| **触发时机** | 依赖变化时自动更新                           | 数据变化时触发（`watch`惰性，`watchEffect`立即） |
| **旧值获取** | 无法直接获取旧值                            | `watch`可以获取旧值，`watchEffect`不能      |

#### 直观例子：区分衍生值与副作用

- **衍生值**：根据`age`计算`isAdult`（`age >= 18`）——用计算属性。
- **副作用**：当`isAdult`变化时，发送请求更新用户权限——用侦听器。

### 选择策略：一句话搞定“该用谁”

记住这个简单的判断逻辑，90%的场景都能快速决策：

1. **如果需要“衍生值 + 缓存”**：用计算属性（Computed）。  
   比如：购物车总价、用户名拼接、状态判断（`isAdult`）。
2. **如果需要“副作用 + 联动”**：用侦听器（Watch/WatchEffect）。
    - 若需要**精准控制触发时机/获取旧值**：用`watch`（比如验证密码一致性、搜索请求）。
    - 若需要**自动追踪依赖/立即执行**：用`watchEffect`（比如更新页面标题、实时保存草稿）。

### 实战示例：购物车与搜索功能的组合

我们用一个综合示例展示两者的配合——实现一个带搜索功能的购物车：

```vue
<script setup>
import { ref, computed, watch } from 'vue'

// 1. 响应式数据：购物车列表
const cart = ref([
  { id: 1, name: 'Vue3实战指南', price: 59, quantity: 1 },
  { id: 2, name: 'TypeScript手册', price: 79, quantity: 2 },
  { id: 3, name: '前端工程化', price: 99, quantity: 1 }
])

// 2. 计算属性：购物车总价（衍生值 + 缓存）
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 3. 侦听器：搜索功能（副作用 + 联动）
const searchQuery = ref('') // 搜索关键词
const filteredCart = ref([...cart.value]) // 过滤后的购物车

// 监听搜索关键词变化，过滤购物车
watch(searchQuery, (newQuery) => {
  filteredCart.value = cart.value.filter(item => 
    item.name.toLowerCase().includes(newQuery.toLowerCase())
  )
}, { immediate: true }) // 初始化时立即过滤

// 辅助方法：修改商品数量
const updateQuantity = (id, newQty) => {
  const item = cart.value.find(i => i.id === id)
  if (item) item.quantity = newQty
}
</script>

<template>
  <div class="cart-container">
    <!-- 搜索栏 -->
    <input 
      v-model="searchQuery" 
      placeholder="搜索商品..." 
      class="search-input"
    />

    <!-- 购物车列表 -->
    <div class="cart-items">
      <div 
        v-for="item in filteredCart" 
        :key="item.id" 
        class="cart-item"
      >
        <h4>{{ item.name }}</h4>
        <p>价格：{{ item.price }}元</p>
        <input 
          type="number" 
          v-model.number="item.quantity" 
          @input="updateQuantity(item.id, item.quantity)"
          class="quantity-input"
        />
      </div>
    </div>

    <!-- 总价 -->
    <div class="total-price">
      总价：{{ totalPrice }}元
    </div>
  </div>
</template>

<style scoped>
.cart-container { max-width: 600px; margin: 20px auto; }
.search-input { width: 100%; padding: 8px; margin-bottom: 15px; }
.cart-item { border-bottom: 1px solid #eee; padding: 10px 0; }
.quantity-input { width: 60px; padding: 4px; }
.total-price { font-size: 1.2em; font-weight: bold; margin-top: 10px; }
</style>
```

这个示例中：

- `totalPrice`用计算属性：因为它是`cart`的衍生值，需要缓存（避免每次渲染都重新计算总价）。
- 搜索功能用`watch`：因为搜索是**副作用操作**（修改`filteredCart`），且需要**初始化时立即执行**（`immediate: true`
  ），确保页面加载时就显示过滤后的结果。

### 课后Quiz：巩固你的理解

#### 问题1：以下场景适合用计算属性还是侦听器？为什么？

场景：根据用户选择的“主题色”（`themeColor`）和“字体大小”（`fontSize`），生成CSS变量（`--main-color`、`--font-size`
），并当CSS变量变化时，自动更新页面的样式。

#### 答案解析：

- **生成CSS变量**：适合用计算属性。因为CSS变量是`themeColor`和`fontSize`的**衍生值**，需要缓存（避免重复生成相同的CSS字符串）。
- **更新页面样式**：适合用侦听器。因为修改页面样式是**DOM副作用操作**，需要在CSS变量变化时触发。

具体实现：

```javascript
const themeColor = ref('#2c3e50')
const fontSize = ref('16px')

// 计算属性：生成CSS变量字符串
const cssVars = computed(() => {
  return `--main-color: ${themeColor.value}; --font-size: ${fontSize.value};`
})

// 侦听器：更新页面样式
watch(cssVars, (newVars) => {
  document.documentElement.style.cssText = newVars
}, { immediate: true })
```

#### 问题2：`watch`的`deep: true`选项会影响性能吗？为什么？

#### 答案解析：

会影响性能。因为`deep: true`会让Vue**递归遍历对象的所有属性**，监听每个属性的变化。如果对象很大（比如有多层嵌套的属性），递归遍历会消耗较多的性能。

**优化建议**：优先使用**函数式监听**（`watch(() => obj.value.prop, ...)`）代替`deep: true`，因为函数式监听只会监听指定的属性，而非整个对象。

### 常见报错与解决方案

在使用计算属性和侦听器时，初学者常遇到以下问题：

#### 报错1：计算属性无限循环

**错误表现**：`Maximum recursive updates exceeded`（超过最大递归更新次数）。  
**原因**：计算属性中修改了自身的依赖，导致无限循环。比如：

```javascript
const count = ref(0)
// 错误：计算属性修改了依赖count
const double = computed(() => {
  count.value++ // 禁止！计算属性不能修改响应式依赖
  return count.value * 2
})
```

**解决**：计算属性必须是**纯函数**，不能修改任何响应式数据。如果需要修改数据，用侦听器代替。

#### 报错2：`watch`监听对象不触发

**错误表现**：修改对象的属性时，`watch`没有触发。  
**原因**：`watch`默认只监听对象的**引用变化**（即`obj = newObj`），不监听对象内部属性的变化（如
`obj.value.name = 'newName'`）。  
**解决**：

1. 使用**函数式监听**（推荐）：`watch(() => obj.value.name, ...)`（监听对象的具体属性）。
2. 使用`deep: true`：`watch(obj, ..., { deep: true })`（监听整个对象的所有属性变化，适合对象较小的场景）。

#### 报错3：`watchEffect`无法获取旧值

**错误表现**：需要旧值但无法获取，比如：

```javascript
const count = ref(0)
watchEffect(() => {
  console.log('旧值：', ???, '新值：', count.value) // 无法获取旧值
})
```

**原因**：`watchEffect`是**自动追踪依赖**的，Vue无法预先知道哪些依赖会变化，因此无法保存旧值。  
**解决**：如果需要旧值，改用`watch`：

```javascript
watch(count, (newVal, oldVal) => {
  console.log('旧值：', oldVal, '新值：', newVal)
})
```

参考链接：

- Vue3计算属性：https://vuejs.org/guide/essentials/computed.html
- Vue3侦听器：https://vuejs.org/guide/essentials/watchers.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3计算属性与侦听器的核心差异是什么？如何快速选对使用场景？](https://blog.cmdragon.cn/posts/a3f61c0d0716076afa903acea2d5a9bf/)



<details>
<summary>往期文章归档</summary>

- [Vue 3中计算属性与方法的使用边界你理清了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a44ac8daed86ce6d69fee6fe54bc14f6/)
- [Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/)
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