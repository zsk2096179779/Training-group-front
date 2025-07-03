<template>
  <div class="profile-container">

    <!-- 基本信息 -->
    <el-card class="card">
      <el-descriptions title="基金基本信息" :column="4">
        <el-descriptions-item label="代码">{{ profile.code }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ profile.name }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ profile.companyName }}</el-descriptions-item>
        <el-descriptions-item label="经理">{{ profile.managerName }}</el-descriptions-item>
        <el-descriptions-item label="成立日">{{ profile.inceptionDate }}</el-descriptions-item>
        <el-descriptions-item label="最新净值">{{ profile.nav }}</el-descriptions-item>
        <el-descriptions-item label="风险">{{ profile.risk }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 业务图：三张原生 ECharts -->
    <el-card class="card">
      <div class="card-header">净值走势（原生 ECharts）</div>
      <div id="navChart" class="chart"></div>
    </el-card>

    <el-card class="card">
      <div class="card-header">持仓分析（原生 ECharts）</div>
      <div id="holdingsChart" class="chart"></div>
    </el-card>

    <el-card class="card">
      <div class="card-header">业绩归因（原生 ECharts）</div>
      <div id="attribChart" class="chart"></div>
    </el-card>

    <!-- 公告列表 -->
    <el-card class="card">
      <div class="card-header">基金公告</div>
      <el-timeline>
        <el-timeline-item
            v-for="ann in profile.announcements"
            :key="`${ann.date}-${ann.title}`"
            :timestamp="ann.date"
        >
          {{ ann.title }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute }       from 'vue-router'
import { fetchFundProfile } from '../../api/funds.js'

// 引入全量 ECharts
import * as echarts from 'echarts'

const route = useRoute()
const code  = route.params.code

const profile = ref({
  code:'', name:'', companyName:'', managerName:'',
  inceptionDate:'', nav:0, risk:0,
  navHistory:[], holdings:[], attribution:[], announcements:[]
})

onMounted(async () => {
  // 1. 测试静态折线（就照示例搬过来）
  const domMain = document.getElementById('main')
  if (domMain) {
    echarts.init(domMain).setOption({
      xAxis: {
        type: 'category',
        data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      },
      yAxis: { type: 'value' },
      series: [{
        data: [820,932,901,934,1290,1330,1320],
        type: 'line',
        smooth: true
      }]
    })
  }

  // 2. 拉业务数据
  const p = await fetchFundProfile(code)
  profile.value = p

  // 3. 三张业务图原生初始化
  // 净值折线
  const domNav = document.getElementById('navChart')
  if (domNav) {
    echarts.init(domNav).setOption({
      tooltip: { trigger:'axis' },
      xAxis: { type:'category', data:p.navHistory.map(i=>i.date) },
      yAxis: { type:'value' },
      series: [{ name:'净值', type:'line', data:p.navHistory.map(i=>i.value) }]
    })
  }

  // 持仓饼图
  const domHold = document.getElementById('holdingsChart')
  if (domHold) {
    echarts.init(domHold).setOption({
      tooltip: { trigger:'item' },
      legend: { bottom:'0' },
      series: [{
        type:'pie',
        radius:'50%',
        data:p.holdings.map(h=>({name:h.name,value:h.percent}))
      }]
    })
  }

  // 业绩归因
  const domAttr = document.getElementById('attribChart')
  if (domAttr) {
    echarts.init(domAttr).setOption({
      tooltip: { trigger:'item' },
      legend: { bottom:'0' },
      series: [{
        type:'pie',
        radius:['40%','60%'],
        data:p.attribution.map(a=>({name:a.category,value:a.value}))
      }]
    })
  }
})
</script>

<style scoped>
.profile-container { padding:16px; background:#f5f7fa; }
.card             { margin-bottom:20px; }
.card-header      { font-weight:600; margin-bottom:12px; }
.chart            { width:100%; height:300px; }
</style>


