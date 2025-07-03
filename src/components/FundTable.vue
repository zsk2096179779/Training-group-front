<template>
  <div class="bg-white shadow rounded overflow-x-auto">
    <table class="min-w-full text-left">
      <thead>
      <tr>
        <th><input type="checkbox" @change="toggleAll"/></th>
        <th>代码</th><th>名称</th><th>标签</th><th>最新净值</th><th>风险</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="fund in funds" :key="fund.code">
        <td><input type="checkbox" v-model="selectedCodes" :value="fund.code"/></td>
        <td>{{ fund.code }}</td>
        <td>{{ fund.name }}</td>
        <td>{{ fund.labels.join(',') }}</td>
        <td>{{ fund.nav }}</td>
        <td>{{ fund.risk }}</td>
      </tr>
      </tbody>
    </table>
    <!-- 分页 -->
    <div class="p-2 flex justify-end space-x-2">
      <button @click="changePage(pagination.page-1)" :disabled="pagination.page===1">‹</button>
      <span>{{ pagination.page }} / {{ totalPage }}</span>
      <button @click="changePage(pagination.page+1)" :disabled="pagination.page===totalPage">›</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundTable',
  props: {
    funds: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        pageSize: 20,
        total:0
      })
    }
  },
  emits: ['selection-change','page-change'],
  data() {
    return { selectedCodes: [] }
  },
  computed: {
    totalPage() {
      return Math.ceil(this.pagination.total / this.pagination.pageSize)
    }
  },
  watch: {
    selectedCodes(codes) {
      const rows = this.funds.filter(f => codes.includes(f.code))
      this.$emit('selection-change', rows)
    }
  },
  methods: {
    toggleAll(e) {
      this.selectedCodes = e.target.checked ? this.funds.map(f=>f.code) : []
    },
    changePage(p) {
      if (p<1||p>this.totalPage) return
      this.$emit('page-change', p)
    }
  }
}
</script>
