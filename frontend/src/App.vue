<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import ProjectManager from './components/ProjectManager.vue';

export default {
  name: 'App',
  components: {
    ProjectManager
  }
};
</script>

<style>
/* 引入全局样式 */
@import './assets/main.css';
</style>