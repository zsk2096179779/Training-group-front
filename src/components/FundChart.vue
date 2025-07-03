<template>
  <div ref="chartRef" class="h-48 bg-white shadow rounded"></div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  name: 'FundChart',
  props: { data: Object },
  mounted() {
    this.chart = echarts.init(this.$refs.chartRef)
    this.chart.setOption({
      title: { text: '标签分布' },
      tooltip: {},
      series: [{
        type: 'pie',
        radius: '50%',
        data: this.data.labels.map(l=>({ name:l.label, value:l.count }))
      }]
    })
  },
  watch: {
    data(d) {
      this.chart.setOption({ series: [{ data: d.labels.map(l=>({ name:l.label, value:l.count })) }] })
    }
  }
}
</script>
