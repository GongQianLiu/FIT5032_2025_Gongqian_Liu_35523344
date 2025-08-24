<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/volunteer-home" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way - Volunteer Portal
        </router-link>
        <div class="d-flex">
          <router-link to="/volunteer-home" class="btn btn-outline-light me-3">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/volunteer-dashboard" class="btn btn-outline-light me-3">
            <i class="bi bi-speedometer2"></i>
            Dashboard
          </router-link>
          <router-link to="/service-map" class="btn btn-outline-light me-3">
            <i class="bi bi-map"></i>
            Service Map
          </router-link>
          <router-link to="/calendar" class="btn btn-outline-light me-3">
            <i class="bi bi-calendar3"></i>
            Calendar & Appointments
          </router-link>
          <router-link to="/volunteer-email" class="btn btn-outline-light me-3">
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
      <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold text-success mb-4">
                Welcome, Volunteer!
              </h1>
              <p class="lead mb-4">
                Thank you for being part of our caring community. Your dedication to helping elderly individuals 
                makes a real difference in their lives.
              </p>
              <p class="text-muted mb-4">
                Browse available tasks, manage your commitments, and continue making a positive impact 
                in our community through your volunteer work.
              </p>
              <div class="welcome-stats">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-success">{{ stats.completedTasks }}</h3>
                      <p>Tasks Completed</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-warning">{{ stats.averageRating }}/5</h3>
                      <p>Your Rating</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-info">{{ stats.availableTasks }}</h3>
                      <p>Available Tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="welcome-image">
                <img src="/src/assets/images/5O0Y6Rd3Y3.jpg" alt="Volunteer Care" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <h2 class="text-center mb-5">How can you help today?</h2>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/volunteer-dashboard')">
                <div class="card-icon">
                  <i class="bi bi-list-task"></i>
                </div>
                <h4>Browse Tasks</h4>
                <p>View and accept available help requests from elderly community members.</p>
                <div class="card-footer">
                  <span class="btn btn-success">View Tasks</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/volunteer-dashboard')">
                <div class="card-icon">
                  <i class="bi bi-check-circle"></i>
                </div>
                <h4>Manage Tasks</h4>
                <p>Track your accepted tasks, update progress, and mark completed tasks.</p>
                <div class="card-footer">
                  <span class="btn btn-success">Manage</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/email-management')">
                <div class="card-icon">
                  <i class="bi bi-envelope"></i>
                </div>
                <h4>Communicate</h4>
                <p>Send emails to elderly members or administrators for better coordination.</p>
                <div class="card-footer">
                  <span class="btn btn-success">Send Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Categories -->
        <div class="categories-section">
          <h2 class="text-center mb-5">Types of Help You Can Provide</h2>
          <div class="row">
            <div class="col-md-3 mb-4">
              <div class="category-card">
                <div class="category-icon">
                  <i class="bi bi-cart"></i>
                </div>
                <h5>Shopping</h5>
                <p>Help with grocery shopping and errands</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="category-card">
                <div class="category-icon">
                  <i class="bi bi-house"></i>
                </div>
                <h5>Housework</h5>
                <p>Assist with cleaning and household tasks</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="category-card">
                <div class="category-icon">
                  <i class="bi bi-truck"></i>
                </div>
                <h5>Delivery</h5>
                <p>Pick up and deliver items or medications</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="category-card">
                <div class="category-icon">
                  <i class="bi bi-people"></i>
                </div>
                <h5>Companionship</h5>
                <p>Provide social interaction and emotional support</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact Section -->
        <div class="impact-section">
          <h2 class="text-center mb-5">Your Impact Matters</h2>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="impact-card text-center">
                <div class="impact-icon">
                  <i class="bi bi-heart"></i>
                </div>
                <h5>Emotional Support</h5>
                <p>Your presence and care provide comfort and reduce loneliness for elderly individuals.</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="impact-card text-center">
                <div class="impact-icon">
                  <i class="bi bi-shield-check"></i>
                </div>
                <h5>Safety & Security</h5>
                <p>Help ensure elderly individuals can live safely and independently in their homes.</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="impact-card text-center">
                <div class="impact-icon">
                  <i class="bi bi-community"></i>
                </div>
                <h5>Community Building</h5>
                <p>Strengthen community bonds and create a more caring, supportive society.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Guidelines -->
        <div class="guidelines-section">
          <h2 class="text-center mb-5">Volunteer Guidelines</h2>
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="guideline-card">
                <div class="guideline-icon">
                  <i class="bi bi-clock"></i>
                </div>
                <div class="guideline-content">
                  <h5>Be Punctual</h5>
                  <p>Arrive on time for scheduled tasks and communicate any delays promptly.</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="guideline-card">
                <div class="guideline-icon">
                  <i class="bi bi-chat"></i>
                </div>
                <div class="guideline-content">
                  <h5>Communicate Clearly</h5>
                  <p>Keep elderly members informed about task progress and any issues.</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="guideline-card">
                <div class="guideline-icon">
                  <i class="bi bi-shield"></i>
                </div>
                <div class="guideline-content">
                  <h5>Respect Privacy</h5>
                  <p>Maintain confidentiality and respect the privacy of elderly members.</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="guideline-card">
                <div class="guideline-icon">
                  <i class="bi bi-star"></i>
                </div>
                <div class="guideline-content">
                  <h5>Quality Service</h5>
                  <p>Provide the best possible assistance and care in all your interactions.</p>
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
  name: 'VolunteerHome',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)

    const stats = ref({
      completedTasks: 0,
      averageRating: 0,
      availableTasks: 0
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

    const navigateTo = (path) => {
      router.push(path)
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    // Load volunteer statistics from Firebase
    const loadStats = async () => {
      if (!currentUser.value) return

      try {
        // Load tasks data
        const tasksSnapshot = await getDocs(collection(db, 'tasks'))
        const allTasks = []
        tasksSnapshot.forEach((doc) => {
          allTasks.push({ id: doc.id, ...doc.data() })
        })

        // Count completed tasks by this volunteer
        const completedTasks = allTasks.filter(t =>
          t.status === 'completed' && t.volunteerId === currentUser.value.id
        ).length

        // Calculate average rating for this volunteer
        const ratedTasks = allTasks.filter(t =>
          t.volunteerId === currentUser.value.id && t.rating && t.rating.rating
        )
        const averageRating = ratedTasks.length > 0
          ? (ratedTasks.reduce((sum, t) => sum + t.rating.rating, 0) / ratedTasks.length).toFixed(1)
          : 0

        // Count available tasks (open tasks)
        const availableTasks = allTasks.filter(t => t.status === 'open').length

        stats.value = {
          completedTasks,
          averageRating,
          availableTasks
        }

      } catch (error) {
        console.error('Failed to load volunteer statistics:', error)
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
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
  color: #198754;
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

.categories-section {
  margin-bottom: 4rem;
}

.category-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.category-icon {
  font-size: 2.5rem;
  color: #198754;
  margin-bottom: 1rem;
}

.category-card h5 {
  color: #333;
  margin-bottom: 1rem;
}

.category-card p {
  color: #6c757d;
  margin: 0;
}

.impact-section {
  margin-bottom: 4rem;
}

.impact-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  height: 100%;
}

.impact-icon {
  font-size: 2.5rem;
  color: #198754;
  margin-bottom: 1rem;
}

.impact-card h5 {
  color: #333;
  margin-bottom: 1rem;
}

.impact-card p {
  color: #6c757d;
  margin: 0;
}

.guidelines-section {
  margin-bottom: 2rem;
}

.guideline-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  height: 100%;
}

.guideline-icon {
  font-size: 2rem;
  color: #198754;
  margin-right: 1rem;
}

.guideline-content h5 {
  margin-bottom: 0.5rem;
  color: #333;
}

.guideline-content p {
  color: #6c757d;
  margin: 0;
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
