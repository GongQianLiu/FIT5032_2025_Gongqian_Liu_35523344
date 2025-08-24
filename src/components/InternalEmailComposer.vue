<template>
  <div class="internal-email-composer">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="bi bi-envelope-plus me-2"></i>
        {{ replyData ? 'Reply to Internal Message' : 'Send Internal Message' }}
      </h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="$emit('cancel')">
          <i class="bi bi-x-lg me-1"></i>
          Cancel
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="sendInternalMessage">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">To (Internal User) *</label>
                <select 
                  class="form-select" 
                  v-model="selectedRecipientId"
                  required
                  :disabled="!!replyData"
                >
                  <option value="">Select a user...</option>
                  <option 
                    v-for="user in availableUsers" 
                    :key="user.id" 
                    :value="user.id"
                  >
                    {{ user.displayName }} ({{ user.role }}) - {{ user.email }}
                  </option>
                </select>
                <div class="form-text">
                  Select an internal user to send a message to.
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Template</label>
                <select class="form-select" v-model="selectedTemplateId" @change="applyTemplate">
                  <option value="">Select a template...</option>
                  <option v-for="template in templates" :key="template.id" :value="template.id">
                    {{ template.name }} - {{ template.category }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Subject *</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="messageForm.subject"
              required
              placeholder="Message subject"
            >
          </div>
          
          <div class="mb-3">
            <label class="form-label">Message *</label>
            <textarea 
              class="form-control" 
              v-model="messageForm.content"
              rows="10"
              required
              placeholder="Type your message here..."
            ></textarea>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              <small>
                <i class="bi bi-info-circle me-1"></i>
                This message will be sent internally through the system
              </small>
            </div>
            <div>
              <button type="button" class="btn btn-secondary me-2" @click="clearForm">
                <i class="bi bi-x-lg me-1"></i>
                Clear
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSending">
                <span v-if="isSending">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending...
                </span>
                <span v-else>
                  <i class="bi bi-send me-1"></i>
                  Send Message
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Original Message (for replies) -->
    <div v-if="replyData" class="card mt-4">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-reply me-2"></i>
          Original Message
        </h6>
      </div>
      <div class="card-body">
        <div class="original-message">
          <div class="mb-2">
            <strong>From:</strong> {{ replyData.originalMessage?.senderName }}
            <span class="text-muted ms-2">&lt;{{ replyData.originalMessage?.senderEmail }}&gt;</span>
          </div>
          <div class="mb-2">
            <strong>Subject:</strong> {{ replyData.originalMessage?.subject }}
          </div>
          <hr>
          <div class="original-content">{{ replyData.originalMessage?.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import internalMailService from '../services/internalMailService';

export default {
  name: 'InternalEmailComposer',
  props: {
    userId: {
      type: String,
      required: true
    },
    replyData: {
      type: Object,
      default: null
    }
  },
  emits: ['message-sent', 'cancel'],
  setup(props, { emit }) {
    const toast = useToast();
    const isSending = ref(false);
    const templates = ref([]);
    const selectedTemplateId = ref('');
    const availableUsers = ref([]);
    const selectedRecipientId = ref('');
    
    const messageForm = ref({
      subject: '',
      content: ''
    });

    // Load templates
    const loadTemplates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'email_templates'));
        const templatesList = [];
        
        querySnapshot.forEach((doc) => {
          templatesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        templates.value = templatesList;
        console.log(`📧 Loaded ${templatesList.length} templates for internal messages`);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    // Load available users (only real Firebase users)
    const loadAvailableUsers = async () => {
      try {
        const result = await internalMailService.getAllUsers();

        if (result.success && result.users.length > 0) {
          // Filter out current user and only use Firebase users
          availableUsers.value = result.users.filter(user => user.id !== props.userId);
          console.log(`📧 Loaded ${availableUsers.value.length} real users from Firebase`);
        } else {
          console.log('📧 No users found in Firebase');
          availableUsers.value = [];
          toast.warning('No other users found in the system. Please ask an administrator to create user accounts.');
        }

      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users from database');
        availableUsers.value = [];
      }
    };

    // Apply template
    const applyTemplate = () => {
      if (selectedTemplateId.value) {
        const template = templates.value.find(t => t.id === selectedTemplateId.value);
        if (template) {
          messageForm.value.subject = template.subject || '';
          messageForm.value.content = template.content || '';
          toast.success(`Template "${template.name}" applied`);
          console.log('📧 Template applied:', template.name);
        }
      }
    };

    // Send internal message
    const sendInternalMessage = async () => {
      console.log('📧 Send message triggered');
      console.log('📧 Selected recipient ID:', selectedRecipientId.value);
      console.log('📧 Available users:', availableUsers.value.length);
      console.log('📧 Form data:', messageForm.value);

      // Validate form data
      if (!selectedRecipientId.value || selectedRecipientId.value === '') {
        console.log('📧 Validation failed: No recipient selected');
        toast.error('Please select a recipient');
        return;
      }

      if (!messageForm.value.subject || messageForm.value.subject.trim() === '') {
        toast.error('Please enter a subject');
        return;
      }

      if (!messageForm.value.content || messageForm.value.content.trim() === '') {
        toast.error('Please enter a message');
        return;
      }

      isSending.value = true;
      try {
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        // Get recipient info
        const recipient = availableUsers.value.find(user => user.id === selectedRecipientId.value);
        if (!recipient) {
          toast.error('Selected recipient not found');
          isSending.value = false;
          return;
        }

        console.log('📧 Sending message with data:', {
          fromUserId: props.userId || currentUser.id,
          toUserId: selectedRecipientId.value,
          subject: messageForm.value.subject,
          recipientName: recipient.displayName
        });

        // Send message with correct parameters
        const result = await internalMailService.sendInternalMessage(
          props.userId || currentUser.id,
          selectedRecipientId.value,
          messageForm.value.subject.trim(),
          messageForm.value.content.trim(),
          'normal'
        );

        if (result.success) {
          toast.success('Internal message sent successfully!');
          emit('message-sent', {
            to: recipient.displayName,
            subject: messageForm.value.subject,
            messageId: result.messageId,
            userId: props.userId,
            type: 'internal'
          });
          clearForm();
        } else {
          toast.error('Failed to send message: ' + result.error);
        }
      } catch (error) {
        console.error('Error sending internal message:', error);
        toast.error('Failed to send message: ' + error.message);
      } finally {
        isSending.value = false;
      }
    };

    // Clear form
    const clearForm = () => {
      messageForm.value = {
        subject: '',
        content: ''
      };
      selectedRecipientId.value = '';
      selectedTemplateId.value = '';
      
      toast.info('Form cleared');
    };

    // Setup reply data
    const setupReplyData = () => {
      if (props.replyData) {
        selectedRecipientId.value = props.replyData.fromUserId || '';
        messageForm.value.subject = props.replyData.subject || '';
        
        // Add reply content template
        if (props.replyData.originalMessage) {
          messageForm.value.content = `\n\n--- Original Message ---\nFrom: ${props.replyData.originalMessage.senderName}\nDate: ${new Date(props.replyData.originalMessage.sentAt).toLocaleString()}\nSubject: ${props.replyData.originalMessage.subject}\n\n${props.replyData.originalMessage.content}`;
        }
      }
    };

    // Watch for reply data changes
    watch(() => props.replyData, () => {
      setupReplyData();
    }, { immediate: true });

    // Initialize
    onMounted(() => {
      loadTemplates();
      loadAvailableUsers();
      setupReplyData();
    });

    return {
      isSending,
      templates,
      selectedTemplateId,
      availableUsers,
      selectedRecipientId,
      messageForm,
      applyTemplate,
      sendInternalMessage,
      clearForm
    };
  }
};
</script>

<style scoped>
.internal-email-composer {
  max-width: 100%;
}

.card {
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.original-message {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.original-content {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
