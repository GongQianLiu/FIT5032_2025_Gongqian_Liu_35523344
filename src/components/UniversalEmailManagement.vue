<template>
  <div class="universal-email-management">
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
              <router-link class="nav-link" :to="getDashboardRoute()">
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

    <!-- Main Content -->
    <div class="main-content">
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
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('inbox')">
            <div class="card-body text-center">
              <i class="bi bi-inbox display-4 text-info mb-3"></i>
              <h5>Inbox</h5>
              <p class="text-muted">Received emails</p>
              <span class="badge bg-danger" v-if="unreadCount > 0">{{ unreadCount }}</span>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('compose')">
            <div class="card-body text-center">
              <i class="bi bi-pencil-square display-4 text-primary mb-3"></i>
              <h5>Compose</h5>
              <p class="text-muted">Send email</p>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('templates')">
            <div class="card-body text-center">
              <i class="bi bi-file-earmark-text display-4 text-success mb-3"></i>
              <h5>Templates</h5>
              <p class="text-muted">Email templates</p>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('sent')">
            <div class="card-body text-center">
              <i class="bi bi-send display-4 text-warning mb-3"></i>
              <h5>Sent</h5>
              <p class="text-muted">Sent emails</p>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('history')">
            <div class="card-body text-center">
              <i class="bi bi-clock-history display-4 text-secondary mb-3"></i>
              <h5>History</h5>
              <p class="text-muted">Email logs</p>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div class="card action-card h-100" @click="setActiveTab('settings')">
            <div class="card-body text-center">
              <i class="bi bi-gear display-4 text-dark mb-3"></i>
              <h5>Settings</h5>
              <p class="text-muted">Email settings</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Card -->
      <div class="card">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'inbox' }"
                @click="setActiveTab('inbox')"
              >
                <i class="bi bi-inbox me-2"></i>
                Inbox
                <span class="badge bg-danger ms-1" v-if="unreadCount > 0">{{ unreadCount }}</span>
              </button>
            </li>
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
                :class="{ active: activeTab === 'sent' }"
                @click="setActiveTab('sent')"
              >
                <i class="bi bi-send me-2"></i>
                Sent
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
          <!-- Inbox Tab -->
          <div v-if="activeTab === 'inbox'" class="tab-content">
            <div class="p-4">
              <UserInbox v-if="currentUser?.id" :user-id="currentUser.id" @compose="setActiveTab('compose')" @reply="handleReply" />
              <div v-else class="text-center py-4">
                <i class="bi bi-person-x display-1 text-muted"></i>
                <p class="text-muted mt-2">Please login to view your inbox</p>
              </div>
            </div>
          </div>

          <!-- Compose Tab -->
          <div v-else-if="activeTab === 'compose'" class="tab-content">
            <div class="p-4">
              <!-- Email Type Selection -->
              <div class="row mb-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title mb-3">
                        <i class="bi bi-envelope-plus me-2"></i>
                        Choose Email Type
                      </h5>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <div
                            class="email-type-card"
                            :class="{ active: emailType === 'internal' }"
                            @click="setEmailType('internal')"
                          >
                            <div class="text-center p-3">
                              <i class="bi bi-people display-4 text-info mb-2"></i>
                              <h6>Internal Message</h6>
                              <p class="text-muted mb-0">Send to other users in the system</p>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 mb-3">
                          <div
                            class="email-type-card"
                            :class="{ active: emailType === 'external' }"
                            @click="setEmailType('external')"
                          >
                            <div class="text-center p-3">
                              <i class="bi bi-envelope display-4 text-primary mb-2"></i>
                              <h6>External Email</h6>
                              <p class="text-muted mb-0">Send to external email addresses</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email Composer -->
              <div v-if="currentUser?.id">
                <div v-if="emailType === 'internal'">
                  <InternalEmailComposer
                    :user-id="currentUser.id"
                    :reply-data="replyData"
                    @message-sent="handleEmailSent"
                    @cancel="setActiveTab('inbox')"
                  />
                </div>
                <div v-else-if="emailType === 'external'">
                  <UserEmailComposer
                    :user-id="currentUser.id"
                    :reply-data="replyData"
                    @email-sent="handleEmailSent"
                    @cancel="setActiveTab('inbox')"
                  />
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="bi bi-person-x display-1 text-muted"></i>
                <p class="text-muted mt-2">Please login to compose emails</p>
              </div>
            </div>
          </div>

          <!-- Templates Tab -->
          <div v-else-if="activeTab === 'templates'" class="tab-content">
            <div class="p-4">
              <EmailTemplates @use-template="handleUseTemplate" />
            </div>
          </div>

          <!-- Sent Tab -->
          <div v-else-if="activeTab === 'sent'" class="tab-content">
            <div class="p-4">
              <UserSentEmails :user-id="currentUser?.id" />
            </div>
          </div>

          <!-- History Tab -->
          <div v-else-if="activeTab === 'history'" class="tab-content">
            <div class="p-4">
              <UserEmailHistory :user-id="currentUser?.id" />
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

    <!-- Emergency backdrop cleanup button (hidden, for debugging) -->
    <button
      v-if="false"
      @click="cleanupBackdrops"
      class="btn btn-danger position-fixed"
      style="top: 10px; right: 10px; z-index: 9999;"
      title="Clean up modal backdrops"
    >
      🧹 Clean
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import EmailComposer from './EmailComposer.vue';
import EmailTemplates from './EmailTemplates.vue';
import EmailHistory from './EmailHistory.vue';
import EmailSettings from './EmailSettings.vue';
import UserInbox from './UserInbox.vue';
import UserEmailComposer from './UserEmailComposer.vue';
import UserSentEmails from './UserSentEmails.vue';
import UserEmailHistory from './UserEmailHistory.vue';
import InternalEmailComposer from './InternalEmailComposer.vue';
import { emailLogService } from '../services/emailLogService';

export default {
  name: 'UniversalEmailManagement',
  components: {
    EmailComposer,
    EmailTemplates,
    EmailHistory,
    EmailSettings,
    UserInbox,
    UserEmailComposer,
    UserSentEmails,
    UserEmailHistory,
    InternalEmailComposer
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const activeTab = ref('inbox');
    const currentUser = ref(null);
    const emailStats = ref({ total: 0, successful: 0, failed: 0 });
    const templateCount = ref(0);
    const unreadCount = ref(0);
    const replyData = ref(null);
    const emailType = ref('internal'); // 'internal' or 'external'

    // Load user info
    const loadUserInfo = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          currentUser.value = JSON.parse(savedUser);
          console.log('📧 Current user loaded:', currentUser.value);
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast.error('Failed to load user information');
        }
      } else {
        console.warn('📧 No current user found in localStorage');
        toast.error('Please login first');
      }
    };

    // Get dashboard route based on user role
    const getDashboardRoute = () => {
      const role = currentUser.value?.role;
      switch (role) {
        case 'admin':
          return '/admin-dashboard';
        case 'elderly':
          return '/elderly-dashboard';
        case 'volunteer':
          return '/volunteer-dashboard';
        default:
          return '/';
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

    // Set email type
    const setEmailType = (type) => {
      emailType.value = type;
      console.log(`📧 Email type set to: ${type}`);
    };

    // Handle email sent
    const handleEmailSent = (emailData) => {
      console.log('📧 Email sent:', emailData);
      toast.success(`Email sent to ${emailData.to}`);
      // Refresh stats
      loadEmailStats();
      loadTemplateCount();
    };

    // Handle template usage
    const handleUseTemplate = (template) => {
      console.log('📧 Using template:', template.name);
      setActiveTab('compose');
      toast.success(`Template "${template.name}" applied`);
    };

    // Handle reply
    const handleReply = (messageData) => {
      replyData.value = messageData;
      setActiveTab('compose');
      toast.info('Replying to message');
    };

    // Load unread count
    const loadUnreadCount = async () => {
      if (currentUser.value?.id) {
        try {
          // This would be implemented with your internal mail service
          // For now, set a mock value
          unreadCount.value = 3;
        } catch (error) {
          console.error('Error loading unread count:', error);
        }
      }
    };

    // Handle logout
    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Emergency cleanup function for modal backdrops
    const cleanupBackdrops = () => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      console.log('🧹 Emergency backdrop cleanup performed');
    };

    // Initialize
    onMounted(() => {
      loadUserInfo();
      loadEmailStats();
      loadTemplateCount();
      loadUnreadCount();
    });

    return {
      activeTab,
      currentUser,
      emailStats,
      templateCount,
      unreadCount,
      replyData,
      emailType,
      getDashboardRoute,
      setActiveTab,
      setEmailType,
      handleEmailSent,
      handleUseTemplate,
      handleReply,
      handleLogout,
      cleanupBackdrops
    };
  }
};
</script>

<style scoped>
/* Import the same beautiful styles from EmailManagementSimple */
.universal-email-management {
  max-width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

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

.main-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin: 2rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

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

.tab-content {
  min-height: 600px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 0 0 20px 20px;
}

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

/* Email Type Selection */
.email-type-card {
  border: 2px solid #e9ecef;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.email-type-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.email-type-card.active {
  border-color: #007bff;
  background: linear-gradient(145deg, #f8f9ff 0%, #e3f2fd 100%);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.email-type-card.active i {
  color: #007bff !important;
}

.email-type-card.active h6 {
  color: #007bff;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content {
    margin: 1rem;
    padding: 1rem;
    border-radius: 15px;
  }

  .nav-tabs .nav-link {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }

  .tab-content {
    min-height: 400px;
  }

  .email-type-card {
    margin-bottom: 1rem;
  }
}
</style>
