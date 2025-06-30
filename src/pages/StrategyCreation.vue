<template>
    <el-container>
      <el-header class="bg-gray-100 border-b flex items-center px-6">
        <span class="text-lg font-bold">策略创建</span>
        <div class="ml-auto">
          <el-button type="primary">保存策略</el-button>
          <el-button type="success" class="ml-2">启动策略</el-button>
        </div>
      </el-header>
      <el-main>
        <!-- 策略创建表单 -->
        <el-form :model="form" label-width="120px">
          <!-- 表单字段... -->
        </el-form>
      </el-main>
    </el-container>
  </template>