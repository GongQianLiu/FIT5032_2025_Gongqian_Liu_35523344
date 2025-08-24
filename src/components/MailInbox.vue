<template>
  <div class="mail-inbox">
    <!-- Inbox Header -->
    <div class="inbox-header">
      <div class="d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="bi bi-inbox me-2"></i>
          Inbox
          <span v-if="unreadCount > 0" class="badge bg-primary ms-2">{{ unreadCount }}</span>
        </h4>
        <div class="inbox-actions">
          <button class="btn btn-outline-primary btn-sm me-2" @click="refreshInbox">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <button class="btn btn-primary btn-sm" @click="$emit('compose')">
            <i class="bi bi-plus-circle"></i>
            Compose
          </button>
        </div>
      </div>
    </div>

    <!-- Inbox Filters -->
    <div class="inbox-filters mb-3">
      <div class="btn-group" role="group">
        <button 
          type="button" 
          class="btn btn-outline-secondary"
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          All
        </button>
        <button 
          type="button" 
          class="btn btn-outline-secondary"
          :class="{ active: currentFilter === 'unread' }"
          @click="setFilter('unread')"
        >
          Unread ({{ unreadCount }})
        </button>
        <button 
          type="button" 
          class="btn btn-outline-secondary"
          :class="{ active: currentFilter === 'starred' }"
          @click="setFilter('starred')"
        >
          Starred
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading messages...</span>
      </div>
      <p class="mt-2 text-muted">Loading your messages...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMessages.length === 0" class="empty-inbox text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <h5 class="mt-3 text-muted">No messages found</h5>
      <p class="text-muted">
        {{ currentFilter === 'all' ? 'Your inbox is empty' : `No ${currentFilter} messages` }}
      </p>
    </div>

    <!-- Messages List -->
    <div v-else class="messages-list">
      <div 
        v-for="message in filteredMessages" 
        :key="message.id"
        class="message-item"
        :class="{ 
          'unread': !message.isRead,
          'starred': message.isStarred,
          'selected': selectedMessage?.id === message.id
        }"
        @click="selectMessage(message)"
      >
        <div class="message-content">
          <div class="message-header">
            <div class="sender-info">
              <strong class="sender-name">{{ getSenderName(message.fromUserId) }}</strong>
              <span class="message-time text-muted ms-2">{{ formatTime(message.sentAt) }}</span>
            </div>
            <div class="message-actions">
              <button 
                class="btn btn-sm btn-outline-warning"
                :class="{ 'btn-warning': message.isStarred }"
                @click.stop="toggleStar(message)"
                title="Star message"
              >
                <i class="bi" :class="message.isStarred ? 'bi-star-fill' : 'bi-star'"></i>
              </button>
              <button 
                class="btn btn-sm btn-outline-danger ms-1"
                @click.stop="deleteMessage(message)"
                title="Delete message"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="message-subject">
            <span class="priority-indicator" v-if="message.priority === 'high'">
              <i class="bi bi-exclamation-triangle text-danger"></i>
            </span>
            {{ message.subject }}
          </div>
          <div class="message-preview text-muted">
            {{ getMessagePreview(message.content) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <div class="modal fade" id="messageDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedMessage?.subject }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedMessage" class="message-detail">
              <div class="message-meta mb-3">
                <div class="row">
                  <div class="col-md-6">
                    <strong>From:</strong> {{ getSenderName(selectedMessage.fromUserId) }}
                  </div>
                  <div class="col-md-6">
                    <strong>Date:</strong> {{ formatDateTime(selectedMessage.sentAt) }}
                  </div>
                </div>
                <div class="row mt-2" v-if="selectedMessage.priority === 'high'">
                  <div class="col-12">
                    <span class="badge bg-danger">
                      <i class="bi bi-exclamation-triangle me-1"></i>
                      High Priority
                    </span>
                  </div>
                </div>
              </div>
              <div class="message-body" v-html="selectedMessage.content"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="replyToMessage">
              <i class="bi bi-reply"></i>
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'vue-toastification';
import internalMailService from '../services/internalMailService';
import { useAuthStore } from '../utils/authUtils';
import { Modal } from 'bootstrap';

export default {
  name: 'MailInbox',
  emits: ['compose', 'reply'],
  setup(props, { emit }) {
    const toast = useToast();
    const authStore = useAuthStore();
    
    // State
    const messages = ref([]);
    const selectedMessage = ref(null);
    const isLoading = ref(true);
    const currentFilter = ref('all');
    const unreadCount = ref(0);
    const unsubscribeInbox = ref(null);

    // Computed
    const filteredMessages = computed(() => {
      switch (currentFilter.value) {
        case 'unread':
          return messages.value.filter(msg => !msg.isRead);
        case 'starred':
          return messages.value.filter(msg => msg.isStarred);
        default:
          return messages.value;
      }
    });

    // Methods
    const loadInbox = async () => {
      try {
        isLoading.value = true;
        const currentUser = authStore.getCurrentUser();
        if (!currentUser?.id) {
          toast.error('Please login first');
          return;
        }

        const result = await internalMailService.getInboxMessages(currentUser.id);
        if (result.success) {
          messages.value = result.messages;
          updateUnreadCount();
        }
      } catch (error) {
        console.error('Error loading inbox:', error);
        toast.error('Failed to load inbox');
      } finally {
        isLoading.value = false;
      }
    };

    const setupRealtimeInbox = () => {
      const currentUser = authStore.getCurrentUser();
      if (currentUser?.id) {
        unsubscribeInbox.value = internalMailService.listenToInbox(
          currentUser.id,
          (newMessages) => {
            messages.value = newMessages;
            updateUnreadCount();
          }
        );
      }
    };

    const updateUnreadCount = () => {
      unreadCount.value = messages.value.filter(msg => !msg.isRead).length;
    };

    const refreshInbox = () => {
      loadInbox();
      toast.success('Inbox refreshed');
    };

    const setFilter = (filter) => {
      currentFilter.value = filter;
    };

    const selectMessage = async (message) => {
      selectedMessage.value = message;
      
      // Mark as read if unread
      if (!message.isRead) {
        try {
          await internalMailService.markAsRead(message.id);
          message.isRead = true;
          updateUnreadCount();
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }

      // Show modal
      const modal = new Modal(document.getElementById('messageDetailModal'));
      modal.show();
    };

    const toggleStar = async (message) => {
      try {
        await internalMailService.toggleStar(message.id, !message.isStarred);
        message.isStarred = !message.isStarred;
        toast.success(message.isStarred ? 'Message starred' : 'Star removed');
      } catch (error) {
        console.error('Error toggling star:', error);
        toast.error('Failed to update message');
      }
    };

    const deleteMessage = async (message) => {
      if (confirm('Are you sure you want to delete this message?')) {
        try {
          await internalMailService.deleteMessage(message.id);
          messages.value = messages.value.filter(msg => msg.id !== message.id);
          toast.success('Message deleted');
        } catch (error) {
          console.error('Error deleting message:', error);
          toast.error('Failed to delete message');
        }
      }
    };

    const replyToMessage = () => {
      if (selectedMessage.value) {
        emit('reply', {
          to: selectedMessage.value.fromUserId,
          subject: `Re: ${selectedMessage.value.subject}`,
          originalMessage: selectedMessage.value
        });
        
        // Close modal
        const modal = Modal.getInstance(document.getElementById('messageDetailModal'));
        modal.hide();
      }
    };

    const getSenderName = (userId) => {
      // In a real app, you'd fetch user details from Firebase
      return `User ${userId.substring(0, 8)}`;
    };

    const getMessagePreview = (content) => {
      const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString();
      }
    };

    const formatDateTime = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    };

    // Lifecycle
    onMounted(() => {
      loadInbox();
      setupRealtimeInbox();
    });

    onUnmounted(() => {
      if (unsubscribeInbox.value) {
        unsubscribeInbox.value();
      }
    });

    return {
      messages,
      filteredMessages,
      selectedMessage,
      isLoading,
      currentFilter,
      unreadCount,
      refreshInbox,
      setFilter,
      selectMessage,
      toggleStar,
      deleteMessage,
      replyToMessage,
      getSenderName,
      getMessagePreview,
      formatTime,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.mail-inbox {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inbox-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.inbox-filters {
  padding: 0 1rem;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: #f8f9fa;
}

.message-item.unread {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.message-item.starred {
  border-left: 4px solid #fd7e14;
}

.message-item.selected {
  background-color: #e3f2fd;
}

.message-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sender-info {
  flex: 1;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.message-subject {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.message-preview {
  font-size: 0.9rem;
  line-height: 1.4;
}

.priority-indicator {
  margin-right: 0.5rem;
}

.empty-inbox i {
  font-size: 4rem;
}

.message-detail {
  line-height: 1.6;
}

.message-meta {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
}

.message-body {
  padding: 1rem 0;
  white-space: pre-wrap;
}
</style>
