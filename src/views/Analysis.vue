<template>
  <div class="analysis">
    <h2>数据分析</h2>
    <div class="analysis-container">
      <div class="chart-container">
        <div class="chart-card">
          <h3>因子相关性分析</h3>
          <div class="chart-placeholder">
            <!-- 这里可以集成图表库，如 ECharts -->
            <p>图表区域</p>
          </div>
        </div>
      </div>
      <div class="data-table">
        <h3>数据概览</h3>
        <table>
          <thead>
            <tr>
              <th>因子名称</th>
              <th>相关性</th>
              <th>收益率</th>
              <th>波动率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i">
              <td>因子 {{ i }}</td>
              <td>{{ (Math.random() * 0.5 + 0.5).toFixed(2) }}</td>
              <td>{{ (Math.random() * 10).toFixed(2) }}%</td>
              <td>{{ (Math.random() * 5).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analysis'
}
</script>

<style scoped>
.analysis {
  padding: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.analysis-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.chart-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.chart-card {
  height: 400px;
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

tr:hover {
  background-color: #f8f9fa;
}
</style> 