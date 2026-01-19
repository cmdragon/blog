---
url: /posts/3687a5437ab56cb082b5b813d5577a40/
title: Vue3响应式系统如何支撑表单数据的集中管理、动态扩展与实时计算？
date: 2026-01-19T05:10:51+08:00
lastmod: 2026-01-19T05:10:51+08:00
author: cmdragon
cover: /images/generated_image_440950dc-3626-44da-996d-7e532e036a06.png

summary:
  Vue3表单处理技巧包括：①集中管理用reactive定义响应式表单对象，对比ref适用场景；②动态表单用响应式数组存储项，通过v-for渲染，结合数组方法实现增删；③即时计算用computed追踪依赖，如购物车总价实时更新，需用v-model.number确保数字计算正确。

categories:
  - vue

tags:
  - 基础入门
  - 表单处理
  - 响应式
  - v-model
  - computed
  - reactive
  - 动态表单

---

<img src="/images/generated_image_440950dc-3626-44da-996d-7e532e036a06.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 表单数据收集与响应式处理

在前端开发中，**表单**
是连接用户与系统的核心桥梁——从用户注册、收货地址填写到购物车结算，几乎所有用户交互都离不开表单。Vue3的响应式系统为表单数据的管理提供了极为灵活的方案，能帮我们轻松实现「数据变更→视图更新→数据收集」的闭环。今天我们就从
**集中管理**、**动态扩展**、**即时计算**三个维度，彻底掌握Vue3的表单处理技巧。

## 一、表单数据的集中管理：用ref/reactive打造「数据仓库」

假设你要做一个**登录表单**，需要收集用户名和密码。如果用原生JS，你可能会给每个输入框绑定`oninput`事件，手动更新变量——但在Vue3中，我们可以用
**响应式对象**把表单数据「集中存放」，让Vue自动帮我们同步视图和数据。

### 1.1 为什么要用「集中管理」？

想象一下：如果表单有10个字段（比如注册表单的用户名、密码、邮箱、手机号、验证码…），你难道要定义10个`let`变量，再写10个事件处理函数？显然不现实。
**集中管理**的核心优势是：

- 所有表单数据存放在一个对象里，逻辑更清晰；
- 修改数据时，视图自动更新（响应式）；
- 提交时直接拿整个对象，不用逐个收集字段。

### 1.2 用reactive定义「表单对象」

Vue3中，`reactive`是处理**复杂对象/数组**的首选——它会把普通对象转换成「响应式代理」，任何修改都会触发视图更新。

来看登录表单的示例：

```vue

<script setup>
  // 1. 导入reactive
  import {reactive} from 'vue'

  // 2. 定义响应式表单对象（初始化所有字段）
  const form = reactive({
    username: '', // 用户名（默认空字符串）
    password: ''  // 密码（默认空字符串）
  })

  // 3. 提交事件处理函数
  const handleSubmit = (e) => {
    e.preventDefault() // 阻止表单默认刷新
    console.log('要提交的数据：', form) // 直接拿整个form对象
  }
</script>

<template>
  <form @submit="handleSubmit">
    <!-- 4. 用v-model绑定form的属性 -->
    <div>
      <label>用户名：</label>
      <input v-model="form.username" placeholder="请输入用户名"/>
    </div>
    <div>
      <label>密码：</label>
      <input v-model="form.password" type="password" placeholder="请输入密码"/>
    </div>
    <button type="submit">登录</button>
  </form>
</template>
```

### 1.3 用ref还是reactive？

如果表单只有1-2个字段（比如「搜索框」只需要`keyword`），可以用`ref`（更简洁）；但如果字段≥3个，**优先用reactive**——因为`ref`需要通过
`value`访问属性（比如`form.value.username`），而`reactive`可以直接写`form.username`，更符合直觉。

举个`ref`的例子（对比用）：

```javascript
import {ref} from 'vue'

const form = ref({username: '', password: ''})
// 访问时需要form.value.username
```

## 二、动态表单：用数组绑定实现「可增可删」的表单项

实际开发中，我们常遇到**动态表单**——比如「添加收货地址」（用户可以添加多个地址）、「多联系人信息」（填写多个紧急联系人）。这时候，我们需要用
**响应式数组**来存储动态项，配合`v-for`循环渲染。

### 2.1 场景：多收货地址输入

假设你要做一个「电商收货地址管理」功能，用户可以**添加/删除**多个收货地址，每个地址包含「姓名、电话、地址」三个字段。

### 2.2 实现步骤：数组+v-for+v-model

```vue

<script setup>
  import {reactive} from 'vue'

  // 1. 用reactive数组存储地址列表（默认一个空地址）
  const addresses = reactive([
    {name: '', phone: '', address: ''}
  ])

  // 2. 新增地址：往数组里push一个空对象
  const addAddress = () => {
    addresses.push({name: '', phone: '', address: ''})
  }

  // 3. 删除地址：根据索引删除对应的项
  const removeAddress = (index) => {
    addresses.splice(index, 1) // splice(索引, 删除数量)
  }
</script>

<template>
  <!-- 4. 用v-for循环渲染每个地址项 -->
  <div
      v-for="(addr, index) in addresses"
      :key="index"  <!-- 用索引当key（简单场景可用，复杂场景建议用唯一id） -->
  style="margin-bottom: 10px;"
  >
  <input v-model="addr.name" placeholder="姓名"/>
  <input v-model="addr.phone" placeholder="电话"/>
  <input v-model="addr.address" placeholder="地址" style="width: 200px;"/>
  <button @click="removeAddress(index)">删除</button>
  </div>

  <!-- 5. 新增按钮 -->
  <button @click="addAddress">+ 添加新地址</button>
</template>
```

### 2.3 关键知识点解析

- **为什么用reactive数组？**  
  `addresses`是`reactive`包裹的数组，所以`push`（新增）、`splice`（删除）等操作都会触发视图更新——如果用普通数组（
  `let addresses = []`），修改数组不会触发响应式！

- **v-for的key为什么用index？**  
  简单场景下（没有复杂的排序/过滤），用索引当`key`是没问题的；但如果你的地址列表需要「排序」或「跨页展示」，建议给每个地址加一个*
  *唯一id**（比如`{ id: Date.now(), name: '', ... }`），避免`v-for`渲染错误。

- **如何保证新增项是响应式的？**  
  我们`push`的是**普通对象**（`{ name: '', ... }`），但因为`addresses`是`reactive`数组，Vue会自动把这个对象转换成响应式代理——所以修改
  `addr.name`时，视图会实时更新！

## 三、表单即时更新：用计算属性实现「实时计算」

很多表单需要「即时反馈」——比如购物车的「总价计算」、注册表单的「密码强度检测」、订单的「优惠后金额」。这些场景下，**
计算属性（computed）**是最佳选择：它会「依赖追踪」，当依赖的响应式数据变化时，自动重新计算结果。

### 3.1 场景：购物车总价实时计算

假设你有一个购物车，每个商品有「名称、单价、数量」三个字段，需要实时计算「总价」（总价=单价×数量之和）。

### 3.2 实现：computed+reduce

```vue

<script setup>
  import {reactive, computed} from 'vue'

  // 1. 购物车数据（响应式数组）
  const cart = reactive({
    items: [
      {name: 'Vue3实战教程', price: 99, quantity: 1},
      {name: 'Vue3组件库', price: 199, quantity: 1}
    ]
  })

  // 2. 计算属性：实时计算总价
  const totalPrice = computed(() => {
    // reduce：遍历数组，累加每一项的（单价×数量）
    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0) // 初始值为0
  })
</script>

<template>
  <div>
    <h3>购物车</h3>
    <!-- 3. 循环渲染商品项 -->
    <div v-for="(item, index) in cart.items" :key="item.name">
      <span>{{ item.name }}</span>
      <!-- v-model.number：把输入值转成数字（避免字符串拼接） -->
      <input v-model.number="item.quantity" type="number" min="1" style="width: 50px;"/>
      <span>单价：￥{{ item.price }}</span>
    </div>
    <!-- 4. 显示总价（computed属性） -->
    <p style="font-weight: bold;">总价：￥{{ totalPrice }}</p>
  </div>
</template>
```

### 3.3 关键知识点解析

- **computed的「依赖追踪」**：  
  `totalPrice`依赖`cart.items`中的`price`和`quantity`——当用户修改任何一个商品的数量时，`totalPrice`会自动重新计算，视图也会实时更新。

- **v-model.number的作用**：  
  输入框的默认值是**字符串**，如果直接用`v-model="item.quantity"`，修改数量时会变成`"2"`（字符串），计算`price * quantity`
  时会变成`99 * "2" = "198"`（字符串拼接）。用`v-model.number`可以把输入值强制转成**数字**，避免计算错误。

- **computed vs methods**：  
  计算属性是「缓存的」——只有依赖项变化时才会重新计算；而`methods`每次调用都会重新执行。比如总价计算，用`computed`性能更好！

## 四、课后Quiz：巩固你的理解

### 问题1：

在动态表单中，为什么要用`reactive`数组而不是普通数组？如果用普通数组会有什么问题？

**答案解析**：  
`reactive`数组是**响应式代理**，修改数组的方法（`push`/`splice`/`pop`等）会触发视图更新；而普通数组的修改（比如
`arr.push(...)`）不会触发响应式，视图不会更新。

比如：

```javascript
// 普通数组：修改后视图不更新
let addresses = []
addresses.push({name: ''}) // 视图没反应

// reactive数组：修改后视图更新
const addresses = reactive([])
addresses.push({name: ''}) // 视图新增一项
```

### 问题2：

为什么计算属性`totalPrice`不能直接赋值？比如`totalPrice = 100`会报错？

**答案解析**：  
计算属性默认是**只读的**（只有`getter`），不能直接赋值。如果需要「可写的计算属性」，要同时定义`getter`和`setter`：

```javascript
const totalPrice = computed({
    get() {
        return cart.items.reduce(...)
    },
    set(value) {
        // 这里可以处理赋值逻辑（比如平分到每个商品的数量）
        const average = value / cart.items.length
        cart.items.forEach(item => item.quantity = average)
    }
})
```

## 五、常见报错解决方案

在表单开发中，你可能会遇到以下3个高频错误，提前帮你踩坑！

### 错误1：`Cannot read properties of undefined (reading 'username')`

- **原因**：表单对象未初始化，导致访问`form.username`时`form`是`undefined`。  
  比如：`const form = ref()`（没给默认值），或者`const form = reactive()`（没定义`username`属性）。
- **解决**：初始化表单对象时，必须定义所有需要的字段：
  ```javascript
  const form = reactive({
    username: '', // 必须定义！
    password: ''
  })
  ```

### 错误2：`v-model cannot be used on an object with no properties`

- **原因**：`v-model`绑定的属性不存在于响应式对象中。  
  比如：`const form = reactive({})`（空对象），然后`v-model="form.username"`——Vue3不会自动给响应式对象添加新属性（Vue2会，但Vue3更严格）。
- **解决**：初始化时**提前定义所有字段**，不要动态添加。

### 错误3：`Computed property 'totalPrice' was assigned to but it has no setter`

- **原因**：试图给「只读计算属性」赋值（比如`totalPrice = 100`）。
- **解决**：
    1. 如果不需要修改计算属性，删除赋值操作（计算属性本来就是用来「计算」的，不是「存储」的）；
    2. 如果需要可写，给计算属性加`setter`（参考3.3节的例子）。

## 参考链接

- Vue3响应式基础：https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- Vue3表单绑定：https://vuejs.org/guide/essentials/forms.html
- Vue3列表渲染：https://vuejs.org/guide/essentials/list.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3响应式系统如何支撑表单数据的集中管理、动态扩展与实时计算？](https://blog.cmdragon.cn/posts/3687a5437ab56cb082b5b813d5577a40/)



<details>
<summary>往期文章归档</summary>

- [Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？](https://blog.cmdragon.cn/posts/ad67c4eb6d76cf7707bdfe6a8146c34f/)
- [Vue3表单事件处理：v-model如何实现数据绑定、验证与提交？](https://blog.cmdragon.cn/posts/1c1e80d697cca0923f29ec70ebb8ccd1/)
- [Vue应用如何基于DOM事件传播机制与事件修饰符实现高效事件处理？](https://blog.cmdragon.cn/posts/b990828143d70aa87f9aa52e16692e48/)
- [Vue3中如何在调用事件处理函数时同时传递自定义参数和原生DOM事件？参数顺序有哪些注意事项？](https://blog.cmdragon.cn/posts/b44316e0866e9f2e6aef927dbcf5152b/)
- [从捕获到冒泡：Vue事件修饰符如何重塑事件执行顺序？](https://blog.cmdragon.cn/posts/021636c2a06f5e2d3d01977a12ddf559/)
- [Vue事件处理：内联还是方法事件处理器，该如何抉择？](https://blog.cmdragon.cn/posts/b3cddf7023ab537e623a61bc01dab6bb/)
- [Vue事件绑定中v-on与@语法如何取舍？参数传递与原生事件处理有哪些实战技巧？](https://blog.cmdragon.cn/posts/bd4d9607ce1bc34cc3bda0a1a46c40f6/)
- [Vue 3中列表排序时为何必须复制数组而非直接修改原始数据？](https://blog.cmdragon.cn/posts/a5f2bacb74476fd7f5e02bb3f1ba6b2b/)
- [Vue虚拟滚动如何将列表DOM数量从万级降至十位数？](https://blog.cmdragon.cn/posts/d3b06b57fb7f126787e6ed22dce1e341/)
- [Vue3中v-if与v-for直接混用为何会报错？计算属性如何解决优先级冲突？](https://blog.cmdragon.cn/posts/3100cc5a2e16f8dac36f722594e6af32/)
- [为何在Vue3递归组件中必须用v-if判断子项存在？](https://blog.cmdragon.cn/posts/455dc2d47c38d12c1cf350e490041e8b/)
- [Vue3列表渲染中，如何用数组方法与计算属性优化v-for的数据处理？](https://blog.cmdragon.cn/posts/3f842bbd7ba0f9c91151b983bf784c8b/)
- [Vue v-for的key：为什么它能解决列表渲染中的“玄学错误”？选错会有哪些后果？](https://blog.cmdragon.cn/posts/1eb3ffac668a743843b5ea1738301d40/)
- [Vue3中v-for与v-if为何不能直接共存于同一元素？](https://blog.cmdragon.cn/posts/138b13c5341f6a1fa9015400433a3611/)
- [Vue3中v-if与v-show的本质区别及动态组件状态保持的关键策略是什么？](https://blog.cmdragon.cn/posts/0242a94dc552b93a1bc335ac4fc33db5/)
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

- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [快图设计 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/quick-image-design)
- [高级文字转图片转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-image-advanced)
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