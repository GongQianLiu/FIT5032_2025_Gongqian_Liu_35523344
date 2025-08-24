<template>
  <div class="ai-assistant-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <div class="d-flex align-items-center">
          <router-link :to="getHomeRoute()" class="btn btn-outline-light me-3">
            <i class="bi bi-arrow-left"></i>
            Back to Home
          </router-link>
          <div class="navbar-brand">
            <i class="bi bi-robot"></i>
            AI Assistant
          </div>
        </div>
        <div class="d-flex">
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
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <AIAssistant />
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
import AIAssistant from '../components/AIAssistant.vue'

export default {
  name: 'AIAssistantPage',
  components: {
    AIAssistant
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)

    const initCurrentUser = () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) {
          toast.error('Please login first')
          router.push('/login')
          return false
        }
        const user = JSON.parse(userStr)
        if (!user || !user.id) {
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

    const getHomeRoute = () => {
      if (!currentUser.value) return '/login'
      
      switch (currentUser.value.role) {
        case 'elderly':
          return '/elderly-home'
        case 'volunteer':
          return '/volunteer-home'
        case 'admin':
          return '/admin-home'
        default:
          return '/login'
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    onMounted(() => {
      initCurrentUser()
    })

    return {
      currentUser,
      getHomeRoute,
      handleLogout
    }
  }
}
</script>

<style scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-brand {
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0;
}

.main-content {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
}
</style>
