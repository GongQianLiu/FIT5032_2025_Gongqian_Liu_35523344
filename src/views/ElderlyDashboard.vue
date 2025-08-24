<template>
  <div class="page-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/elderly-dashboard" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way
        </router-link>
        <div class="d-flex me-auto">
          <router-link to="/elderly-home" class="btn btn-outline-light me-3">
            <i class="bi bi-house-fill"></i>
            Home
          </router-link>
        </div>
        <div class="d-flex">
          <button class="btn btn-outline-light me-3" @click="showNewTaskModal">
            <i class="bi bi-plus-circle"></i>
            Request Help
          </button>
          <router-link to="/service-map" class="btn btn-outline-light me-3">
            <i class="bi bi-map"></i>
            Service Map
          </router-link>
          <router-link to="/calendar" class="btn btn-outline-light me-3">
            <i class="bi bi-calendar3"></i>
            Calendar & Appointments
          </router-link>
          <router-link to="/rate-volunteers" class="btn btn-outline-light me-3">
            <i class="bi bi-star-fill"></i>
            Rate Volunteers
          </router-link>
          <router-link to="/elderly-email" class="btn btn-outline-light me-3">
            <i class="bi bi-envelope"></i>
            Send Email
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
      <div class="container-fluid">
        <div class="content-wrapper">
          <div class="main-column">
            <div class="welcome-banner">
              <h2>Welcome Back!</h2>
              <p>Need assistance? Our volunteers are here to help you with daily tasks.</p>
              <button class="btn btn-outline-light" @click="showNewTaskModal">
                <i class="bi bi-plus-circle"></i>
                Request New Help
              </button>
            </div>
            <div class="card">
              <div class="card-header">
                <h3 class="mb-0">My Help Requests</h3>
                <p class="text-muted mb-0">Manage your help requests and track their progress</p>
              </div>
              <div class="card-body">
                <DataTable
                  :data="myTasks"
                  :columns="myTasksColumns"
                  :filterColumns="myTasksFilterColumns"
                  @confirm-task="confirmTask"
                  @show-rating-modal="showRatingModal"
                  @show-complaint-modal="showComplaintModal"
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

    <!-- Modals -->
    <!-- New Task Modal -->
    <div class="modal" id="newTaskModal" tabindex="-1" ref="newTaskModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Request New Help</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitNewTask">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newTask.title"
                  required
                  placeholder="Enter task title"
                  oninvalid="this.setCustomValidity('Please enter a task title')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Type</label>
                <select 
                  class="form-select" 
                  v-model="newTask.type" 
                  required
                  oninvalid="this.setCustomValidity('Please select a task type')"
                  oninput="this.setCustomValidity('')"
                >
                  <option value="shopping">Shopping</option>
                  <option value="delivery">Delivery</option>
                  <option value="housework">Housework</option>
                  <option value="companionship">Companionship</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  v-model="newTask.description"
                  rows="3"
                  required
                  placeholder="Describe what you need help with"
                  oninvalid="this.setCustomValidity('Please describe what you need help with')"
                  oninput="this.setCustomValidity('')"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Accept Deadline (1-3 hours from now)</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  v-model="newTask.deadline"
                  required
                  :min="minDeadline"
                  :max="maxDeadline"
                  oninvalid="this.setCustomValidity('Please select a deadline')"
                  oninput="this.setCustomValidity('')"
                />
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Creating...' : 'Create Request' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div class="modal" id="ratingModal" tabindex="-1" ref="ratingModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate Volunteer's Help</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitRating">
              <div class="mb-4 text-center">
                <div class="stars">
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="bi"
                    :class="star <= rating ? 'bi-star-fill' : 'bi-star'"
                    @click="rating = star"
                    style="color: #ffc107; cursor: pointer;"
                  ></i>
                </div>
                <div class="rating-text mt-2">
                  {{ getRatingText(rating) }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Review (Optional)</label>
                <textarea
                  class="form-control"
                  v-model="review"
                  rows="3"
                  placeholder="Share your experience with the volunteer"
                ></textarea>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="!rating || isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Submitting...' : 'Submit Rating' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Complaint Modal -->
    <div class="modal" id="complaintModal" tabindex="-1" ref="complaintModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Report an Issue</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitComplaint" class="complaint-form">
              <div class="mb-3">
                <label class="form-label">Describe the Issue</label>
                <textarea
                  class="form-control"
                  v-model="complaint"
                  rows="4"
                  required
                  placeholder="Please describe what went wrong"
                ></textarea>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-danger" :disabled="!complaint || isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Submitting...' : 'Submit Report' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import taskService from '../services/taskService'
import NotificationPanel from '../components/NotificationPanel.vue'
import DataTable from '../components/DataTable.vue'

import { Modal } from 'bootstrap'

export default {
  name: 'ElderlyDashboard',
  components: {
    NotificationPanel,
    DataTable
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)
    const myTasks = ref([])
    const isLoading = ref(false)
    const complaint = ref('')
    const selectedTask = ref(null)
    const rating = ref(0)
    const review = ref('')

    // Computed properties: earliest and latest deadlines for new tasks
    const formatDateTimeLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const minDeadline = computed(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5); // Set minimum time to 5 minutes from now
      return formatDateTimeLocal(now);
    });

    const maxDeadline = computed(() => {
      const now = new Date();
      now.setHours(now.getHours() + 3); // Set maximum time to 3 hours from now
      return formatDateTimeLocal(now);
    });

    // New task form data
    const newTask = ref({
      title: '',
      type: 'shopping',
      description: '',
      deadline: formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)) // Default to 1 hour from now
    });

    const validateDeadline = (deadline) => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const minTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      const maxTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

      if (deadlineDate < minTime) {
        toast.error('Deadline must be at least 5 minutes from now');
        return false;
      }
      if (deadlineDate > maxTime) {
        toast.error('The deadline you set is too far. Please set a deadline within 3 hours from now.');
        return false;
      }
      return true;
    };

    const initCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) {
          toast.error('Please login first')
          router.push('/login')
          return false
        }
        const user = JSON.parse(userStr)
        if (!user || !user.id || user.role !== 'elderly') {
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

    // My Tasks Table Columns
    const myTasksColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'type', label: 'Type', sortable: true, formatter: 'TaskTypeFormatter' },
      { key: 'status', label: 'Status', sortable: true, formatter: 'StatusFormatter' },
      { key: 'volunteerName', label: 'Volunteer', sortable: true },
      { key: 'deadline', label: 'Accept Deadline', sortable: true, formatter: 'DateTimeFormatter' },
      { key: 'completionDeadline', label: 'Completion Deadline', sortable: true, formatter: 'DateTimeFormatter' },
      { key: 'priority', label: 'Priority', sortable: true, formatter: 'PriorityFormatter' },
      { key: 'actions', label: 'Actions', sortable: false, formatter: 'ElderlyTaskActionsFormatter' }
    ]

    // My Tasks Searchable Columns
    const myTasksSearchableColumns = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'volunteerName', label: 'Volunteer' },
      { key: 'description', label: 'Description' }
    ]

    // My Tasks Filter Columns
    const myTasksFilterColumns = [
      { key: 'type', label: 'Task Type' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'volunteerName', label: 'Volunteer' }
    ]

    const loadTasks = async () => {
      try {
        isLoading.value = true
        console.log('Fetching tasks for user:', currentUser.value.id)
        
        const tasks = await taskService.getTasksByUser(currentUser.value.id, 'elderly')
        console.log('Loaded tasks:', tasks)
        
        // 如果没有任务，创建一些测试任务
        if (tasks.length === 0) {
          console.log('No tasks found, creating test tasks...')
          const testTasks = [
            {
              title: 'Grocery Shopping',
              type: 'shopping',
              description: 'Need help with weekly grocery shopping',
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              location: 'Melbourne CBD',
              priority: 'medium'
            },
            {
              title: 'House Cleaning',
              type: 'housework',
              description: 'Help with basic house cleaning tasks',
              deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              location: 'Melbourne CBD',
              priority: 'low'
            }
          ]
          
          for (const taskData of testTasks) {
            try {
              await taskService.createTask({
                ...taskData,
                elderlyId: currentUser.value.id,
                elderlyName: currentUser.value.username
              })
            } catch (error) {
              console.error('Error creating test task:', error)
            }
          }
          
          // 重新加载任务
          const newTasks = await taskService.getTasksByUser(currentUser.value.id, 'elderly')
          myTasks.value = newTasks
        } else {
          myTasks.value = tasks
        }
        
        isLoading.value = false
      } catch (error) {
        console.error('Failed to load tasks:', error)
        errorMessage.value = error.message
        isLoading.value = false
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    const showNewTaskModal = () => {
      newTask.value = {
        title: '',
        type: 'shopping',
        description: '',
        deadline: formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)) // Default to 1 hour from now
      }
      const modalElement = document.getElementById('newTaskModal')
      if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
      } else {
        console.error('Modal element not found')
      }
    }

    const submitNewTask = async () => {
      try {
        if (!validateDeadline(newTask.value.deadline)) {
          return;
        }

        isLoading.value = true;
        const taskData = {
          title: newTask.value.title,
          type: newTask.value.type,
          description: newTask.value.description,
          deadline: newTask.value.deadline,
          location: 'Melbourne CBD', // 默认位置，可以后续添加位置选择
          elderlyId: currentUser.value.id,
          elderlyName: currentUser.value.username,
          priority: 'medium' // 默认优先级
        };
        await taskService.createTask(taskData);
        toast.success('Task created successfully');
        loadTasks();
        const modalElement = document.getElementById('newTaskModal');
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      } catch (error) {
        console.error('Failed to create task:', error);
        toast.error('Failed to create task');
      } finally {
        isLoading.value = false;
      }
    };

    const showRatingModal = (task) => {
      selectedTask.value = task
      rating.value = 0
      review.value = ''
      const modalElement = document.getElementById('ratingModal')
      if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
      }
    }

    const submitRating = async () => {
      try {
        isLoading.value = true
        await taskService.updateTask(selectedTask.value.id, {
          rating: rating.value,
          review: review.value
        })
        toast.success('Rating submitted successfully')
        loadTasks()
        const modalElement = document.getElementById('ratingModal')
        if (modalElement) {
          const modal = Modal.getInstance(modalElement)
          if (modal) {
            modal.hide()
          }
        }
      } catch (error) {
        console.error('Failed to submit rating:', error)
        toast.error('Failed to submit rating')
      } finally {
        isLoading.value = false
      }
    }

    const showComplaintModal = (task) => {
      selectedTask.value = task
      complaint.value = ''
      const modalElement = document.getElementById('complaintModal')
      if (modalElement) {
        const modal = new Modal(modalElement)
        modal.show()
      }
    }

    const submitComplaint = async () => {
      try {
        isLoading.value = true
        await taskService.submitComplaint(selectedTask.value.id, complaint.value)
        toast.success('Complaint submitted successfully')
        loadTasks()
        const modalElement = document.getElementById('complaintModal')
        if (modalElement) {
          const modal = Modal.getInstance(modalElement)
          if (modal) {
            modal.hide()
          }
        }
      } catch (error) {
        console.error('Failed to submit complaint:', error)
        toast.error('Failed to submit complaint')
      } finally {
        isLoading.value = false
      }
    }

    const confirmTask = async (task) => {
      try {
        isLoading.value = true
        await taskService.confirmTask(task.id)
        toast.success('Task confirmed successfully')
        loadTasks()
      } catch (error) {
        console.error('Failed to confirm task:', error)
        toast.error('Failed to confirm task')
      } finally {
        isLoading.value = false
      }
    }

    const getStatusBadgeClass = (status) => {
      const statusMap = {
        'pending': 'bg-warning',
        'accepted': 'bg-info',
        'completed': 'bg-success',
        'pending_confirmation': 'bg-warning',
        'confirmed': 'bg-success',
        'expired': 'bg-secondary',
        'overdue': 'bg-danger'
      }
      return `badge ${statusMap[status] || 'bg-secondary'}`
    }

    const getStatusDisplay = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'accepted': 'In Progress',
        'completed': 'Completed',
        'pending_confirmation': 'Pending Confirmation',
        'confirmed': 'Confirmed',
        'expired': 'Expired',
        'overdue': 'Overdue'
      }
      return statusMap[status] || status
    }

    const getRatingText = (rating) => {
      const texts = [
        'Select a rating',
        'Poor',
        'Fair',
        'Good',
        'Very Good',
        'Excellent'
      ]
      return texts[rating] || texts[0]
    }

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
    }

    onMounted(() => {
      console.log('ElderlyDashboard mounted')
      if (initCurrentUser()) {
        loadTasks()
      }
    })

    return {
      currentUser,
      myTasks,
      isLoading,
      newTask,
      selectedTask,
      rating,
      review,
      complaint,
      minDeadline,
      maxDeadline,
      myTasksColumns,
      myTasksSearchableColumns,
      myTasksFilterColumns,
      handleLogout,
      showNewTaskModal,
      submitNewTask,
      showRatingModal,
      submitRating,
      showComplaintModal,
      submitComplaint,
      confirmTask,
      getStatusBadgeClass,
      getStatusDisplay,
      getRatingText,
      formatDateTime
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
  background: #0d6efd;
  padding: 0.75rem 0;
  color: white;
  flex-shrink: 0;
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.navbar .container-fluid {
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
  padding: 0; /* Override bootstrap padding */
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
  /* Removed flex: 1 to allow natural height */
}

.welcome-banner {
  background: #0d6efd;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
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

.welcome-banner .btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.welcome-banner .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
  color: #333;
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

  .dashboard-content {
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