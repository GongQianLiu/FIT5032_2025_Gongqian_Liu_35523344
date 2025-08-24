<template>
  <div class="page-container">
    <!-- Enhanced Navbar -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link to="/email-management" class="navbar-brand">
          <i class="bi bi-envelope-at me-2"></i>
          <span class="brand-text">Evergreen Way</span>
          <small class="brand-subtitle">Email Management Center</small>
        </router-link>
        
        <div class="d-flex align-items-center gap-2">
          <div class="email-status">
            <span class="badge bg-success">
              <i class="bi bi-check-circle"></i>
              Service Ready
            </span>
          </div>
          <router-link to="/volunteer-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i> Home
          </router-link>
          <router-link to="/admin-dashboard" class="btn btn-outline-light">
            <i class="bi bi-arrow-left"></i> Back
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container-fluid">
        <!-- Enhanced Page Header -->
        <div class="page-header">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="header-content">
                <h1 class="page-title">
                  <i class="bi bi-envelope-paper me-3"></i>
                  Email Management Center
                </h1>
                <p class="page-description">
                  Professional email communication with advanced templates and attachment support
                </p>
              </div>
            </div>
            <div class="col-md-4 text-end">
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ emailStats.sent }}</span>
                  <span class="stat-label">Emails Sent</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ emailStats.templates }}</span>
                  <span class="stat-label">Templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="quick-actions-panel mb-4">
          <div class="row">
            <div class="col-md-3">
              <div class="action-card" @click="focusComposer">
                <div class="action-icon">
                  <i class="bi bi-pencil-square"></i>
                </div>
                <div class="action-content">
                  <h6>Compose Email</h6>
                  <p>Create and send new email</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="showTemplates">
                <div class="action-icon">
                  <i class="bi bi-file-text"></i>
                </div>
                <div class="action-content">
                  <h6>Email Templates</h6>
                  <p>Use predefined templates</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="showHistory">
                <div class="action-icon">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div class="action-content">
                  <h6>Email History</h6>
                  <p>View sent emails</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="showSettings">
                <div class="action-icon">
                  <i class="bi bi-gear"></i>
                </div>
                <div class="action-content">
                  <h6>Settings</h6>
                  <p>Configure email settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Email Interface -->
        <div class="row">
          <div class="col-lg-8">
            <!-- Email Navigation Tabs -->
            <div class="enhanced-card mb-4">
              <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: activeTab === 'inbox' }"
                      @click="setActiveTab('inbox')"
                      type="button"
                    >
                      <i class="bi bi-inbox me-2"></i>
                      Inbox
                      <span v-if="unreadCount > 0" class="badge bg-primary ms-2">{{ unreadCount }}</span>
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: activeTab === 'compose' }"
                      @click="setActiveTab('compose')"
                      type="button"
                    >
                      <i class="bi bi-envelope-plus me-2"></i>
                      Compose
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: activeTab === 'templates' }"
                      @click="setActiveTab('templates')"
                      type="button"
                    >
                      <i class="bi bi-file-earmark-text me-2"></i>
                      Templates
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: activeTab === 'history' }"
                      @click="setActiveTab('history')"
                      type="button"
                    >
                      <i class="bi bi-clock-history me-2"></i>
                      History
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: activeTab === 'settings' }"
                      @click="setActiveTab('settings')"
                      type="button"
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
                  <MailInbox
                    @compose="setActiveTab('compose')"
                    @reply="handleReply"
                  />
                </div>

                <!-- Compose Tab -->
                <div v-else-if="activeTab === 'compose'" class="tab-content">
                  <div class="p-4">
                    <EmailComposer @email-sent="onMessageSent" />
                  </div>
                </div>

                <!-- Templates Tab -->
                <div v-else-if="activeTab === 'templates'" class="tab-content">
                  <div class="p-4">
                    <EmailTemplates @use-template="useTemplate" />
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
          
          <div class="col-lg-4">
            <!-- Email Templates Panel -->
            <div class="enhanced-card mb-4" id="templates-panel">
              <div class="card-header">
                <h4 class="mb-0">
                  <i class="bi bi-file-text me-2"></i>
                  Quick Templates
                </h4>
              </div>
              <div class="card-body">
                <div class="template-grid">
                  <div 
                    v-for="template in emailTemplates" 
                    :key="template.id"
                    class="template-card"
                    @click="selectTemplate(template)"
                  >
                    <div class="template-icon">
                      <i :class="template.icon"></i>
                    </div>
                    <div class="template-info">
                      <h6>{{ template.name }}</h6>
                      <p>{{ template.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Email Statistics -->
            <div class="enhanced-card mb-4">
              <div class="card-header">
                <h4 class="mb-0">
                  <i class="bi bi-graph-up me-2"></i>
                  Email Statistics
                </h4>
              </div>
              <div class="card-body">
                <div class="stats-grid">
                  <div class="stat-box">
                    <div class="stat-icon bg-primary">
                      <i class="bi bi-envelope-check"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">{{ emailStats.sent }}</span>
                      <span class="stat-label">Sent Today</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-icon bg-success">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">{{ emailStats.delivered }}</span>
                      <span class="stat-label">Delivered</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-icon bg-warning">
                      <i class="bi bi-clock"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">{{ emailStats.pending }}</span>
                      <span class="stat-label">Pending</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-icon bg-danger">
                      <i class="bi bi-x-circle"></i>
                    </div>
                    <div class="stat-details">
                      <span class="stat-value">{{ emailStats.failed }}</span>
                      <span class="stat-label">Failed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email History Section -->
        <div class="row mt-4" id="email-history">
          <div class="col-12">
            <div class="enhanced-card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h3 class="mb-0">
                    <i class="bi bi-clock-history me-2"></i>
                    Email History
                  </h3>
                  <div class="history-controls">
                    <div class="input-group input-group-sm" style="width: 250px;">
                      <span class="input-group-text">
                        <i class="bi bi-search"></i>
                      </span>
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Search emails..."
                        v-model="historySearchQuery"
                      >
                    </div>
                    <button class="btn btn-outline-primary btn-sm ms-2" @click="refreshHistory">
                      <i class="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Recipient</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Sent Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="email in filteredEmailHistory" :key="email.id">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="avatar-sm me-2">
                              <i class="bi bi-person-circle"></i>
                            </div>
                            <div>
                              <div class="fw-medium">{{ email.recipient }}</div>
                              <small class="text-muted">{{ email.recipientEmail }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="email-subject">
                            {{ email.subject }}
                            <i v-if="email.hasAttachment" class="bi bi-paperclip ms-1 text-muted"></i>
                          </div>
                        </td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(email.status)">
                            <i :class="getStatusIcon(email.status)" class="me-1"></i>
                            {{ email.status }}
                          </span>
                        </td>
                        <td>
                          <div class="text-nowrap">
                            {{ formatDateTime(email.sentTime) }}
                          </div>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" @click="viewEmail(email)" title="View">
                              <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-secondary" @click="resendEmail(email)" title="Resend">
                              <i class="bi bi-arrow-clockwise"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../utils/authUtils';
import EmailSender from '../components/EmailSender.vue';
import MailInbox from '../components/MailInbox.vue';
import EnhancedMailComposer from '../components/EnhancedMailComposer.vue';
import EmailHistory from '../components/EmailHistory.vue';
import EmailComposer from '../components/EmailComposer.vue';
import EmailTemplates from '../components/EmailTemplates.vue';
import EmailSettings from '../components/EmailSettings.vue';
import internalMailService from '../services/internalMailService';

export default {
  name: 'EmailManagement',
  components: {
    EmailSender,
    MailInbox,
    EnhancedMailComposer,
    EmailHistory,
    EmailComposer,
    EmailTemplates,
    EmailSettings
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    const authStore = useAuthStore();

    // State
    const activeTab = ref('inbox');
    const historySearchQuery = ref('');
    const unreadCount = ref(0);
    const replyData = ref(null);
    const unsubscribeUnreadCount = ref(null);

    // Email statistics data
    const emailStats = ref({
      sent: 24,
      delivered: 22,
      pending: 1,
      failed: 1,
      templates: 6
    });

    // Email templates
    const emailTemplates = ref([
      {
        id: 'welcome',
        name: 'Welcome Email',
        description: 'Welcome new users to the platform',
        icon: 'bi bi-hand-thumbs-up',
        subject: 'Welcome to Evergreen Way',
        content: 'Dear user, welcome to the Evergreen Way community!'
      },
      {
        id: 'task_created',
        name: 'Task Created',
        description: 'Notify when a new task is created',
        icon: 'bi bi-plus-circle',
        subject: 'New Help Request Created',
        content: 'Your help request has been successfully created.'
      },
      {
        id: 'task_accepted',
        name: 'Task Accepted',
        description: 'Notify when a task is accepted',
        icon: 'bi bi-check-circle',
        subject: 'Your Help Request Has Been Accepted',
        content: 'Your help request has been accepted by a volunteer.'
      }
    ]);

    // Email history
    const emailHistory = ref([
      {
        id: 1,
        recipient: 'John Doe',
        recipientEmail: 'john@example.com',
        subject: 'Welcome to Evergreen Way',
        status: 'Delivered',
        sentTime: new Date(Date.now() - 2 * 60 * 60000),
        hasAttachment: false
      },
      {
        id: 2,
        recipient: 'Mary Smith',
        recipientEmail: 'mary@example.com',
        subject: 'Task Reminder - Health Checkup',
        status: 'Delivered',
        sentTime: new Date(Date.now() - 4 * 60 * 60000),
        hasAttachment: true
      }
    ]);

    // Computed properties
    const filteredEmailHistory = computed(() => {
      if (!historySearchQuery.value) return emailHistory.value;
      const query = historySearchQuery.value.toLowerCase();
      return emailHistory.value.filter(email => 
        email.recipient.toLowerCase().includes(query) ||
        email.recipientEmail.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query)
      );
    });

    // Methods
    const formatDateTime = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        'Delivered': 'bg-success',
        'Pending': 'bg-warning',
        'Failed': 'bg-danger',
        'Sent': 'bg-info'
      };
      return classes[status] || 'bg-secondary';
    };

    const getStatusIcon = (status) => {
      const icons = {
        'Delivered': 'bi bi-check-circle',
        'Pending': 'bi bi-clock',
        'Failed': 'bi bi-x-circle',
        'Sent': 'bi bi-send'
      };
      return icons[status] || 'bi bi-question-circle';
    };

    // Navigation methods
    const focusComposer = () => {
      document.getElementById('email-composer')?.scrollIntoView({ behavior: 'smooth' });
    };

    const showTemplates = () => {
      document.getElementById('templates-panel')?.scrollIntoView({ behavior: 'smooth' });
    };

    const showHistory = () => {
      document.getElementById('email-history')?.scrollIntoView({ behavior: 'smooth' });
    };

    const showSettings = () => {
      toast.info('Email settings panel coming soon!');
    };

    // Template methods
    const selectTemplate = (template) => {
      toast.success(`Template "${template.name}" selected`);
    };

    const onTemplateSelected = (template) => {
      selectTemplate(template);
    };

    // Tab management
    const setActiveTab = (tab) => {
      activeTab.value = tab;
      replyData.value = null; // Clear reply data when switching tabs
    };

    // Handle reply from inbox
    const handleReply = (data) => {
      replyData.value = data;
      setActiveTab('compose');
    };

    // Handle message sent from composer
    const onMessageSent = (data) => {
      emailStats.value.sent++;
      toast.success(`${data.type === 'internal' ? 'Internal message' : 'External email'} sent successfully!`);
      setActiveTab('inbox');
    };

    // Load unread count
    const loadUnreadCount = async () => {
      try {
        const currentUser = authStore.getCurrentUser();
        if (currentUser?.id) {
          const result = await internalMailService.getUnreadCount(currentUser.id);
          if (result.success) {
            unreadCount.value = result.count;
          }
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    // Email actions (legacy) - removed duplicate function

    const saveDraft = () => {
      toast.info('Draft saved successfully!');
    };

    const previewEmail = () => {
      toast.info('Email preview feature coming soon!');
    };

    const viewEmail = (email) => {
      toast.info(`Viewing email: ${email.subject}`);
    };

    const resendEmail = (email) => {
      toast.info(`Resending email: ${email.subject}`);
    };

    const refreshHistory = () => {
      toast.success('Email history refreshed');
    };

    const handleLogout = () => {
      router.push('/login');
    };

    // Handle email sent from EmailComposer (merged with onMessageSent)

    // Handle template usage
    const useTemplate = (template) => {
      console.log('📧 Using template:', template.name);
      setActiveTab('compose');
    };

    // Lifecycle
    onMounted(() => {
      loadUnreadCount();
    });

    onUnmounted(() => {
      if (unsubscribeUnreadCount.value) {
        unsubscribeUnreadCount.value();
      }
      internalMailService.cleanup();
    });

    return {
      // Data
      activeTab,
      emailStats,
      emailTemplates,
      emailHistory,
      filteredEmailHistory,
      historySearchQuery,
      unreadCount,
      replyData,

      // Methods
      setActiveTab,
      handleReply,
      onMessageSent,
      formatDateTime,
      getStatusBadgeClass,
      getStatusIcon,
      focusComposer,
      showTemplates,
      showHistory,
      showSettings,
      selectTemplate,
      onTemplateSelected,
      useTemplate,
      saveDraft,
      previewEmail,
      viewEmail,
      resendEmail,
      refreshHistory,
      handleLogout
    };
  }
};
</script>

<style scoped>
/* Page Layout */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Enhanced Navbar */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

.navbar-brand {
  color: white !important;
  font-weight: 700;
  font-size: 1.5rem;
  text-decoration: none;
}

.brand-text {
  display: block;
  line-height: 1.2;
}

.brand-subtitle {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  opacity: 0.9;
}

.email-status .badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 0;
}

/* Enhanced Page Header */
.page-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}

.header-content {
  text-align: left;
}

.page-title {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
}

.header-stats {
  display: flex;
  gap: 2rem;
  justify-content: flex-end;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  min-width: 100px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* Quick Actions Panel */
.quick-actions-panel {
  margin-bottom: 2rem;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  height: 100%;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
  transition: color 0.3s ease;
}

.action-card:hover .action-icon {
  color: white;
}

.action-content h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Enhanced Cards */
.enhanced-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  overflow: hidden;
  margin-bottom: 2rem;
}

.enhanced-card .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem;
  border-radius: 0;
}

.enhanced-card .card-header h3,
.enhanced-card .card-header h4 {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

/* Tab Content */
.tab-content {
  min-height: 600px;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 0;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #495057;
  background-color: #f8f9fa;
}

.nav-tabs .nav-link.active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  border-bottom: 2px solid #007bff;
}

.card-header-tabs {
  margin-bottom: -1px;
}

.composer-actions {
  display: flex;
  gap: 0.5rem;
}

/* Template Grid */
.template-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.template-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.template-card:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.template-icon {
  font-size: 1.5rem;
  color: #667eea;
  margin-right: 1rem;
  width: 40px;
  text-align: center;
}

.template-info h6 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #2d3748;
}

.template-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-right: 1rem;
}

.stat-details {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
}

/* Email History Table */
.table-responsive {
  border-radius: 12px;
  overflow: hidden;
}

.table {
  margin: 0;
}

.table th {
  background: #f8f9fa;
  border: none;
  font-weight: 600;
  color: #2d3748;
  padding: 1rem;
}

.table td {
  padding: 1rem;
  border-color: #e2e8f0;
  vertical-align: middle;
}

.avatar-sm {
  font-size: 1.5rem;
  color: #718096;
}

.email-subject {
  font-weight: 500;
  color: #2d3748;
}

.history-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Buttons */
.btn {
  border-radius: 10px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-outline-primary {
  border-color: #667eea;
  color: #667eea;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

/* Badges */
.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-stats {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .stat-item {
    min-width: auto;
  }

  .composer-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .history-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .action-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .navbar-brand {
    font-size: 1.2rem;
  }
}
</style>
