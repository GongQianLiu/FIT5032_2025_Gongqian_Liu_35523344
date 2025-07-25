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
                <i class="bi bi-calendar-event me-1"></i>Schedule
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
                  <i class="bi bi-calendar2-check"></i>
                </div>
                <h4 class="card-title mb-0">My Services</h4>
              </div>
              <p class="card-text text-muted fs-5">Manage your service schedule and arrangements</p>
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
                  <i class="bi bi-person-plus"></i>
                </div>
                <h4 class="card-title mb-0">Service Requests</h4>
              </div>
              <p class="card-text text-muted fs-5">View service requests from seniors</p>
              <button class="btn btn-outline-success btn-lg">
                <i class="bi bi-arrow-right me-1"></i>Process Requests
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="feature-icon bg-info bg-gradient text-white rounded-3 me-3">
                  <i class="bi bi-graph-up"></i>
                </div>
                <h4 class="card-title mb-0">Service Statistics</h4>
              </div>
              <p class="card-text text-muted fs-5">View your service hours and ratings</p>
              <button class="btn btn-outline-info btn-lg">
                <i class="bi bi-arrow-right me-1"></i>View Stats
              </button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 p-4">
              <h4 class="mb-0">Pending Service Requests</h4>
            </div>
            <div class="card-body p-0">
              <div class="service-request d-flex align-items-center p-4 border-bottom">
                <div class="request-icon bg-light rounded-circle me-3">
                  <i class="bi bi-person text-primary fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="mb-1">Mrs. Smith - Medical Appointment</h5>
                  <p class="text-muted fs-5 mb-0">Time: Tomorrow 9:00 AM</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary btn-lg">Accept</button>
                  <button class="btn btn-outline-danger btn-lg">Decline</button>
                </div>
              </div>
              <div class="service-request d-flex align-items-center p-4">
                <div class="request-icon bg-light rounded-circle me-3">
                  <i class="bi bi-person text-primary fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="mb-1">Mr. Johnson - Home Visit</h5>
                  <p class="text-muted fs-5 mb-0">Time: Saturday 2:00 PM</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary btn-lg">Accept</button>
                  <button class="btn btn-outline-danger btn-lg">Decline</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 p-4">
              <h4 class="mb-0">Service Hours</h4>
            </div>
            <div class="card-body p-4">
              <div class="stats-item d-flex align-items-center mb-4">
                <div class="stats-icon bg-primary text-white rounded-circle me-3">
                  <i class="bi bi-clock-history fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">This Month</h5>
                  <p class="text-primary fw-bold mb-0 fs-4">24 Hours</p>
                </div>
              </div>
              <div class="stats-item d-flex align-items-center">
                <div class="stats-icon bg-success text-white rounded-circle me-3">
                  <i class="bi bi-star fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1">Service Rating</h5>
                  <p class="text-success fw-bold mb-0 fs-4">4.8/5.0</p>
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
  name: 'VolunteerDashboard',
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

.request-icon, .stats-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-request {
  transition: background-color 0.2s;
}

.service-request:hover {
  background-color: #f8f9fa;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover,
.btn-outline-success:hover,
.btn-outline-info:hover {
  transform: translateX(5px);
}

.btn-outline-primary,
.btn-outline-danger {
  min-width: 120px;
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

.stats-item {
  padding: 1rem;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.stats-item:hover {
  background-color: #f8f9fa;
}

@media (min-width: 992px) {
  .navbar-brand {
    font-size: 1.5rem;
  }
}
</style> 