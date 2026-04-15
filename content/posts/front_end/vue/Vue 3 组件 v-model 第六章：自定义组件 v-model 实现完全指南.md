---
url: /posts/vue3-component-v-model-chapter-6-custom-implementation/
title: Vue 3 组件 v-model 完全指南（六）：自定义组件 v-model 实现完全指南——从表单封装到复杂数据结构
date: 2026-04-15T10:00:00+08:00
lastmod: 2026-04-15T10:00:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/0bea77e965584232b48a3cef5dc16eb1~tplv-5jbd59dj06-image.png

summary: 掌握 Vue 3 自定义组件 v-model 的完整实现方案，从表单组件到非表单组件，从简单数据到复杂结构的双向绑定。

categories:
  - vue

tags:
  - v-model
  - 自定义组件
  - 双向绑定
  - 组件设计
  - 表单封装
  - 实战技巧
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/0bea77e965584232b48a3cef5dc16eb1~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现 1000+ 提升效率与开发的 AI 工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 表单类组件的 v-model 封装

### 1.1 基础输入组件

```vue
<!-- BaseInput.vue - 基础输入组件 -->
<template>
  <div class="base-input" :class="{ 'is-disabled': disabled }">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-wrapper">
      <span v-if="prefixIcon" class="prefix-icon">
        <component :is="prefixIcon" />
      </span>

      <input
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        class="input-field"
        :class="{
          'has-prefix': prefixIcon,
          'has-suffix': suffixIcon || clearable,
        }"
      />

      <span v-if="suffixIcon" class="suffix-icon">
        <component :is="suffixIcon" />
      </span>

      <span
        v-if="clearable && modelValue"
        @click="handleClear"
        class="clear-icon"
      >
        ×
      </span>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-if="helperText && !error" class="helper-text">{{
      helperText
    }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
    validator: (value) => {
      return [
        "text",
        "number",
        "password",
        "email",
        "tel",
        "url",
        "search",
      ].includes(value);
    },
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: [String, Number],
    default: null,
  },
  prefixIcon: {
    type: String,
    default: "",
  },
  suffixIcon: {
    type: String,
    default: "",
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  helperText: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "input",
  "focus",
  "blur",
  "clear",
]);

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
  emit("input", { value: event.target.value, event });
};

const handleFocus = (event) => {
  emit("focus", { value: props.modelValue, event });
};

const handleBlur = (event) => {
  emit("blur", { value: props.modelValue, event });
};

const handleClear = () => {
  emit("update:modelValue", "");
  emit("clear");
};
</script>

<style scoped>
.base-input {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required {
  color: #f44336;
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  background: #fff;
}

.input-field.has-prefix {
  padding-left: 36px;
}

.input-field.has-suffix {
  padding-right: 36px;
}

.input-field:hover:not(:disabled):not(:readonly) {
  border-color: #42b883;
}

.input-field:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.input-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.prefix-icon,
.suffix-icon {
  position: absolute;
  display: flex;
  align-items: center;
  color: #999;
}

.prefix-icon {
  left: 12px;
}

.suffix-icon {
  right: 12px;
}

.clear-icon {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #999;
  font-size: 18px;
  line-height: 1;
  transition: color 0.3s;
}

.clear-icon:hover {
  color: #666;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #f44336;
  font-size: 12px;
}

.helper-text {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.base-input.is-disabled .input-field {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>
```

### 1.2 选择器组件

```vue
<!-- SelectPicker.vue - 选择器组件 -->
<template>
  <div class="select-picker">
    <label v-if="label" class="picker-label">{{ label }}</label>

    <div class="select-wrapper">
      <select
        :value="modelValue"
        @change="handleChange"
        :disabled="disabled"
        class="select-field"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <span class="select-arrow">▼</span>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const handleChange = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);
  emit("change", { value, event });
};
</script>

<style scoped>
.select-picker {
  margin-bottom: 16px;
}

.picker-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.select-wrapper {
  position: relative;
}

.select-field {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.3s;
}

.select-field:hover:not(:disabled) {
  border-color: #42b883;
}

.select-field:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.select-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-field option:disabled {
  color: #999;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 10px;
  pointer-events: none;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #f44336;
  font-size: 12px;
}
</style>
```

### 1.3 复选框组组件

```vue
<!-- CheckboxGroup.vue - 复选框组组件 -->
<template>
  <div class="checkbox-group">
    <label v-if="label" class="group-label">{{ label }}</label>

    <div class="checkbox-list">
      <label
        v-for="option in options"
        :key="option.value"
        class="checkbox-item"
        :class="{
          'is-checked': isChecked(option.value),
          'is-disabled': option.disabled,
        }"
      >
        <input
          type="checkbox"
          :checked="isChecked(option.value)"
          @change="handleCheckboxChange"
          :value="option.value"
          :disabled="option.disabled"
          class="checkbox-input"
        />
        <span class="checkbox-text">{{ option.label }}</span>
      </label>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
  label: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isChecked = (value) => {
  return props.modelValue.includes(value);
};

const handleCheckboxChange = (event) => {
  const value = event.target.value;
  const checked = event.target.checked;

  let newValue;
  if (checked) {
    newValue = [...props.modelValue, value];
  } else {
    newValue = props.modelValue.filter((v) => v !== value);
  }

  emit("update:modelValue", newValue);
  emit("change", { value, checked, newValue: [...newValue] });
};
</script>

<style scoped>
.checkbox-group {
  margin-bottom: 16px;
}

.group-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-input:disabled {
  cursor: not-allowed;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
}
</style>
```

## 2. 非表单组件的双向绑定设计

### 2.1 计数器组件

```vue
<!-- Counter.vue - 计数器组件 -->
<template>
  <div class="counter" :class="{ 'is-disabled': disabled }">
    <button
      @click="handleDecrement"
      :disabled="disabled || currentValue <= min"
      class="counter-btn decrement"
      type="button"
    >
      -
    </button>

    <span class="counter-value">{{ displayValue }}</span>

    <button
      @click="handleIncrement"
      :disabled="disabled || currentValue >= max"
      class="counter-btn increment"
      type="button"
    >
      +
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  format: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "change",
  "increment",
  "decrement",
]);

const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

const displayValue = computed(() => {
  if (props.format) {
    return props.format(props.modelValue);
  }
  return props.modelValue;
});

const handleIncrement = () => {
  if (currentValue.value < props.max) {
    const newValue = currentValue.value + props.step;
    currentValue.value = Math.min(newValue, props.max);
    emit("change", currentValue.value);
    emit("increment");
  }
};

const handleDecrement = () => {
  if (currentValue.value > props.min) {
    const newValue = currentValue.value - props.step;
    currentValue.value = Math.max(newValue, props.min);
    emit("change", currentValue.value);
    emit("decrement");
  }
};
</script>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.counter-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #42b883;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-btn:hover:not(:disabled) {
  background: #369970;
  transform: scale(1.1);
}

.counter-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.counter-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  min-width: 48px;
  text-align: center;
}

.counter.is-disabled {
  opacity: 0.6;
}
</style>
```

### 2.2 评分组件

```vue
<!-- Rating.vue - 评分组件 -->
<template>
  <div class="rating" :class="{ 'is-readonly': readonly }">
    <div
      v-for="star in max"
      :key="star"
      @click="handleClick(star)"
      @mouseenter="handleHover(star)"
      @mouseleave="handleLeave"
      class="star"
      :class="{
        'is-active': star <= currentValue,
        'is-hovered': hoverValue !== null && star <= hoverValue,
      }"
    >
      <span class="star-icon">★</span>
    </div>

    <span v-if="showScore" class="score-text">
      {{ currentValue }} / {{ max }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 5,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  showScore: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const hoverValue = ref(null);

const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

const handleClick = (star) => {
  if (!props.readonly) {
    currentValue.value = star;
    emit("change", star);
  }
};

const handleHover = (star) => {
  if (!props.readonly) {
    hoverValue.value = star;
  }
};

const handleLeave = () => {
  hoverValue.value = null;
};
</script>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.star {
  cursor: pointer;
  transition: transform 0.3s;
}

.star:hover {
  transform: scale(1.2);
}

.star.is-active .star-icon,
.star.is-hovered .star-icon {
  color: #ffd700;
}

.star-icon {
  font-size: 24px;
  color: #ddd;
  transition: color 0.3s;
}

.score-text {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

.rating.is-readonly .star {
  cursor: default;
}

.rating.is-readonly .star:hover {
  transform: none;
}
</style>
```

### 2.3 开关组件

```vue
<!-- ToggleSwitch.vue - 开关组件 -->
<template>
  <div
    @click="handleToggle"
    class="toggle-switch"
    :class="{
      'is-checked': modelValue,
      'is-disabled': disabled,
    }"
  >
    <div class="toggle-core">
      <div class="toggle-button">
        <span v-if="loading" class="loading-spinner"></span>
      </div>
    </div>

    <span v-if="label" class="toggle-label">{{ label }}</span>

    <span v-if="showStatus" class="toggle-status">
      {{ modelValue ? activeText : inactiveText }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
  activeText: {
    type: String,
    default: "开",
  },
  inactiveText: {
    type: String,
    default: "关",
  },
});

const emit = defineEmits(["update:modelValue", "change", "toggle"]);

const handleToggle = () => {
  if (!props.disabled && !props.loading) {
    const newValue = !props.modelValue;
    emit("update:modelValue", newValue);
    emit("change", newValue);
    emit("toggle");
  }
};
</script>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-core {
  position: relative;
  width: 44px;
  height: 22px;
  background: #ddd;
  border-radius: 11px;
  transition: background 0.3s;
}

.toggle-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch.is-checked .toggle-core {
  background: #42b883;
}

.toggle-switch.is-checked .toggle-button {
  left: 24px;
}

.toggle-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid #ddd;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toggle-label {
  font-size: 14px;
  color: #333;
}

.toggle-status {
  font-size: 12px;
  color: #666;
  min-width: 24px;
}
</style>
```

## 3. 复杂数据结构的 v-model 处理

### 3.1 日期范围选择器

```vue
<!-- DateRangePicker.vue - 日期范围选择器 -->
<template>
  <div class="date-range-picker">
    <label v-if="label" class="picker-label">{{ label }}</label>

    <div class="date-inputs">
      <input
        :value="formattedStartDate"
        @input="handleStartInput"
        @blur="handleStartBlur"
        type="text"
        placeholder="开始日期"
        class="date-input"
      />

      <span class="separator">至</span>

      <input
        :value="formattedEndDate"
        @input="handleEndInput"
        @blur="handleEndBlur"
        type="text"
        placeholder="结束日期"
        class="date-input"
      />
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ start: "", end: "" }),
  },
  label: {
    type: String,
    default: "",
  },
  format: {
    type: Function,
    default: (date) => (date ? new Date(date).toLocaleDateString() : ""),
  },
  parse: {
    type: Function,
    default: (str) => (str ? new Date(str).toISOString() : ""),
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const formattedStartDate = computed(() => {
  return props.format(props.modelValue.start);
});

const formattedEndDate = computed(() => {
  return props.format(props.modelValue.end);
});

const handleStartInput = (event) => {
  const value = props.parse(event.target.value);
  const newValue = { ...props.modelValue, start: value };
  emit("update:modelValue", newValue);
  emit("change", newValue);
};

const handleEndInput = (event) => {
  const value = props.parse(event.target.value);
  const newValue = { ...props.modelValue, end: value };
  emit("update:modelValue", newValue);
  emit("change", newValue);
};

const handleStartBlur = () => {
  // 可以在这里添加验证逻辑
};

const handleEndBlur = () => {
  // 可以在这里添加验证逻辑
};
</script>

<style scoped>
.date-range-picker {
  margin-bottom: 16px;
}

.picker-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.date-input:focus {
  outline: none;
  border-color: #42b883;
}

.separator {
  color: #999;
  font-size: 14px;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #f44336;
  font-size: 12px;
}
</style>
```

### 3.2 标签输入组件

```vue
<!-- TagInput.vue - 标签输入组件 -->
<template>
  <div class="tag-input">
    <label v-if="label" class="input-label">{{ label }}</label>

    <div class="tag-container">
      <span v-for="(tag, index) in tags" :key="index" class="tag">
        {{ tag }}
        <span @click="removeTag(index)" class="remove-tag">×</span>
      </span>

      <input
        :value="inputValue"
        @input="handleInput"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        placeholder="输入标签后按回车"
        class="tag-input-field"
      />
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  maxTags: {
    type: Number,
    default: 10,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change", "add", "remove"]);

const inputValue = ref("");

const tags = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

const handleInput = (event) => {
  inputValue.value = event.target.value;
};

const addTag = () => {
  const tag = inputValue.value.trim();

  if (!tag || tags.value.length >= props.maxTags) {
    return;
  }

  const newTags = [...tags.value, tag];
  tags.value = newTags;
  inputValue.value = "";

  emit("change", newTags);
  emit("add", tag);
};

const removeTag = (index) => {
  const tag = tags.value[index];
  const newTags = tags.value.filter((_, i) => i !== index);
  tags.value = newTags;

  emit("change", newTags);
  emit("remove", tag);
};

const handleBackspace = () => {
  if (!inputValue.value && tags.value.length > 0) {
    removeTag(tags.value.length - 1);
  }
};
</script>

<style scoped>
.tag-input {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 6px;
  min-height: 44px;
  transition: border-color 0.3s;
}

.tag-container:focus-within {
  border-color: #42b883;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #42b883;
  color: white;
  border-radius: 4px;
  font-size: 13px;
}

.remove-tag {
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  opacity: 0.8;
}

.remove-tag:hover {
  opacity: 1;
}

.tag-input-field {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  padding: 6px;
  font-size: 14px;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #f44336;
  font-size: 12px;
}
</style>
```

## 4. 课后 Quiz

### 题目 1：表单组件设计

**问题：** 设计一个可复用的表单组件需要考虑哪些关键要素？

**答案：**

1. modelValue prop 和 update:modelValue 事件
2. 辅助 props（label、placeholder、disabled 等）
3. 额外事件（focus、blur、change 等）
4. 错误处理和帮助文本
5. 可访问性（label、id、aria 属性）
6. 样式定制能力

### 题目 2：非表单组件 v-model

**问题：** 非表单组件如何实现 v-model 双向绑定？

**答案：**
通过 computed 属性的 getter/setter 模式，getter 返回 modelValue，setter 触发 update:modelValue 事件。

### 题目 3：复杂数据结构

**问题：** 如何处理对象或数组类型的 v-model？

**答案：**
使用 computed 的 getter/setter，在 setter 中创建新的对象或数组副本，避免直接修改原数据。

## 5. 常见报错解决方案

### 报错 1：对象直接修改

**产生原因：**

- 直接修改对象 prop 而非创建新副本

**解决办法：**

```vue
<script setup>
const props = defineProps({
  modelValue: Object,
});

const emit = defineEmits(["update:modelValue"]);

// ✅ 正确：创建新副本
const updateValue = () => {
  emit("update:modelValue", { ...props.modelValue, key: newValue });
};
</script>
```

### 报错 2：数组响应式丢失

**产生原因：**

- 使用索引直接修改数组

**解决办法：**

```vue
<script setup>
// ✅ 正确：使用数组方法
const addTag = (tag) => {
  emit("update:modelValue", [...props.modelValue, tag]);
};
</script>
```

---

参考链接：https://vuejs.org/guide/components/v-model.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 组件 v-model 第六章：自定义组件 v-model 实现完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-6-custom-implementation/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 组件 v-model 第五章：修饰符使用完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-5-modifiers/)
- [Vue 3 组件 v-model 第四章：参数与动态绑定完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-4-dynamic-binding/)
- [Vue 3 组件 v-model 第三章：多个 v-model 绑定完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-3-multiple-binding/)
- [Vue 3 组件 v-model 第二章：单个 v-model 的基础使用完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-2-single-binding/)
- [Vue 3 组件 v-model 第一章：基础概念与语法糖本质完全解析](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-1-fundamentals/)

</details>

<details>
<summary>免费好用的热门在线工具</summary>

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto 文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8 在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [快图设计 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/quick-image-design)
- [高级文字转图片转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-image-advanced)
- [RAID 计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/raid-calculator)
- [在线 PS - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/photoshop-online)
- [CMDragon 在线工具 - 高级 AI 工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)

</details>
