<script>
export default {
  name: 'App'
}
</script>

<template>
  <div id="app">
    <router-view />
    </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

#app {
  width: 100%;
  min-height: 100vh;
    display: flex;
  flex-direction: column;
  }

* {
  box-sizing: border-box;
}
</style>
