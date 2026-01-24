---
url: /posts/1bab953e41f66ac53de099fa9fe76483/
title: Vue3中动态样式数组的后项覆盖规则如何与计算属性结合实现复杂状态样式管理？
date: 2025-12-17T12:10:12+08:00
lastmod: 2025-12-17T12:10:12+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_01ecf107-77c0-4a2a-929f-06fcf0e9e206.png

summary:
  Vue3样式绑定包含数组语法(后项覆盖前项)、计算属性(处理多状态样式)、动态内联样式(与数据联动)三大技巧。数组合并规则清晰，计算属性抽离复杂逻辑，动态样式通过响应式数据联动更新。需注意驼峰命名、非响应式对象不更新等问题，以提升样式组合灵活性与可维护性。

categories:
  - vue

tags:
  - 基础入门
  - Style绑定
  - 数组语法
  - 计算属性
  - 动态样式
  - 样式合并
  - 内联样式

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_01ecf107-77c0-4a2a-929f-06fcf0e9e206.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/


## 一、Style绑定的数组语法：组合多个样式对象  
在Vue3中，`v-bind:style`（简写为`:style`）除了支持**对象语法**，还可以用**数组语法**组合多个样式对象。这种方式特别适合需要**合并基础样式与动态样式**的场景——比如一个按钮既要保留默认的 padding、border 样式，又要根据“禁用状态”动态切换背景色。


### 1.1 基本用法：数组里的样式合并规则  
数组语法的核心逻辑是：**数组中的每个样式对象会被合并，后面的对象会覆盖前面对象的同名属性**（类似CSS的层叠规则）。  

举个简单例子：我们需要一个“基础文本样式 + 动态背景色”的div：  
```vue
<template>
  <!-- 数组组合baseStyles（基础）和dynamicStyles（动态） -->
  <div :style="[baseStyles, dynamicStyles]">
    我是数组语法的示例
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 基础样式：固定的字体、颜色
const baseStyles = ref({
  fontSize: '18px',  // 驼峰命名（Vue推荐）
  color: '#333',
  padding: '10px'
})

// 动态样式：点击后切换背景色
const dynamicStyles = ref({
  backgroundColor: 'lightblue'  // 初始为浅蓝色
})

// 模拟动态修改：点击div切换背景色
const toggleBg = () => {
  dynamicStyles.value.backgroundColor = 
    dynamicStyles.value.backgroundColor === 'lightblue' 
      ? 'lightcoral' 
      : 'lightblue'
}
</script>
```  

**效果说明**：  
- 初始时，div的样式是`baseStyles`（字体18px、深灰） + `dynamicStyles`（浅蓝背景）的合并结果。  
- 点击div后，`dynamicStyles`的`backgroundColor`变为浅红，div的背景色会**自动更新**（因为`dynamicStyles`是响应式ref）。  


### 1.2 关键规则：后项覆盖前项  
如果数组中的多个对象有**同名属性**，后面的对象会覆盖前面的。比如：  
```javascript
const base = { color: 'red', fontSize: '16px' }
const dynamic = { color: 'blue' }
const styles = [base, dynamic]  // 最终color是blue，fontSize是16px
```  

这意味着你可以把**固定样式放在前面**，**动态样式放在后面**——动态样式会“覆盖”基础样式的同名属性，实现灵活的样式调整。


## 二、计算属性：让复杂样式组合更优雅  
当样式需要依赖**多个状态**时（比如“禁用+ hover”的按钮），直接在模板里写数组会让代码变得冗长。这时候**计算属性（computed）**是更好的选择——它能把复杂的样式逻辑抽离出来，让模板更简洁。


### 2.1 为什么用计算属性？  
假设我们有一个按钮，需要根据三个状态切换样式：  
- 基础样式（固定）；  
- 禁用状态（灰色背景、不可点击）；  
- Hover状态（绿色背景、白色文字）。  

如果不用计算属性，模板会写成这样：  
```vue
<!-- 模板里的样式数组会非常长，难以维护 -->
<button :style="[
  { padding: '8px 16px', border: 'none' },
  isDisabled ? { backgroundColor: '#ccc' } : {},
  isHovered && !isDisabled ? { backgroundColor: '#42b983' } : {}
]">
  点击我
</button>
```  

而用计算属性，可以把样式逻辑移到`<script>`里，模板只需要绑定一个`buttonStyles`：  


### 2.2 示例：带状态的按钮样式  
```vue
<template>
  <button 
    :style="buttonStyles" 
    @click="toggleDisabled"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    {{ isDisabled ? '禁用' : '点击' }}
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'

// 1. 定义响应式状态
const isDisabled = ref(false)  // 是否禁用
const isHovered = ref(false)   // 是否hover

// 2. 计算属性：根据状态生成样式数组
const buttonStyles = computed(() => [
  // ① 基础样式（固定）
  {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'  // 过渡动画
  },
  // ② 禁用状态样式（仅当isDisabled为true时生效）
  isDisabled.value ? {
    backgroundColor: '#ccc',
    color: '#999',
    cursor: 'not-allowed'  // 禁用时的鼠标样式
  } : {},
  // ③ Hover状态样式（仅当hover且未禁用时生效）
  isHovered.value && !isDisabled.value ? {
    backgroundColor: '#42b983',
    color: 'white'
  } : {}
])

// 3. 模拟禁用状态切换
const toggleDisabled = () => {
  isDisabled.value = !isDisabled.value
}
</script>
```  

**代码解释**：  
- `buttonStyles`是一个计算属性，依赖`isDisabled`和`isHovered`的变化；  
- 数组中的每个元素都是**条件样式对象**：当条件满足时，返回对应的样式；否则返回空对象`{}`（不影响其他样式）；  
- 计算属性会自动响应状态变化——比如`isDisabled`从`false`变`true`时，`buttonStyles`会重新计算，按钮样式随之更新。  


## 三、动态内联样式：与数据联动的切换技巧  
数组语法的另一个常用场景是**动态修改单个样式属性**（比如进度条的宽度、文本框的背景色）。这类场景通常需要将样式属性与**响应式数据**绑定，实现“数据变→样式变”的效果。


### 3.1 示例1：动态进度条  
假设我们需要一个“点击增加进度”的进度条，核心是**动态修改`width`属性**：  
```vue
<template>
  <div class="progress-container">
    <!-- 动态绑定width：进度值（0-100）+ % -->
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
  </div>
  <button @click="increaseProgress">增加进度</button>
</template>

<script setup>
import { ref } from 'vue'

const progress = ref(0)  // 进度值（响应式）

// 点击按钮增加进度（最多100%）
const increaseProgress = () => {
  if (progress.value < 100) {
    progress.value += 10
  }
}
</script>

<style scoped>
.progress-container {
  width: 300px;
  height: 20px;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.progress-bar {
  height: 100%;
  background-color: #42b983;
  transition: width 0.3s ease;  // 平滑过渡
}
</style>
```  

**效果说明**：  
- `progress`是响应式数据，初始为0；  
- 点击按钮时，`progress`增加10，`width`属性会自动更新为`progress + '%'`（比如10% → 20%）；  
- 通过`transition`实现进度条的平滑动画。  


### 3.2 示例2：根据输入长度动态改背景色  
我们可以扩展数组语法，结合**计算属性**实现更复杂的联动：比如文本框根据输入长度切换背景色（短→白、中→黄、长→红）。  

```vue
<template>
  <input 
    type="text" 
    v-model="inputText" 
    :style="inputStyles"
    placeholder="输入内容..."
  >
</template>

<script setup>
import { ref, computed } from 'vue'

const inputText = ref('')  // 绑定输入框内容

// 计算属性：根据输入长度生成样式数组
const inputStyles = computed(() => [
  // 基础样式（固定）
  {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '300px'
  },
  // 动态背景色：根据输入长度切换
  {
    backgroundColor: 
      inputText.value.length < 10 ? 'white' :  // 短：白
      inputText.value.length <= 20 ? 'lightyellow' :  // 中：黄
      'lightcoral'  // 长：红
  }
])
</script>
```  


## 四、课后Quiz：巩固你的样式绑定技能  
**问题**：请用**数组语法 + 计算属性**实现一个“动态标签”组件——标签的背景色根据`type`属性切换（`type="success"`为绿色，`type="warning"`为黄色，`type="error"`为红色），同时保持基础样式（圆角、padding）。  

**要求**：  
1. 基础样式包含：`padding: '4px 8px'`、`border-radius: '4px'`、`color: 'white'`；  
2. 动态样式根据`type`切换`backgroundColor`；  
3. 用计算属性返回样式数组。  


### 答案与解析  
```vue
<template>
  <span :style="tagStyles">{{ text }}</span>
</template>

<script setup>
import { computed, defineProps } from 'vue'

// 接收父组件传递的type和text
const props = defineProps({
  type: {
    type: String,
    default: 'success'  // 默认成功态
  },
  text: String
})

// 计算属性：生成样式数组
const tagStyles = computed(() => [
  // ① 基础样式
  {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px'
  },
  // ② 动态背景色（根据type）
  {
    backgroundColor: {
      success: '#42b983',
      warning: '#f1c40f',
      error: '#e74c3c'
    }[props.type]  // 根据type取对应颜色
  }
])
</script>
```  

**解析**：  
1. 用`defineProps`接收父组件的`type`和`text`；  
2. 计算属性`tagStyles`返回数组：基础样式 + 动态背景色；  
3. 动态背景色用**对象映射**（`{ success: '#42b983', ... }[props.type]`），比`if-else`更简洁。  


## 五、常见报错与解决方案  
在Style绑定中，以下错误是新手常犯的，提前避坑！


### 报错1：样式键名用“短横线”导致不生效  
**错误代码**：  
```javascript
const dynamicStyles = ref({
  background-color: 'lightblue'  // 错误：短横线不能直接作为对象键名
})
```  

**原因**：JavaScript对象的键名如果包含短横线（比如`background-color`），必须用**字符串引号**包裹，否则会被解析为“减法表达式”（`background - color`）。  

**解决方法**：  
- 用**驼峰命名**（Vue推荐）：`backgroundColor`；  
- 用**字符串键名**：`'background-color'`。  

**正确代码**：  
```javascript
const dynamicStyles = ref({
  backgroundColor: 'lightblue'  // 推荐
  // 或
  // 'background-color': 'lightblue'
})
```  


### 报错2：数组中的样式对象为`undefined`  
**错误代码**：  
```javascript
const buttonStyles = computed(() => [
  baseStyles,
  isDisabled.value ? disabledStyles : undefined  // 错误：返回undefined
])
```  

**原因**：Vue会忽略数组中的`undefined`或`null`，但如果数组中有`undefined`，后面的样式可能无法正确合并。  

**解决方法**：确保数组中的每个元素都是**有效对象**（空对象`{}`也可以）。  

**正确代码**：  
```javascript
const buttonStyles = computed(() => [
  baseStyles,
  isDisabled.value ? disabledStyles : {}  // 空对象不影响合并
])
```  


### 报错3：动态样式没有响应式更新  
**错误代码**：  
```javascript
// 普通对象，非响应式
const dynamicStyles = {
  backgroundColor: 'lightblue'
}

// 修改时样式不更新
const changeColor = () => {
  dynamicStyles.backgroundColor = 'lightcoral'
}
```  

**原因**：普通对象不是响应式的，Vue无法检测到它的变化。  

**解决方法**：  
- 用`ref`包裹样式对象（推荐）；  
- 用`computed`返回样式（依赖响应式数据）。  

**正确代码**：  
```javascript
const dynamicStyles = ref({
  backgroundColor: 'lightblue'
})

const changeColor = () => {
  dynamicStyles.value.backgroundColor = 'lightcoral'  // 响应式修改
}
```  


## 参考链接  
Vue官网Style绑定文档：https://vuejs.org/guide/essentials/class-and-style.html#array-syntax-1

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue3中动态样式数组的后项覆盖规则如何与计算属性结合实现复杂状态样式管理？](https://blog.cmdragon.cn/posts/1bab953e41f66ac53de099fa9fe76483/)



<details>
<summary>往期文章归档</summary>

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