<<<<<<< HEAD
<script>
export default {
  name: 'App'
}
</script>

<template>
  <router-view></router-view>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

body {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
}

.container-fluid {
  max-width: 1920px;
  margin: 0 auto;
}

/* 增加输入框的可读性 */
.form-control::placeholder,
.form-select {
  opacity: 0.7;
}

/* 优化按钮点击效果 */
.btn {
  position: relative;
  overflow: hidden;
}

.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.btn:active::after {
  width: 200px;
  height: 200px;
}

/* 优化卡片悬停效果 */
.card {
  will-change: transform;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12) !important;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 优化表单元素的焦点状态 */
.form-control:focus,
.form-select:focus,
.btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(142, 55, 215, 0.25);
}

/* 优化链接悬停效果 */
a {
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  text-decoration: none;
}

/* 响应式字体大小 */
@media (min-width: 1400px) {
  html {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  html {
    font-size: 16px;
=======
<script setup>
import JSON  from './components/JSON.vue'
</script>

<template>
  <header>
    
  </header>

  <main>
    <JSON/>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
>>>>>>> 6e5a34e48eba6954091de76b7fe04de78b5108bc
  }
}
</style>
