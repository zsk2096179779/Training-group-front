<template>
  <div class="product-list">
    <h1>产品列表</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-if="error" class="error">
      加载失败: {{ error }}
      <button @click="fetchProducts">重试</button>
    </div>

    <div v-if="products.length > 0" class="products-container">
      <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
      >
        <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image">
        <h3>{{ product.name }}</h3>
        <p class="price">¥{{ product.price }}</p>
        <button
            class="order-btn"
            @click="orderProduct(product)"
        >
          立即订购
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="no-products">
      暂无产品数据
    </div>
  </div>
</template>

<script>
import { getProductList, createOrder } from '@/api/product'

export default {
  data() {
    return {
      products: [],
      loading: false,
      error: null
    }
  },
  created() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        // 使用导入的API方法
        this.products = await getProductList()
      } catch (err) {
        this.error = err.message || '获取产品列表失败'
      } finally {
        this.loading = false
      }
    },

    async orderProduct(product) {
      try {
        // 使用导入的API方法
        await createOrder({
          productId: product.id,
          quantity: 1
        })

        alert(`已成功订购 ${product.name}`)
      } catch (err) {
        alert(`订购失败: ${err.message || '未知错误'}`)
      }
    }
  }
}
</script>
<style scoped>
.product-list {
  padding: 20px;
}

.loading, .error, .no-products {
  text-align: center;
  padding: 20px;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.price {
  color: #e63946;
  font-weight: bold;
  margin: 10px 0;
}

.order-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.order-btn:hover {
  background-color: #369f6d;
}
</style>