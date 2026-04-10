---
url: /posts/vue3-component-events-practical-applications/
title: Vue 3 组件事件实战：表单、模态框等场景的综合应用指南
date: 2026-04-08T10:00:00+08:00
lastmod: 2026-04-08T10:00:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/74d5acd5aecf49778f2cea144bf85cb6~tplv-5jbd59dj06-image.png

summary: 深入解析 Vue 3 组件事件在表单验证、模态框管理、数据提交等实战场景中的综合应用，从组件设计到事件通信，构建高效、可维护的前端应用架构

categories:
  - vue

tags:
  - 基础入门
  - 组件事件
  - 实战应用
  - 表单处理
  - 模态框
  - 组件通信
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/74d5acd5aecf49778f2cea144bf85cb6~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现 1000+ 提升效率与开发的 AI 工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 表单场景中的组件事件应用

表单是 Web 应用中最常见的交互场景之一。掌握组件事件在表单中的应用，可以构建出高效、可维护的表单系统。

### 1.1 基础表单组件事件

```vue
<!-- FormInput.vue - 可复用的表单输入组件 -->
<template>
  <div class="form-input">
    <label :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      class="input"
      :class="{ error: hasError }"
    />

    <span v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  validate: Function,
});

const emit = defineEmits(["update:modelValue", "blur", "focus", "validate"]);

const inputId = computed(
  () => `input-${Math.random().toString(36).substr(2, 9)}`,
);
const hasError = ref(false);
const errorMessage = ref("");

const handleInput = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);

  // 实时验证
  if (props.validate) {
    const result = props.validate(value);
    hasError.value = !result.valid;
    errorMessage.value = result.message || "";
    emit("validate", { valid: result.valid, message: result.message });
  }
};

const handleBlur = (event) => {
  emit("blur", {
    value: props.modelValue,
    event,
  });
};

const handleFocus = (event) => {
  emit("focus", event);
};

// 暴露验证方法给父组件
defineExpose({
  validate: () => {
    if (props.validate) {
      const result = props.validate(props.modelValue);
      hasError.value = !result.valid;
      errorMessage.value = result.message || "";
      return result;
    }
    return { valid: true };
  },
  reset: () => {
    hasError.value = false;
    errorMessage.value = "";
    emit("update:modelValue", "");
  },
});
</script>

<style scoped>
.form-input {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #35495e;
}

.required {
  color: #f44336;
  margin-left: 4px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s;
}

.input:focus {
  border-color: #42b883;
}

.input.error {
  border-color: #f44336;
}

.input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #f44336;
}
</style>
```

```vue
<!-- RegistrationForm.vue - 注册表单 -->
<template>
  <div class="registration-form">
    <h2>用户注册</h2>

    <FormInput
      ref="usernameRef"
      v-model="formData.username"
      label="用户名"
      placeholder="请输入用户名"
      required
      :validate="validateUsername"
      @validate="handleUsernameValidate"
    />

    <FormInput
      ref="emailRef"
      v-model="formData.email"
      label="邮箱"
      type="email"
      placeholder="请输入邮箱"
      required
      :validate="validateEmail"
      @validate="handleEmailValidate"
    />

    <FormInput
      ref="passwordRef"
      v-model="formData.password"
      label="密码"
      type="password"
      placeholder="请输入密码"
      required
      :validate="validatePassword"
      @validate="handlePasswordValidate"
    />

    <div class="form-actions">
      <button @click="handleSubmit" :disabled="!isFormValid" class="submit-btn">
        提交注册
      </button>
      <button @click="handleReset" class="reset-btn">重置表单</button>
    </div>

    <div
      v-if="submitResult"
      :class="['result', submitResult.success ? 'success' : 'error']"
    >
      {{ submitResult.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import FormInput from "./FormInput.vue";

const usernameRef = ref(null);
const emailRef = ref(null);
const passwordRef = ref(null);

const formData = reactive({
  username: "",
  email: "",
  password: "",
});

const validationState = reactive({
  username: false,
  email: false,
  password: false,
});

const isFormValid = computed(() => {
  return (
    validationState.username &&
    validationState.email &&
    validationState.password
  );
});

const submitResult = ref(null);

// 验证规则
const validateUsername = (value) => {
  if (!value || value.trim() === "") {
    return { valid: false, message: "用户名不能为空" };
  }
  if (value.length < 3 || value.length > 20) {
    return { valid: false, message: "用户名长度必须在 3-20 个字符之间" };
  }
  return { valid: true };
};

const validateEmail = (value) => {
  if (!value || value.trim() === "") {
    return { valid: false, message: "邮箱不能为空" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, message: "请输入有效的邮箱地址" };
  }
  return { valid: true };
};

const validatePassword = (value) => {
  if (!value || value.length === 0) {
    return { valid: false, message: "密码不能为空" };
  }
  if (value.length < 6) {
    return { valid: false, message: "密码长度至少 6 位" };
  }
  return { valid: true };
};

// 处理验证事件
const handleUsernameValidate = (result) => {
  validationState.username = result.valid;
};

const handleEmailValidate = (result) => {
  validationState.email = result.valid;
};

const handlePasswordValidate = (result) => {
  validationState.password = result.valid;
};

// 提交表单
const handleSubmit = async () => {
  // 手动触发所有字段的验证
  const usernameResult = usernameRef.value.validate();
  const emailResult = emailRef.value.validate();
  const passwordResult = passwordRef.value.validate();

  if (!usernameResult.valid || !emailResult.valid || !passwordResult.valid) {
    submitResult.value = {
      success: false,
      message: "请修正表单中的错误",
    };
    return;
  }

  // 模拟 API 调用
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    submitResult.value = {
      success: true,
      message: "注册成功！",
    };

    console.log("提交的数据:", formData);
  } catch (error) {
    submitResult.value = {
      success: false,
      message: "注册失败，请稍后重试",
    };
  }
};

// 重置表单
const handleReset = () => {
  usernameRef.value.reset();
  emailRef.value.reset();
  passwordRef.value.reset();
  submitResult.value = null;
};
</script>

<style scoped>
.registration-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

h2 {
  margin-top: 0;
  color: #35495e;
  text-align: center;
  margin-bottom: 30px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn,
.reset-btn {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background-color: #42b883;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #35495e;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #f0f0f0;
  color: #666;
}

.reset-btn:hover {
  background-color: #e0e0e0;
}

.result {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.result.success {
  background: #e8f5e9;
  color: #4caf50;
}

.result.error {
  background: #ffebee;
  color: #f44336;
}
</style>
```

### 1.2 复杂表单组件事件通信

```vue
<!-- DynamicForm.vue - 动态表单组件 -->
<template>
  <div class="dynamic-form">
    <div v-for="field in fields" :key="field.id" class="form-field">
      <component
        :is="getComponentType(field.type)"
        v-bind="field.props"
        :modelValue="field.value"
        @update:modelValue="handleFieldUpdate(field.id, $event)"
        @blur="handleFieldBlur(field.id)"
        @validate="handleFieldValidate(field.id, $event)"
      />
    </div>

    <div class="form-actions">
      <button @click="handleSubmit" class="submit-btn">提交</button>
      <button @click="$emit('cancel')" class="cancel-btn">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FormInput from "./FormInput.vue";

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel", "field-change"]);

const fieldStates = ref({});

const getComponentType = (type) => {
  const componentMap = {
    text: FormInput,
    email: FormInput,
    password: FormInput,
    number: FormInput,
  };
  return componentMap[type] || FormInput;
};

const handleFieldUpdate = (fieldId, value) => {
  const field = props.fields.find((f) => f.id === fieldId);
  if (field) {
    field.value = value;
  }

  emit("field-change", {
    fieldId,
    value,
    field,
  });
};

const handleFieldBlur = (fieldId) => {
  console.log("字段失去焦点:", fieldId);
};

const handleFieldValidate = (fieldId, result) => {
  fieldStates.value[fieldId] = result;
};

const handleSubmit = () => {
  const formData = {};
  const validationErrors = [];

  props.fields.forEach((field) => {
    formData[field.id] = field.value;

    const state = fieldStates.value[fieldId];
    if (state && !state.valid) {
      validationErrors.push({
        fieldId: field.id,
        message: state.message,
      });
    }
  });

  if (validationErrors.length > 0) {
    emit("submit", {
      success: false,
      errors: validationErrors,
    });
    return;
  }

  emit("submit", {
    success: true,
    data: formData,
  });
};
</script>

<style scoped>
.dynamic-form {
  padding: 20px;
}

.form-field {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn {
  background-color: #42b883;
  color: white;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}
</style>
```

## 2. 模态框场景中的组件事件应用

模态框（Modal）是 Web 应用中常用的交互组件。通过组件事件，可以实现灵活的模态框管理。

### 2.1 基础模态框组件事件

```vue
<!-- BaseModal.vue - 基础模态框组件 -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-mask">
        <div
          class="modal-container"
          :class="[size]"
          @click.self="handleMaskClick"
        >
          <!-- 头部 -->
          <div v-if="$slots.header" class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="close-btn" @click="handleClose">×</button>
          </div>

          <!-- 内容 -->
          <div class="modal-body">
            <slot>
              <p>{{ content }}</p>
            </slot>
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer">
              <button @click="handleCancel" class="cancel-btn">取消</button>
              <button @click="handleConfirm" class="confirm-btn">确认</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "标题",
  },
  content: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium", "large", "full"].includes(value),
  },
  closeOnMask: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "open",
  "close",
  "confirm",
  "cancel",
]);

// 监听模态框打开
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      emit("open");
      // 禁止 body 滚动
      document.body.style.overflow = "hidden";
    } else if (!newValue && oldValue) {
      emit("close");
      // 恢复 body 滚动
      document.body.style.overflow = "";
    }
  },
);

const handleClose = async () => {
  if (props.beforeClose) {
    const shouldClose = await props.beforeClose();
    if (!shouldClose) return;
  }
  emit("update:modelValue", false);
};

const handleMaskClick = () => {
  if (props.closeOnMask) {
    handleClose();
  }
};

const handleConfirm = () => {
  emit("confirm");
  handleClose();
};

const handleCancel = () => {
  emit("cancel");
  handleClose();
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-container.small {
  width: 400px;
}

.modal-container.medium {
  width: 600px;
}

.modal-container.large {
  width: 900px;
}

.modal-container.full {
  width: 95%;
  height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #35495e;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #35495e;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: #42b883;
  color: white;
}

.confirm-btn:hover {
  background: #35495e;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}
</style>
```

### 2.2 模态框实战应用

```vue
<!-- ConfirmModal.vue - 确认对话框 -->
<template>
  <BaseModal
    v-model="visible"
    :title="title"
    size="small"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #header>
      <h3>{{ title }}</h3>
    </template>

    <p class="confirm-message">
      {{ message }}
    </p>

    <template #footer>
      <button @click="handleCancel" class="cancel-btn">取消</button>
      <button @click="handleConfirm" class="confirm-btn" :disabled="confirming">
        {{ confirming ? "确认中..." : "确认" }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseModal from "./BaseModal.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "确认操作",
  },
  message: {
    type: String,
    required: true,
  },
  onConfirm: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "confirmed"]);

const confirming = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleConfirm = async () => {
  if (confirming.value) return;

  confirming.value = true;

  try {
    if (props.onConfirm) {
      await props.onConfirm();
    }

    emit("confirmed");
    visible.value = false;
  } catch (error) {
    console.error("确认操作失败:", error);
  } finally {
    confirming.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  emit("update:modelValue", false);
};
</script>

<style scoped>
.confirm-message {
  font-size: 16px;
  color: #35495e;
  line-height: 1.6;
  margin: 20px 0;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

```vue
<!-- FormModal.vue - 表单模态框 -->
<template>
  <BaseModal
    v-model="visible"
    :title="title"
    :size="size"
    :before-close="beforeClose"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #header>
      <h3>{{ title }}</h3>
    </template>

    <form @submit.prevent="handleSubmit" class="modal-form">
      <slot name="form-content" :form-data="formData" :errors="errors">
        <!-- 默认表单内容 -->
      </slot>
    </form>

    <template #footer>
      <button @click="handleCancel" class="cancel-btn">取消</button>
      <button @click="handleSubmit" class="confirm-btn" :disabled="submitting">
        {{ submitting ? "提交中..." : "确认" }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import BaseModal from "./BaseModal.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "表单",
  },
  size: {
    type: String,
    default: "medium",
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  validate: {
    type: Function,
    default: null,
  },
  onSubmit: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "success", "error"]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formData = reactive({ ...props.initialData });
const errors = reactive({});
const submitting = ref(false);

const beforeClose = async () => {
  if (submitting.value) {
    return false;
  }

  // 检查是否有未保存的更改
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(props.initialData);
  if (hasChanges) {
    return window.confirm("有未保存的更改，确定要关闭吗？");
  }

  return true;
};

const handleSubmit = async () => {
  if (submitting.value) return;

  // 验证表单
  if (props.validate) {
    const validation = await props.validate(formData);
    if (!validation.valid) {
      Object.assign(errors, validation.errors);
      return;
    }
  }

  submitting.value = true;

  try {
    await props.onSubmit(formData);
    emit("success", formData);
    visible.value = false;
  } catch (error) {
    emit("error", error);
    console.error("提交失败:", error);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, props.initialData);
  Object.keys(errors).forEach((key) => delete errors[key]);
};

defineExpose({
  resetForm,
  formData,
  errors,
});
</script>

<style scoped>
.modal-form {
  padding: 0;
}
</style>
```

### 2.3 模态框管理器

```vue
<!-- ModalManager.vue - 模态框管理器 -->
<template>
  <div class="modal-manager">
    <!-- 删除确认模态框 -->
    <ConfirmModal
      v-model="deleteModalVisible"
      title="确认删除"
      :message="deleteMessage"
      :on-confirm="handleDeleteConfirm"
      @confirmed="handleDeleteConfirmed"
    />

    <!-- 编辑表单模态框 -->
    <FormModal
      ref="editModalRef"
      v-model="editModalVisible"
      title="编辑信息"
      :initial-data="editData"
      :validate="validateEditForm"
      :on-submit="handleEditSubmit"
      @success="handleEditSuccess"
    >
      <template #form-content="{ form-data, errors }">
        <div class="form-content">
          <FormInput
            v-model="form - data.name"
            label="姓名"
            placeholder="请输入姓名"
            required
          />
          <FormInput
            v-model="form - data.email"
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
            required
          />
          <FormInput
            v-model="form - data.phone"
            label="手机号"
            placeholder="请输入手机号"
          />
        </div>
      </template>
    </FormModal>

    <!-- 操作提示模态框 -->
    <BaseModal v-model="messageModalVisible" :title="messageTitle" size="small">
      <p>{{ messageContent }}</p>

      <template #footer>
        <button @click="messageModalVisible = false" class="confirm-btn">
          确定
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseModal from "./BaseModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import FormModal from "./FormModal.vue";
import FormInput from "./FormInput.vue";

const deleteModalVisible = ref(false);
const deleteMessage = ref("");
const deleteItemId = ref(null);

const editModalVisible = ref(false);
const editData = reactive({
  name: "",
  email: "",
  phone: "",
});

const editModalRef = ref(null);

const messageModalVisible = ref(false);
const messageTitle = ref("提示");
const messageContent = ref("");

// 删除相关方法
const showDeleteModal = (itemId, message) => {
  deleteItemId.value = itemId;
  deleteMessage.value = message || "确定要删除此项吗？";
  deleteModalVisible.value = true;
};

const handleDeleteConfirm = async () => {
  // 模拟 API 调用
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("删除项目:", deleteItemId.value);
};

const handleDeleteConfirmed = () => {
  showMessage("删除成功");
  // 刷新列表等后续操作
};

// 编辑相关方法
const showEditModal = (item) => {
  editData.name = item.name;
  editData.email = item.email;
  editData.phone = item.phone;
  editModalVisible.value = true;
};

const validateEditForm = async (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "姓名不能为空";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "请输入有效的邮箱地址";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const handleEditSubmit = async (data) => {
  // 模拟 API 调用
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("提交编辑:", data);
};

const handleEditSuccess = (data) => {
  showMessage("编辑成功");
  // 刷新列表等后续操作
};

// 消息提示方法
const showMessage = (content, title = "提示") => {
  messageTitle.value = title;
  messageContent.value = content;
  messageModalVisible.value = true;
};

// 暴露方法给父组件
defineExpose({
  showDeleteModal,
  showEditModal,
  showMessage,
});
</script>

<style scoped>
.modal-manager {
  /* 管理器本身不需要样式 */
}

.form-content {
  padding: 10px;
}
</style>
```

## 3. 数据列表场景中的组件事件应用

### 3.1 可操作的数据列表

```vue
<!-- DataTable.vue - 数据列表组件 -->
<template>
  <div class="data-table">
    <!-- 表格头部 -->
    <div class="table-header">
      <div class="header-title">
        <h3>{{ title }}</h3>
      </div>
      <div class="header-actions">
        <slot name="header-actions">
          <button @click="$emit('refresh')" class="action-btn">🔄 刷新</button>
          <button @click="$emit('add')" class="action-btn primary">
            ➕ 新增
          </button>
        </slot>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="table-body">
      <table v-if="data.length > 0">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.title }}
            </th>
            <th v-if="$slots.actions || showActions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td v-for="column in columns" :key="column.key">
              <slot
                :name="`cell-${column.key}`"
                :value="item[column.key]"
                :row="item"
              >
                {{ item[column.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions || showActions">
              <div class="action-buttons">
                <slot name="actions" :row="item">
                  <button @click="handleEdit(item)" class="btn-edit">
                    编辑
                  </button>
                  <button @click="handleDelete(item)" class="btn-delete">
                    删除
                  </button>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <slot name="empty">
          <p>暂无数据</p>
        </slot>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="table-pagination">
      <slot name="pagination" :pagination="pagination">
        <button
          @click="handlePageChange(pagination.current - 1)"
          :disabled="pagination.current <= 1"
        >
          上一页
        </button>
        <span>第 {{ pagination.current }} / {{ pagination.total }} 页</span>
        <button
          @click="handlePageChange(pagination.current + 1)"
          :disabled="pagination.current >= pagination.total"
        >
          下一页
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "数据列表",
  },
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  pagination: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["refresh", "add", "edit", "delete", "page-change"]);

const handleEdit = (item) => {
  emit("edit", item);
};

const handleDelete = (item) => {
  emit("delete", item);
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= props.pagination.total) {
    emit("page-change", page);
  }
};
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header-title h3 {
  margin: 0;
  color: #35495e;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #f0f0f0;
  color: #666;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.primary {
  background: #42b883;
  color: white;
}

.action-btn.primary:hover {
  background: #35495e;
}

.table-body {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9f9f9;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  font-weight: 600;
  color: #35495e;
  font-size: 14px;
}

td {
  font-size: 14px;
  color: #666;
}

tbody tr:hover {
  background: #f9f9f9;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #e3f2fd;
  color: #2196f3;
}

.btn-edit:hover {
  background: #2196f3;
  color: white;
}

.btn-delete {
  background: #ffebee;
  color: #f44336;
}

.btn-delete:hover {
  background: #f44336;
  color: white;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.table-pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.table-pagination button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
```

### 3.2 列表实战应用

```vue
<!-- UserList.vue - 用户列表页面 -->
<template>
  <div class="user-list-page">
    <DataTable
      title="用户管理"
      :columns="columns"
      :data="userData"
      :pagination="pagination"
      @refresh="handleRefresh"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
    >
      <!-- 自定义单元格 -->
      <template #cell-status="{ value }">
        <span :class="['status-badge', value ? 'active' : 'inactive']">
          {{ value ? "启用" : "禁用" }}
        </span>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>

      <!-- 自定义操作按钮 -->
      <template #actions="{ row }">
        <button @click="handleView(row)" class="btn-view">查看</button>
        <button @click="handleEdit(row)" class="btn-edit">编辑</button>
        <button @click="confirmDelete(row)" class="btn-delete">删除</button>
      </template>

      <!-- 空状态 -->
      <template #empty>
        <div class="empty-state">
          <p>暂无用户数据</p>
          <button @click="$emit('add')" class="add-btn">添加第一个用户</button>
        </div>
      </template>
    </DataTable>

    <!-- 使用模态框管理器 -->
    <ModalManager ref="modalManagerRef" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import DataTable from "./DataTable.vue";
import ModalManager from "./ModalManager.vue";

const modalManagerRef = ref(null);

const columns = [
  { key: "id", title: "ID" },
  { key: "name", title: "姓名" },
  { key: "email", title: "邮箱" },
  { key: "phone", title: "手机号" },
  { key: "status", title: "状态" },
  { key: "created_at", title: "创建时间" },
];

const userData = ref([]);
const pagination = reactive({
  current: 1,
  total: 10,
  pageSize: 10,
});

onMounted(() => {
  loadUsers();
});

const loadUsers = async () => {
  // 模拟 API 调用
  await new Promise((resolve) => setTimeout(resolve, 500));

  userData.value = [
    {
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      phone: "13800138000",
      status: true,
      created_at: "2024-01-01 10:00:00",
    },
    {
      id: 2,
      name: "李四",
      email: "lisi@example.com",
      phone: "13900139000",
      status: false,
      created_at: "2024-01-02 11:00:00",
    },
  ];
};

const handleRefresh = () => {
  loadUsers();
};

const handleAdd = () => {
  modalManagerRef.value.showEditModal({
    id: null,
    name: "",
    email: "",
    phone: "",
  });
};

const handleEdit = (user) => {
  modalManagerRef.value.showEditModal({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
};

const confirmDelete = (user) => {
  modalManagerRef.value.showDeleteModal(
    user.id,
    `确定要删除用户"${user.name}"吗？`,
  );
};

const handleDelete = (user) => {
  console.log("删除用户:", user);
};

const handleView = (user) => {
  modalManagerRef.value.showMessage(`查看用户详情：${user.name}`, "用户详情");
};

const handlePageChange = (page) => {
  pagination.current = page;
  loadUsers();
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};
</script>

<style scoped>
.user-list-page {
  padding: 20px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.inactive {
  background: #ffebee;
  color: #f44336;
}

.btn-view {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #f3e5f5;
  color: #9c27b0;
}

.btn-view:hover {
  background: #9c27b0;
  color: white;
}

.empty-state .add-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state .add-btn:hover {
  background: #35495e;
}
</style>
```

## 4. 综合实战：完整的 CRUD 应用

```vue
<!-- CRUDApp.vue - 完整的增删改查应用 -->
<template>
  <div class="crud-app">
    <h1>用户管理系统</h1>

    <!-- 数据列表 -->
    <DataTable
      title="用户列表"
      :columns="columns"
      :data="users"
      :pagination="pagination"
      @refresh="loadUsers"
      @add="showAddModal"
      @edit="showEditModal"
      @delete="confirmDelete"
      @page-change="handlePageChange"
    >
      <template #cell-status="{ value }">
        <span :class="['status-badge', value ? 'active' : 'inactive']">
          {{ value ? "启用" : "禁用" }}
        </span>
      </template>

      <template #actions="{ row }">
        <button @click="handleView(row)" class="action-btn view">查看</button>
        <button @click="showEditModal(row)" class="action-btn edit">
          编辑
        </button>
        <button @click="confirmDelete(row)" class="action-btn delete">
          删除
        </button>
      </template>
    </DataTable>

    <!-- 模态框管理器 -->
    <ModalManager ref="modalManagerRef" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import DataTable from "./DataTable.vue";
import ModalManager from "./ModalManager.vue";
import FormModal from "./FormModal.vue";

const modalManagerRef = ref(null);

const columns = [
  { key: "id", title: "ID" },
  { key: "name", title: "姓名" },
  { key: "email", title: "邮箱" },
  { key: "phone", title: "手机号" },
  { key: "status", title: "状态" },
];

const users = ref([]);
const pagination = reactive({
  current: 1,
  total: 5,
  pageSize: 10,
});

onMounted(() => {
  loadUsers();
});

const loadUsers = async () => {
  try {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 800));

    users.value = [
      {
        id: 1,
        name: "张三",
        email: "zhangsan@example.com",
        phone: "13800138000",
        status: true,
      },
      {
        id: 2,
        name: "李四",
        email: "lisi@example.com",
        phone: "13900139000",
        status: false,
      },
    ];
  } catch (error) {
    modalManagerRef.value.showMessage("加载数据失败", "错误");
  }
};

const showAddModal = () => {
  modalManagerRef.value.showEditModal({
    id: null,
    name: "",
    email: "",
    phone: "",
    status: true,
  });
};

const showEditModal = (user) => {
  modalManagerRef.value.showEditModal({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
  });
};

const confirmDelete = (user) => {
  modalManagerRef.value.showDeleteModal(
    user.id,
    `确定要删除用户"${user.name}"吗？`,
  );
};

const handleView = (user) => {
  modalManagerRef.value.showMessage(
    `用户详情：\n姓名：${user.name}\n邮箱：${user.email}\n手机：${user.phone}`,
    "用户详情",
  );
};

const handlePageChange = (page) => {
  pagination.current = page;
  loadUsers();
};
</script>

<style scoped>
.crud-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #35495e;
  margin-bottom: 30px;
}

.action-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.action-btn.view {
  background: #f3e5f5;
  color: #9c27b0;
}

.action-btn.view:hover {
  background: #9c27b0;
  color: white;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #2196f3;
}

.action-btn.edit:hover {
  background: #2196f3;
  color: white;
}

.action-btn.delete {
  background: #ffebee;
  color: #f44336;
}

.action-btn.delete:hover {
  background: #f44336;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.inactive {
  background: #ffebee;
  color: #f44336;
}
</style>
```

## 5. 课后 Quiz

### 题目 1：表单组件事件

**问题：** 在表单组件中，如何实现双向绑定和实时验证？请说明关键代码。

**答案：**

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps(["modelValue", "validate"]);
const emit = defineEmits(["update:modelValue", "validate"]);

const handleInput = (event) => {
  const value = event.target.value;
  // 触发更新事件实现双向绑定
  emit("update:modelValue", value);

  // 实时验证
  if (props.validate) {
    const result = props.validate(value);
    emit("validate", result);
  }
};
</script>

<template>
  <input :value="modelValue" @input="handleInput" />
</template>
```

### 题目 2：模态框事件通信

**问题：** 模态框组件中，如何处理关闭前的确认逻辑？

**答案：**

```vue
<script setup>
const props = defineProps({
  beforeClose: Function,
});

const emit = defineEmits(["update:modelValue", "close"]);

const handleClose = async () => {
  if (props.beforeClose) {
    const shouldClose = await props.beforeClose();
    if (!shouldClose) return;
  }
  emit("update:modelValue", false);
  emit("close");
};
</script>
```

### 题目 3：列表组件事件设计

**问题：** 数据列表组件应该暴露哪些事件给父组件？

**答案：**

- `refresh` - 刷新数据
- `add` - 新增操作
- `edit` - 编辑操作（传递行数据）
- `delete` - 删除操作（传递行数据）
- `page-change` - 分页变化（传递页码）
- `sort` - 排序变化（传递排序信息）

## 6. 常见报错解决方案

### 报错 1：`v-model is missing its "get" expression`

**产生原因：**

- v-model 绑定表达式不正确
- 缺少 update 事件

**解决办法：**

```vue
<!-- ❌ 错误 -->
<CustomInput v-model="formData.name" />

<!-- ✅ 正确 -->
<CustomInput
  :modelValue="formData.name"
  @update:modelValue="formData.name = $event"
/>
```

### 报错 2：模态框关闭后事件仍在触发

**产生原因：**

- 未在模态框关闭时清理事件监听
- 异步操作未检查组件状态

**解决办法：**

```vue
<script setup>
import { ref, onBeforeUnmount } from "vue";

const isModalOpen = ref(false);

const handleAsyncAction = async () => {
  const result = await apiCall();

  // 检查模态框是否已关闭
  if (!isModalOpen.value) return;

  // 继续处理
};

onBeforeUnmount(() => {
  isModalOpen.value = false;
});
</script>
```

### 报错 3：表单提交后数据未更新

**产生原因：**

- 响应式数据更新方式不正确
- 未触发重新渲染

**解决办法：**

```vue
<script setup>
import { reactive } from "vue";

const formData = reactive({
  name: "",
  email: "",
});

// ✅ 正确：直接修改属性
const handleSubmit = () => {
  formData.name = "新值";
  formData.email = "新邮箱";
};

// ❌ 错误：替换整个对象
// const handleSubmit = () => {
//   formData = { name: '新值', email: '新邮箱' }
// }
</script>
```

## 7. 最佳实践总结

1. **表单组件事件：**
   - 使用 `v-model` 实现双向绑定
   - 通过 `validate` 事件实现实时验证
   - 暴露 `reset` 和 `validate` 方法给父组件

2. **模态框组件事件：**
   - 使用 `Teleport` 将模态框渲染到 body
   - 通过 `before-close` 处理关闭确认
   - 使用 `open`、`close` 事件跟踪状态

3. **列表组件事件：**
   - 暴露常用的 CRUD 事件
   - 支持自定义操作插槽
   - 实现分页和排序事件

4. **性能优化：**
   - 使用事件委托减少监听器数量
   - 防抖/节流高频事件
   - 及时清理事件监听器

---

参考链接：https://vuejs.org/guide/components/events.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 组件事件实战：表单、模态框等场景的综合应用指南](https://blog.cmdragon.cn/posts/vue3-component-events-practical-applications/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 动态事件、事件参数与异步事件处理完整指南](https://blog.cmdragon.cn/posts/vue3-dynamic-events-parameters-async-handling/)
- [Vue 3 跨层级组件事件通信：mitt 事件总线与依赖注入完整指南](https://blog.cmdragon.cn/posts/vue3-cross-level-component-event-communication/)
- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3 中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在 Vue3 中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API 生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3 生命周期钩子实战指南：如何正确选择 onMounted、onUpdated 与 onUnmounted 的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3 中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue 3 组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
- [Vue 组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)

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
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
- [歌词生成工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/lyrics-generator)
- [网盘资源聚合搜索 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/cloud-drive-search)
- [ASCII 字符画生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ascii-art-generator)
- [JSON Web Tokens 工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/jwt-tool)
- [Bcrypt 密码工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/bcrypt-tool)
- [GIF 合成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-composer)
- [GIF 分解器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-decomposer)
- [文本隐写术 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-steganography)
- [CMDragon 在线工具 - 高级 AI 工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现 1000+ 提升效率与开发的 AI 工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)
- [CMDragon 更新日志 - 最新更新、功能与改进 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/changelog)
- [支持我们 - 成为赞助者 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/sponsor)

</details>
