<template>
  <el-table :data="factors" style="width: 100%">
    <el-table-column prop="name" label="因子名称" />
    <el-table-column prop="code" label="因子编码" />
    <el-table-column prop="category" label="所属分类" />
    <el-table-column prop="description" label="描述" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="editFactor(row)">编辑</el-button>
        <el-button type="danger" size="small" @click="deleteFactor(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllFactors } from '@/api/factor';

const factors = ref([]);

const fetchFactors = async () => {
  const res = await getAllFactors();
  factors.value = res.data;
};

const editFactor = (factor) => {
  // 触发编辑弹窗或路由跳转，传递因子数据
  console.log('编辑因子', factor);
};

const deleteFactor = (id) => {
  // 调用接口删除，后续实现
  console.log('删除因子', id);
};

onMounted(fetchFactors);
</script>
