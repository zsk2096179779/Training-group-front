<template>
  <el-form :model="form" ref="formRef" label-width="100px">
    <el-form-item label="因子名称" prop="name" :rules="[{ required: true, message: '请输入因子名称', trigger: 'blur' }]">
      <el-input v-model="form.name" />
    </el-form-item>

    <el-form-item label="因子编码" prop="code" :rules="[{ required: true, message: '请输入因子编码', trigger: 'blur' }]">
      <el-input v-model="form.code" />
    </el-form-item>

    <el-form-item label="所属分类" prop="category">
      <el-input v-model="form.category" />
    </el-form-item>

    <el-form-item label="描述">
      <el-input type="textarea" v-model="form.description" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { createFactor, updateFactor } from '@/api/factor';

const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  code: '',
  category: '',
  description: '',
});

const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await updateFactor(form.id, form);
      } else {
        await createFactor(form);
      }
      alert('保存成功');
      // 触发刷新列表或关闭弹窗
    } catch (e) {
      alert('保存失败');
    }
  });
};

const reset = () => {
  form.name = '';
  form.code = '';
  form.category = '';
  form.description = '';
};
</script>
