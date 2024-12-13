<!-- filepath: /src/App.vue -->
<template>
  <div id="app">
    <div class="combobox">
      <select v-model="selectedItem" @change="navigateTo(selectedItem)">
        <option disabled value="">请选择功能</option>
        <option v-for="item in menuItems" :key="item.name" :value="item.route">
          {{ item.name }}
        </option>
      </select>
    </div>
    <!-- 渲染路由对应的组件 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      selectedItem: '',
      menuItems: [
        { name: 'Leaflet入门-1：显示底图与矢量对象', route: '/HelloWorld' },
        { name: '功能一', route: '/FunctionOne' },
        { name: '功能二', route: '/feature2' },
        // 添加更多功能项
      ],
    };
  },
  methods: {
    navigateTo(route) {
      if (route) {
        this.$router.push(route);
      }
    },
  },
};
</script>

<style>
.combobox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.combobox select {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.combobox select:focus {
  outline: none;
  border-color: #66afe9;
}
</style>