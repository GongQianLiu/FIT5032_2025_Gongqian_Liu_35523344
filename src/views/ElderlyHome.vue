<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/elderly-home" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way - Elderly Portal
        </router-link>
        <div class="d-flex">
          <button class="btn btn-outline-light me-3" @click="showNewTaskModal">
            <i class="bi bi-plus-circle"></i>
            Request Help
          </button>
          <router-link to="/elderly-dashboard" class="btn btn-outline-light me-3">
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
      <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold text-primary mb-4">
                Welcome to Evergreen Way
              </h1>
              <p class="lead mb-4">
                Your trusted platform for connecting with caring volunteers who are ready to help with your daily needs.
              </p>
              <p class="text-muted mb-4">
                Whether you need assistance with shopping, housework, companionship, or other daily tasks, 
                our community of dedicated volunteers is here to support you.
              </p>
              <div class="welcome-stats">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-primary">{{ stats.totalVolunteers }}</h3>
                      <p>Active Volunteers</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-success">{{ stats.completedTasks }}</h3>
                      <p>Tasks Completed</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="text-warning">{{ stats.averageRating }}/5</h3>
                      <p>Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="welcome-image">
                <img src="/src/assets/images/5O0Y6Rd3Y3.jpg" alt="Elderly Care" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <h2 class="text-center mb-5">What would you like to do today?</h2>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/elderly-dashboard')">
                <div class="card-icon">
                  <i class="bi bi-list-task"></i>
                </div>
                <h4>Request Help</h4>
                <p>Create new help requests for daily tasks like shopping, housework, or companionship.</p>
                <div class="card-footer">
                  <span class="btn btn-primary">Get Started</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/calendar')">
                <div class="card-icon">
                  <i class="bi bi-calendar3"></i>
                </div>
                <h4>Book Appointments</h4>
                <p>Schedule health checkups, rehabilitation sessions, and other wellness appointments.</p>
                <div class="card-footer">
                  <span class="btn btn-primary">Book Now</span>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="action-card" @click="navigateTo('/rate-volunteers')">
                <div class="card-icon">
                  <i class="bi bi-star-fill"></i>
                </div>
                <h4>Rate Volunteers</h4>
                <p>Share your experience and rate the volunteers who have helped you.</p>
                <div class="card-footer">
                  <span class="btn btn-primary">Rate Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Services -->
        <div class="services-section">
          <h2 class="text-center mb-5">Additional Services</h2>
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="service-card" @click="navigateTo('/service-map')">
                <div class="service-icon">
                  <i class="bi bi-map"></i>
                </div>
                <div class="service-content">
                  <h5>Service Map</h5>
                  <p>Find nearby services and facilities in your area.</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="service-card" @click="navigateTo('/elderly-email')">
                <div class="service-icon">
                  <i class="bi bi-envelope"></i>
                </div>
                <div class="service-content">
                  <h5>Send Email</h5>
                  <p>Contact volunteers or administrators directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Overview -->
        <div class="features-section">
          <h2 class="text-center mb-5">Why Choose Evergreen Way?</h2>
          <div class="row">
            <div class="col-md-3 mb-4">
              <div class="feature-item text-center">
                <div class="feature-icon">
                  <i class="bi bi-shield-check"></i>
                </div>
                <h5>Safe & Secure</h5>
                <p>All volunteers are verified and background-checked for your safety.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="feature-item text-center">
                <div class="feature-icon">
                  <i class="bi bi-clock"></i>
                </div>
                <h5>24/7 Support</h5>
                <p>Get help whenever you need it, with flexible scheduling options.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="feature-item text-center">
                <div class="feature-icon">
                  <i class="bi bi-heart"></i>
                </div>
                <h5>Caring Community</h5>
                <p>Connect with compassionate volunteers who genuinely care about your well-being.</p>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="feature-item text-center">
                <div class="feature-icon">
                  <i class="bi bi-phone"></i>
                </div>
                <h5>Easy to Use</h5>
                <p>Simple and intuitive interface designed specifically for elderly users.</p>
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

export default {
  name: 'ElderlyHome',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)
    
    const stats = ref({
      totalVolunteers: 45,
      completedTasks: 128,
      averageRating: 4.8
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

    const navigateTo = (path) => {
      router.push(path)
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    const showNewTaskModal = () => {
      // Navigate to dashboard where the task creation modal is available
      router.push('/elderly-dashboard')
      // Show a toast to guide the user
      toast.info('Click "Request Help" on the dashboard to create a new task')
    }

    onMounted(() => {
      initCurrentUser()
    })

    return {
      currentUser,
      stats,
      navigateTo,
      handleLogout,
      showNewTaskModal
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
  background: #0d6efd;
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
  color: #0d6efd;
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
  color: #0d6efd;
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

.features-section {
  margin-bottom: 2rem;
}

.feature-item {
  padding: 1.5rem;
}

.feature-icon {
  font-size: 2.5rem;
  color: #0d6efd;
  margin-bottom: 1rem;
}

.feature-item h5 {
  color: #333;
  margin-bottom: 1rem;
}

.feature-item p {
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
