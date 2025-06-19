<template>
  <el-tree
      :data="treeData"
      :props="defaultProps"
      accordion
      node-key="id"
      show-checkbox
      @node-click="handleNodeClick"
  ></el-tree>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFactorTree } from '@/api/factor';

const treeData = ref([]);

const defaultProps = {
  children: 'children',
  label: 'name',
};

const fetchTree = async () => {
  const res = await getFactorTree();
  treeData.value = res.data;
};

const handleNodeClick = (data) => {
  console.log('点击节点', data);
};

onMounted(fetchTree);
</script>
