<template>
  <div class="page-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/volunteer-dashboard" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way
        </router-link>
        <div class="d-flex">
          <router-link to="/volunteer-home" class="btn btn-outline-light me-3">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/service-map" class="btn btn-outline-light me-3">
            <i class="bi bi-map"></i>
            Service Map
          </router-link>
          <router-link to="/volunteer-email" class="btn btn-outline-light me-3">
            <i class="bi bi-envelope"></i>
            Send Email
          </router-link>
          <router-link to="/ai-assistant" class="btn btn-outline-light me-3">
            <i class="bi bi-robot"></i>
            AI Assistant
          </router-link>
          <button class="btn btn-outline-light" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container-fluid">
        <div class="content-wrapper">
          <div class="main-column">
            <div class="welcome-banner">
              <h2>Welcome Back!</h2>
              <p>Thank you for your dedication to helping our elderly community.</p>
            </div>
            
            <!-- Available Tasks Table -->
            <div class="card">
              <div class="card-header">
                <h3 class="mb-0">Available Tasks</h3>
                <p class="text-muted mb-0">Browse and accept available help requests</p>
              </div>
              <div class="card-body">
                <DataTable
                  :data="availableTasks"
                  :columns="availableTasksColumns"
                  :filterColumns="availableTasksFilterColumns"
                  @accept-task="acceptTask"
                />
              </div>
            </div>

            <!-- My Accepted Tasks Table -->
            <div class="card">
              <div class="card-header">
                <h3 class="mb-0">My Accepted Tasks</h3>
                <p class="text-muted mb-0">Manage your accepted help requests</p>
              </div>
              <div class="card-body">
                <DataTable
                  :data="myTasks"
                  :columns="myTasksColumns"
                  :filterColumns="myTasksFilterColumns"
                  @complete-task="completeTask"
                  @edit-task="editTask"
                />
              </div>
            </div>
          </div>
          <div class="sidebar-column">
            <NotificationPanel v-if="currentUser" :userId="currentUser.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import taskService from '../services/taskService'
import volunteerRatingService from '../services/volunteerRatingService'
import NotificationPanel from '../components/NotificationPanel.vue'
import DataTable from '../components/DataTable.vue'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'VolunteerDashboard',
  components: {
    NotificationPanel,
    DataTable
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)
    const tasks = ref([])
    const isAccepting = ref(false)
    const isCompleting = ref(false)
    const ratingStats = ref({
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    })

    // Initialize user information
    const initCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) {
          toast.error('Please login first')
          router.push('/login')
          return false
        }
        const user = JSON.parse(userStr)
        if (!user || !user.id || user.role !== 'volunteer') {
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

    // Filter tasks by status
    const availableTasks = computed(() => 
      tasks.value.filter(t => t.status === 'open')
    )

    const myTasks = computed(() => 
      tasks.value.filter(t => t.volunteerId === currentUser.value?.id)
    )

    const completedTasks = computed(() => 
      myTasks.value.filter(t => t.status === 'completed')
    )

    const inProgressTasks = computed(() => 
      myTasks.value.filter(t => t.status === 'in_progress')
    )

    const averageRating = computed(() => {
      const ratedTasks = myTasks.value.filter(t => t.rating)
      if (ratedTasks.length === 0) return 0
      return ratedTasks.reduce((sum, t) => sum + t.rating, 0) / ratedTasks.length
    })

    // Available Tasks Table Columns
    const availableTasksColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'type', label: 'Type', sortable: true, formatter: 'TaskTypeFormatter' },
      { key: 'elderlyName', label: 'Requester', sortable: true },
      { key: 'deadline', label: 'Accept Deadline', sortable: true, formatter: 'DateTimeFormatter' },
      { key: 'priority', label: 'Priority', sortable: true, formatter: 'PriorityFormatter' },
      { key: 'actions', label: 'Actions', sortable: false, formatter: 'AvailableTaskActionsFormatter' }
    ]

    // Available Tasks Searchable Columns
    const availableTasksSearchableColumns = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'elderlyName', label: 'Requester' },
      { key: 'description', label: 'Description' }
    ]

    // My Tasks Table Columns
    const myTasksColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'type', label: 'Type', sortable: true, formatter: 'TaskTypeFormatter' },
      { key: 'status', label: 'Status', sortable: true, formatter: 'StatusFormatter' },
      { key: 'elderlyName', label: 'Requester', sortable: true },
      { key: 'deadline', label: 'Completion Deadline', sortable: true, formatter: 'DateTimeFormatter' },
      { key: 'priority', label: 'Priority', sortable: true, formatter: 'PriorityFormatter' },
      { key: 'actions', label: 'Actions', sortable: false, formatter: 'MyTaskActionsFormatter' }
    ]

    // My Tasks Searchable Columns
    const myTasksSearchableColumns = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'elderlyName', label: 'Requester' },
      { key: 'description', label: 'Description' }
    ]

    // Available Tasks Filter Columns
    const availableTasksFilterColumns = [
      { key: 'type', label: 'Task Type' },
      { key: 'priority', label: 'Priority' },
      { key: 'elderlyName', label: 'Requester' },
      { key: 'location', label: 'Location' }
    ]

    // My Tasks Filter Columns
    const myTasksFilterColumns = [
      { key: 'type', label: 'Task Type' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'elderlyName', label: 'Requester' }
    ]

    const loadTasks = async () => {
      try {
        if (!currentUser.value) {
          console.error('User not initialized');
          return;
        }

        // Fetch available tasks (open status)
        const available = await taskService.getTasksByStatus('open');

        // Fetch tasks already accepted by the current volunteer
        const myTasksList = await taskService.getTasksByUser(currentUser.value.id, 'volunteer');

        // Combine the lists, ensuring no duplicates.
        const availableTaskIds = new Set(available.map(t => t.id));
        const combinedTasks = [...available];

        myTasksList.forEach(task => {
          if (!availableTaskIds.has(task.id)) {
            combinedTasks.push(task);
          }
        });

        // Enrich tasks with elderly user names if missing
        const enrichedTasks = await Promise.all(combinedTasks.map(async (task) => {
          if (!task.elderlyName && task.elderlyId) {
            try {
              // Load elderly user data from Firebase
              const userDoc = await getDoc(doc(db, 'users', task.elderlyId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                task.elderlyName = userData.displayName || userData.username || 'Unknown User';
              }
            } catch (error) {
              console.error('Failed to load elderly user data:', error);
              task.elderlyName = 'Unknown User';
            }
          }
          return task;
        }));

        tasks.value = enrichedTasks;

      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast.error('Failed to load tasks');
      }
    };

    const loadRatingStats = async () => {
      try {
        if (!currentUser.value) return
        const stats = await volunteerRatingService.getVolunteerRatings(currentUser.value.id)
        ratingStats.value = stats
      } catch (error) {
        console.error('Failed to load rating statistics:', error)
      }
    }

    const acceptTask = async (task) => {
      if (!currentUser.value) return
      
      try {
        isAccepting.value = true
        await taskService.acceptTask(
          task.id,
          currentUser.value.id,
          currentUser.value.username
        )
        toast.success('Task accepted successfully')
        loadTasks()
      } catch (error) {
        console.error('Failed to accept task:', error)
        toast.error('Failed to accept task')
      } finally {
        isAccepting.value = false
      }
    }

    const completeTask = async (task) => {
      try {
        isCompleting.value = true
        await taskService.completeTask(task.id)
        toast.success('Task marked as completed')
        loadTasks()
      } catch (error) {
        console.error('Failed to complete task:', error)
        toast.error('Failed to complete task')
      } finally {
        isCompleting.value = false
      }
    }

    const editTask = (task) => {
      // 志愿者不能编辑任务，只能查看详情
      toast.info('Task details: ' + task.title)
      console.log('Task details:', task)
    }

    const getTypeClass = (type) => {
      const classes = {
        shopping: 'bg-info',
        delivery: 'bg-warning',
        housework: 'bg-success',
        companionship: 'bg-primary',
        other: 'bg-secondary'
      }
      return classes[type] || 'bg-secondary'
    }

    const getStatusBadgeClass = (status) => {
      const statusMap = {
        'open': 'bg-warning',
        'in_progress': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-secondary'
      }
      return `badge ${statusMap[status] || 'bg-secondary'}`
    }

    const getStatusDisplay = (status) => {
      const statusMap = {
        'open': 'Open',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status
    }

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
    }

    const isUrgent = (deadline) => {
      const now = new Date()
      const deadlineDate = new Date(deadline)
      const hoursDiff = (deadlineDate - now) / (1000 * 60 * 60)
      return hoursDiff <= 24 && hoursDiff > 0
    }

    const logout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    onMounted(() => {
      console.log('VolunteerDashboard mounted')
      if (initCurrentUser()) {
        loadTasks()
        loadRatingStats()
      }
    })

    return {
      tasks,
      currentUser,
      availableTasks,
      myTasks,
      completedTasks,
      inProgressTasks,
      averageRating,
      ratingStats,
      availableTasksColumns,
      availableTasksSearchableColumns,
      availableTasksFilterColumns,
      myTasksColumns,
      myTasksSearchableColumns,
      myTasksFilterColumns,
      isAccepting,
      isCompleting,
      acceptTask,
      completeTask,
      editTask,
      getTypeClass,
      getStatusBadgeClass,
      getStatusDisplay,
      formatDateTime,
      logout,
      isUrgent
    }
  }
}
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
  padding: 0.75rem 0;
  color: white;
  flex-shrink: 0;
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.navbar .container {
  max-width: 100%;
  padding: 0 2rem;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* Remove padding */
  background-color: #f8f9fa;
}

.container-fluid {
  height: 100%;
  padding: 0;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
  padding: 2rem; /* Apply consistent padding here */
  height: 100%;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-column {
  width: 350px;
  flex-shrink: 0;
}

.welcome-banner, .card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card {
  height: auto;
}

.welcome-banner {
  background: #0d6efd;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.welcome-banner h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-banner p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #eee;
}

.card-body {
  /* Removed flex: 1 and overflow: auto */
}

.table-responsive {
  /* Removed height: 100% */
  overflow-x: auto;
  overflow-y: hidden;
}

.table {
  margin: 0;
  width: 100%;
}

.table th {
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn-group .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
}

/* Task Details Modal */
.task-details {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.task-details h6 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.task-details p {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.task-details p:last-child {
  margin-bottom: 0;
}

@media (max-width: 1400px) {
  .notification-sidebar {
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .notification-sidebar {
    width: 100%;
  }

  .main-content {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .page-content {
    padding: 1rem;
  }

  .welcome-banner {
    padding: 1.5rem;
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .welcome-banner h2 {
    font-size: 1.5rem;
  }

  .content-wrapper {
    gap: 1.5rem;
  }

  .card-header {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .btn-group .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style> 