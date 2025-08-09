import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'

Vue.config.productionTip = false;
Vue.use(ElementUI);

// 添加全局路由守卫
router.beforeEach((to, from, next) => {
  // 如果设置了 reload 元字段，强制重新加载组件
  if (to.meta.reload) {
    if (to.name === from.name) {
      // 相同路由时强制刷新
      next({
        ...to,
        replace: true
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')