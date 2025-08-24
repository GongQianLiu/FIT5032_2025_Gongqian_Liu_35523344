import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 初始化 Firebase
import './firebase/config'

// 导入 Bootstrap CSS 和 JS
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 将 bootstrap 暴露到全局
window.bootstrap = bootstrap
// 导入 Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// 导入 Toast 提示组件
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Toast 配置
const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
}

const app = createApp(App)

// 使用插件
app.use(router)
app.use(Toast, toastOptions)

// 挂载应用
app.mount('#app')

// 导入模态框清理工具
import './utils/modalUtils'

// 导入测试工具（仅在开发环境）
if (import.meta.env.DEV) {
  import('./utils/createTestUsers').then(({ createTestUsers, deleteTestUsers }) => {
    window.createTestUsers = createTestUsers;
    window.deleteTestUsers = deleteTestUsers;
    console.log('🔧 Test user utilities loaded. Use window.createTestUsers() to create test users.');
  });

  import('./utils/createTestEmails').then(({ createTestEmails, deleteTestEmails, getEmailStats }) => {
    window.createTestEmails = createTestEmails;
    window.deleteTestEmails = deleteTestEmails;
    window.getEmailStats = getEmailStats;
    console.log('🔧 Test email utilities loaded. Use window.createTestEmails() to create test emails.');
  });

  import('./utils/testEmailSystem').then(({ testInternalEmail, testEmailStats, testUserEmails, cleanupTestEmails }) => {
    window.testInternalEmail = testInternalEmail;
    window.testEmailStats = testEmailStats;
    window.testUserEmails = testUserEmails;
    window.cleanupTestEmails = cleanupTestEmails;
    console.log('🔧 Email testing utilities loaded. Use window.testInternalEmail() to test email system.');
  });

  import('./utils/testNetlifyEmail').then(({ testNetlifyEmail, testNetlifyFunctionAvailability }) => {
    window.testNetlifyEmail = testNetlifyEmail;
    window.testNetlifyFunctionAvailability = testNetlifyFunctionAvailability;
    console.log('🔧 Netlify email testing utilities loaded. Use window.testNetlifyEmail() to test Netlify Functions.');
  });

  import('./utils/testCompleteEmailSystem').then(({ testCompleteEmailSystem, testEmailSystemConfig }) => {
    window.testCompleteEmailSystem = testCompleteEmailSystem;
    window.testEmailSystemConfig = testEmailSystemConfig;
    console.log('🔧 Complete email system testing utilities loaded. Use window.testCompleteEmailSystem() to test everything.');
  });
}
