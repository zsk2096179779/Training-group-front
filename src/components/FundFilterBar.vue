<!--<template>-->
<!--  <div class="flex space-x-2 items-center p-2 bg-white shadow">-->
<!--    <input-->
<!--        v-model="local.code"-->
<!--        placeholder="基金代码或名称"-->
<!--        class="border rounded px-2 py-1 flex-1"-->
<!--    />-->
<!--    <select-->
<!--        v-model="local.labels"-->
<!--        multiple-->
<!--        class="border rounded px-2 py-1"-->
<!--    >-->
<!--      <option v-for="lab in labels" :key="lab.value" :value="lab.value">-->
<!--        {{ lab.label }}-->
<!--      </option>-->
<!--    </select>-->
<!--    <button class="btn btn-sm btn-primary" @click="$emit('search')">-->
<!--      查询-->
<!--    </button>-->
<!--    <button class="btn btn-sm btn-secondary" @click="reset">-->
<!--      重置-->
<!--    </button>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: 'FundFilterBar',-->
<!--  props: {-->
<!--    labels: Array,-->
<!--    value: Object-->
<!--  },-->
<!--  data() {-->
<!--    return { local: { ...this.value } }-->
<!--  },-->
<!--  watch: {-->
<!--    value(v) { this.local = { ...v } },-->
<!--    local: { deep: true, handler(v) { this.$emit('update:value', v) } }-->
<!--  },-->
<!--  methods: {-->
<!--    reset() {-->
<!--      this.local = { code:'', labels: [] }-->
<!--      this.$emit('search')-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
<template>
  <div class="flex space-x-2 p-2 bg-white shadow rounded">
    <!-- 模式选择 -->
    <template v-if="mode === 'list'">
      <input
          v-model="local.code"
          placeholder="基金代码或名称"
          class="border px-2 py-1 rounded flex-1"
      />
    </template>
    <template v-else-if="mode === 'company'">
      <input
          v-model="local.companyName"
          placeholder="基金公司名称"
          class="border px-2 py-1 flex-1 rounded"
      />
    </template>
    <template v-else-if="mode === 'manager'">
      <input
          v-model="local.managerName"
          placeholder="基金经理姓名"
          class="border px-2 py-1 flex-1 rounded"
      />
    </template>

    <!-- 标签多选 -->
    <select
        v-model="local.labels"
        multiple
        class="border px-2 py-1 rounded"
    >
      <option
          v-for="lab in labels"
          :key="lab.id"
          :value="lab.id"
      >{{lab.name}}</option>
    </select>

    <!-- 操作按钮 -->
    <button class="btn btn-sm btn-primary" @click="$emit('search')">
      查询
    </button>
    <button class="btn btn-sm btn-secondary" @click="onReset">
      重置
    </button>
  </div>
</template>

<script>
export default {
  name: 'FundFilterBar',
  props: {
    /** 'list' | 'company' | 'manager' */
    mode: {
      type: String,
      default: 'list'
    },
    /** 后端标签列表：[{ id, name }] */
    labels: {
      type: Array,
      default: () => []
    },
    /** v-model:value 绑定的 filters 对象 */
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      local: { ...this.value }
    }
  },
  watch: {
    // 外部 value 变时，同步到 local
    value: {
      handler(v) {
        this.local = { ...v }
      },
      deep: true
    },
    // local 变时，向父组件抛出 update:value
    local: {
      handler(v) {
        this.$emit('update:value', { ...v })
      },
      deep: true
    }
  },
  methods: {
    onReset() {
      // 清空当前 mode 下的字段 + labels
      if (this.mode === 'list')    this.local.code = ''
      if (this.mode === 'company') this.local.companyName = ''
      if (this.mode === 'manager') this.local.managerName = ''
      this.local.labels = []
      this.$emit('search')
    }
  }
}
</script>
