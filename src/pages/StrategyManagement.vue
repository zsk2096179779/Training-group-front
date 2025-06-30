<template>
    <el-container>
      <el-header class="bg-gray-100 border-b flex items-center px-6">
        <span class="text-lg font-bold">策略管理</span>
        <div class="ml-auto flex items-center">
          <el-input placeholder="搜索策略..." style="width: 300px" />
          <el-button type="primary" class="ml-4" @click="showCreateDialog = true">
            <el-icon class="mr-1"><Plus /></el-icon>创建策略
          </el-button>
        </div>
      </el-header>
      <el-main>
        <!-- 策略管理内容 -->
        <el-table :data="strategies" style="width: 100%">
          <!-- 列定义... -->
        </el-table>
      </el-main>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  
  // 模拟数据
  const strategies = ref([])
  
  // 对话框状态（如果需要）
  const showCreateDialog = ref(false)
  </script>