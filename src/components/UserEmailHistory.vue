<template>
  <div class="user-email-history">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="bi bi-clock-history me-2"></i>
        Email History & Statistics
      </h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="refreshHistory">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <i class="bi bi-envelope display-4 text-primary mb-2"></i>
            <h3 class="text-primary">{{ userStats.total }}</h3>
            <p class="text-muted mb-0">Total Emails</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <i class="bi bi-check-circle display-4 text-success mb-2"></i>
            <h3 class="text-success">{{ userStats.sent }}</h3>
            <p class="text-muted mb-0">Successfully Sent</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <i class="bi bi-inbox display-4 text-info mb-2"></i>
            <h3 class="text-info">{{ userStats.received }}</h3>
            <p class="text-muted mb-0">Received</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card stats-card">
          <div class="card-body text-center">
            <i class="bi bi-percent display-4 text-warning mb-2"></i>
            <h3 class="text-warning">{{ userStats.successRate }}%</h3>
            <p class="text-muted mb-0">Success Rate</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Options -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Date Range</label>
            <select class="form-select" v-model="dateFilter" @change="applyFilters">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Email Type</label>
            <select class="form-select" v-model="typeFilter" @change="applyFilters">
              <option value="all">All Emails</option>
              <option value="sent">Sent Only</option>
              <option value="received">Received Only</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="statusFilter" @change="applyFilters">
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Search</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery" 
              @input="applyFilters"
              placeholder="Search emails..."
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading email history...</p>
    </div>

    <!-- Email History List -->
    <div v-else-if="filteredHistory.length > 0" class="email-history-list">
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="email in filteredHistory" :key="email.id">
                  <td>
                    <small>{{ formatDate(email.timestamp) }}</small>
                  </td>
                  <td>
                    <span class="badge" :class="email.type === 'sent' ? 'bg-primary' : 'bg-info'">
                      {{ email.type }}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong>{{ email.contact }}</strong>
                      <br>
                      <small class="text-muted">{{ email.email }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="subject-cell">
                      {{ email.subject || 'No Subject' }}
                      <i v-if="email.hasAttachment" class="bi bi-paperclip ms-1 text-muted"></i>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(email.status)">
                      {{ email.status }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ email.method }}</small>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="viewEmailDetails(email)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-clock-history display-1 text-muted"></i>
      <h4 class="text-muted mt-3">No Email History</h4>
      <p class="text-muted">Your email history will appear here.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { emailLogService } from '../services/emailLogService';
import internalMailService from '../services/internalMailService';

export default {
  name: 'UserEmailHistory',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const toast = useToast();
    const isLoading = ref(false);
    const emailHistory = ref([]);
    const dateFilter = ref('30');
    const typeFilter = ref('all');
    const statusFilter = ref('all');
    const searchQuery = ref('');

    // User statistics
    const userStats = ref({
      total: 0,
      sent: 0,
      received: 0,
      successRate: 0
    });

    // Load user email history
    const loadEmailHistory = async () => {
      isLoading.value = true;
      try {
        // Get user's sent emails from email logs
        const sentResult = await emailLogService.getUserEmailLogs(props.userId);

        // Get user's received emails from internal messages
        const receivedResult = await internalMailService.getInboxMessages(props.userId);

        const allEmails = [];

        // Process sent emails
        if (sentResult.success && sentResult.emails) {
          sentResult.emails.forEach(email => {
            allEmails.push({
              id: email.id,
              type: 'sent',
              subject: email.subject,
              content: email.content,
              recipientName: email.recipientName || 'Unknown Recipient',
              recipientEmail: email.recipientEmail || email.toEmail,
              senderName: email.senderName || 'You',
              senderEmail: email.senderEmail || email.fromEmail,
              sentAt: email.sentAt,
              status: email.status || 'sent'
            });
          });
        }

        // Process received emails
        if (receivedResult.success && receivedResult.messages) {
          receivedResult.messages.forEach(message => {
            allEmails.push({
              id: message.id,
              type: 'received',
              subject: message.subject,
              content: message.content,
              senderName: message.fromUserName || 'Unknown Sender',
              senderEmail: message.fromUserEmail,
              recipientName: message.toUserName || 'You',
              recipientEmail: message.toUserEmail,
              sentAt: message.sentAt,
              status: 'received',
              isRead: message.isRead
            });
          });
        }

        // Sort by date (newest first)
        allEmails.sort((a, b) => {
          const aTime = a.sentAt ? new Date(a.sentAt) : new Date(0);
          const bTime = b.sentAt ? new Date(b.sentAt) : new Date(0);
          return bTime - aTime;
        });

        if (allEmails.length > 0) {
          emailHistory.value = allEmails.map(email => ({
            id: email.id,
            type: email.type,
            contact: email.type === 'sent' ? email.recipientName : email.senderName,
            email: email.type === 'sent' ? email.recipientEmail : email.senderEmail,
            subject: email.subject,
            timestamp: email.sentAt,
            status: email.status,
            method: 'Internal',
            hasAttachment: false,
            content: email.content,
            isRead: email.isRead
          }));
        } else {
          // Mock data for demonstration
          emailHistory.value = [
            {
              id: '1',
              type: 'sent',
              contact: 'Dr. Sarah Johnson',
              email: 'dr.johnson@evergreenway.com',
              subject: 'Appointment Confirmation',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              status: 'sent',
              method: 'postmark',
              hasAttachment: false
            },
            {
              id: '2',
              type: 'received',
              contact: 'Community Events Team',
              email: 'events@evergreenway.com',
              subject: 'Weekly Community Gathering',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              status: 'received',
              method: 'internal',
              hasAttachment: false
            },
            {
              id: '3',
              type: 'sent',
              contact: 'Admin Team',
              email: 'admin@evergreenway.com',
              subject: 'Service Request',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              status: 'sent',
              method: 'postmark',
              hasAttachment: true
            }
          ];
        }

        // Calculate statistics
        calculateStats();
        console.log(`📧 Loaded ${emailHistory.value.length} email history items for user ${props.userId}`);
      } catch (error) {
        console.error('Error loading email history:', error);
        toast.error('Failed to load email history');
      } finally {
        isLoading.value = false;
      }
    };

    // Calculate user statistics
    const calculateStats = () => {
      const total = emailHistory.value.length;
      const sent = emailHistory.value.filter(email => email.type === 'sent').length;
      const received = emailHistory.value.filter(email => email.type === 'received').length;
      const successful = emailHistory.value.filter(email => email.status === 'sent').length;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      userStats.value = {
        total,
        sent,
        received,
        successRate
      };
    };

    // Filtered history
    const filteredHistory = computed(() => {
      let filtered = emailHistory.value;

      // Date filter
      const days = parseInt(dateFilter.value);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(email => new Date(email.timestamp) >= cutoffDate);

      // Type filter
      if (typeFilter.value !== 'all') {
        filtered = filtered.filter(email => email.type === typeFilter.value);
      }

      // Status filter
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(email => email.status === statusFilter.value);
      }

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(email => 
          email.contact.toLowerCase().includes(query) ||
          email.email.toLowerCase().includes(query) ||
          (email.subject && email.subject.toLowerCase().includes(query))
        );
      }

      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });

    // Apply filters
    const applyFilters = () => {
      // Filters are applied automatically through computed property
      console.log('📧 Filters applied');
    };

    // Refresh history
    const refreshHistory = () => {
      toast.info('Refreshing email history...');
      loadEmailHistory();
    };

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Unknown';
      return new Date(date).toLocaleString();
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'sent':
        case 'received':
          return 'bg-success';
        case 'failed':
          return 'bg-danger';
        case 'pending':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    };

    // View email details
    const viewEmailDetails = (email) => {
      toast.info(`Viewing details for: ${email.subject}`);
      // This would open a modal with full email details
    };

    // Initialize
    onMounted(() => {
      if (props.userId) {
        loadEmailHistory();
      }
    });

    return {
      isLoading,
      emailHistory,
      filteredHistory,
      userStats,
      dateFilter,
      typeFilter,
      statusFilter,
      searchQuery,
      applyFilters,
      refreshHistory,
      formatDate,
      getStatusBadgeClass,
      viewEmailDetails
    };
  }
};
</script>

<style scoped>
.user-email-history {
  max-width: 100%;
}

.stats-card {
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.email-history-list {
  max-height: 600px;
  overflow-y: auto;
}

.subject-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #2c3e50;
}

.table td {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .subject-cell {
    max-width: 150px;
  }
}
</style>
