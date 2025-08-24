<template>
  <div class="email-management-simple">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-house-heart me-2"></i>
          Evergreen Way
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin-dashboard" v-if="currentUser?.role === 'admin'">
                <i class="bi bi-speedometer2 me-1"></i>
                Dashboard
              </router-link>
              <router-link class="nav-link" to="/elderly-dashboard" v-else-if="currentUser?.role === 'elderly'">
                <i class="bi bi-speedometer2 me-1"></i>
                Dashboard
              </router-link>
              <router-link class="nav-link" to="/volunteer-dashboard" v-else-if="currentUser?.role === 'volunteer'">
                <i class="bi bi-speedometer2 me-1"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link active" to="/email-management">
                <i class="bi bi-envelope me-1"></i>
                Email
              </router-link>
            </li>
            <li class="nav-item" v-if="currentUser?.role === 'admin'">
              <router-link class="nav-link" to="/user-management">
                <i class="bi bi-people me-1"></i>
                Users
              </router-link>
            </li>
          </ul>

          <div class="navbar-nav">
            <div class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                {{ currentUser?.displayName || currentUser?.username || 'User' }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-1"></i>
                  Logout
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="bi bi-envelope me-2"></i>
        Email Management Center
      </h2>
      <div class="d-flex gap-2">
        <span class="badge bg-primary">{{ emailStats.total || 0 }} Sent</span>
        <span class="badge bg-success">{{ templateCount || 0 }} Templates</span>
      </div>
    </div>

    <!-- Action Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card action-card h-100" @click="setActiveTab('compose')">
          <div class="card-body text-center">
            <i class="bi bi-pencil-square display-4 text-primary mb-3"></i>
            <h5>Compose Email</h5>
            <p class="text-muted">Create and send new email</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card action-card h-100" @click="setActiveTab('templates')">
          <div class="card-body text-center">
            <i class="bi bi-file-earmark-text display-4 text-info mb-3"></i>
            <h5>Email Templates</h5>
            <p class="text-muted">Use predefined templates</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card action-card h-100" @click="setActiveTab('history')">
          <div class="card-body text-center">
            <i class="bi bi-clock-history display-4 text-success mb-3"></i>
            <h5>Email History</h5>
            <p class="text-muted">View sent emails</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card action-card h-100" @click="setActiveTab('settings')">
          <div class="card-body text-center">
            <i class="bi bi-gear display-4 text-warning mb-3"></i>
            <h5>Settings</h5>
            <p class="text-muted">Configure email settings</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'compose' }"
              @click="setActiveTab('compose')"
            >
              <i class="bi bi-pencil-square me-2"></i>
              Compose
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'templates' }"
              @click="setActiveTab('templates')"
            >
              <i class="bi bi-file-earmark-text me-2"></i>
              Templates
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'history' }"
              @click="setActiveTab('history')"
            >
              <i class="bi bi-clock-history me-2"></i>
              History
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'settings' }"
              @click="setActiveTab('settings')"
            >
              <i class="bi bi-gear me-2"></i>
              Settings
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <!-- Compose Tab -->
        <div v-if="activeTab === 'compose'" class="tab-content">
          <div class="p-4">
            <EmailComposer @email-sent="handleEmailSent" />
          </div>
        </div>

        <!-- Templates Tab -->
        <div v-else-if="activeTab === 'templates'" class="tab-content">
          <div class="p-4">
            <EmailTemplates @use-template="handleUseTemplate" />
          </div>
        </div>

        <!-- History Tab -->
        <div v-else-if="activeTab === 'history'" class="tab-content">
          <div class="p-4">
            <EmailHistory />
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="tab-content">
          <div class="p-4">
            <EmailSettings @view-logs="setActiveTab('history')" />
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import EmailComposer from '../components/EmailComposer.vue';
import EmailTemplates from '../components/EmailTemplates.vue';
import EmailHistory from '../components/EmailHistory.vue';
import EmailSettings from '../components/EmailSettings.vue';
import { emailLogService } from '../services/emailLogService';

export default {
  name: 'EmailManagementSimple',
  components: {
    EmailComposer,
    EmailTemplates,
    EmailHistory,
    EmailSettings
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const activeTab = ref('compose');
    const currentUser = ref(null);
    const emailStats = ref({ total: 0, successful: 0, failed: 0 });
    const templateCount = ref(0);

    // Load user info
    const loadUserInfo = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          currentUser.value = JSON.parse(savedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    // Load email statistics
    const loadEmailStats = async () => {
      try {
        const result = await emailLogService.getEmailStats(30);
        if (result.success) {
          emailStats.value = result.stats;
        }
      } catch (error) {
        console.error('Error loading email stats:', error);
      }
    };

    // Load template count
    const loadTemplateCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'email_templates'));
        templateCount.value = querySnapshot.size;
      } catch (error) {
        console.error('Error loading template count:', error);
      }
    };

    // Set active tab
    const setActiveTab = (tab) => {
      activeTab.value = tab;
      console.log(`📧 Switched to ${tab} tab`);
    };

    // Handle email sent
    const handleEmailSent = (emailData) => {
      console.log('📧 Email sent:', emailData);
      toast.success(`Email sent to ${emailData.to}`);
      // Refresh stats
      loadEmailStats();
    };

    // Handle template usage
    const handleUseTemplate = (template) => {
      console.log('📧 Using template:', template.name);
      setActiveTab('compose');
      toast.success(`Template "${template.name}" applied`);
    };

    // Handle logout
    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Initialize
    onMounted(() => {
      loadUserInfo();
      loadEmailStats();
      loadTemplateCount();
    });

    return {
      activeTab,
      currentUser,
      emailStats,
      templateCount,
      setActiveTab,
      handleEmailSent,
      handleUseTemplate,
      handleLogout
    };
  }
};
</script>

<style scoped>
.email-management-simple {
  max-width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Navigation Bar Styling */
.navbar {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  transform: translateY(-1px);
}

/* Main Content Area */
.email-management-simple > div:not(.navbar) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin: 2rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Header Styling */
h2 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  margin-bottom: 0;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Action Cards */
.action-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.action-card:hover::before {
  opacity: 0.05;
}

.action-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.action-card .card-body {
  position: relative;
  z-index: 2;
  padding: 2rem;
}

.action-card i {
  transition: all 0.3s ease;
}

.action-card:hover i {
  transform: scale(1.1);
  color: #667eea;
}

.action-card h5 {
  font-weight: 600;
  margin-top: 1rem;
  color: #2c3e50;
}

.action-card p {
  color: #6c757d;
  margin-bottom: 0;
}

/* Main Card */
.card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0;
}

/* Tab Navigation */
.nav-tabs {
  border: none;
  background: transparent;
  padding: 1rem 1rem 0 1rem;
}

.nav-tabs .nav-link {
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  padding: 1rem 1.5rem;
  margin-right: 0.5rem;
  border-radius: 15px 15px 0 0;
  transition: all 0.3s ease;
  background: transparent;
}

.nav-tabs .nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-tabs .nav-link.active {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  color: #667eea;
  border: none;
  font-weight: 700;
}

.nav-tabs .nav-link i {
  margin-right: 0.5rem;
}

/* Tab Content */
.tab-content {
  min-height: 600px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 0 0 20px 20px;
}

.card-body {
  padding: 0;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-card {
  animation: fadeInUp 0.6s ease forwards;
}

.action-card:nth-child(1) { animation-delay: 0.1s; }
.action-card:nth-child(2) { animation-delay: 0.2s; }
.action-card:nth-child(3) { animation-delay: 0.3s; }
.action-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive Design */
@media (max-width: 768px) {
  .email-management-simple > div:not(.navbar) {
    margin: 1rem;
    padding: 1rem;
    border-radius: 15px;
  }

  .action-card {
    margin-bottom: 1rem;
  }

  .action-card .card-body {
    padding: 1.5rem;
  }

  .nav-tabs {
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .nav-tabs .nav-link {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.25rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .tab-content {
    min-height: 400px;
  }
}

@media (max-width: 576px) {
  .navbar-brand {
    font-size: 1.25rem;
  }

  .action-card:hover {
    transform: translateY(-5px) scale(1.01);
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .email-management-simple > div:not(.navbar) {
    background: rgba(33, 37, 41, 0.95);
    color: #fff;
  }

  .action-card {
    background: linear-gradient(145deg, #2c3e50 0%, #34495e 100%);
    color: #fff;
  }

  .action-card h5 {
    color: #fff;
  }

  .card {
    background: linear-gradient(145deg, #2c3e50 0%, #34495e 100%);
  }

  .tab-content {
    background: linear-gradient(145deg, #2c3e50 0%, #34495e 100%);
  }
}
</style>
