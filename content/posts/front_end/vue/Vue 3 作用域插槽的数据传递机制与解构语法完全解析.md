---
url: /posts/d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0/
title: Vue 3 作用域插槽的数据传递机制与解构语法完全解析
date: 2026-05-02T12:00:00+08:00
lastmod: 2026-05-02T12:00:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/

summary: 本文深入讲解Vue 3作用域插槽的数据传递机制，从基本概念入手，通过丰富的示例展示如何向插槽传递Props、如何接收插槽Props、以及如何使用解构语法简化代码，帮助开发者彻底掌握这一强大的组件通信方式。

categories:
  - vue

tags:
  - 基础入门
  - 作用域插槽
  - 数据传递
  - 解构语法
  - 组件通信
  - Props传递
  - 插槽Props
  - 高级技巧
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、什么是作用域插槽？

在之前的章节中，我们已经了解到插槽内容只能访问父组件的数据作用域。但在某些场景下，我们希望插槽内容能够同时使用父组件和子组件的数据。比如一个列表组件，它负责数据获取和分页逻辑，但我们希望父组件能够控制每个列表项的渲染样式，这时就需要用到作用域插槽。

作用域插槽允许子组件向插槽传递数据，父组件可以在插槽内容中访问这些数据。你可以把它想象成子组件给插槽"注入"了一些数据，父组件在使用插槽时可以直接使用这些"注入"的数据。

## 二、作用域插槽的工作原理

### 2.1 子组件向插槽传递数据

```vue
<!-- MyComponent.vue -->
<template>
  <div class="my-component">
    <!-- 向插槽传递数据，类似对组件传递props -->
    <slot :text="greetingMessage" :count="1"></slot>
  </div>
</template>

<script setup>
import { ref } from "vue";

const greetingMessage = ref("Hello from child component!");
</script>
```

### 2.2 父组件接收插槽Props

```vue
<!-- ParentComponent.vue -->
<template>
  <MyComponent v-slot="slotProps">
    <!-- 通过 slotProps 访问子组件传递的数据 -->
    <p>{{ slotProps.text }} - Count: {{ slotProps.count }}</p>
  </MyComponent>
</template>

<script setup>
import MyComponent from "./MyComponent.vue";
</script>
```

### 2.3 作用域插槽的JavaScript函数类比

```javascript
// 子组件可以类比为：
function MyComponent(slots) {
  const greetingMessage = "Hello from child component!";

  return `
    <div class="my-component">
      ${
        // 调用插槽函数时传入props
        slots.default({
          text: greetingMessage,
          count: 1,
        })
      }
    </div>
  `;
}

// 父组件提供的插槽可以类比为：
MyComponent({
  default: (slotProps) => {
    // slotProps 就是子组件传入的 { text, count }
    return `<p>${slotProps.text} - Count: ${slotProps.count}</p>`;
  },
});
```

## 三、解构插槽Props

为了让代码更简洁，我们可以使用ES6的解构语法直接提取插槽Props：

### 3.1 基础解构

```vue
<template>
  <MyComponent v-slot="{ text, count }">
    <!-- 直接使用解构后的变量 -->
    <p>{{ text }} - Count: {{ count }}</p>
  </MyComponent>
</template>
```

### 3.2 重命名解构

```vue
<template>
  <MyComponent v-slot="{ text: message, count: number }">
    <p>{{ message }} - Number: {{ number }}</p>
  </MyComponent>
</template>
```

### 3.3 解构带默认值

```vue
<template>
  <MyComponent v-slot="{ text = 'Default text', count = 0 }">
    <p>{{ text }} - Count: {{ count }}</p>
  </MyComponent>
</template>
```

### 3.4 解构与剩余参数

```vue
<template>
  <MyComponent v-slot="{ text, ...rest }">
    <p>{{ text }}</p>
    <pre>{{ JSON.stringify(rest) }}</pre>
  </MyComponent>
</template>
```

## 四、作用域插槽的实战案例

### 4.1 案例一：可定制的列表项组件

```vue
<!-- UserItem.vue -->
<template>
  <div class="user-item">
    <!-- 向插槽传递用户数据和权限信息 -->
    <slot :user="user" :isAdmin="isAdmin" :stats="userStats"></slot>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 用户数据
const user = ref({
  name: "张三",
  age: 28,
  avatar: "https://via.placeholder.com/60",
  email: "zhangsan@example.com",
});

// 是否是管理员
const isAdmin = ref(true);

// 计算属性：用户统计信息
const userStats = computed(() => ({
  postsCount: 42,
  followersCount: 128,
  followingCount: 56,
}));
</script>

<style scoped>
.user-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>
```

使用方式：

```vue
<!-- ParentComponent.vue -->
<template>
  <div class="user-list">
    <!-- 接收插槽Props并自定义渲染 -->
    <UserItem v-slot="{ user, isAdmin, stats }">
      <div class="user-card">
        <img :src="user.avatar" :alt="user.name" class="user-avatar" />
        <div class="user-info">
          <h3 class="user-name">
            {{ user.name }}
            <span v-if="isAdmin" class="admin-badge">管理员</span>
          </h3>
          <p class="user-email">{{ user.email }}</p>
          <div class="user-stats">
            <span class="stat">帖子: {{ stats.postsCount }}</span>
            <span class="stat">粉丝: {{ stats.followersCount }}</span>
            <span class="stat">关注: {{ stats.followingCount }}</span>
          </div>
        </div>
      </div>
    </UserItem>

    <!-- 另一种渲染方式 -->
    <UserItem v-slot="{ user, isAdmin }">
      <div class="user-simple">
        <span>{{ user.name }}</span>
        <span v-if="isAdmin" class="role-badge">管理员</span>
      </div>
    </UserItem>
  </div>
</template>

<script setup>
import UserItem from "./UserItem.vue";
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  display: flex;
  gap: 16px;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-badge {
  background-color: #42b983;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.user-email {
  color: #666;
  margin: 0 0 8px 0;
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat {
  color: #999;
  font-size: 14px;
}

.user-simple {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  background-color: #ff9800;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
```

### 4.2 案例二：数据表格组件

```vue
<!-- DataTable.vue -->
<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <!-- 为每一列渲染插槽，传递行数据和索引 -->
          <td v-for="column in columns" :key="column.key">
            <slot
              :name="column.key"
              :row="row"
              :index="index"
              :value="row[column.key]"
            >
              <!-- 默认渲染：直接显示值 -->
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    required: true,
    // 期望格式：[{ key: 'name', label: '姓名' }, ...]
  },
  data: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background-color: #f9f9f9;
}
</style>
```

使用方式：

```vue
<!-- ParentComponent.vue -->
<template>
  <DataTable :columns="columns" :data="users">
    <!-- 自定义姓名列的渲染 -->
    <template #name="{ row, value }">
      <div class="user-cell">
        <img :src="row.avatar" :alt="value" class="avatar" />
        <span>{{ value }}</span>
      </div>
    </template>

    <!-- 自定义状态列的渲染 -->
    <template #status="{ value }">
      <span :class="['status-badge', `status-${value}`]">
        {{ statusMap[value] || value }}
      </span>
    </template>

    <!-- 自定义操作列的渲染 -->
    <template #actions="{ row }">
      <div class="actions">
        <button class="btn btn-edit" @click="editUser(row)">编辑</button>
        <button class="btn btn-delete" @click="deleteUser(row)">删除</button>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { ref } from "vue";
import DataTable from "./DataTable.vue";

const statusMap = {
  active: "活跃",
  inactive: "未激活",
  banned: "已封禁",
};

const columns = ref([
  { key: "name", label: "姓名" },
  { key: "email", label: "邮箱" },
  { key: "status", label: "状态" },
  { key: "actions", label: "操作" },
]);

const users = ref([
  {
    name: "张三",
    email: "zhangsan@example.com",
    status: "active",
    avatar: "/avatars/1.jpg",
  },
  {
    name: "李四",
    email: "lisi@example.com",
    status: "inactive",
    avatar: "/avatars/2.jpg",
  },
  {
    name: "王五",
    email: "wangwu@example.com",
    status: "banned",
    avatar: "/avatars/3.jpg",
  },
]);

const editUser = (user) => {
  console.log("编辑用户:", user);
};

const deleteUser = (user) => {
  console.log("删除用户:", user);
};
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-inactive {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-banned {
  background-color: #ffebee;
  color: #d32f2f;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-edit {
  background-color: #2196f3;
  color: #fff;
}

.btn-delete {
  background-color: #f44336;
  color: #fff;
}
</style>
```

### 4.3 使用 v-bind 传递多个插槽Props

当需要传递大量数据时，可以使用`v-bind`一次性传递整个对象：

```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <!-- 使用 v-bind 传递整个对象 -->
    <slot v-bind="itemData"></slot>
  </div>
</template>

<script setup>
import { ref } from "vue";

const itemData = ref({
  id: 1,
  title: "文章标题",
  content: "文章内容...",
  author: "作者名",
  createdAt: "2026-05-02",
  tags: ["Vue", "教程"],
  likes: 42,
  comments: 8,
});
</script>
```

使用方式：

```vue
<template>
  <ChildComponent v-slot="{ title, content, author, tags, likes }">
    <article>
      <h2>{{ title }}</h2>
      <p>{{ content }}</p>
      <footer>
        <span>作者: {{ author }}</span>
        <div class="tags">
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <span>{{ likes }} 点赞</span>
      </footer>
    </article>
  </ChildComponent>
</template>
```

## 五、作用域插槽的流程图

```
子组件定义插槽并传递数据
    ↓
<slot :text="message" :count="1"></slot>
    ↓
Vue 创建插槽Props对象
    ↓
{ text: 'Hello', count: 1 }
    ↓
父组件接收插槽Props
    ↓
<MyComponent v-slot="slotProps">
  {{ slotProps.text }}
</MyComponent>
    ↓
或使用解构语法
    ↓
<MyComponent v-slot="{ text, count }">
  {{ text }} - {{ count }}
</MyComponent>
    ↓
插槽内容中可以使用：
- 父组件的数据 ✅
- 子组件传入的插槽Props ✅
- 但不能访问子组件的内部数据 ❌
```

## 六、课后Quiz

### 题目1：作用域插槽解决了什么问题？

A. 插槽内容无法访问子组件数据
B. 插槽内容无法访问父组件数据
C. 插槽默认内容无法显示
D. 插槽名称无法动态指定

**答案解析：A**

作用域插槽的核心功能是让插槽内容能够访问子组件传递的数据。之前我们学到插槽内容只能访问父组件的作用域，作用域插槽打破了这个限制。

### 题目2：以下哪种解构语法是正确的？

A. `<MyComponent v-slot="{ text, count }">`
B. `<MyComponent v-slot="text, count">`
C. `<MyComponent v-slot="[text, count]">`
D. `<MyComponent v-slot="text: count">`

**答案解析：A**

使用ES6的对象解构语法`{ text, count }`来接收插槽Props。选项B、C、D都不是有效的解构语法。

### 题目3：如何向插槽传递整个对象的所有属性？

A. `<slot :data="obj"></slot>`
B. `<slot v-bind="obj"></slot>`
C. `<slot v-for="(value, key) in obj" :[key]="value"></slot>`
D. `<slot :props="obj"></slot>`

**答案解析：B**

使用`v-bind="obj"`可以将对象的所有属性作为插槽Props传递。这与组件Props的传递方式相同。

## 七、常见报错解决方案

### 1. 报错：无法访问插槽Props

**原因**：没有正确使用`v-slot`指令接收插槽Props。

**错误示例**：

```vue
<!-- 错误：没有使用 v-slot -->
<MyComponent>
  {{ text }} <!-- 错误：text 未定义 -->
</MyComponent>
```

**解决办法**：

```vue
<!-- 正确：使用 v-slot 接收 Props -->
<MyComponent v-slot="{ text }">
  {{ text }}
</MyComponent>
```

### 2. 报错：解构插槽Props时属性为undefined

**原因**：子组件没有传递对应的属性，或属性名不匹配。

**解决办法**：

```vue
<!-- 使用默认值避免 undefined -->
<MyComponent v-slot="{ text = '默认值', count = 0 }">
  {{ text }} - {{ count }}
</MyComponent>

<!-- 使用可选链操作符 -->
<MyComponent v-slot="slotProps">
  {{ slotProps?.text }}
</MyComponent>
```

### 3. 预防建议

- 始终使用解构语法简化代码
- 为可能为undefined的属性提供默认值
- 确保子组件和父组件使用的属性名一致
- 使用TypeScript为插槽Props提供类型约束

## 参考链接：https://cn.vuejs.org/guide/components/slots.html#scoped-slots

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 作用域插槽的数据传递机制与解构语法完全解析](https://blog.cmdragon.cn/posts/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 动态插槽名与条件插槽的灵活应用完全指南](https://blog.cmdragon.cn/posts/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/)
- [Vue 3 具名插槽的精准内容定位与多区域布局实战完全解析](https://blog.cmdragon.cn/posts/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7/)
- [Vue 3 默认插槽的深入应用与默认内容设计策略完全解析](https://blog.cmdragon.cn/posts/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/)
- [Vue 3 插槽内容分发机制的基础概念与工作原理完全解析](https://blog.cmdragon.cn/posts/f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6/)
- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3生命周期钩子实战指南：如何正确选择onMounted、onUpdated与onUnmounted的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue 3组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
- [Vue组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)
- [Vue3组件化开发中，Props与Emits如何实现数据流转与事件协作？](https://blog.cmdragon.cn/posts/8cff7d2df113da66ea7be560c4d1d22a/)
- [Vue 3模板引用如何与其他特性协同实现复杂交互？](https://blog.cmdragon.cn/posts/331bf75d114ab09116eadfcdca602b58/)
- [Vue 3 v-for中模板引用如何实现高效管理与动态控制？](https://blog.cmdragon.cn/posts/cb380897ddc3578b180ecf8843c774c1/)
- [Vue 3的defineExpose：如何突破script setup组件默认封装，实现精准的父子通讯？](https://blog.cmdragon.cn/posts/202ae0f4acde7128e0e31baf63732fb5/)
- [Vue 3模板引用的生命周期时机如何把握？常见陷阱该如何避免？](https://blog.cmdragon.cn/posts/7d2a0f6555ecbe92afd7d2491c427463/)
- [Vue 3模板引用如何实现父组件与子组件的高效交互？](https://blog.cmdragon.cn/posts/3fb7bdd84128b7efaaa1c979e1f28dee/)
- [Vue中为何需要模板引用？又如何高效实现DOM与组件实例的直接访问？](https://blog.cmdragon.cn/posts/23f3464ba16c7054b4783cded50c04c6/)
- [Vue 3 watch与watchEffect如何区分使用？常见陷阱与性能优化技巧有哪些？](https://blog.cmdragon.cn/posts/68a26cc0023e4994a6bc54fb767365c8/)
- [Vue3侦听器实战：组件与Pinia状态监听如何高效应用？](https://blog.cmdragon.cn/posts/fd4695f668d64332dda9962c24214f32/)
- [Vue 3中何时用watch，何时用watchEffect？核心区别及性能优化策略是什么？](https://blog.cmdragon.cn/posts/cdbbb1837f8c093252e61f46dbf0a2e7/)
- [Vue 3中如何有效管理侦听器的暂停、恢复与副作用清理？](https://blog.cmdragon.cn/posts/09551ab614c463a6d6ca69818e8c2d52/)
- [Vue 3 watchEffect：如何实现响应式依赖的自动追踪与副作用管理？](https://blog.cmdragon.cn/posts/b7bca5d20f628ac09f7192ad935ef664/)
- [Vue 3 watch如何利用immediate、once、deep选项实现初始化、一次性与深度监听？](https://blog.cmdragon.cn/posts/2c6cdb100a20f10c7e7d4413617c7ea9/)
- [Vue 3中watch如何高效监听多数据源、计算结果与数组变化？](https://blog.cmdragon.cn/posts/757a1728bc1b9c0c8b317b0354d85568/)
- [Vue 3中watch监听ref和reactive的核心差异与注意事项是什么？](https://blog.cmdragon.cn/posts/8e70552f0f61e0dc8c7f567a2d272345/)
- [Vue3中Watch与watchEffect的核心差异及适用场景是什么？](https://blog.cmdragon.cn/posts/dde70ab90dc5062c435e0501f5a6e7cb/)
- [Vue 3自定义指令如何赋能表单自动聚焦与防抖输入的高效实现？](https://blog.cmdragon.cn/posts/1f5ed5047850ed52c0fd0386f76bd4ae/)
- [Vue3中如何优雅实现支持多绑定变量和修饰符的双向绑定组件？](https://blog.cmdragon.cn/posts/e3d4e128815ad731611b8ef29e37616b/)
- [Vue 3表单验证如何从基础规则到异步交互构建完整验证体系？](https://blog.cmdragon.cn/posts/7d1caedd822f70542aa0eed67e30963b/)
- [Vue3响应式系统如何支撑表单数据的集中管理、动态扩展与实时计算？](https://blog.cmdragon.cn/posts/3687a5437ab56cb082b5b813d5577a40/)
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
- [Vue v-for的key：为什么它能解决列表渲染中的"玄学错误"？选错会有哪些后果？](https://blog.cmdragon.cn/posts/1eb3ffac668a743843b5ea1738301d40/)
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
- [快速入门Vue模板引用：从收DOM"快递"到调子组件方法，你玩明白了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbce4f2a23aa72c96b1c0473900321e/)
- [快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/23a2d5a334e15575277814c16e45df50/)
- [快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6be38de6382e31d282659b689c5b17f0/)
- [快速入门Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/60ce517684f4a418f453d66aa805606c/)
- [快速入门Vue3的v-指令：数据和DOM的"翻译官"到底有多少本事？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e4ae7d5e4a9205bb11b2baccb230c637/)
- [快速入门Vue3，插值、动态绑定和避坑技巧你都搞懂了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/999ce4fb32259ff4fbf4bf7bcb851654/)
- [想让PostgreSQL快到飞起？先找健康密码还是先换引擎？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a6997d81b49cd232b87e1cf603888ad1/)
- [想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)
- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
- [PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)
- [复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)
- [只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)
- [B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)
- [想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)
- [PostgreSQL的"时光机"MVCC和锁机制是怎么搞定高并发的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)
- [PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)
- [大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么"分类"才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)
- [PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)
- [PostgreSQL里的子查询和CTE居然在性能上"掐架"？到底该站哪边？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c096347d18e67b7431faacd2c4757093/)
- [PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)
- [PostgreSQL新手SQL总翻车？这7个性能陷阱你踩过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/068ecb772a87d7df20a8c9fb4b233f8e/)
- [PostgreSQL索引选B-Tree还是GiST？"瑞士军刀"和"多面手"的差别你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)
- [想知道数据库怎么给查询"算成本选路线"？EXPLAIN能帮你看明白？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)
- [PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)
- [PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)
- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从"说目标"变"讲步骤"？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的"飞"起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的"仓库-房间-货架"游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
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

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
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
