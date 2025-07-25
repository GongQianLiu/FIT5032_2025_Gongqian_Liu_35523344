<template>
  <div class="dashboard-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid px-4">
        <a class="navbar-brand fs-3" href="#">
          <i class="bi bi-heart-fill me-2"></i>
          Evergreen Way
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link active fs-5" href="#">
                <i class="bi bi-house-fill me-1"></i>Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#">
                <i class="bi bi-calendar-event me-1"></i>Activities
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#">
                <i class="bi bi-chat-dots-fill me-1"></i>Messages
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <span class="text-light me-3 fs-5">
              <i class="bi bi-person-circle me-1"></i>
              {{ currentUser?.username }}
            </span>
            <button class="btn btn-outline-light btn-lg" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container-fluid dashboard-content">
      <div class="row g-4 py-4 px-3 px-lg-4">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="feature-icon bg-primary bg-gradient text-white rounded-3 me-3">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <h4 class="card-title mb-0">My Appointments</h4>
              </div>
              <p class="card-text text-muted fs-5">View your service appointments and status</p>
              <button class="btn btn-outline-primary btn-lg">
                <i class="bi bi-arrow-right me-1"></i>View Details
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="feature-icon bg-success bg-gradient text-white rounded-3 me-3">
                  <i class="bi bi-people"></i>
                </div>
                <h4 class="card-title mb-0">Volunteer Services</h4>
              </div>
              <p class="card-text text-muted fs-5">Browse and book volunteer services</p>
              <button class="btn btn-outline-success btn-lg">
                <i class="bi bi-arrow-right me-1"></i>Book Now
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="feature-icon bg-info bg-gradient text-white rounded-3 me-3">
                  <i class="bi bi-chat-square-text"></i>
                </div>
                <h4 class="card-title mb-0">Community</h4>
              </div>
              <p class="card-text text-muted fs-5">Join community discussions and share your stories</p>
              <button class="btn btn-outline-info btn-lg">
                <i class="bi bi-arrow-right me-1"></i>Join Now
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 p-4">
              <h4 class="mb-0">Upcoming Activities</h4>
            </div>
            <div class="card-body p-0">
              <div class="activity-item d-flex align-items-center p-4 border-bottom">
                <div class="activity-icon bg-light rounded-circle me-3">
                  <i class="bi bi-music-note text-primary fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Community Singing</h5>
                  <p class="text-muted mb-0 fs-5">Time: Saturday 10:00 AM</p>
                </div>
              </div>
              <div class="activity-item d-flex align-items-center p-4 border-bottom">
                <div class="activity-icon bg-light rounded-circle me-3">
                  <i class="bi bi-heart text-danger fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Health Talk</h5>
                  <p class="text-muted mb-0 fs-5">Time: Sunday 2:00 PM</p>
                </div>
              </div>
              <div class="activity-item d-flex align-items-center p-4">
                <div class="activity-icon bg-light rounded-circle me-3">
                  <i class="bi bi-tree text-success fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Gardening Therapy</h5>
                  <p class="text-muted mb-0 fs-5">Time: Next Tuesday 9:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 p-4">
              <h4 class="mb-0">Health Reminders</h4>
            </div>
            <div class="card-body p-4">
              <div class="reminder-item d-flex align-items-center mb-4">
                <div class="reminder-icon bg-warning text-white rounded-circle me-3">
                  <i class="bi bi-clock fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Medication Reminder</h5>
                  <p class="text-muted mb-0 fs-5">Today 12:00 PM</p>
                </div>
              </div>
              <div class="reminder-item d-flex align-items-center">
                <div class="reminder-icon bg-info text-white rounded-circle me-3">
                  <i class="bi bi-droplet fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Hydration Reminder</h5>
                  <p class="text-muted mb-0 fs-5">Every 2 hours</p>
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

export default {
  name: 'ElderlyDashboard',
  setup() {
    const router = useRouter()
    const currentUser = ref(null)

    onMounted(() => {
      const userStr = localStorage.getItem('currentUser')
      if (userStr) {
        currentUser.value = JSON.parse(userStr)
      }
    })

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    return {
      currentUser,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-content {
  max-width: 1800px;
  margin: 0 auto;
}

.card {
  transition: transform 0.2s;
  border-radius: 15px;
}

.card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.activity-icon, .reminder-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-item {
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
}

.btn-outline-primary:hover,
.btn-outline-success:hover,
.btn-outline-info:hover {
  transform: translateX(5px);
}

.card-header {
  background-color: transparent;
  border-bottom: 2px solid #f0f0f0;
}

.border-bottom {
  border-color: #f0f0f0 !important;
}

.nav-link {
  padding: 0.8rem 1.2rem;
}

.navbar-brand {
  font-weight: 600;
}

@media (min-width: 992px) {
  .navbar-brand {
    font-size: 1.5rem;
  }
}
</style> 