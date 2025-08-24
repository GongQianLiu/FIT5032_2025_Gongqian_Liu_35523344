<template>
  <div class="user-inbox">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="bi bi-inbox me-2"></i>
        Inbox
      </h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="refreshInbox">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
        <button class="btn btn-primary btn-sm" @click="$emit('compose')">
          <i class="bi bi-plus-lg me-1"></i>
          Compose
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading messages...</p>
    </div>

    <!-- Messages List -->
    <div v-else-if="messages.length > 0" class="messages-list">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        :class="{ 'unread': !message.isRead }"
        @click="openMessage(message)"
      >
        <div class="message-header">
          <div class="sender-info">
            <strong>{{ message.senderName || 'Unknown Sender' }}</strong>
            <small class="text-muted ms-2">{{ message.senderEmail }}</small>
          </div>
          <div class="message-meta">
            <small class="text-muted">{{ formatDate(message.sentAt) }}</small>
            <span v-if="!message.isRead" class="badge bg-primary ms-2">New</span>
          </div>
        </div>
        <div class="message-subject">
          {{ message.subject || 'No Subject' }}
        </div>
        <div class="message-preview">
          {{ getMessagePreview(message.content) }}
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <h4 class="text-muted mt-3">No Messages</h4>
      <p class="text-muted">Your inbox is empty. New messages will appear here.</p>
    </div>

    <!-- Message Detail Modal -->
    <div class="modal fade" id="messageModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedMessage?.subject || 'No Subject' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedMessage" class="message-details">
              <div class="message-info mb-3">
                <div class="row">
                  <div class="col-md-6">
                    <strong>From:</strong> {{ selectedMessage.senderName || 'Unknown' }}
                    <br>
                    <small class="text-muted">{{ selectedMessage.senderEmail }}</small>
                  </div>
                  <div class="col-md-6 text-end">
                    <strong>Date:</strong> {{ formatDate(selectedMessage.sentAt) }}
                  </div>
                </div>
              </div>
              <hr>
              <div class="message-content" v-html="selectedMessage.content"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="replyToMessage">
              <i class="bi bi-reply me-1"></i>
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useToast } from 'vue-toastification';
import internalMailService from '../services/internalMailService';

export default {
  name: 'UserInbox',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  emits: ['compose', 'reply'],
  setup(props, { emit }) {
    const toast = useToast();
    const isLoading = ref(false);
    const messages = ref([]);
    const selectedMessage = ref(null);
    let unsubscribeListener = null;

    // Mock messages for demonstration
    const mockMessages = [
      {
        id: '1',
        senderName: 'Dr. Sarah Johnson',
        senderEmail: 'dr.johnson@evergreenway.com',
        subject: 'Health Check Reminder',
        content: '<p>Dear Patient,</p><p>This is a friendly reminder about your upcoming health check appointment scheduled for next week.</p><p>Please bring your medical records and any current medications.</p><p>Best regards,<br>Dr. Sarah Johnson</p>',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: false
      },
      {
        id: '2',
        senderName: 'Community Events Team',
        senderEmail: 'events@evergreenway.com',
        subject: 'Weekly Community Gathering',
        content: '<p>Hello!</p><p>Join us for our weekly community gathering this Friday at 2 PM in the main hall.</p><p>We will have refreshments and activities for everyone.</p><p>Hope to see you there!</p>',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true
      },
      {
        id: '3',
        senderName: 'Volunteer Coordinator',
        senderEmail: 'volunteers@evergreenway.com',
        subject: 'Thank You for Your Service',
        content: '<p>Dear Volunteer,</p><p>Thank you for your dedicated service to our community. Your efforts make a real difference in the lives of our residents.</p><p>We appreciate everything you do!</p>',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isRead: true
      }
    ];

    // Load messages
    const loadMessages = async () => {
      isLoading.value = true;
      try {
        const result = await internalMailService.getInboxMessages(props.userId);
        if (result.success) {
          messages.value = result.messages.map(msg => ({
            id: msg.id,
            senderName: msg.fromUserName || 'Unknown Sender',
            senderEmail: msg.fromUserEmail || 'unknown@evergreenway.com',
            subject: msg.subject,
            content: msg.content,
            sentAt: msg.sentAt,
            isRead: msg.isRead,
            fromUserId: msg.fromUserId
          }));
        } else {
          // Fallback to mock messages if Firebase fails
          messages.value = mockMessages.map(msg => ({
            ...msg,
            toUserId: props.userId
          }));
        }

        console.log(`📧 Loaded ${messages.value.length} messages for user ${props.userId}`);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        // Fallback to mock messages
        messages.value = mockMessages.map(msg => ({
          ...msg,
          toUserId: props.userId
        }));
      } finally {
        isLoading.value = false;
      }
    };

    // Refresh inbox
    const refreshInbox = () => {
      toast.info('Refreshing inbox...');
      loadMessages();
    };

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Unknown';
      const messageDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now - messageDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return messageDate.toLocaleDateString();
      }
    };

    // Get message preview
    const getMessagePreview = (content) => {
      if (!content) return 'No content';
      // Strip HTML tags and get first 100 characters
      const text = content.replace(/<[^>]*>/g, '');
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    // Open message
    const openMessage = async (message) => {
      selectedMessage.value = message;

      // Mark as read (only for real Firebase messages, not sample messages)
      if (!message.isRead) {
        if (!message.id.startsWith('sample-')) {
          try {
            const result = await internalMailService.markAsRead(message.id);
            if (result.success) {
              message.isRead = true;
              toast.success('Message marked as read');
            }
          } catch (error) {
            console.error('Error marking message as read:', error);
            // Still mark as read locally for UI purposes
            message.isRead = true;
          }
        } else {
          // For sample messages, just mark as read locally
          message.isRead = true;
        }
      }

      // Clean up any existing backdrop first
      const existingBackdrops = document.querySelectorAll('.modal-backdrop');
      existingBackdrops.forEach(backdrop => backdrop.remove());

      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        const modalElement = document.getElementById('messageModal');
        if (modalElement && window.bootstrap) {
          try {
            // Dispose existing modal instance if any
            const existingModal = window.bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
              existingModal.dispose();
            }

            // Create new modal instance with proper cleanup
            const modal = new window.bootstrap.Modal(modalElement, {
              backdrop: true,
              keyboard: true,
              focus: true
            });

            // Add event listener for proper cleanup when modal is hidden
            modalElement.addEventListener('hidden.bs.modal', () => {
              // Clean up any remaining backdrop
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());

              // Reset body styles
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
            }, { once: true });

            modal.show();
            console.log('📧 Message modal opened successfully');
          } catch (error) {
            console.error('Error opening message modal:', error);
            toast.error('Failed to open message');
          }
        } else {
          console.error('Message modal element not found or Bootstrap not available');
          toast.error('Unable to display message');
        }
      }, 100);
    };

    // Reply to message
    const replyToMessage = () => {
      if (selectedMessage.value) {
        const replyData = {
          to: selectedMessage.value.senderEmail,
          subject: `Re: ${selectedMessage.value.subject}`,
          originalMessage: selectedMessage.value
        };
        
        emit('reply', replyData);
        
        // Close modal
        const modalElement = document.getElementById('messageModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      }
    };

    // Setup real-time listener
    const setupRealtimeListener = () => {
      if (props.userId) {
        unsubscribeListener = internalMailService.listenToInbox(props.userId, (result) => {
          if (result.success) {
            messages.value = result.messages.map(msg => ({
              id: msg.id,
              senderName: msg.fromUserName || 'Unknown Sender',
              senderEmail: msg.fromUserEmail || 'unknown@evergreenway.com',
              subject: msg.subject,
              content: msg.content,
              sentAt: msg.sentAt,
              isRead: msg.isRead,
              fromUserId: msg.fromUserId
            }));
            console.log(`📧 Real-time update: ${messages.value.length} messages`);
          }
        });
      }
    };

    // Initialize
    onMounted(() => {
      if (props.userId) {
        loadMessages();
        setupRealtimeListener();
      }
    });

    // Cleanup
    onUnmounted(() => {
      if (unsubscribeListener) {
        unsubscribeListener();
        console.log('📧 Inbox listener unsubscribed');
      }
    });

    return {
      isLoading,
      messages,
      selectedMessage,
      loadMessages,
      refreshInbox,
      formatDate,
      getMessagePreview,
      openMessage,
      replyToMessage
    };
  }
};
</script>

<style scoped>
.user-inbox {
  max-width: 100%;
}

.messages-list {
  max-height: 600px;
  overflow-y: auto;
}

.message-item {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.message-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.message-item.unread {
  border-left: 4px solid #007bff;
  background: #f8f9ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-subject {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.message-preview {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message-content {
  line-height: 1.6;
}

.message-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .message-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .message-meta {
    margin-top: 0.5rem;
  }
}
</style>
