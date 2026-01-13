---
url: /posts/1c1e80d697cca0923f29ec70ebb8ccd1/
title: Vue3表单事件处理：v-model如何实现数据绑定、验证与提交？
date: 2026-01-13T20:14:03+08:00
lastmod: 2026-01-13T20:14:03+08:00
author: cmdragon
cover: /images/generated_image_d6672da0-3b9c-4e21-a367-0e63938c5f64.png

summary:
  Vue3表单事件处理中，v-model实现输入框双向绑定，配合.lazy延迟更新、.number转为数字、.trim去除空格修饰符定制行为。表单提交用@submit.prevent阻止默认刷新，结合验证逻辑确保数据合法。单选框绑定单个值，复选框组绑定数组、单个绑定布尔值，支持change事件监听。

categories:
  - vue

tags:
  - 基础入门
  - 表单事件处理
  - v-model
  - 表单提交验证
  - 输入框双向绑定
  - 复选框
  - 单选框

---

<img src="/images/generated_image_d6672da0-3b9c-4e21-a367-0e63938c5f64.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 表单事件处理

表单是前端与用户交互的核心组件之一——从登录注册到信息提交，几乎所有用户输入场景都离不开表单。Vue3 针对表单处理提供了*
*简洁的语法糖**和**灵活的事件机制**，让我们能快速实现“数据绑定-事件响应-验证提交”的完整流程。本章我们就来拆解表单处理的三大核心场景：输入框双向绑定、表单提交验证，以及复选框/单选框的事件处理。

## 一、输入框双向绑定事件

输入框是表单中最基础的组件，我们需要让“用户输入”和“组件数据”**实时同步**——这就是“双向绑定”的核心需求。Vue3 用 `v-model`
帮我们实现了这一点。

### 1. 基础用法：`v-model` 语法糖

`v-model` 本质是 `v-bind:value`（绑定输入框当前值）和 `v-on:input`（监听输入事件更新数据）的**语法糖**。比如：

```vue

<template>
  <!-- 用v-model绑定message变量，输入内容实时同步 -->
  <input v-model="message" placeholder="请输入内容"/>
  <!-- 实时显示输入的内容 -->
  <p>你输入的内容：{{ message }}</p>
</template>

<script setup>
  import {ref} from 'vue'
  // 声明响应式变量message，初始值为空
  const message = ref('')
</script>
```

这段代码等价于：

```vue
<input
    :value="message"
    @input="message = $event.target.value"
    placeholder="请输入内容"
/>
```

`v-model` 帮我们省掉了手动绑定和监听的代码，让逻辑更简洁。

### 2. 修饰符：定制双向绑定行为

有时候我们需要对输入内容做**额外处理**，比如“只在失去焦点时更新”“转为数字”“去除空格”——Vue3 提供了 3 个常用修饰符：

#### （1）`.lazy`：延迟更新

默认 `v-model` 会在**每输入一个字符**就更新数据（`input` 事件）。如果想优化性能（比如大文本输入），可以用 `.lazy` 让数据在*
*失去焦点或按回车键**时更新（`change` 事件）：

```vue
<input v-model.lazy="message" placeholder="失去焦点后更新"/>
```

#### （2）`.number`：转为数字

输入框默认返回**字符串类型**，如果需要处理数字（比如年龄、价格），用 `.number` 自动转为 `Number` 类型：

```vue
<!-- type="number" 让输入框显示数字键盘 -->
<input v-model.number="age" type="number" placeholder="请输入年龄"/>
```

> 注意：如果输入非数字内容（比如字母），`age` 会保持原来的数值（不会变成 `NaN`）。

#### （3）`.trim`：去除首尾空格

用户常不小心输入首尾空格，用 `.trim` 自动去除：

```vue
<input v-model.trim="username" placeholder="自动去除首尾空格"/>
```

## 二、表单提交与验证事件

表单的最终目的是**收集用户数据并提交**，但提交前必须做两件事：

1. 阻止浏览器默认的刷新行为（默认 `form` 提交会发送 HTTP 请求并刷新页面）；
2. 验证输入内容是否符合要求（比如用户名不能为空、密码长度≥6）。

### 1. 阻止默认提交：`@submit.prevent`

用 `@submit` 监听表单提交事件，配合 `.prevent` 修饰符**阻止默认刷新**：

```vue

<template>
  <!-- 阻止默认提交，调用handleSubmit函数 -->
  <form @submit.prevent="handleSubmit">
    <!-- 表单内容 -->
  </form>
</template>
```

### 2. 自定义验证逻辑

验证分为**实时验证**（输入时提示错误）和**提交时验证**（最终检查）。我们可以用 `computed` 或 `watch` 实现实时验证，用提交函数做最终检查。

#### 示例：带实时验证的登录表单

```vue

<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-item">
      <label>用户名：</label>
      <input v-model.trim="form.username" placeholder="请输入用户名"/>
      <!-- 实时提示错误：用户名为空 -->
      <p v-if="!form.username" class="error">用户名不能为空</p>
    </div>
    <div class="form-item">
      <label>密码：</label>
      <input type="password" v-model="form.password" placeholder="请输入密码"/>
      <!-- 实时提示错误：密码长度不足6位 -->
      <p v-if="form.password.length < 6" class="error">密码至少6位</p>
    </div>
    <!-- 根据验证结果禁用按钮 -->
    <button type="submit" :disabled="!isFormValid">提交</button>
  </form>
</template>

<script setup>
  import {ref, computed} from 'vue'

  // 表单数据：响应式对象
  const form = ref({
    username: '',
    password: ''
  })

  // 计算属性：判断表单是否有效（所有字段符合要求）
  const isFormValid = computed(() => {
    return form.value.username.trim() !== '' && form.value.password.length >= 6
  })

  // 提交处理函数
  const handleSubmit = () => {
    if (isFormValid.value) {
      // 这里替换为实际的提交逻辑（比如调用接口）
      alert('登录成功！')
      // 重置表单
      form.value.username = ''
      form.value.password = ''
    }
  }
</script>

<style scoped>
  .form-item {
    margin-bottom: 16px;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }
</style>
```

## 三、复选框/单选框事件处理

复选框（`checkbox`）和单选框（`radio`）的核心是**选择状态与数据的绑定**，但它们的 `v-model` 绑定规则略有不同。

### 1. 单选框：绑定单个值

单选框组的 `v-model` 绑定**单个变量**，变量值为选中项的 `value`：

```vue

<template>
  <div>
    <label>性别：</label>
    <!-- 选中时，gender变为'male' -->
    <input type="radio" v-model="gender" value="male"/> 男
    <!-- 选中时，gender变为'female' -->
    <input type="radio" v-model="gender" value="female"/> 女
    <p>你的选择：{{ gender }}</p>
  </div>
</template>

<script setup>
  import {ref} from 'vue'
  // 初始选中“男”
  const gender = ref('male')
</script>
```

### 2. 复选框：绑定布尔值或数组

复选框分为两种场景：

- **单个复选框**（比如“同意协议”）：绑定**布尔值**（`true`/`false`）；
- **多个复选框组**（比如“爱好选择”）：绑定**数组**（选中项的 `value` 会加入数组）。

#### （1）单个复选框：布尔值绑定

```vue

<template>
  <div>
    <!-- 勾选时，isAgree变为true -->
    <input type="checkbox" v-model="isAgree"/> 我同意用户协议
    <!-- 协议未勾选时，按钮禁用 -->
    <button :disabled="!isAgree">下一步</button>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  const isAgree = ref(false)
</script>
```

#### （2）复选框组：数组绑定

```vue

<template>
  <div>
    <label>爱好：</label>
    <!-- 选中时，hobbies加入'reading' -->
    <input type="checkbox" v-model="hobbies" value="reading"/> 阅读
    <!-- 选中时，hobbies加入'coding' -->
    <input type="checkbox" v-model="hobbies" value="coding"/> 编程
    <!-- 选中时，hobbies加入'sports' -->
    <input type="checkbox" v-model="hobbies" value="sports"/> 运动
    <p>你的爱好：{{ hobbies.join('、') }}</p>
  </div>
</template>

<script setup>
  import {ref} from 'vue'
  // 初始为空数组，选中项会加入数组
  const hobbies = ref([])
</script>
```

### 3. 事件监听：状态变化时做额外操作

如果需要在“选中/取消选中”时做额外处理（比如弹出提示），可以用 `@change` 事件：

```vue

<template>
  <input
      type="checkbox"
      v-model="isAgree"
      @change="handleAgree"
  /> 我同意用户协议
</template>

<script setup>
  import {ref} from 'vue'

  const isAgree = ref(false)

  // e.target.checked 是当前复选框的状态（true/false）
  const handleAgree = (e) => {
    if (e.target.checked) {
      alert('感谢你同意协议！')
    }
  }
</script>
```

## 课后 Quiz

来做几个小测试，巩固下本章知识点～

### 1. 请写出一个使用 `v-model.number` 的输入框示例，并说明其作用。

**答案**：

```vue
<input v-model.number="age" type="number" placeholder="请输入年龄"/>
```  

**作用**：将输入的字符串转为 `Number` 类型，避免后续计算错误（比如 `age + 1` 不会变成字符串拼接）。

### 2. 表单提交时，如何阻止页面刷新并执行自定义验证？

**答案**：

- 用 `@submit.prevent` 阻止默认刷新行为；
- 在 `handleSubmit` 函数中执行验证逻辑（比如检查用户名是否为空）。  
  示例：

```vue

<form @submit.prevent="handleSubmit">
  <!-- 表单内容 -->
</form>
```

### 3. 多个复选框组成的“爱好选择”，`v-model` 应该绑定什么类型的变量？请写示例代码。

**答案**：  
绑定**数组**类型。示例：

```vue

<template>
  <input type="checkbox" v-model="hobbies" value="reading"/> 阅读
  <input type="checkbox" v-model="hobbies" value="coding"/> 编程
</template>

<script setup>
  import {ref} from 'vue'

  const hobbies = ref([])
</script>
```

## 本章常见报错及解决方法

### 1. 报错：`Property "xxx" was accessed during render but is not defined`

- **现象**：控制台提示变量未定义，但你明明写了 `v-model="xxx"`。
- **原因**：`xxx` 没有在 `setup` 中用 `ref`/`reactive` 声明（Vue3 要求响应式变量必须显式声明）。
- **解决**：在 `setup` 中声明变量，比如 `const xxx = ref('')`。
- **预防**：写 `v-model` 前先声明变量，避免拼写错误。

### 2. 报错：表单提交后页面刷新

- **现象**：点击提交按钮，页面重新加载，数据丢失。
- **原因**：未阻止表单的默认 `submit` 行为（浏览器默认会发送 HTTP 请求并刷新页面）。
- **解决**：给 `@submit` 加 `prevent` 修饰符，比如 `@submit.prevent="handleSubmit"`。
- **预防**：处理表单提交时，优先用 `@submit.prevent`。

### 3. 报错：复选框组无法多选

- **现象**：勾选多个复选框，只有最后一个被选中，或数组未更新。
- **原因**：`v-model` 绑定的不是数组（比如绑定了 `ref('')`）。
- **解决**：将绑定变量改为数组，比如 `const hobbies = ref([])`。
- **预防**：多个复选框组时，记得绑定数组。

### 4. 报错：`v-model.number` 不生效

- **现象**：输入数字后，变量还是字符串类型。
- **原因**：输入框未加 `type="number"`，或输入了非数字字符。
- **解决**：给输入框加 `type="number"`（显示数字键盘），确保输入内容是数字。
- **预防**：用 `.number` 时，配合 `type="number"` 使用。

## 参考链接

- Vue3 表单处理官方文档：https://vuejs.org/guide/essentials/forms.html
- Vue3 事件处理官方文档：https://vuejs.org/guide/essentials/event-handling.html
- Vue3 响应式基础官方文档：https://vuejs.org/guide/essentials/reactivity-fundamentals.html

以上就是表单事件处理的核心内容啦～ 下一章我们会学习组件通信，敬请期待！

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3表单事件处理：v-model如何实现数据绑定、验证与提交？](https://blog.cmdragon.cn/posts/1c1e80d697cca0923f29ec70ebb8ccd1/)






<details>
<summary>往期文章归档</summary>

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