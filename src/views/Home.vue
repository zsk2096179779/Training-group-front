<template>
  <div class="home">
    <div class="hero">
      <h1>欢迎使用 Training Group</h1>
      <p>专业的因子管理和数据分析平台</p>
    </div>
    <div class="features">
      <div class="feature-card">
        <h3>因子管理</h3>
        <p>轻松管理和配置您的因子数据</p>
      </div>
      <div class="feature-card">
        <h3>数据分析</h3>
        <p>深入分析因子表现和相关性</p>
      </div>
      <div class="feature-card">
        <h3>可视化展示</h3>
        <p>直观的数据可视化展示</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #34495e;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #7f8c8d;
}
</style> 