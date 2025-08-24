<template>
  <div class="page-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/admin-dashboard" class="navbar-brand">
          <i class="bi bi-shield-fill"></i>
          Evergreen Way - Admin Console
        </router-link>
        <div class="d-flex">
          <router-link to="/admin-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/health-services" class="btn btn-outline-light me-2">
            <i class="bi bi-heart-pulse"></i>
            Health Services
          </router-link>
          <router-link to="/community-events" class="btn btn-outline-light me-2">
            <i class="bi bi-calendar-event"></i>
            Community Events
          </router-link>
          <router-link to="/user-management" class="btn btn-outline-light me-2">
            <i class="bi bi-people"></i>
            User Management
          </router-link>
          <router-link to="/email-management" class="btn btn-outline-light me-2">
            <i class="bi bi-envelope"></i>
            Email Management
          </router-link>
          <router-link to="/ai-assistant" class="btn btn-outline-light me-2">
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
      <div class="container-fluid">
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="stat-card bg-primary text-white">
              <div class="stat-icon">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.totalUsers }}</h3>
                <p>Total Users</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-success text-white">
              <div class="stat-icon">
                <i class="bi bi-heart-pulse"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.totalTasks }}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-warning text-white">
              <div class="stat-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.completedTasks }}</h3>
                <p>Completed Tasks</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card bg-info text-white">
              <div class="stat-icon">
                <i class="bi bi-star-fill"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.averageRating.toFixed(1) }}</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </div>
        </div>

                <!-- Main Content Area -->
        <div class="row">
          <!-- Left Column -->
          <div class="col-lg-8">
            <!-- Recent Activities -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-activity"></i>
                  Recent Activities
                </h5>
                <button class="btn btn-sm btn-outline-primary" @click="refreshActivities">
                  <i class="bi bi-arrow-clockwise"></i>
                  Refresh
                </button>
              </div>
              <div class="card-body">
                <div class="activity-list">
                  <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                    <div class="activity-icon">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="activity-content">
                      <h6>{{ activity.title }}</h6>
                      <p class="text-muted">{{ activity.description }}</p>
                      <small class="text-muted">{{ formatDateTime(activity.timestamp) }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interactive Charts Dashboard -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-graph-up"></i>
                  Interactive Analytics Dashboard
                </h5>
              </div>
              <div class="card-body">
                <InteractiveCharts />
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="col-lg-4">
            <!-- Quick Actions -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-lightning"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <button class="btn btn-primary w-100 mb-2" @click="showAddServiceModal">
                    <i class="bi bi-plus-circle"></i>
                    Add Health Service
                  </button>
                  <button class="btn btn-success w-100 mb-2" @click="showAddEventModal">
                    <i class="bi bi-calendar-plus"></i>
                    Create Community Event
                  </button>
                  <button class="btn btn-info w-100 mb-2" @click="exportUserData">
                    <i class="bi bi-download"></i>
                    Export User Data
                  </button>
                  <button class="btn btn-warning w-100 mb-2" @click="sendBulkEmail">
                    <i class="bi bi-envelope"></i>
                    Send Bulk Email
                  </button>
                </div>
              </div>
            </div>

            <!-- System Status -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-gear"></i>
                  System Status
                </h5>
              </div>
              <div class="card-body">
                <div class="system-status">
                  <div class="status-item">
                    <span>Database Connection</span>
                    <span class="status-badge success">
                      <i class="bi bi-check-circle"></i>
                      Normal
                    </span>
                  </div>
                  <div class="status-item">
                    <span>Email Service</span>
                    <span class="status-badge success">
                      <i class="bi bi-check-circle"></i>
                      Normal
                    </span>
                  </div>
                  <div class="status-item">
                    <span>Storage Service</span>
                    <span class="status-badge success">
                      <i class="bi bi-check-circle"></i>
                      Normal
                    </span>
                  </div>
                  <div class="status-item">
                    <span>Authentication Service</span>
                    <span class="status-badge success">
                      <i class="bi bi-check-circle"></i>
                      Normal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Users -->
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-person-plus"></i>
                  Recently Registered Users
                </h5>
              </div>
              <div class="card-body">
                <div class="recent-users">
                  <div v-for="user in recentUsers" :key="user.id" class="user-item">
                    <div class="user-avatar">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="user-info">
                      <h6>{{ user.displayName }}</h6>
                      <small class="text-muted">{{ user.role === 'elderly' ? 'Elderly' : 'Volunteer' }}</small>
                    </div>
                    <small class="text-muted">{{ formatDate(user.createdAt) }}</small>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import InteractiveCharts from '../components/InteractiveCharts.vue';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import taskService from '../services/taskService';
import emailService from '../services/emailService';


export default {
  name: 'AdminDashboard',
  components: {
    InteractiveCharts
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    // Statistics data
    const stats = ref({
      totalUsers: 0,
      totalTasks: 0,
      completedTasks: 0,
      averageRating: 0
    });

    // Recent activities
    const recentActivities = ref([]);

    // Task status statistics
    const taskStatusStats = ref({
      pending: 0,
      inProgress: 0,
      completed: 0
    });

    // Task type statistics
    const taskTypeStats = ref({});

    // Recent users
    const recentUsers = ref([]);

    // Load statistics data
    const loadStats = async () => {
      try {
        // Load real data from Firebase
        const [usersSnapshot, tasksSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'tasks'))
        ]);

        const totalUsers = usersSnapshot.size;
        const totalTasks = tasksSnapshot.size;

        let completedTasks = 0;
        let totalRating = 0;
        let ratingCount = 0;

        tasksSnapshot.forEach((doc) => {
          const task = doc.data();
          if (task.status === 'completed') {
            completedTasks++;
          }
          if (task.rating && task.rating > 0) {
            totalRating += task.rating;
            ratingCount++;
          }
        });

        stats.value = {
          totalUsers,
          totalTasks,
          completedTasks,
          averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0
        };

        // Calculate task status statistics
        const statusCounts = { pending: 0, inProgress: 0, completed: 0 };
        const typeCounts = {};

        tasksSnapshot.forEach((doc) => {
          const task = doc.data();

          // Count by status
          if (task.status === 'open') statusCounts.pending++;
          else if (task.status === 'in_progress') statusCounts.inProgress++;
          else if (task.status === 'completed') statusCounts.completed++;

          // Count by type
          if (task.type) {
            typeCounts[task.type] = (typeCounts[task.type] || 0) + 1;
          }
        });

        taskStatusStats.value = statusCounts;
        taskTypeStats.value = typeCounts;

      } catch (error) {
        console.error('Failed to load statistics:', error);
        toast.error('Failed to load statistics');
      }
    };

    // Load recent activities
    const loadRecentActivities = async () => {
      try {
        // Load recent tasks as activities
        const recentTasksQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const recentTasksSnapshot = await getDocs(recentTasksQuery);
        const activities = [];

        recentTasksSnapshot.forEach((doc) => {
          const task = doc.data();
          activities.push({
            id: doc.id,
            type: 'task_created',
            title: 'New Task Created',
            description: `${task.elderlyName || 'User'} created a ${task.type} task`,
            timestamp: task.createdAt?.toDate() || new Date()
          });
        });

        recentActivities.value = activities;
      } catch (error) {
        console.error('Failed to load recent activities:', error);
        toast.error('Failed to load recent activities');
      }
    };

    // Load recent users
    const loadRecentUsers = async () => {
      try {
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const users = [];

        recentUsersSnapshot.forEach((doc) => {
          const user = doc.data();
          let createdAt = new Date();

          // Handle different date formats
          if (user.createdAt) {
            if (typeof user.createdAt.toDate === 'function') {
              // Firestore Timestamp
              createdAt = user.createdAt.toDate();
            } else if (user.createdAt instanceof Date) {
              // JavaScript Date
              createdAt = user.createdAt;
            } else if (typeof user.createdAt === 'string') {
              // String date
              createdAt = new Date(user.createdAt);
            }
          }

          users.push({
            id: doc.id,
            displayName: user.displayName || user.username || 'Unknown User',
            role: user.role || 'unknown',
            createdAt: createdAt
          });
        });

        recentUsers.value = users;
      } catch (error) {
        console.error('Failed to load recent users:', error);
        toast.error('Failed to load recent users');
      }
    };

    // Get activity icon
    const getActivityIcon = (type) => {
      const icons = {
        task_created: 'bi bi-plus-circle text-primary',
        task_completed: 'bi bi-check-circle text-success',
        user_registered: 'bi bi-person-plus text-info',
        task_accepted: 'bi bi-hand-thumbs-up text-warning'
      };
      return icons[type] || 'bi bi-info-circle text-secondary';
    };

    // Get task type name
    const getTaskTypeName = (type) => {
      const names = {
        shopping: 'Shopping',
        delivery: 'Delivery',
        housework: 'Housework',
        companionship: 'Companionship'
      };
      return names[type] || type;
    };

    // Format date time
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US');
    };

    // Format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US');
    };

    // Refresh activities
    const refreshActivities = () => {
      loadRecentActivities();
      toast.success('Activity data refreshed');
    };

    // Show add service modal
    const showAddServiceModal = () => {
      router.push('/health-services');
    };

    // Show add event modal
    const showAddEventModal = () => {
      router.push('/community-events');
    };

    // Export user data
    const exportUserData = async () => {
      try {
        toast.info('Exporting user data...');

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];

        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          users.push({
            id: doc.id,
            username: user.username || '',
            email: user.email || '',
            role: user.role || '',
            displayName: user.displayName || '',
            createdAt: user.createdAt?.toDate()?.toISOString() || ''
          });
        });

        // Create CSV content
        const csvHeaders = ['ID', 'Username', 'Email', 'Role', 'Display Name', 'Created At'];
        const csvRows = users.map(user => [
          user.id,
          user.username,
          user.email,
          user.role,
          user.displayName,
          user.createdAt
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${users.length} users to CSV file`);
      } catch (error) {
        console.error('Failed to export user data:', error);
        toast.error('Failed to export user data');
      }
    };

    // Send bulk email
    const sendBulkEmail = () => {
      router.push('/email-management');
    };

    // Logout
    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Initialize data when page loads
    onMounted(() => {
      loadStats();
      loadRecentActivities();
      loadRecentUsers();
    });

    return {
      stats,
      recentActivities,
      taskStatusStats,
      taskTypeStats,
      recentUsers,
      getActivityIcon,
      getTaskTypeName,
      formatDateTime,
      formatDate,
      refreshActivities,
      showAddServiceModal,
      showAddEventModal,
      exportUserData,
      sendBulkEmail,
      handleLogout
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f8f9fa;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.stat-content p {
  margin: 0;
  opacity: 0.9;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.activity-content h6 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.activity-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.progress-stats {
  margin-top: 1rem;
}

.progress-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-item span:first-child {
  width: 80px;
  font-size: 0.9rem;
}

.progress-item .progress {
  flex: 1;
  margin: 0 1rem;
  height: 8px;
}

.progress-item span:last-child {
  width: 40px;
  text-align: right;
  font-size: 0.9rem;
}

.task-type-stats {
  margin-top: 1rem;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.type-item:last-child {
  border-bottom: none;
}

.type-count {
  font-weight: 600;
  color: #007bff;
}

.quick-actions .btn {
  text-align: left;
}

.system-status {
  margin-top: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}

.status-badge {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.status-badge.success {
  color: #28a745;
}

.status-badge.error {
  color: #dc3545;
}

.recent-users {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #6c757d;
}

.user-info {
  flex: 1;
}

.user-info h6 {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .navbar .d-flex {
    flex-wrap: wrap;
  }
  
  .navbar .btn {
    margin-bottom: 0.5rem;
  }
}
</style>
