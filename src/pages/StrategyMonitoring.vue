<template>
    <el-container>
      <el-header class="bg-gray-100 border-b flex items-center px-6">
        <span class="text-lg font-bold">策略监控</span>
        <div class="ml-auto flex items-center">
          <el-select v-model="selectedStrategy" placeholder="选择策略">
            <el-option v-for="strategy in strategies" :key="strategy.id" :label="strategy.name" :value="strategy.id" />
          </el-select>
          <el-button class="ml-4">刷新数据</el-button>
        </div>
      </el-header>
      <el-main>
        <!-- 策略监控图表 -->
        <div class="grid grid-cols-2 gap-4">
          <el-card>收益曲线图</el-card>
          <el-card>风险指标</el-card>
        </div>
      </el-main>
    </el-container>
  </template>