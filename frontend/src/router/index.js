import Vue from 'vue'
import VueRouter from 'vue-router'
import ProjectManager from '@/components/ProjectManager.vue'

import ProjectLeaderStatistics from '@/components/ProjectLeaderStatistics.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ProjectManager',
    component: ProjectManager
  },
  {
    path: '/leader-statistics',
    name: 'ProjectLeaderStatistics',
    component: ProjectLeaderStatistics,
    // 添加 meta 字段确保每次进入都重新加载
    meta: { reload: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 解决路由相同但参数变化时组件不刷新的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router