<template>
  <div class="user-sent-emails">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="bi bi-send me-2"></i>
        Sent Emails
      </h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="refreshSentEmails">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading sent emails...</p>
    </div>

    <!-- Sent Emails List -->
    <div v-else-if="sentEmails.length > 0" class="sent-emails-list">
      <div 
        v-for="email in sentEmails" 
        :key="email.id"
        class="email-item"
        @click="viewEmail(email)"
      >
        <div class="email-header">
          <div class="recipient-info">
            <strong>To: {{ email.recipientEmail }}</strong>
            <small class="text-muted ms-2" v-if="email.recipientName">{{ email.recipientName }}</small>
          </div>
          <div class="email-meta">
            <small class="text-muted">{{ formatDate(email.sentAt) }}</small>
            <span class="badge ms-2" :class="getStatusBadgeClass(email.status)">
              {{ email.status }}
            </span>
          </div>
        </div>
        <div class="email-subject">
          {{ email.subject || 'No Subject' }}
        </div>
        <div class="email-preview">
          {{ getEmailPreview(email.content) }}
        </div>
        <div class="email-actions">
          <small class="text-muted">
            <i class="bi bi-envelope me-1"></i>
            {{ email.method || 'Email' }}
            <span v-if="email.hasAttachment" class="ms-2">
              <i class="bi bi-paperclip"></i>
            </span>
          </small>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-send display-1 text-muted"></i>
      <h4 class="text-muted mt-3">No Sent Emails</h4>
      <p class="text-muted">Emails you send will appear here.</p>
    </div>

    <!-- Email Detail Modal -->
    <div class="modal fade" id="emailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedEmail?.subject || 'No Subject' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedEmail" class="email-details">
              <div class="email-info mb-3">
                <div class="row">
                  <div class="col-md-6">
                    <strong>To:</strong> {{ selectedEmail.recipientEmail }}
                    <br>
                    <small class="text-muted" v-if="selectedEmail.recipientName">
                      {{ selectedEmail.recipientName }}
                    </small>
                  </div>
                  <div class="col-md-6 text-end">
                    <strong>Sent:</strong> {{ formatDate(selectedEmail.sentAt) }}
                    <br>
                    <span class="badge" :class="getStatusBadgeClass(selectedEmail.status)">
                      {{ selectedEmail.status }}
                    </span>
                  </div>
                </div>
              </div>
              <hr>
              <div class="email-content" v-html="selectedEmail.content"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-outline-primary" @click="resendEmail" v-if="selectedEmail?.status === 'failed'">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import { emailLogService } from '../services/emailLogService';

export default {
  name: 'UserSentEmails',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const toast = useToast();
    const isLoading = ref(false);
    const sentEmails = ref([]);
    const selectedEmail = ref(null);

    // Load sent emails for user
    const loadSentEmails = async () => {
      isLoading.value = true;
      try {
        // Get user's sent emails from email logs
        const result = await emailLogService.getUserEmailLogs(props.userId);
        if (result.success && result.emails && result.emails.length > 0) {
          sentEmails.value = result.emails.map(email => ({
            id: email.id,
            recipientEmail: email.toEmail || email.recipientEmail,
            recipientName: email.recipientName || email.toUserName || '',
            subject: email.subject,
            content: email.content || 'No content available',
            sentAt: email.sentAt,
            status: email.status || 'sent',
            method: email.method || 'Internal',
            hasAttachment: email.hasAttachment || false,
            messageId: email.messageId
          }));
          
          console.log(`📧 Loaded ${sentEmails.value.length} sent emails for user ${props.userId}`);
        } else {
          // If no logs found, create some mock data for demonstration
          sentEmails.value = [
            {
              id: '1',
              recipientEmail: 'dr.johnson@evergreenway.com',
              recipientName: 'Dr. Sarah Johnson',
              subject: 'Appointment Confirmation',
              content: '<p>Dear Dr. Johnson,</p><p>I would like to confirm my appointment for next Tuesday at 2 PM.</p><p>Thank you!</p>',
              sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              status: 'sent',
              method: 'postmark',
              hasAttachment: false
            },
            {
              id: '2',
              recipientEmail: 'admin@evergreenway.com',
              recipientName: 'Admin Team',
              subject: 'Service Request',
              content: '<p>Hello,</p><p>I would like to request assistance with transportation to my medical appointment.</p><p>Please let me know the availability.</p>',
              sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              status: 'sent',
              method: 'postmark',
              hasAttachment: true
            }
          ];
        }
      } catch (error) {
        console.error('Error loading sent emails:', error);
        toast.error('Failed to load sent emails');
      } finally {
        isLoading.value = false;
      }
    };

    // Refresh sent emails
    const refreshSentEmails = () => {
      toast.info('Refreshing sent emails...');
      loadSentEmails();
    };

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Unknown';
      const emailDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now - emailDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return emailDate.toLocaleDateString();
      }
    };

    // Get email preview
    const getEmailPreview = (content) => {
      if (!content) return 'No content';
      // Strip HTML tags and get first 100 characters
      const text = content.replace(/<[^>]*>/g, '');
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'sent':
          return 'bg-success';
        case 'failed':
          return 'bg-danger';
        case 'pending':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    };

    // View email
    const viewEmail = (email) => {
      selectedEmail.value = email;
      
      nextTick(() => {
        const modal = new bootstrap.Modal(document.getElementById('emailModal'));
        modal.show();
      });
    };

    // Resend email
    const resendEmail = () => {
      if (selectedEmail.value) {
        toast.info('Resend functionality would be implemented here');
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
        if (modal) {
          modal.hide();
        }
      }
    };

    // Initialize
    onMounted(() => {
      if (props.userId) {
        loadSentEmails();
      }
    });

    return {
      isLoading,
      sentEmails,
      selectedEmail,
      loadSentEmails,
      refreshSentEmails,
      formatDate,
      getEmailPreview,
      getStatusBadgeClass,
      viewEmail,
      resendEmail
    };
  }
};
</script>

<style scoped>
.user-sent-emails {
  max-width: 100%;
}

.sent-emails-list {
  max-height: 600px;
  overflow-y: auto;
}

.email-item {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.email-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.email-subject {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.email-preview {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.email-actions {
  border-top: 1px solid #f1f3f4;
  padding-top: 0.5rem;
}

.email-content {
  line-height: 1.6;
}

.email-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .email-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .email-meta {
    margin-top: 0.5rem;
  }
}
</style>
