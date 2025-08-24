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
          <router-link to="/elderly-dashboard" class="btn btn-outline-light me-3">
            My Tasks
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
        <div class="card">
          <div class="card-header">
            <h2 class="mb-0">Rate Your Volunteers</h2>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Task</th>
                    <th>Completed Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="completedTasks.length === 0">
                    <td colspan="4" class="text-center py-5">
                      <div class="empty-state">
                        <i class="bi bi-clipboard-check fs-1 text-muted mb-3"></i>
                        <p class="text-muted">No completed tasks to rate</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="task in completedTasks" :key="task.id">
                    <td>{{ task.volunteerName }}</td>
                    <td>{{ task.title }}</td>
                    <td>{{ formatDateTime(task.completedAt) }}</td>
                    <td>
                      <button 
                        v-if="!task.rating"
                        class="btn btn-primary btn-sm"
                        @click="showRatingModal(task)"
                      >
                        <i class="bi bi-star"></i>
                        Rate Now
                      </button>
                      <span v-else class="rating-display">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="bi"
                          :class="star <= task.rating ? 'bi-star-fill text-warning' : 'bi-star'"
                        ></i>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div class="modal fade" id="ratingModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate Volunteer's Service</h5>
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
                    :class="star <= rating ? 'bi-star-fill text-warning' : 'bi-star'"
                    @click="rating = star"
                  ></i>
                </div>
                <div class="rating-text mt-2">{{ getRatingText(rating) }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Review (Optional)</label>
                <textarea
                  class="form-control"
                  v-model="review"
                  rows="3"
                  placeholder="Share your experience with this volunteer..."
                  oninvalid="this.setCustomValidity('Please share your experience')"
                  oninput="this.setCustomValidity('')"
                ></textarea>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="isLoading || !rating">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Submitting...' : 'Submit Rating' }}
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import taskService from '../services/taskService'
import { Modal } from 'bootstrap'

export default {
  name: 'RateVolunteers',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const completedTasks = ref([])
    const selectedTask = ref(null)
    const rating = ref(0)
    const review = ref('')
    const isLoading = ref(false)

    const loadCompletedTasks = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) {
          toast.error('Please login first')
          router.push('/login')
          return
        }

        const user = JSON.parse(userStr)
        if (!user || !user.id || user.role !== 'elderly') {
          toast.error('Invalid user information')
          router.push('/login')
          return
        }

        const tasks = await taskService.getTasksByUser(user.id, 'elderly')
        // 过滤出已完成的任务
        let completedTasks = tasks.filter(task => task.status === 'completed')
        
        // 如果没有已完成的任务，创建一些测试数据
        if (completedTasks.length === 0) {
          console.log('No completed tasks found, creating test completed tasks...')
          const testCompletedTasks = [
            {
              title: 'Grocery Shopping',
              type: 'shopping',
              description: 'Weekly grocery shopping completed',
              deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              location: 'Melbourne CBD',
              priority: 'medium',
              volunteerId: 'test-volunteer-1',
              volunteerName: 'John Smith',
              completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              status: 'completed'
            },
            {
              title: 'House Cleaning',
              type: 'housework',
              description: 'House cleaning service completed',
              deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              location: 'Melbourne CBD',
              priority: 'low',
              volunteerId: 'test-volunteer-2',
              volunteerName: 'Sarah Johnson',
              completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
              status: 'completed'
            }
          ]
          
          for (const taskData of testCompletedTasks) {
            try {
              await taskService.createTask({
                ...taskData,
                elderlyId: user.id,
                elderlyName: user.username
              })
            } catch (error) {
              console.error('Error creating test completed task:', error)
            }
          }
          
          // 重新加载任务
          const newTasks = await taskService.getTasksByUser(user.id, 'elderly')
          completedTasks = newTasks.filter(task => task.status === 'completed')
        }
        
        completedTasks.value = completedTasks
      } catch (error) {
        console.error('Failed to load tasks:', error)
        toast.error('Failed to load completed tasks')
      }
    }

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
      if (!rating.value) {
        toast.error('Please select a rating')
        return
      }

      try {
        isLoading.value = true
        await taskService.updateTask(selectedTask.value.id, {
          rating: rating.value,
          review: review.value
        })
        toast.success('Rating submitted successfully')
        const modalElement = document.getElementById('ratingModal')
        if (modalElement) {
          const modal = Modal.getInstance(modalElement)
          if (modal) {
            modal.hide()
          }
        }
        loadCompletedTasks()
      } catch (error) {
        console.error('Failed to submit rating:', error)
        toast.error('Failed to submit rating')
      } finally {
        isLoading.value = false
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
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
      loadCompletedTasks()
    })

    return {
      completedTasks,
      rating,
      review,
      isLoading,
      showRatingModal,
      submitRating,
      handleLogout,
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
  color: white;
  flex-shrink: 0;
  padding: 0.75rem 0;
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

.container-fluid {
  height: 100%;
  padding: 0;
}

.card {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 100%;
}

.card-header {
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #eee;
}

.card-body {
  padding: 0 2rem;
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

.rating-display {
  color: #ffc107;
  font-size: 1.1rem;
  display: flex;
  gap: 0.25rem;
}

.stars {
  font-size: 2rem;
  letter-spacing: 0.5rem;
  cursor: pointer;
  color: #ffc107;
}

.stars i {
  transition: transform 0.2s ease;
}

.stars i:hover {
  transform: scale(1.2);
}

.rating-text {
  font-size: 1rem;
  color: #666;
}

.modal-content {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.modal-header {
  border-bottom: 1px solid #eee;
  padding: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .navbar-content {
    padding: 0.75rem 0;
  }

  .main-container {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .stars {
    font-size: 1.5rem;
  }
}
</style> 