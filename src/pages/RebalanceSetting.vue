<template>
    <el-container>
      <el-header class="bg-gray-100 border-b flex items-center px-6">
        <span class="text-lg font-bold">再平衡设置</span>
        <div class="ml-auto">
          <el-button type="primary">应用设置</el-button>
        </div>
      </el-header>
      <el-main>
        <!-- 再平衡设置表单 -->
        <el-form label-width="180px">
          <el-form-item label="再平衡触发条件">
            <el-radio-group v-model="rebalanceCondition">
              <!-- 选项 -->
            </el-radio-group>
          </el-form-item>
          <!-- 其他字段 -->
        </el-form>
      </el-main>
    </el-container>
  </template>