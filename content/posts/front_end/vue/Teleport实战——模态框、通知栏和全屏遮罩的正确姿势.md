---
url: /posts/t4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9/
title: Teleport实战——模态框、通知栏和全屏遮罩的正确姿势
date: 2026-05-19T18:30:00+08:00
lastmod: 2026-05-19T18:30:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/2026年6月17日 14_53_23.png

summary: 理论学完了，来点实际的！模态框组件怎么配合Transition做动画？通知栏怎么实现堆叠和自动消失？全屏遮罩怎么防止滚动穿透？三个完整实战案例，拿去直接用。

categories:
  - vue

tags:
  - 基础入门
  - Teleport
  - 模态框
  - 通知栏
  - 全屏遮罩
  - Transition
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2026年6月17日 14_53_23.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、带动画的模态框

模态框是Teleport最经典的场景。加上Transition动画就更丝滑了。

### 完整的Modal组件

```vue
<!-- Modal.vue -->
<script setup>
import { watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

function close() {
  emit("update:modelValue", false);
}

// 打开时禁止body滚动，防止穿透
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <div class="modal-header">
            <slot name="header">标题</slot>
            <button class="close-btn" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot>弹窗内容</slot>
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <button @click="close">关闭</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

/* Transition动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
```

### 使用Modal组件

```vue
<script setup>
import { ref } from "vue";
import Modal from "./Modal.vue";

const showModal = ref(false);
</script>

<template>
  <button @click="showModal = true">打开弹窗</button>

  <Modal v-model="showModal">
    <template #header>确认操作</template>
    <p>你确定要执行这个操作吗？</p>
    <template #footer>
      <button @click="showModal = false">取消</button>
      <button @click="showModal = false">确认</button>
    </template>
  </Modal>
</template>
```

关键点：

- Teleport把弹窗传到body，不受任何父元素影响
- Transition包裹弹窗内容，添加淡入缩放动画
- 点击遮罩层（.modal-overlay）关闭弹窗（@click.self确保只有点遮罩本身才关闭）
- watch监听modelValue，打开时禁止body滚动

## 二、通知栏（Toast）

通知栏需要多个实例堆叠，自动消失，这正是Teleport共享目标的典型场景。

### Toast容器和组件

```vue
<!-- ToastItem.vue -->
<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: "info", // info / success / warning / error
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const emit = defineEmits(["close"]);
const visible = ref(false);

onMounted(() => {
  // 入场动画
  requestAnimationFrame(() => {
    visible.value = true;
  });

  // 自动消失
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false;
      // 等动画播完再触发关闭
      setTimeout(() => emit("close"), 300);
    }, props.duration);
  }
});
</script>

<template>
  <Teleport to="#toast-container">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast-${type}`]">
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.toast-info {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}
.toast-success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.toast-warning {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}
.toast-error {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
```

### Toast管理器

```javascript
// toast.js
import { createApp, h } from "vue";
import ToastItem from "./ToastItem.vue";

// 在body中创建容器
function ensureContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:2000;";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, options = {}) {
  ensureContainer();

  const { type = "info", duration = 3000 } = options;

  // 创建Toast实例
  const wrapper = document.createElement("div");
  document.getElementById("toast-container").appendChild(wrapper);

  const app = createApp({
    render() {
      return h(ToastItem, {
        message,
        type,
        duration,
        onClose: () => {
          app.unmount();
          wrapper.remove();
        },
      });
    },
  });

  app.mount(wrapper);
}
```

### 使用Toast

```javascript
import { showToast } from "./toast";

showToast("操作成功！", { type: "success" });
showToast("请先登录", { type: "warning" });
showToast("网络错误", { type: "error", duration: 5000 });
```

## 三、全屏遮罩

全屏遮罩需要覆盖整个页面，而且要防止滚动穿透。

```vue
<!-- Overlay.vue -->
<script setup>
import { watch, ref } from "vue";

const props = defineProps({
  visible: Boolean,
  preventScroll: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:visible"]);

function close() {
  emit("update:visible", false);
}

// 防止滚动穿透
watch(
  () => props.visible,
  (val) => {
    if (props.preventScroll) {
      document.body.style.overflow = val ? "hidden" : "";
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="fullscreen-overlay" @click="close">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
```

### 使用全屏遮罩

```vue
<script setup>
import { ref } from "vue";
import Overlay from "./Overlay.vue";

const showOverlay = ref(false);
</script>

<template>
  <button @click="showOverlay = true">显示遮罩</button>

  <Overlay v-model:visible="showOverlay">
    <div style="background: white; padding: 40px; border-radius: 12px;">
      <h2>全屏遮罩内容</h2>
      <p>点击遮罩或按钮关闭</p>
      <button @click="showOverlay = false">关闭</button>
    </div>
  </Overlay>
</template>
```

## 四、三个实战案例的对比

| 特性               | 模态框  | 通知栏           | 全屏遮罩 |
| ------------------ | ------- | ---------------- | -------- |
| Teleport目标       | body    | #toast-container | body     |
| 是否需要Transition | 是      | 是               | 是       |
| 多实例共存         | 通常1个 | 多个堆叠         | 通常1个  |
| 自动消失           | 否      | 是               | 否       |
| 防滚动穿透         | 是      | 否               | 是       |
| 点击遮罩关闭       | 是      | 否               | 是       |

## 课后Quiz

### 问题1：为什么模态框组件中要用watch监听modelValue来禁止body滚动？

**答案解析：** 因为模态框打开时，用户滚动鼠标会穿透到下面的页面，导致页面跟着滚动。通过在模态框打开时设置 `document.body.style.overflow = 'hidden'`，关闭时恢复，可以防止滚动穿透。必须在watch中做而不是在onMounted中，因为模态框可能多次打开关闭。

### 问题2：通知栏组件为什么要用Teleport传到#toast-container而不是body？

**答案解析：** 传到#toast-container可以统一管理所有通知的布局和样式。如果传到body，通知会散落在body下面，和其他Teleport内容混在一起，不方便统一设置定位和排列方式。专用容器让通知集中管理，样式更好控制。

## 常见报错解决方案

### 1. 模态框打开后页面还能滚动

**错误现象：** 模态框打开了，但滚动鼠标页面还是跟着动。

**可能原因：** 没有禁止body滚动，或者overflow:hidden被其他样式覆盖。

**解决方案：** 在模态框打开时设置 `document.body.style.overflow = 'hidden'`，关闭时恢复。确保没有其他样式覆盖这个设置。

### 2. 通知栏容器不存在导致Teleport报错

**错误现象：** showToast调用时报 "Invalid Teleport target"。

**可能原因：** #toast-container容器还没有被创建。

**解决方案：** 在showToast函数中先调用ensureContainer确保容器存在，然后再渲染Toast组件。容器可以动态创建并添加到body中。

### 3. Transition动画不生效

**错误现象：** Teleport内的Transition没有过渡动画，内容直接出现/消失。

**可能原因：** Transition的name和CSS类名不匹配，或者CSS选择器没有正确匹配Teleport内的元素。

**解决方案：** 检查Transition的name属性和对应的CSS类名是否匹配。比如name="modal"对应的类名是 `.modal-enter-active`、`.modal-leave-active` 等。确保CSS写在Teleport内部组件的scoped样式中。

参考链接：

- https://cn.vuejs.org/guide/built-ins/teleport.html
- https://cn.vuejs.org/guide/built-ins/transition.html
- https://cn.vuejs.org/examples/#modal

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Teleport实战——模态框、通知栏和全屏遮罩的正确姿势](https://blog.cmdragon.cn/posts/t4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3生命周期钩子实战指南：如何正确选择onMounted、onUpdated与onUnmounted的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)

</details>

<details>
<summary>免费好用的热门在线工具</summary>

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [CMDragon 在线工具 - 高级AI工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现1000+提升效率与开发的AI工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)

</details>
