---
url: /posts/6be38de6382e31d282659b689c5b17f0/
title: 快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？
date: 2025-11-01T07:37:23+08:00
lastmod: 2025-11-01T07:37:23+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/95f95c601c8f4b66b59eef45fa6ed401~tplv-5jbd59dj06-image.png

summary:
  v-model是Vue中简化表单输入的语法糖，自动同步输入值与组件状态。它根据输入类型适配DOM属性和事件：文本/多行文本用`value`和`input`，复选框/单选框用`checked`和`change`，选择器用`value`和`change`。`v-model`支持修饰符如`.lazy`（延迟同步）、`.number`（转为数字）、`.trim`（去除首尾空格）。动态值绑定可通过`v-bind`实现，如复选框的`true-value`和`false-value`，单选框的动态值，选择器的对象值。常见问题包括iOS选择器无法选中第一个选项、IME输入不更新等，均有相应解决方案。

categories:
  - vue

tags:
  - 基础入门
    - Vue.js
  - v-model
  - 表单绑定
  - 动态值处理
  - 修饰符
  - 常见报错解决

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/95f95c601c8f4b66b59eef45fa6ed401~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、v-model：表单绑定的语法糖

在Vue中处理表单输入时，我们需要将输入值与组件状态同步。手动实现需绑定`value`属性并监听`input`/`change`事件，而`v-model`
是简化这一过程的**语法糖**——它自动完成“值绑定+事件监听”，让代码更简洁。

`v-model`的核心逻辑是：

```vue
<!-- v-model="data" 等价于 -->
<input :value="data" @input="data = $event.target.value"/>
```  

它会根据输入类型自动适配DOM属性和事件：

- 文本/多行文本：`value`属性 + `input`事件
- 复选框/单选框：`checked`属性 + `change`事件
- 选择器：`value`属性 + `change`事件

### 1.1 文本输入：单行与多行

#### 单行文本

最基础的输入类型，`v-model`直接绑定响应式变量：

```vue

<template>
  <!-- 实时显示输入内容 -->
  <p>输入的内容：{{ message }}</p>
  <!-- v-model同步输入与message -->
  <input v-model="message" placeholder="请输入"/>
</template>

<script setup>
  import {ref} from 'vue'
  // 初始值在JS侧声明（而非DOM的value属性）
  const message = ref('')
</script>
```  

#### 多行文本

`<textarea>`需用`v-model`绑定（**不能用插值`{{ }}`**）：

```vue

<template>
  <!-- 保留换行符（white-space: pre-line） -->
  <p style="white-space: pre-line;">多行内容：{{ message }}</p>
  <textarea v-model="message" placeholder="请输入多行内容"></textarea>
</template>

<script setup>
  import {ref} from 'vue'

  const message = ref('')
</script>
```  

### 1.2 复选框：布尔值与数组

#### 单个复选框

绑定**布尔值**，适用于“同意协议”等场景：

```vue

<template>
  <input type="checkbox" id="agree" v-model="isAgreed"/>
  <label for="agree">{{ isAgreed ? '已同意' : '未同意' }}</label>
</template>

<script setup>
  import {ref} from 'vue'

  const isAgreed = ref(false) // 初始未同意
</script>
```  

#### 多个复选框

绑定**数组**，选中的项会自动加入数组：

```vue

<template>
  <div>选中的名字：{{ checkedNames }}</div>
  <input type="checkbox" id="jack" value="Jack" v-model="checkedNames"/>
  <label for="jack">Jack</label>
  <input type="checkbox" id="john" value="John" v-model="checkedNames"/>
  <label for="john">John</label>
</template>

<script setup>
  import {ref} from 'vue'

  const checkedNames = ref([]) // 初始为空数组
</script>
```  

### 1.3 单选框：互斥选择的绑定

单选框组绑定到同一个变量，选中的`value`会赋值给变量：

```vue

<template>
  <div>选中的选项：{{ picked }}</div>
  <input type="radio" id="one" value="One" v-model="picked"/>
  <label for="one">One</label>
  <input type="radio" id="two" value="Two" v-model="picked"/>
  <label for="two">Two</label>
</template>

<script setup>
  import {ref} from 'vue'

  const picked = ref('One') // 初始选中One
</script>
```  

### 1.4 选择器：单选与多选

#### 单选选择器

`v-model`绑定字符串，需添加`disabled`的空值选项（解决iOS兼容问题）：

```vue

<template>
  <div>选中的选项：{{ selected }}</div>
  <select v-model="selected">
    <!-- 解决iOS无法选第一个选项的问题 -->
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</template>

<script setup>
  import {ref} from 'vue'

  const selected = ref('') // 初始为空
</script>
```  

#### 多选选择器

添加`multiple`属性，`v-model`绑定数组：

```vue

<template>
  <div>选中的选项：{{ selected }}</div>
  <select v-model="selected" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</template>

<script setup>
  import {ref} from 'vue'

  const selected = ref([]) // 初始为空数组
</script>
```  

#### 动态选项

用`v-for`渲染动态选项（常见于从接口获取数据的场景）：

```vue

<template>
  <select v-model="selected">
    <option v-for="option in options" :value="option.value">
      {{ option.text }}
    </option>
  </select>
</template>

<script setup>
  import {ref} from 'vue'

  const selected = ref('A')
  // 动态选项列表（可从接口获取）
  const options = ref([
    {text: '选项一', value: 'A'},
    {text: '选项二', value: 'B'},
    {text: '选项三', value: 'C'}
  ])
</script>
```  

## 二、值绑定：动态值的处理

默认情况下，`v-model`的`value`是**静态字符串/布尔值**，但有时需要绑定**动态值**（如组件属性、对象），这时需用`v-bind`（或简写
`:`）。

### 2.1 复选框的动态true/false值

用`true-value`和`false-value`指定选中/未选中时的值（非布尔值）：

```vue

<template>
  <input
      type="checkbox"
      v-model="toggle"
      true-value="yes"
      false-value="no"
  />
  <p>当前值：{{ toggle }}</p> <!-- 选中为"yes"，未选中为"no" -->
</template>

<script setup>
  import {ref} from 'vue'

  const toggle = ref('no') // 初始未选中
</script>
```  

### 2.2 单选框的动态值

绑定`value`到组件的动态属性（如接口返回的值）：

```vue

<template>
  <input type="radio" v-model="pick" :value="option1"/>
  <label>选项一</label>
  <input type="radio" v-model="pick" :value="option2"/>
  <label>选项二</label>
  <p>选中的值：{{ pick }}</p>
</template>

<script setup>
  import {ref} from 'vue'
  // 动态值（可从接口获取）
  const option1 = ref('动态值1')
  const option2 = ref('动态值2')
  const pick = ref(option1.value) // 初始选中选项一
</script>
```  

### 2.3 选择器的对象值

`option`的`value`可以是**对象**（传递更多信息）：

```vue

<template>
  <select v-model="selected">
    <option :value="{ id: 1, name: '张三' }">张三</option>
    <option :value="{ id: 2, name: '李四' }">李四</option>
  </select>
  <p>选中的用户：{{ selected.name }}</p> <!-- 显示用户名 -->
</template>

<script setup>
  import {ref} from 'vue'

  const selected = ref({id: 1, name: '张三'}) // 初始选中张三
</script>
```  

## 三、修饰符：定制v-model的行为

`v-model`提供三个修饰符，调整同步时机或值的处理：

### 3.1 .lazy：延迟同步到change事件

默认`v-model`在`input`事件（每输入一个字符）同步，`lazy`改为在`change`事件（输入完成、失去焦点或回车）同步：

```vue

<template>
  <input v-model.lazy="msg" placeholder="输入完成后同步"/>
  <p>当前值：{{ msg }}</p> <!-- 失去焦点后才更新 -->
</template>

<script setup>
  import {ref} from 'vue'

  const msg = ref('')
</script>
```  

### 3.2 .number：自动转换为数字

自动将输入值转为`Number`类型（适用于数字输入）：

```vue

<template>
  <input v-model.number="age" type="number" placeholder="请输入年龄"/>
  <p>年龄类型：{{ typeof age }}</p> <!-- 输入数字时为"number" -->
</template>

<script setup>
  import {ref} from 'vue'

  const age = ref(0) // 初始值为数字
</script>
```  

### 3.3 .trim：自动去除首尾空格

自动去除输入值的首尾空格：

```vue

<template>
  <input v-model.trim="msg" placeholder="输入带空格的内容"/>
  <p>处理后的值："{{ msg }}"</p> <!-- 首尾空格被去除 -->
</template>

<script setup>
  import {ref} from 'vue'

  const msg = ref('')
</script>
```  

## 四、课后Quiz：巩固你的理解

### 问题1

`v-model`在**文本输入框**和**复选框**上分别对应哪些DOM属性和事件？  
**答案**：

- 文本输入框：`value`属性 + `input`事件；
- 复选框：`checked`属性 + `change`事件。

### 问题2

如何让`v-model`绑定的复选框值为`"yes"`或`"no"`，而不是布尔值？  
**答案**：  
使用`true-value`和`false-value`属性：

```vue
<input type="checkbox" v-model="toggle" true-value="yes" false-value="no"/>
```  

### 问题3

`.lazy`修饰符的作用是什么？请写出使用`.lazy`的`v-model`示例。  
**答案**：  
作用：将同步时机从`input`事件改为`change`事件（输入完成后同步）。  
示例：

```vue
<input v-model.lazy="msg"/>
```  

### 问题4

为什么`<select>`元素需要添加一个`disabled`的空值选项？  
**答案**：  
若初始值不匹配任何选项，iOS会无法选中第一个选项（iOS不触发`change`事件）。添加空值选项可解决：

```vue
<select v-model="selected">
  <option disabled value="">请选择</option>
  <option>A</option>
</select>
```  

## 五、常见报错与解决

### 5.1 选择器无法选中第一个选项（iOS）

**现象**：iOS设备上，`<select>`的第一个选项无法选中。  
**原因**：初始值不匹配任何选项，iOS不触发`change`事件。  
**解决**：添加`disabled`的空值选项（见1.4节单选选择器示例）。

### 5.2 IME输入时v-model不更新

**现象**：输入中文、日文等需IME的语言时，`v-model`在组合过程中不更新。  
**原因**：`v-model`默认忽略IME组合时的输入。  
**解决**：手动绑定`input`事件和`value`：

```vue

<template>
  <input :value="msg" @input="msg = $event.target.value"/>
</template>

<script setup>
  import {ref} from 'vue'

  const msg = ref('')
</script>
```  

### 5.3 输入数字但得到字符串

**现象**：输入数字后，变量类型是`string`而非`number`。  
**原因**：`v-model`默认保留原始输入类型（字符串）。  
**解决**：添加`number`修饰符：

```vue
<input v-model.number="age" type="number"/>
```  

参考链接：  
https://vuejs.org/guide/essentials/forms.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？](https://blog.cmdragon.cn/posts/6be38de6382e31d282659b689c5b17f0/)



<details>
<summary>往期文章归档</summary>

- [快速入门Vue3：条件渲染与列表渲染的小秘密，你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a325ca6534b78c20bd46c816c3f82aee/)
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