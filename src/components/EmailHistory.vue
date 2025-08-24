<template>
  <div class="email-history">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>
        <i class="bi bi-clock-history me-2"></i>
        Email History
      </h3>
      <div class="btn-group">
        <button 
          class="btn btn-outline-secondary btn-sm"
          @click="refreshHistory"
          :disabled="isLoading"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
        <button 
          class="btn btn-outline-info btn-sm"
          @click="showStats"
        >
          <i class="bi bi-graph-up me-1"></i>
          Statistics
        </button>
      </div>
    </div>

    <!-- Statistics Card (when shown) -->
    <div v-if="showStatsCard" class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-bar-chart me-2"></i>
          Email Statistics (Last 30 Days)
        </h5>
      </div>
      <div class="card-body">
        <div class="row" v-if="emailStats">
          <div class="col-md-3">
            <div class="text-center">
              <h4 class="text-primary">{{ emailStats.total }}</h4>
              <small class="text-muted">Total Emails</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center">
              <h4 class="text-success">{{ emailStats.successful }}</h4>
              <small class="text-muted">Successful</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center">
              <h4 class="text-danger">{{ emailStats.failed }}</h4>
              <small class="text-muted">Failed</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center">
              <h4 class="text-info">{{ emailStats.successRate }}%</h4>
              <small class="text-muted">Success Rate</small>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <h6>By Send Method:</h6>
          <div class="d-flex gap-3">
            <span v-for="(count, method) in emailStats?.byMethod" :key="method" class="badge bg-secondary">
              {{ method }}: {{ count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading email history...</p>
    </div>

    <!-- Email History Table -->
    <div v-else-if="emailHistory.length > 0" class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Time</th>
                <th>To</th>
                <th>Subject</th>
                <th>Method</th>
                <th>Status</th>
                <th>Sender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="email in emailHistory" :key="email.id">
                <td>
                  <small>{{ formatDate(email.sentAt) }}</small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 150px;">
                    {{ email.to }}
                  </span>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 200px;">
                    {{ email.subject }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getMethodBadgeClass(email.sendMethod)">
                    {{ email.sendMethod }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="email.success ? 'bg-success' : 'bg-danger'">
                    {{ email.success ? 'Sent' : 'Failed' }}
                  </span>
                </td>
                <td>
                  <small>{{ email.senderName || 'System' }}</small>
                </td>
                <td>
                  <button 
                    class="btn btn-outline-primary btn-sm"
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

    <!-- No Data State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <h4 class="text-muted mt-3">No Email History</h4>
      <p class="text-muted">No emails have been sent yet.</p>
    </div>

    <!-- Email Details Modal -->
    <div class="modal fade" id="emailDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Email Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedEmail">
            <div class="row">
              <div class="col-md-6">
                <strong>To:</strong> {{ selectedEmail.to }}<br>
                <strong>Subject:</strong> {{ selectedEmail.subject }}<br>
                <strong>Sent At:</strong> {{ formatDate(selectedEmail.sentAt) }}<br>
                <strong>Method:</strong> 
                <span class="badge" :class="getMethodBadgeClass(selectedEmail.sendMethod)">
                  {{ selectedEmail.sendMethod }}
                </span><br>
                <strong>Status:</strong> 
                <span class="badge" :class="selectedEmail.success ? 'bg-success' : 'bg-danger'">
                  {{ selectedEmail.success ? 'Sent' : 'Failed' }}
                </span>
              </div>
              <div class="col-md-6">
                <strong>Sender:</strong> {{ selectedEmail.senderName || 'System' }}<br>
                <strong>Message ID:</strong> {{ selectedEmail.messageId || 'N/A' }}<br>
                <strong>Content Length:</strong> {{ selectedEmail.contentLength || 0 }} chars<br>
                <strong>Has Attachment:</strong> {{ selectedEmail.hasAttachment ? 'Yes' : 'No' }}<br>
                <strong>Environment:</strong> {{ selectedEmail.environment || 'Unknown' }}
              </div>
            </div>
            
            <div class="mt-3" v-if="selectedEmail.contentPreview">
              <strong>Content Preview:</strong>
              <div class="border rounded p-2 mt-1 bg-light">
                <small>{{ selectedEmail.contentPreview }}</small>
              </div>
            </div>
            
            <div class="mt-3" v-if="!selectedEmail.success && selectedEmail.errorMessage">
              <strong>Error Message:</strong>
              <div class="alert alert-danger">
                <small>{{ selectedEmail.errorMessage }}</small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { emailLogService } from '../services/emailLogService';
import { useToast } from 'vue-toastification';

export default {
  name: 'EmailHistory',
  setup() {
    const toast = useToast();
    const isLoading = ref(false);
    const emailHistory = ref([]);
    const emailStats = ref(null);
    const showStatsCard = ref(false);
    const selectedEmail = ref(null);

    // Load email history
    const loadEmailHistory = async () => {
      isLoading.value = true;
      try {
        const result = await emailLogService.getEmailHistory();
        if (result.success) {
          emailHistory.value = result.emails;
          console.log(`📧 Loaded ${result.count} email records`);
        } else {
          toast.error('Failed to load email history: ' + result.error);
        }
      } catch (error) {
        console.error('Error loading email history:', error);
        toast.error('Failed to load email history');
      } finally {
        isLoading.value = false;
      }
    };

    // Load email statistics from Firebase
    const loadEmailStats = async () => {
      try {
        console.log('📊 Loading email statistics from Firebase...');
        const result = await emailLogService.getEmailStats(30); // Last 30 days
        if (result.success) {
          emailStats.value = result.stats;
          console.log('📊 Real email stats loaded:', result.stats);
          console.log(`📧 Total emails: ${result.stats.total}`);
          console.log(`✅ Successful: ${result.stats.successful}`);
          console.log(`❌ Failed: ${result.stats.failed}`);
          console.log(`📈 Success rate: ${result.stats.successRate}%`);
        } else {
          console.warn('Failed to load email statistics:', result.error);
          // Set default stats if loading fails
          emailStats.value = {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
            byMethod: {},
            byDay: {}
          };
        }
      } catch (error) {
        console.error('Error loading email stats:', error);
        // Set default stats on error
        emailStats.value = {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0,
          byMethod: {},
          byDay: {}
        };
      }
    };

    // Refresh history
    const refreshHistory = () => {
      loadEmailHistory();
      if (showStatsCard.value) {
        loadEmailStats();
      }
    };

    // Show/hide statistics
    const showStats = async () => {
      showStatsCard.value = !showStatsCard.value;
      if (showStatsCard.value && !emailStats.value) {
        await loadEmailStats();
      }
    };

    // View email details
    const viewEmailDetails = (email) => {
      selectedEmail.value = email;
      const modal = new bootstrap.Modal(document.getElementById('emailDetailsModal'));
      modal.show();
    };

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Unknown';
      return new Date(date).toLocaleString();
    };

    // Get method badge class
    const getMethodBadgeClass = (method) => {
      switch (method) {
        case 'firebase': return 'bg-warning';
        case 'postmark': return 'bg-info';
        case 'mock': return 'bg-secondary';
        default: return 'bg-dark';
      }
    };

    // Initialize
    onMounted(() => {
      loadEmailHistory();
    });

    return {
      isLoading,
      emailHistory,
      emailStats,
      showStatsCard,
      selectedEmail,
      refreshHistory,
      showStats,
      viewEmailDetails,
      formatDate,
      getMethodBadgeClass
    };
  }
};
</script>

<style scoped>
.email-history {
  max-width: 100%;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  font-size: 0.75em;
}
</style>
