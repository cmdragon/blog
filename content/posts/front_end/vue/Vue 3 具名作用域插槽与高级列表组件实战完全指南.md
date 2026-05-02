---
url: /posts/e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1/
title: Vue 3 具名作用域插槽与高级列表组件实战完全指南
date: 2026-05-02T12:30:00+08:00
lastmod: 2026-05-02T12:30:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/

summary: 本文深入讲解Vue 3具名作用域插槽的使用方式，通过高级列表组件FancyList的完整实现案例，展示如何结合v-bind传递插槽Props、如何在循环中渲染作用域插槽，以及如何处理具名作用域插槽与默认插槽的混用场景。

categories:
  - vue

tags:
  - 基础入门
  - 具名作用域插槽
  - 高级列表组件
  - v-bind传递
  - 组件复用
  - 实战案例
  - 插槽Props
  - 列表渲染
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、具名作用域插槽的基础使用

具名插槽同样可以传递Props，父组件需要在对应的具名插槽上接收：

### 1.1 子组件传递Props到具名插槽

```vue
<!-- MyComponent.vue -->
<template>
  <div>
    <!-- 向具名插槽传递Props -->
    <slot name="header" :message="hello"></slot>

    <!-- 向默认插槽传递Props -->
    <slot :content="mainContent"></slot>
  </div>
</template>

<script setup>
import { ref } from "vue";

const hello = ref("Hello from header slot");
const mainContent = ref("Main content here");
</script>
```

### 1.2 父组件接收具名作用域插槽Props

```vue
<!-- ParentComponent.vue -->
<template>
  <MyComponent>
    <!-- 接收具名作用域插槽Props -->
    <template #header="headerProps">
      {{ headerProps }}
    </template>

    <!-- 接收默认作用域插槽Props -->
    <template #default="defaultProps">
      {{ defaultProps }}
    </template>
  </MyComponent>
</template>
```

### 1.3 使用解构语法简化

```vue
<template>
  <MyComponent>
    <template #header="{ message }">
      <h2>{{ message }}</h2>
    </template>

    <template #default="{ content }">
      <p>{{ content }}</p>
    </template>
  </MyComponent>
</template>
```

## 二、重要注意事项：name属性不作为Props传递

```vue
<!-- 子组件 -->
<template>
  <slot name="header" message="hello"></slot>
</template>
```

注意：插槽上的`name`是Vue特别保留的attribute，不会作为Props传递给插槽。最终`headerProps`的结果是`{ message: 'hello' }`，不包含`name`属性。

## 三、混用默认插槽与具名插槽的正确方式

### 3.1 错误写法

当同时使用具名插槽与默认插槽时，直接为组件添加`v-slot`指令将导致编译错误：

```vue
<!-- 错误：无法编译 -->
<MyComponent v-slot="{ message }">
  <p>{{ message }}</p>
  <template #footer>
    <!-- message 属于默认插槽，此处不可用 -->
    <p>{{ message }}</p>
  </template>
</MyComponent>
```

### 3.2 正确写法

为默认插槽使用显式的`<template>`标签：

```vue
<!-- 正确：使用显式的默认插槽 -->
<MyComponent>
  <template #default="{ message }">
    <p>{{ message }}</p>
  </template>

  <template #footer>
    <p>底部内容</p>
  </template>
</MyComponent>
```

## 四、高级列表组件实战

### 4.1 完整实现FancyList组件

```vue
<!-- FancyList.vue -->
<template>
  <div class="fancy-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="list-loading">
      <slot name="loading">
        <div class="default-loading">加载中...</div>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-else-if="items.length === 0" class="list-empty">
      <slot name="empty">
        <div class="default-empty">暂无数据</div>
      </slot>
    </div>

    <!-- 列表内容 -->
    <ul v-else class="list-content">
      <li v-for="item in items" :key="item.id" class="list-item">
        <!-- 使用v-bind传递整个item对象作为插槽Props -->
        <slot name="item" v-bind="item"></slot>
      </li>
    </ul>

    <!-- 分页 -->
    <div v-if="showPagination" class="list-pagination">
      <slot
        name="pagination"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :onPrev="goToPrevPage"
        :onNext="goToNextPage"
      >
        <div class="default-pagination">
          <button :disabled="currentPage <= 1" @click="goToPrevPage">
            上一页
          </button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button :disabled="currentPage >= totalPages" @click="goToNextPage">
            下一页
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["page-change"]);

const items = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / props.perPage));

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `${props.apiUrl}?page=${currentPage.value}&perPage=${props.perPage}`,
    );
    const data = await response.json();
    items.value = data.items;
    totalItems.value = data.total;
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    emits("page-change", currentPage.value);
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    emits("page-change", currentPage.value);
  }
};

watch(currentPage, fetchData);

onMounted(fetchData);

defineExpose({
  refresh: fetchData,
  currentPage,
});
</script>

<style scoped>
.fancy-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.list-loading,
.list-empty {
  padding: 40px;
  text-align: center;
  color: #666;
}

.list-content {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.list-item:last-child {
  border-bottom: none;
}

.list-pagination {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.default-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}

.default-pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.default-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 4.2 使用FancyList组件

```vue
<!-- ParentComponent.vue -->
<template>
  <div>
    <FancyList :api-url="url" :per-page="10">
      <!-- 自定义加载状态 -->
      <template #loading>
        <div class="custom-loading">
          <div class="spinner"></div>
          <p>正在获取数据...</p>
        </div>
      </template>

      <!-- 自定义空状态 -->
      <template #empty>
        <div class="custom-empty">
          <img src="/empty-state.svg" alt="空状态" />
          <p>没有找到任何内容</p>
        </div>
      </template>

      <!-- 自定义列表项渲染 -->
      <template #item="{ id, body, username, likes, createdAt }">
        <div class="custom-item">
          <div class="item-header">
            <span class="author">{{ username }}</span>
            <time class="date">{{ formatDate(createdAt) }}</time>
          </div>
          <p class="content">{{ body }}</p>
          <div class="item-footer">
            <span class="likes">❤️ {{ likes }}</span>
            <button class="btn-share">分享</button>
          </div>
        </div>
      </template>

      <!-- 自定义分页 -->
      <template #pagination="{ currentPage, totalPages, onPrev, onNext }">
        <div class="custom-pagination">
          <button @click="onPrev" :disabled="currentPage <= 1">← 上一页</button>
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          <button @click="onNext" :disabled="currentPage >= totalPages">
            下一页 →
          </button>
        </div>
      </template>
    </FancyList>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FancyList from "./FancyList.vue";

const url = ref("https://api.example.com/posts");

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("zh-CN");
};
</script>

<style scoped>
.custom-loading,
.custom-empty {
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-item {
  padding: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.author {
  font-weight: 600;
  color: #333;
}

.date {
  color: #999;
  font-size: 14px;
}

.content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.likes {
  color: #e91e63;
}

.btn-share {
  padding: 4px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.custom-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}

.custom-pagination button {
  padding: 6px 12px;
  border: 1px solid #42b983;
  background-color: #fff;
  color: #42b983;
  cursor: pointer;
  border-radius: 4px;
}

.custom-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}
</style>
```

## 五、v-bind在作用域插槽中的妙用

在循环中多次渲染`<slot>`并每次都提供不同的数据时，可以使用`v-bind`：

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- 使用v-bind传递整个item对象 -->
      <slot name="item" v-bind="item"></slot>
    </li>
  </ul>
</template>
```

这等价于：

```vue
<slot
  name="item"
  :id="item.id"
  :title="item.title"
  :body="item.body"
  :author="item.author"
></slot>
```

使用`v-bind`更加简洁，也更容易维护。

## 六、课后Quiz

### 题目1：当同时使用默认作用域插槽和具名插槽时，为什么不能直接为组件添加v-slot指令？

A. Vue不支持这种语法
B. 避免默认插槽Props作用域与具名插槽混淆
C. 会影响性能
D. 会导致内存泄漏

**答案解析：B**

直接为组件添加`v-slot`指令时，默认插槽的Props作用域会与具名插槽混淆，导致在具名插槽中错误地访问默认插槽的Props。使用显式的`<template #default>`可以明确作用域边界。

### 题目2：在列表循环中渲染插槽，如何高效传递每个item的数据？

A. `<slot name="item" :item="item"></slot>`
B. `<slot name="item" v-bind="item"></slot>`
C. `<slot name="item" :data="JSON.stringify(item)"></slot>`
D. `<slot name="item" :props="item"></slot>`

**答案解析：B**

使用`v-bind="item"`可以将item对象的所有属性作为插槽Props传递，父组件可以直接解构使用，简洁且高效。

### 题目3：具名作用域插槽的Props中是否包含name属性？

A. 包含
B. 不包含
C. 取决于子组件实现
D. 只有在显式传递时才包含

**答案解析：B**

`name`是Vue特别保留的attribute，用于标识插槽名称，不会作为Props传递给插槽。这是Vue的设计规则。

## 七、常见报错解决方案

### 1. 报错：同时使用具名插槽和默认插槽时编译错误

**原因**：直接在组件标签上使用`v-slot`指令，同时内部又有具名插槽。

**解决办法**：

```vue
<!-- 错误 -->
<MyComponent v-slot="{ message }">
  <p>{{ message }}</p>
  <template #footer>内容</template>
</MyComponent>

<!-- 正确 -->
<MyComponent>
  <template #default="{ message }">
    <p>{{ message }}</p>
  </template>
  <template #footer>内容</template>
</MyComponent>
```

### 2. 报错：v-bind传递的对象属性未定义

**原因**：传递给`v-bind`的对象可能为null或undefined。

**解决办法**：

```vue
<slot name="item" v-bind="item || {}"></slot>
```

### 3. 预防建议

- 始终为默认插槽使用显式的`<template>`标签
- 使用TypeScript为插槽Props提供类型约束
- 为可能为空的v-bind对象提供默认空对象

## 参考链接：https://cn.vuejs.org/guide/components/slots.html#named-scoped-slots

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 具名作用域插槽与高级列表组件实战完全指南](https://blog.cmdragon.cn/posts/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0/)
