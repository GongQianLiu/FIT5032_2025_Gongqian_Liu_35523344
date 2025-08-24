<template>
  <div class="test-page">
    <div class="container mt-4">
      <h1>🧪 System Test Page</h1>
      <p class="text-muted">Testing all services and components</p>
      
      <!-- Current User Info -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Current User Information</h5>
            </div>
            <div class="card-body">
              <div v-if="currentUser" class="row">
                <div class="col-md-6">
                  <p><strong>Username:</strong> {{ currentUser.username }}</p>
                  <p><strong>Email:</strong> {{ currentUser.email }}</p>
                  <p><strong>Role:</strong> 
                    <span :class="'badge bg-' + getRoleColor(currentUser.role)">
                      {{ getRoleName(currentUser.role) }}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>Status:</strong> 
                    <span :class="currentUser.isActive ? 'text-success' : 'text-danger'">
                      {{ currentUser.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                  <p><strong>Created:</strong> {{ formatDate(currentUser.createdAt) }}</p>
                  <p><strong>Last Login:</strong> {{ formatDate(currentUser.lastLogin) }}</p>
                </div>
              </div>
              <div v-else class="text-center">
                <p class="text-muted">No user information available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Service Status -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Service Status</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-2" v-for="service in serviceStatus" :key="service.name">
                  <div class="d-flex align-items-center">
                    <i :class="[service.icon, service.status === 'success' ? 'text-success' : 'text-danger']"></i>
                    <span class="ms-2">{{ service.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>Task Service Test</h5>
            </div>
            <div class="card-body">
              <div v-if="taskTest.loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else>
                <p><strong>Total Tasks:</strong> {{ taskTest.total }}</p>
                <p><strong>Open Tasks:</strong> {{ taskTest.open }}</p>
                <p><strong>Completed Tasks:</strong> {{ taskTest.completed }}</p>
                <div v-if="taskTest.error" class="alert alert-danger">
                  {{ taskTest.error }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>User Service Test</h5>
            </div>
            <div class="card-body">
              <div v-if="userTest.loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else>
                <p><strong>Total Users:</strong> {{ userTest.total }}</p>
                <p><strong>Elderly Users:</strong> {{ userTest.elderly }}</p>
                <p><strong>Volunteers:</strong> {{ userTest.volunteers }}</p>
                <p><strong>Admins:</strong> {{ userTest.admins }}</p>
                <div v-if="userTest.error" class="alert alert-danger">
                  {{ userTest.error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Innovation Components -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>F-Class Innovation Components</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <div class="card">
                    <div class="card-body text-center">
                      <i class="bi bi-calendar-event fs-1 text-primary"></i>
                      <h6 class="mt-2">Appointment Calendar</h6>
                      <p class="text-muted small">FullCalendar.io integration</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card">
                    <div class="card-body text-center">
                      <i class="bi bi-graph-up fs-1 text-success"></i>
                      <h6 class="mt-2">Interactive Charts</h6>
                      <p class="text-muted small">Chart.js visualization</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card">
                    <div class="card-body text-center">
                      <i class="bi bi-robot fs-1 text-info"></i>
                      <h6 class="mt-2">AI Assistant</h6>
                      <p class="text-muted small">Gemini API integration</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card">
                    <div class="card-body text-center">
                      <i class="bi bi-gear fs-1 text-warning"></i>
                      <h6 class="mt-2">Admin Dashboard</h6>
                      <p class="text-muted small">Data management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" @click="runAllTests">
                  <i class="bi bi-play-circle me-1"></i>
                  Run All Tests
                </button>
                <button class="btn btn-success" @click="testTaskService">
                  <i class="bi bi-list-task me-1"></i>
                  Test Task Service
                </button>
                <button class="btn btn-info" @click="testUserService">
                  <i class="bi bi-people me-1"></i>
                  Test User Service
                </button>
                <button class="btn btn-warning" @click="testNotificationService">
                  <i class="bi bi-bell me-1"></i>
                  Test Notification Service
                </button>
                <button class="btn btn-secondary" @click="testRatingService">
                  <i class="bi bi-star me-1"></i>
                  Test Rating Service
                </button>
                <button class="btn btn-dark" @click="testAuthService">
                  <i class="bi bi-shield-check me-1"></i>
                  Test Auth Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Icons Demo -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Interactive Icons Demo</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-2 mb-3 text-center">
                  <div class="icon-demo">
                    <IconCommunity />
                    <p class="mt-2">Community</p>
                  </div>
                </div>
                <div class="col-md-2 mb-3 text-center">
                  <div class="icon-demo">
                    <IconDocumentation />
                    <p class="mt-2">Documentation</p>
                  </div>
                </div>
                <div class="col-md-2 mb-3 text-center">
                  <div class="icon-demo">
                    <IconEcosystem />
                    <p class="mt-2">Ecosystem</p>
                  </div>
                </div>
                <div class="col-md-2 mb-3 text-center">
                  <div class="icon-demo">
                    <IconSupport />
                    <p class="mt-2">Support</p>
                  </div>
                </div>
                <div class="col-md-2 mb-3 text-center">
                  <div class="icon-demo">
                    <IconTooling />
                    <p class="mt-2">Tooling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Log -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Test Log</h5>
            </div>
            <div class="card-body">
              <div class="test-log" style="max-height: 300px; overflow-y: auto;">
                <div v-for="log in testLogs" :key="log.id" class="log-entry mb-2">
                  <small class="text-muted">{{ log.timestamp }}</small>
                  <span :class="log.type === 'success' ? 'text-success' : log.type === 'error' ? 'text-danger' : 'text-info'">
                    {{ log.message }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import taskService from '../services/taskService'
import userService from '../services/userService'
import notificationService from '../services/notificationService'
import volunteerRatingService from '../services/volunteerRatingService'
import firebaseAuth from '../services/firebaseAuth'
import IconCommunity from '../components/icons/IconCommunity.vue'
import IconDocumentation from '../components/icons/IconDocumentation.vue'
import IconEcosystem from '../components/icons/IconEcosystem.vue'
import IconSupport from '../components/icons/IconSupport.vue'
import IconTooling from '../components/icons/IconTooling.vue'

export default {
  name: 'TestPage',
  components: {
    IconCommunity,
    IconDocumentation,
    IconEcosystem,
    IconSupport,
    IconTooling
  },
  setup() {
    const currentUser = ref(null)
    const serviceStatus = ref([
      { name: 'Task Service', status: 'pending', icon: 'bi-list-task' },
      { name: 'User Service', status: 'pending', icon: 'bi-people' },
      { name: 'Notification Service', status: 'pending', icon: 'bi-bell' },
      { name: 'Rating Service', status: 'pending', icon: 'bi-star' },
      { name: 'Auth Service', status: 'pending', icon: 'bi-shield-check' }
    ])

    const taskTest = ref({
      loading: false,
      total: 0,
      open: 0,
      completed: 0,
      error: null
    })

    const userTest = ref({
      loading: false,
      total: 0,
      elderly: 0,
      volunteers: 0,
      admins: 0,
      error: null
    })

    const testLogs = ref([])

    const addLog = (message, type = 'info') => {
      testLogs.value.unshift({
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      })
    }

    const getRoleColor = (role) => {
      switch (role) {
        case 'admin': return 'danger'
        case 'volunteer': return 'success'
        case 'elderly': return 'primary'
        default: return 'secondary'
      }
    }

    const getRoleName = (role) => {
      switch (role) {
        case 'admin': return 'Administrator'
        case 'volunteer': return 'Volunteer'
        case 'elderly': return 'Elderly'
        default: return 'Unknown'
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }

    const testTaskService = async () => {
      taskTest.value.loading = true
      taskTest.value.error = null
      addLog('Testing Task Service...', 'info')

      try {
        const tasks = await taskService.getAllTasks()
        const stats = await taskService.getTaskStatistics()
        
        taskTest.value.total = tasks.length
        taskTest.value.open = stats.open
        taskTest.value.completed = stats.completed
        
        serviceStatus.value[0].status = 'success'
        addLog(`Task Service: Found ${tasks.length} tasks`, 'success')
      } catch (error) {
        taskTest.value.error = error.message
        serviceStatus.value[0].status = 'error'
        addLog(`Task Service Error: ${error.message}`, 'error')
      } finally {
        taskTest.value.loading = false
      }
    }

    const testUserService = async () => {
      userTest.value.loading = true
      userTest.value.error = null
      addLog('Testing User Service...', 'info')

      try {
        const users = await userService.getAllUsers()
        const stats = await userService.getUserStatistics()
        
        userTest.value.total = users.length
        userTest.value.elderly = stats.elderly
        userTest.value.volunteers = stats.volunteers
        userTest.value.admins = stats.admins
        
        serviceStatus.value[1].status = 'success'
        addLog(`User Service: Found ${users.length} users`, 'success')
      } catch (error) {
        userTest.value.error = error.message
        serviceStatus.value[1].status = 'error'
        addLog(`User Service Error: ${error.message}`, 'error')
      } finally {
        userTest.value.loading = false
      }
    }

    const testNotificationService = async () => {
      addLog('Testing Notification Service...', 'info')

      try {
        const notifications = await notificationService.getAllRatings()
        serviceStatus.value[2].status = 'success'
        addLog(`Notification Service: Working correctly`, 'success')
      } catch (error) {
        serviceStatus.value[2].status = 'error'
        addLog(`Notification Service Error: ${error.message}`, 'error')
      }
    }

    const testRatingService = async () => {
      addLog('Testing Rating Service...', 'info')

      try {
        const ratings = await volunteerRatingService.getAllRatings()
        serviceStatus.value[3].status = 'success'
        addLog(`Rating Service: Found ${ratings.length} ratings`, 'success')
      } catch (error) {
        serviceStatus.value[3].status = 'error'
        addLog(`Rating Service Error: ${error.message}`, 'error')
      }
    }

    const testAuthService = async () => {
      addLog('Testing Auth Service...', 'info')

      try {
        const userInfo = await firebaseAuth.getCurrentUserInfo()
        if (userInfo) {
          currentUser.value = userInfo
          serviceStatus.value[4].status = 'success'
          addLog(`Auth Service: User authenticated - ${userInfo.username} (${userInfo.role})`, 'success')
        } else {
          serviceStatus.value[4].status = 'error'
          addLog('Auth Service: No authenticated user found', 'error')
        }
      } catch (error) {
        serviceStatus.value[4].status = 'error'
        addLog(`Auth Service Error: ${error.message}`, 'error')
      }
    }

    const runAllTests = async () => {
      addLog('Running all tests...', 'info')
      await testTaskService()
      await testUserService()
      await testNotificationService()
      await testRatingService()
      await testAuthService()
      addLog('All tests completed!', 'success')
    }

    onMounted(async () => {
      addLog('Test page loaded successfully', 'success')
      
      // 获取当前用户信息
      try {
        const userInfo = await firebaseAuth.getCurrentUserInfo()
        if (userInfo) {
          currentUser.value = userInfo
          addLog(`Current user: ${userInfo.username} (${userInfo.role})`, 'success')
        }
      } catch (error) {
        addLog(`Failed to get current user: ${error.message}`, 'error')
      }
      
      runAllTests()
    })

    return {
      currentUser,
      serviceStatus,
      taskTest,
      userTest,
      testLogs,
      testTaskService,
      testUserService,
      testNotificationService,
      testRatingService,
      testAuthService,
      runAllTests,
      getRoleColor,
      getRoleName,
      formatDate
    }
  }
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.log-entry {
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
}

.log-entry:last-child {
  border-bottom: none;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0 !important;
}

.test-log {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.icon-demo {
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.icon-demo:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.icon-demo svg {
  width: 48px;
  height: 48px;
  transition: transform 0.3s ease;
}

.icon-demo:hover svg {
  transform: scale(1.1);
}

.icon-demo p {
  margin: 0;
  font-weight: 500;
  color: #495057;
}
</style>
