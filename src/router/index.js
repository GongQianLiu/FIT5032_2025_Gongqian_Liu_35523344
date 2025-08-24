import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import ElderlyHome from '../views/ElderlyHome.vue'
import VolunteerHome from '../views/VolunteerHome.vue'
import AdminHome from '../views/AdminHome.vue'
import ElderlyDashboard from '../views/ElderlyDashboard.vue'
import VolunteerDashboard from '../views/VolunteerDashboard.vue'
import RateVolunteers from '../views/RateVolunteers.vue'
import DataManagement from '../views/DataManagement.vue'
import EmailManagement from '../components/UniversalEmailManagement.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import HealthServices from '../views/HealthServices.vue'
import CommunityEvents from '../views/CommunityEvents.vue'
import UserManagement from '../views/UserManagement.vue'
import ServiceMap from '../views/ServiceMap.vue'
import Calendar from '../views/Calendar.vue'
import AIAssistantPage from '../views/AIAssistantPage.vue'
import TestPage from '../views/TestPage.vue'
import TestDataTable from '../views/TestDataTable.vue'
import VolunteerEmailManagement from '../views/VolunteerEmailManagement.vue'
import ElderlyEmailManagement from '../views/ElderlyEmailManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/elderly-home',
    component: ElderlyHome,
    meta: { requiresAuth: true, role: 'elderly' }
  },
  {
    path: '/volunteer-home',
    component: VolunteerHome,
    meta: { requiresAuth: true, role: 'volunteer' }
  },
  {
    path: '/admin-home',
    component: AdminHome,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/elderly-dashboard',
    component: ElderlyDashboard,
    meta: { requiresAuth: true, role: 'elderly' }
  },
  {
    path: '/volunteer-dashboard',
    component: VolunteerDashboard,
    meta: { requiresAuth: true, role: 'volunteer' }
  },
  {
    path: '/rate-volunteers',
    component: RateVolunteers,
    meta: { requiresAuth: true, role: 'elderly' }
  },
  {
    path: '/data-management',
    component: DataManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/email-management',
    component: EmailManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/volunteer-email',
    component: VolunteerEmailManagement,
    meta: { requiresAuth: true, role: 'volunteer' }
  },
  {
    path: '/elderly-email',
    component: ElderlyEmailManagement,
    meta: { requiresAuth: true, role: 'elderly' }
  },
  {
    path: '/admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/health-services',
    component: HealthServices,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/community-events',
    component: CommunityEvents,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/user-management',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/service-map',
    component: ServiceMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    component: Calendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-assistant',
    component: AIAssistantPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    component: TestPage,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/test-datatable',
    component: TestDataTable,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 角色权限映射
const roleHierarchy = {
  'elderly': 1,
  'volunteer': 2,
  'admin': 3
}

// 检查用户是否有权限访问某个角色
function hasPermission(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 获取用户默认仪表板路由
function getDefaultDashboard(userRole) {
  switch (userRole) {
    case 'admin':
      return '/admin-dashboard'
    case 'volunteer':
      return '/volunteer-dashboard'
    case 'elderly':
    default:
      return '/elderly-dashboard'
  }
}

router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!currentUser) {
      // 未登录，重定向到登录页
      next('/login')
      return
    }
    
    // 检查用户是否被禁用
    if (currentUser.isActive === false) {
      localStorage.removeItem('currentUser')
      next('/login')
      return
    }
    
    // 检查角色权限
    if (to.meta.role && !hasPermission(currentUser.role, to.meta.role)) {
      // 权限不足，重定向到默认仪表板
      const defaultRoute = getDefaultDashboard(currentUser.role)
      next(defaultRoute)
      return
    }
  }
  
  // 检查是否需要游客访问（已登录用户不能访问登录/注册页）
  if (to.meta.requiresGuest) {
    if (currentUser && to.path !== '/') {
      // 已登录且不是根路径，重定向到默认仪表板
      const defaultRoute = getDefaultDashboard(currentUser.role)
      next(defaultRoute)
      return
    }
  }
  
  next()
})

export default router 