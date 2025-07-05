<template>
  <el-dialog
      v-model="dialogVisible"
      title="保存组合"
      width="400px"
      destroy-on-close
  >
    <el-form :model="form" label-width="0">
      <el-form-item prop="name">
        <el-input
            v-model="form.name"
            placeholder="请输入组合名称"
            clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button
            type="primary"
            :disabled="!form.name.trim()"
            @click="onConfirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, computed } from 'vue'

// 接收 v-model 绑定的值
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['update:visible', 'confirm'])

// 把它跟 props.visible 绑在一起
const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emit('update:visible', val)
  }
})

// 表单状态
const form = reactive({
  name: ''
})

function onCancel() {
  // 关闭弹窗并重置
  emit('update:visible', false)
  form.name = ''
}

function onConfirm() {
  const n = form.name.trim()
  if (!n) return
  // 通知外层“确定”事件，传组合名称
  emit('confirm', n)
  // 关闭弹窗并重置
  emit('update:visible', false)
  form.name = ''
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
