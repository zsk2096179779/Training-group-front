<template>
  <div class="settings">
    <h2>系统设置</h2>
    <div class="settings-container">
      <div class="settings-card">
        <h3>基本设置</h3>
        <div class="setting-item">
          <label>主题设置</label>
          <select v-model="theme">
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
          </select>
        </div>
        <div class="setting-item">
          <label>语言设置</label>
          <select v-model="language">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      
      <div class="settings-card">
        <h3>数据设置</h3>
        <div class="setting-item">
          <label>数据更新频率</label>
          <select v-model="updateFrequency">
            <option value="daily">每日</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </select>
        </div>
        <div class="setting-item">
          <label>数据缓存</label>
          <div class="toggle-switch">
            <input type="checkbox" v-model="enableCache" id="cache-toggle">
            <label for="cache-toggle"></label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      theme: 'light',
      language: 'zh',
      updateFrequency: 'daily',
      enableCache: true
    }
  }
}
</script>

<style scoped>
.settings {
  padding: 2rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.settings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.settings-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.setting-item {
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  color: #2c3e50;
  font-weight: 500;
}

select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: #2196F3;
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
}
</style> 