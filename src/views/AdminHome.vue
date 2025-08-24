<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/admin-home" class="navbar-brand">
          <i class="bi bi-shield-fill"></i>
          Evergreen Way - Admin Portal
        </router-link>
        <div class="d-flex">
          <router-link to="/admin-dashboard" class="btn btn-outline-light me-3">
            <i class="bi bi-speedometer2"></i>
            Dashboard
          </router-link>
          <router-link to="/user-management" class="btn btn-outline-light me-3">
            <i class="bi bi-people"></i>
            User Management
          </router-link>
          <router-link to="/health-services" class="btn btn-outline-light me-3">
            <i class="bi bi-hospital"></i>
            Health Services
          </router-link>
          <router-link to="/community-events" class="btn btn-outline-light me-3">
            <i class="bi bi-calendar-event"></i>
            Community Events
          </router-link>
          <router-link to="/data-management" class="btn btn-outline-light me-3">
            <i class="bi bi-database"></i>
            Data Management
          </router-link>
          <router-link to="/email-management" class="btn btn-outline-light me-3">
            <i class="bi bi-envelope"></i>
            Email Management
          </router-link>
          <router-link to="/ai-assistant" class="btn btn-outline-light me-3">
            <i class="bi bi-robot"></i>
            AI Assistant
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold mb-4" style="color: #667eea;">
                Admin Dashboard
              </h1>
              <p class="lead mb-4">
                Welcome to the administrative control center. Monitor system performance, 
                manage users, and ensure smooth operation of the Evergreen Way platform.
              </p>
              <p class="text-muted mb-4">
                From here you can oversee all aspects of the platform, including user management, 
                service coordination, and system analytics.
              </p>
              <div class="welcome-stats">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 style="color: #667eea;">{{ stats.totalUsers }}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 style="color: #764ba2;">{{ stats.activeTasks }}</h3>
                      <p>Active Tasks</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 style="color: #667eea;">{{ stats.systemHealth }}%</h3>
                      <p>System Health</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="welcome-image">
                <img src="/src/assets/images/EbBmoVDxYK.jpg" alt="Admin Dashboard" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <h2 class="text-center mb-5">System Management</h2>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/admin-dashboard')">
                <div class="card-icon">
                  <i class="bi bi-graph-up"></i>
                </div>
                <h4>Analytics Dashboard</h4>
                <p>View comprehensive system analytics, user statistics, and performance metrics.</p>
                <div class="card-footer">
                  <span class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">View Analytics</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/user-management')">
                <div class="card-icon">
                  <i class="bi bi-people"></i>
                </div>
                <h4>User Management</h4>
                <p>Manage user accounts, roles, permissions, and monitor user activity.</p>
                <div class="card-footer">
                  <span class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">Manage Users</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/email-management')">
                <div class="card-icon">
                  <i class="bi bi-envelope"></i>
                </div>
                <h4>Email System</h4>
                <p>Send bulk emails, manage email templates, and monitor communication.</p>
                <div class="card-footer">
                  <span class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">Email Center</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Management -->
        <div class="services-section">
          <h2 class="text-center mb-5">Service Management</h2>
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="service-card" @click="navigateTo('/health-services')">
                <div class="service-icon">
                  <i class="bi bi-heart-pulse"></i>
                </div>
                <div class="service-content">
                  <h5>Health Services</h5>
                  <p>Manage health service offerings, appointments, and medical resources.</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="service-card" @click="navigateTo('/community-events')">
                <div class="service-icon">
                  <i class="bi bi-calendar-event"></i>
                </div>
                <div class="service-content">
                  <h5>Community Events</h5>
                  <p>Organize and manage community events, activities, and social programs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Overview -->
        <div class="system-overview">
          <h2 class="text-center mb-5">System Overview</h2>
          <div class="row">
            <div class="col-md-3 mb-4">
              <div class="overview-card text-center">
                <div class="overview-icon">
                  <i class="bi bi-shield-check"></i>
                </div>
                <h5>Security</h5>
                <p>Monitor system security, user authentication, and data protection.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="overview-card text-center">
                <div class="overview-icon">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <h5>Performance</h5>
                <p>Track system performance, response times, and resource utilization.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="overview-card text-center">
                <div class="overview-icon">
                  <i class="bi bi-database"></i>
                </div>
                <h5>Data Management</h5>
                <p>Manage data storage, backups, and ensure data integrity.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="overview-card text-center">
                <div class="overview-icon">
                  <i class="bi bi-gear"></i>
                </div>
                <h5>Configuration</h5>
                <p>Configure system settings, integrations, and platform parameters.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats-section">
          <h2 class="text-center mb-5">Quick Statistics</h2>
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="stats-card">
                <div class="stats-header">
                  <h5>User Distribution</h5>
                </div>
                <div class="stats-content">
                  <div class="stat-row">
                    <span>Elderly Users:</span>
                    <span class="stat-value">{{ userStats.elderly }}</span>
                  </div>
                  <div class="stat-row">
                    <span>Volunteers:</span>
                    <span class="stat-value">{{ userStats.volunteers }}</span>
                  </div>
                  <div class="stat-row">
                    <span>Admins:</span>
                    <span class="stat-value">{{ userStats.admins }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="stats-card">
                <div class="stats-header">
                  <h5>Task Statistics</h5>
                </div>
                <div class="stats-content">
                  <div class="stat-row">
                    <span>Open Tasks:</span>
                    <span class="stat-value">{{ taskStats.open }}</span>
                  </div>
                  <div class="stat-row">
                    <span>In Progress:</span>
                    <span class="stat-value">{{ taskStats.inProgress }}</span>
                  </div>
                  <div class="stat-row">
                    <span>Completed:</span>
                    <span class="stat-value">{{ taskStats.completed }}</span>
                  </div>
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
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { db } from '../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
  name: 'AdminHome',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)

    const stats = ref({
      totalUsers: 0,
      activeTasks: 0,
      systemHealth: 98
    })

    const userStats = ref({
      elderly: 0,
      volunteers: 0,
      admins: 0
    })

    const taskStats = ref({
      open: 0,
      inProgress: 0,
      completed: 0
    })

    const initCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) {
          toast.error('Please login first')
          router.push('/login')
          return false
        }
        const user = JSON.parse(userStr)
        if (!user || !user.id || user.role !== 'admin') {
          toast.error('Invalid user information')
          router.push('/login')
          return false
        }
        currentUser.value = user
        return true
      } catch (error) {
        console.error('Failed to parse user information:', error)
        toast.error('Invalid user information')
        router.push('/login')
        return false
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    // Load statistics from Firebase
    const loadStats = async () => {
      try {
        // Load users data
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const users = []
        usersSnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() })
        })

        // Count users by role
        const userCounts = {
          elderly: users.filter(u => u.role === 'elderly').length,
          volunteers: users.filter(u => u.role === 'volunteer').length,
          admins: users.filter(u => u.role === 'admin').length
        }
        userStats.value = userCounts

        // Load tasks data
        const tasksSnapshot = await getDocs(collection(db, 'tasks'))
        const tasks = []
        tasksSnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() })
        })

        // Count tasks by status
        const taskCounts = {
          open: tasks.filter(t => t.status === 'open').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          completed: tasks.filter(t => t.status === 'completed').length
        }
        taskStats.value = taskCounts

        // Update general stats
        stats.value = {
          totalUsers: users.length,
          activeTasks: taskCounts.open + taskCounts.inProgress,
          systemHealth: 98
        }

      } catch (error) {
        console.error('Failed to load statistics:', error)
        toast.error('Failed to load statistics')
      }
    }

    onMounted(async () => {
      if (initCurrentUser()) {
        await loadStats()
      }
    })

    return {
      currentUser,
      stats,
      userStats,
      taskStats,
      navigateTo,
      handleLogout,
      loadStats
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%);
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand {
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
}

.main-content {
  padding: 3rem 0;
}

.welcome-section {
  margin-bottom: 4rem;
  padding: 3rem 0;
}

.welcome-stats {
  margin-top: 2rem;
}

.stat-item h3 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-item p {
  color: #6c757d;
  margin: 0;
}

.welcome-image img {
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.quick-actions-section {
  margin-bottom: 4rem;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.action-card h4 {
  color: #333;
  margin-bottom: 1rem;
}

.action-card p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.services-section {
  margin-bottom: 4rem;
}

.service-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.service-icon {
  font-size: 2rem;
  color: #dc3545;
  margin-right: 1rem;
}

.service-content h5 {
  margin-bottom: 0.5rem;
  color: #333;
}

.service-content p {
  color: #6c757d;
  margin: 0;
}

.system-overview {
  margin-bottom: 4rem;
}

.overview-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  height: 100%;
}

.overview-icon {
  font-size: 2.5rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.overview-card h5 {
  color: #333;
  margin-bottom: 1rem;
}

.overview-card p {
  color: #6c757d;
  margin: 0;
}

.quick-stats-section {
  margin-bottom: 2rem;
}

.stats-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.stats-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  text-align: center;
}

.stats-header h5 {
  margin: 0;
  font-weight: 600;
}

.stats-content {
  padding: 1.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-value {
  font-weight: bold;
  color: #667eea;
}

@media (max-width: 768px) {
  .welcome-section {
    text-align: center;
  }
  
  .welcome-image {
    margin-top: 2rem;
  }
  
  .action-card {
    margin-bottom: 2rem;
  }
}
</style>
