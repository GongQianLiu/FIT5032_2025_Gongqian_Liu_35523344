<template>
  <div class="page-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/elderly-home" class="navbar-brand">
          <i class="bi bi-house-heart-fill"></i>
          Evergreen Way - Elderly Portal
        </router-link>
        <div class="d-flex">
          <router-link to="/elderly-home" class="btn btn-outline-light me-3">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/elderly-dashboard" class="btn btn-outline-light me-3">
            <i class="bi bi-speedometer2"></i>
            Dashboard
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
        <div class="row">
          <div class="col-12">
            <div class="page-header">
              <h1 class="page-title">
                <i class="bi bi-envelope"></i>
                Email Management
              </h1>
              <p class="page-description">Send and manage your emails</p>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Email Navigation -->
          <div class="col-md-3">
            <div class="card">
              <div class="card-body">
                <div class="email-nav">
                  <button 
                    class="nav-btn" 
                    :class="{ active: activeTab === 'compose' }"
                    @click="activeTab = 'compose'"
                  >
                    <i class="bi bi-pencil-square"></i>
                    Compose Email
                  </button>
                  <button 
                    class="nav-btn" 
                    :class="{ active: activeTab === 'inbox' }"
                    @click="activeTab = 'inbox'"
                  >
                    <i class="bi bi-inbox"></i>
                    Inbox
                    <span v-if="unreadCount > 0" class="badge bg-danger ms-2">{{ unreadCount }}</span>
                  </button>
                  <button 
                    class="nav-btn" 
                    :class="{ active: activeTab === 'sent' }"
                    @click="activeTab = 'sent'"
                  >
                    <i class="bi bi-send"></i>
                    Sent
                  </button>
                  <button 
                    class="nav-btn" 
                    :class="{ active: activeTab === 'history' }"
                    @click="activeTab = 'history'"
                  >
                    <i class="bi bi-clock-history"></i>
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Content -->
          <div class="col-md-9">
            <div class="card">
              <div class="card-body">
                <!-- Compose Email -->
                <div v-if="activeTab === 'compose'" class="email-compose">
                  <h5 class="mb-3">Compose New Email</h5>
                  <UserEmailComposer
                    v-if="currentUser"
                    :userId="currentUser.id"
                    :currentUser="currentUser"
                    @email-sent="handleEmailSent"
                  />
                </div>

                <!-- Inbox -->
                <div v-if="activeTab === 'inbox'" class="email-inbox">
                  <h5 class="mb-3">Inbox</h5>
                  <UserInbox 
                    v-if="currentUser" 
                    :userId="currentUser.id"
                    @unread-count="updateUnreadCount"
                  />
                </div>

                <!-- Sent -->
                <div v-if="activeTab === 'sent'" class="email-sent">
                  <h5 class="mb-3">Sent Emails</h5>
                  <UserSentEmails 
                    v-if="currentUser" 
                    :userId="currentUser.id"
                  />
                </div>

                <!-- History -->
                <div v-if="activeTab === 'history'" class="email-history">
                  <h5 class="mb-3">Email History</h5>
                  <UserEmailHistory 
                    v-if="currentUser" 
                    :userId="currentUser.id"
                  />
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
import UserEmailComposer from '../components/UserEmailComposer.vue'
import UserInbox from '../components/UserInbox.vue'
import UserSentEmails from '../components/UserSentEmails.vue'
import UserEmailHistory from '../components/UserEmailHistory.vue'

export default {
  name: 'ElderlyEmailManagement',
  components: {
    UserEmailComposer,
    UserInbox,
    UserSentEmails,
    UserEmailHistory
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const currentUser = ref(null)
    const activeTab = ref('compose')
    const unreadCount = ref(0)

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
          toast.error('Access denied')
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

    const handleLogout = () => {
      localStorage.removeItem('currentUser')
      router.push('/login')
    }

    const handleEmailSent = () => {
      toast.success('Email sent successfully!')
      activeTab.value = 'sent'
    }

    const updateUnreadCount = (count) => {
      unreadCount.value = count
    }

    onMounted(() => {
      initCurrentUser()
    })

    return {
      currentUser,
      activeTab,
      unreadCount,
      handleLogout,
      handleEmailSent,
      updateUnreadCount
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
}

.navbar {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar-brand {
  color: white !important;
  font-weight: 600;
  text-decoration: none;
}

.main-content {
  padding: 2rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #6c757d;
  margin: 0;
}

.email-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6c757d;
  text-align: left;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.nav-btn i {
  margin-right: 0.5rem;
}

.card {
  border: none;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  border-radius: 10px;
}

.email-compose,
.email-inbox,
.email-sent,
.email-history {
  min-height: 500px;
}
</style>
