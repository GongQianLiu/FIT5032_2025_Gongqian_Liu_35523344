import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  // 老人和志愿者的仪表板路由将在后续实现
  {
    path: '/elderly-dashboard',
    name: 'ElderlyDashboard',
    component: () => import('../views/ElderlyDashboard.vue')
  },
  {
    path: '/volunteer-dashboard',
    name: 'VolunteerDashboard',
    component: () => import('../views/VolunteerDashboard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('currentUser')

  if (authRequired && !loggedIn) {
    return next('/login')
  }

  next()
})

export default router 