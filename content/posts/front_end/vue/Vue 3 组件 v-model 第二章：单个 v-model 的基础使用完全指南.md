---
url: /posts/vue3-component-v-model-chapter-2-single-binding/
title: Vue 3 组件 v-model 完全指南（二）：单个 v-model 基础实现——modelValue 与事件机制详解
date: 2026-04-11T10:00:00+08:00
lastmod: 2026-04-11T10:00:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/16c32dca56284c5db4c9fec6c8172494~tplv-5jbd59dj06-image.png

summary: 掌握 Vue 3 单个 v-model 的完整实现，从 modelValue prop 定义到 update:modelValue 事件触发，构建基础表单组件的实战技巧。

categories:
  - vue

tags:
  - v-model
  - modelValue
  - 表单组件
  - 基础入门
  - 双向绑定
  - 实战技巧
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/16c32dca56284c5db4c9fec6c8172494~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现 1000+ 提升效率与开发的 AI 工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. modelValue prop 的定义与接收

### 1.1 基础定义方式

在 Vue 3 中，组件的单个 v-model 默认使用 `modelValue` 作为 prop 名称：

```vue
<!-- BaseInput.vue - 基础输入组件 -->
<template>
  <div class="base-input">
    <label v-if="label" class="label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field"
    />
  </div>
</template>

<script setup>
// 定义 props
defineProps({
  // modelValue 是 v-model 的默认 prop
  modelValue: {
    type: [String, Number],
    required: true,
    validator: (value) => {
      // 可以添加自定义验证逻辑
      return typeof value === "string" || typeof value === "number";
    },
  },
  // 标签文本
  label: {
    type: String,
    default: "",
  },
  // 输入类型
  type: {
    type: String,
    default: "text",
    validator: (value) => {
      return ["text", "number", "password", "email", "tel", "url"].includes(
        value,
      );
    },
  },
  // 占位符
  placeholder: {
    type: String,
    default: "",
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 声明 emit
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.base-input {
  margin-bottom: 16px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
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

.input-field:hover:not(:disabled) {
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
</style>
```

### 1.2 使用 Options API 的方式

```vue
<!-- BaseInputOptions.vue - Options API 版本 -->
<script>
export default {
  props: {
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
    },
  },
  emits: ["update:modelValue"],
  methods: {
    handleInput(event) {
      // 触发更新事件
      this.$emit("update:modelValue", event.target.value);
    },
  },
};
</script>
```

### 1.3 类型验证的最佳实践

```vue
<!-- TypedInput.vue - 带类型验证的输入组件 -->
<template>
  <div class="typed-input">
    <input
      :value="modelValue"
      @input="handleInput"
      :type="computedType"
      class="input-field"
    />
    <span v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
    validator: (value, props) => {
      // 根据类型验证值
      if (props.type === "number" && typeof value !== "number") {
        return false;
      }
      if (props.type === "email" && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      }
      return true;
    },
  },
  type: {
    type: String,
    default: "text",
    validator: (value) => {
      return ["text", "number", "email", "password", "tel"].includes(value);
    },
  },
});

const emit = defineEmits(["update:modelValue"]);

const computedType = computed(() => {
  return props.type === "number" ? "text" : props.type;
});

const errorMessage = computed(() => {
  if (props.type === "email" && props.modelValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.modelValue)) {
      return "请输入有效的邮箱地址";
    }
  }
  return "";
});

const handleInput = (event) => {
  let value = event.target.value;

  // 数字类型转换
  if (props.type === "number") {
    value = parseFloat(value) || 0;
  }

  emit("update:modelValue", value);
};
</script>

<style scoped>
.typed-input {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #42b883;
}

.error-message {
  display: block;
  margin-top: 4px;
  color: #f44336;
  font-size: 12px;
}
</style>
```

## 2. update:modelValue 事件的触发

### 2.1 基础事件触发

```vue
<!-- SimpleInput.vue - 简单事件触发示例 -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    @change="$emit('update:modelValue', $event.target.value)"
    @blur="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
```

### 2.2 带处理逻辑的事件触发

```vue
<!-- ProcessedInput.vue - 带处理逻辑的输入组件 -->
<template>
  <div class="processed-input">
    <input
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      :type="type"
      class="input-field"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String,
    default: "text",
  },
  trim: {
    type: Boolean,
    default: false,
  },
  uppercase: {
    type: Boolean,
    default: false,
  },
  lowercase: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const internalValue = ref(props.modelValue);

const handleInput = (event) => {
  let value = event.target.value;

  // 处理 trim
  if (props.trim) {
    value = value.trim();
  }

  // 处理大小写
  if (props.uppercase) {
    value = value.toUpperCase();
  } else if (props.lowercase) {
    value = value.toLowerCase();
  }

  internalValue.value = value;
  emit("update:modelValue", value);
};

const handleBlur = (event) => {
  // 失焦时最终确认
  let value = event.target.value;

  if (props.trim) {
    value = value.trim();
    emit("update:modelValue", value);
  }
};
</script>

<style scoped>
.processed-input {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #42b883;
}
</style>
```

### 2.3 异步事件处理

```vue
<!-- AsyncInput.vue - 异步事件处理组件 -->
<template>
  <div class="async-input">
    <input
      :value="modelValue"
      @input="handleInput"
      :disabled="isLoading"
      class="input-field"
    />
    <span v-if="isLoading" class="loading-indicator"> 验证中... </span>
    <span
      v-if="validationMessage"
      :class="['validation-message', validationType]"
    >
      {{ validationMessage }}
    </span>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  asyncValidate: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isLoading = ref(false);
const validationMessage = ref("");
const validationType = ref("success"); // 'success' | 'error' | 'warning'

const handleInput = async (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);

  // 如果有异步验证函数
  if (props.asyncValidate) {
    isLoading.value = true;
    validationMessage.value = "";

    try {
      const result = await props.asyncValidate(value);
      validationMessage.value = result.message;
      validationType.value = result.type;
    } catch (error) {
      validationMessage.value = error.message;
      validationType.value = "error";
    } finally {
      isLoading.value = false;
    }
  }
};

// 监听外部变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.asyncValidate && newValue) {
      handleValidation(newValue);
    }
  },
);

const handleValidation = async (value) => {
  if (!props.asyncValidate) return;

  isLoading.value = true;

  try {
    const result = await props.asyncValidate(value);
    validationMessage.value = result.message;
    validationType.value = result.type;
  } catch (error) {
    validationMessage.value = error.message;
    validationType.value = "error";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.async-input {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.input-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 12px;
}

.validation-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.validation-message.success {
  color: #42b883;
}

.validation-message.error {
  color: #f44336;
}

.validation-message.warning {
  color: #ff9800;
}
</style>
```

## 3. 基础表单组件的 v-model 实现

### 3.1 文本输入框组件

```vue
<!-- TextInput.vue - 文本输入组件 -->
<template>
  <div class="text-input" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-wrapper">
      <input
        :id="inputId"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :type="computedType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        class="input-field"
        :class="{ 'has-prefix': hasPrefix, 'has-suffix': hasSuffix }"
      />

      <slot name="prefix" class="prefix"></slot>
      <slot name="suffix" class="suffix"></slot>

      <span
        v-if="clearable && modelValue"
        @click="handleClear"
        class="clear-icon"
      >
        ×
      </span>
    </div>

    <span v-if="hasError" class="error-message">{{ errorMessage }}</span>
    <span v-if="helperText && !hasError" class="helper-text">{{
      helperText
    }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

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
  minlength: {
    type: [String, Number],
    default: null,
  },
  pattern: {
    type: String,
    default: null,
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
  prefixIcon: {
    type: String,
    default: "",
  },
  suffixIcon: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "input", "blur", "clear"]);

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`);

const hasPrefix = computed(() => {
  return !!props.prefixIcon || !!props.$slots.prefix;
});

const hasSuffix = computed(() => {
  return !!props.suffixIcon || !!props.$slots.suffix;
});

const hasError = computed(() => {
  return !!props.error;
});

const errorMessage = computed(() => {
  return props.error;
});

const computedType = computed(() => {
  return props.type;
});

const handleInput = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);
  emit("input", { value, event });
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
.text-input {
  margin-bottom: 16px;
}

.label {
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

.input-field:hover:not(:disabled):not(:read-only) {
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

.input-field:read-only {
  background: #f9f9f9;
}

.text-input.has-error .input-field {
  border-color: #f44336;
}

.text-input.has-error .input-field:focus {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
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
</style>
```

### 3.2 数字输入框组件

```vue
<!-- NumberInput.vue - 数字输入组件 -->
<template>
  <div class="number-input">
    <label v-if="label" class="label">{{ label }}</label>

    <div class="input-wrapper">
      <button
        @click="decrement"
        :disabled="isMinDisabled"
        class="control-btn"
        type="button"
      >
        -
      </button>

      <input
        :value="displayValue"
        @input="handleInput"
        @blur="handleBlur"
        type="text"
        inputmode="decimal"
        :disabled="disabled"
        class="input-field"
      />

      <button
        @click="increment"
        :disabled="isMaxDisabled"
        class="control-btn"
        type="button"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  min: {
    type: Number,
    default: -Infinity,
  },
  max: {
    type: Number,
    default: Infinity,
  },
  step: {
    type: Number,
    default: 1,
  },
  precision: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return "";
  }
  return props.modelValue.toFixed(props.precision);
});

const isMinDisabled = computed(() => {
  return props.modelValue <= props.min;
});

const isMaxDisabled = computed(() => {
  return props.modelValue >= props.max;
});

const handleInput = (event) => {
  const value = event.target.value;

  if (value === "") {
    emit("update:modelValue", null);
    return;
  }

  const numValue = parseFloat(value);

  if (!isNaN(numValue)) {
    emit("update:modelValue", numValue);
  }
};

const handleBlur = (event) => {
  let value = parseFloat(event.target.value);

  if (isNaN(value)) {
    value = props.min;
  }

  // 限制在 min 和 max 之间
  value = Math.max(props.min, Math.min(props.max, value));

  // 保留精度
  value = parseFloat(value.toFixed(props.precision));

  emit("update:modelValue", value);
};

const increment = () => {
  if (!isMaxDisabled.value) {
    const newValue = props.modelValue + props.step;
    const value = parseFloat(newValue.toFixed(props.precision));
    emit("update:modelValue", value);
  }
};

const decrement = () => {
  if (!isMinDisabled.value) {
    const newValue = props.modelValue - props.step;
    const value = parseFloat(newValue.toFixed(props.precision));
    emit("update:modelValue", value);
  }
};
</script>

<style scoped>
.number-input {
  margin-bottom: 16px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.control-btn:first-child {
  border-right: 1px solid #ddd;
}

.control-btn:last-child {
  border-left: 1px solid #ddd;
}

.input-field {
  flex: 1;
  border: none;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  background: transparent;
}

.input-field:focus {
  outline: none;
}

.input-field:disabled {
  background: #f5f5f5;
}
</style>
```

### 3.3 开关组件

```vue
<!-- Switch.vue - 开关组件 -->
<template>
  <div
    class="switch"
    :class="{ 'is-checked': modelValue, 'is-disabled': disabled }"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
      :disabled="disabled"
      class="switch-input"
    />

    <div @click="toggle" class="switch-core">
      <div class="switch-button"></div>
    </div>

    <span v-if="label" class="switch-label">{{ label }}</span>
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
});

const emit = defineEmits(["update:modelValue", "change"]);

const handleChange = (event) => {
  const value = event.target.checked;
  emit("update:modelValue", value);
  emit("change", value);
};

const toggle = () => {
  if (!props.disabled) {
    const newValue = !props.modelValue;
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }
};
</script>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.switch-input {
  display: none;
}

.switch-core {
  position: relative;
  width: 40px;
  height: 20px;
  background: #ddd;
  border-radius: 10px;
  transition: background 0.3s;
}

.switch-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch.is-checked .switch-core {
  background: #42b883;
}

.switch.is-checked .switch-button {
  left: 22px;
}

.switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.switch-label {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}
</style>
```

## 4. 实战示例：用户信息表单

```vue
<!-- UserProfileForm.vue - 用户信息表单 -->
<template>
  <div class="user-profile-form">
    <h2>用户信息</h2>

    <form @submit.prevent="handleSubmit">
      <TextInput
        v-model="formData.username"
        label="用户名"
        placeholder="请输入用户名"
        required
        clearable
        :maxlength="20"
        helper-text="用户名长度 2-20 个字符"
        :error="errors.username"
      />

      <TextInput
        v-model="formData.email"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱地址"
        required
        clearable
        :error="errors.email"
      />

      <TextInput
        v-model="formData.phone"
        label="手机号"
        type="tel"
        placeholder="请输入手机号"
        pattern="^1[3-9]\d{9}$"
        :error="errors.phone"
      />

      <NumberInput
        v-model="formData.age"
        label="年龄"
        :min="1"
        :max="150"
        :step="1"
        :error="errors.age"
      />

      <Switch v-model="formData.isVip" label="VIP 会员" />

      <div class="form-actions">
        <button type="button" @click="handleReset" class="btn-reset">
          重置
        </button>
        <button type="submit" :disabled="isSubmitting" class="btn-submit">
          {{ isSubmitting ? "提交中..." : "提交" }}
        </button>
      </div>
    </form>

    <div v-if="submitResult" class="submit-result">
      <h3>提交结果：</h3>
      <pre>{{ submitResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import TextInput from "./TextInput.vue";
import NumberInput from "./NumberInput.vue";
import Switch from "./Switch.vue";

const formData = reactive({
  username: "",
  email: "",
  phone: "",
  age: 18,
  isVip: false,
});

const errors = reactive({
  username: "",
  email: "",
  phone: "",
  age: "",
});

const isSubmitting = ref(false);
const submitResult = ref(null);

const validateForm = () => {
  let isValid = true;

  // 验证用户名
  if (!formData.username) {
    errors.username = "用户名不能为空";
    isValid = false;
  } else if (formData.username.length < 2 || formData.username.length > 20) {
    errors.username = "用户名长度 2-20 个字符";
    isValid = false;
  } else {
    errors.username = "";
  }

  // 验证邮箱
  if (!formData.email) {
    errors.email = "邮箱不能为空";
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "请输入有效的邮箱地址";
      isValid = false;
    } else {
      errors.email = "";
    }
  }

  // 验证手机号
  if (!formData.phone) {
    errors.phone = "手机号不能为空";
    isValid = false;
  } else {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = "请输入有效的手机号";
      isValid = false;
    } else {
      errors.phone = "";
    }
  }

  // 验证年龄
  if (!formData.age || formData.age < 1 || formData.age > 150) {
    errors.age = "年龄必须在 1-150 之间";
    isValid = false;
  } else {
    errors.age = "";
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    submitResult.value = { ...formData };
    console.log("提交成功:", submitResult.value);
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleReset = () => {
  formData.username = "";
  formData.email = "";
  formData.phone = "";
  formData.age = 18;
  formData.isVip = false;

  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  submitResult.value = null;
};
</script>

<style scoped>
.user-profile-form {
  max-width: 500px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 32px;
  text-align: center;
  color: #333;
  font-size: 24px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn-reset,
.btn-submit {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset {
  background: #f5f5f5;
  color: #333;
}

.btn-reset:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #42b883;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #369970;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-result {
  margin-top: 32px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.submit-result h3 {
  margin-top: 0;
  color: #666;
}

.submit-result pre {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}
</style>
```

## 5. 课后 Quiz

### 题目 1：modelValue 的作用

**问题：** Vue 3 组件中，`modelValue` prop 的作用是什么？

**答案：**
`modelValue` 是 Vue 3 中 v-model 的默认 prop 名称，用于接收父组件传递的值，实现双向数据绑定。

### 题目 2：触发更新事件

**问题：** 如何在子组件中触发 v-model 的更新？

**答案：**
使用 `emit('update:modelValue', newValue)` 来触发更新事件，通知父组件更新数据。

### 题目 3：表单组件设计要点

**问题：** 设计一个可复用的表单组件需要考虑哪些因素？

**答案：**

1. props 定义（modelValue、label、placeholder 等）
2. emits 声明（update:modelValue、blur、focus 等）
3. 状态管理（disabled、readonly、error 等）
4. 可访问性（label、id、aria 属性）
5. 样式定制（slot、class 等）
6. 验证逻辑（pattern、validator 等）

## 6. 常见报错解决方案

### 报错 1：`Missing required prop: "modelValue"`

**产生原因：**

- 父组件未传递 v-model 值

**解决办法：**

```vue
<!-- ❌ 错误 -->
<CustomInput />

<!-- ✅ 正确 -->
<CustomInput v-model="value" />
```

### 报错 2：`Define emits missing "update:modelValue"`

**产生原因：**

- 子组件未声明 update:modelValue 事件

**解决办法：**

```vue
<!-- ✅ 确保声明 emit -->
<script setup>
defineEmits(["update:modelValue"]);
</script>
```

### 报错 3：值不更新

**产生原因：**

- 直接修改了 prop 而非触发事件

**解决办法：**

```vue
<!-- ❌ 错误 -->
<script setup>
const props = defineProps(["modelValue"]);
props.modelValue = "new value"; // 错误
</script>

<!-- ✅ 正确 -->
<script setup>
const emit = defineEmits(["update:modelValue"]);
emit("update:modelValue", "new value"); // 正确
</script>
```

## 7. 最佳实践建议

1. **类型验证：** 为 modelValue 添加详细的类型定义和验证
2. **文档化：** 使用 JSDoc 注释说明组件用法
3. **可访问性：** 添加 label、id、aria 等属性
4. **错误处理：** 提供清晰的错误提示
5. **性能优化：** 使用 computed 缓存计算结果

---

参考链接：https://vuejs.org/guide/components/v-model.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 组件 v-model 第二章：单个 v-model 的基础使用完全指南](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-2-single-binding/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 组件 v-model 第一章：基础概念与语法糖本质完全解析](https://blog.cmdragon.cn/posts/vue3-component-v-model-chapter-1-fundamentals/)
- [Vue 3 组件事件性能优化与最佳实践完整指南](https://blog.cmdragon.cn/posts/vue3-component-events-performance-optimization/)
- [Vue 3 动态事件、事件参数与异步事件处理完整指南](https://blog.cmdragon.cn/posts/vue3-dynamic-events-parameters-async-handling/)
- [Vue 3 跨层级组件事件通信：mitt 事件总线与依赖注入完整指南](https://blog.cmdragon.cn/posts/vue3-cross-level-component-event-communication/)
- [Vue 3 组件事件实战：表单、模态框等场景的综合应用指南](https://blog.cmdragon.cn/posts/vue3-component-events-practical-applications/)
- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3 中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在 Vue3 中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API 生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3 生命周期钩子实战指南：如何正确选择 onMounted、onUpdated 与 onUnmounted 的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)

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
- [Mermaid 在线编辑器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/mermaid-live-editor)
- [数学求解计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/math-solver-calculator)
- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [CMDragon 在线工具 - 高级 AI 工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)

</details>
