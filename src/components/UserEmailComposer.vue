<template>
  <div class="user-email-composer">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="bi bi-pencil-square me-2"></i>
        {{ replyData ? 'Reply to Message' : 'Compose Email' }}
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
        <form @submit.prevent="sendEmail">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">Recipient Type *</label>
                <div class="btn-group w-100" role="group">
                  <input type="radio" class="btn-check" name="recipientType" id="internal" v-model="recipientType" value="internal">
                  <label class="btn btn-outline-primary" for="internal">Internal User</label>

                  <input type="radio" class="btn-check" name="recipientType" id="external" v-model="recipientType" value="external">
                  <label class="btn btn-outline-primary" for="external">External Email</label>
                </div>
              </div>

              <!-- Internal User Selection -->
              <div class="mb-3" v-if="recipientType === 'internal'">
                <label class="form-label">To (Internal User) *</label>
                <select
                  class="form-select"
                  v-model="selectedUserId"
                  required
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
              </div>

              <!-- External Email Input -->
              <div class="mb-3" v-if="recipientType === 'external'">
                <label class="form-label">To (External Email) *</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="emailForm.to"
                  :required="recipientType === 'external'"
                  placeholder="recipient@example.com"
                >
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
                <div class="form-text" v-if="templates.length === 0">
                  No templates available. Create templates in the Templates tab.
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Subject *</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="emailForm.subject"
              required
              placeholder="Email subject"
            >
          </div>
          
          <div class="mb-3">
            <label class="form-label">Message *</label>
            <textarea 
              class="form-control" 
              v-model="emailForm.content"
              rows="12"
              required
              placeholder="Email content (HTML supported)"
            ></textarea>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Attachment (Optional)</label>
            <input 
              type="file" 
              class="form-control" 
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            >
            <div class="form-text">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 5MB)
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              <small v-if="attachment">
                <i class="bi bi-paperclip me-1"></i>
                {{ attachment.name }} ({{ formatFileSize(attachment.size) }})
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
                  Send Email
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
          <div class="original-content" v-html="replyData.originalMessage?.content"></div>
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
import emailService from '../services/emailService';
import internalMailService from '../services/internalMailService';

export default {
  name: 'UserEmailComposer',
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
  emits: ['email-sent', 'cancel'],
  setup(props, { emit }) {
    const toast = useToast();

    // Initialize all reactive variables at the top
    const isSending = ref(false);
    const templates = ref([]);
    const selectedTemplateId = ref('');
    const attachment = ref(null);
    const recipientType = ref('internal');
    const selectedUserId = ref('');
    const availableUsers = ref([]);

    const emailForm = ref({
      to: '',
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
        console.log(`📧 Loaded ${templatesList.length} templates`);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    // Load available users for internal messaging
    const loadUsers = async () => {
      try {
        const result = await internalMailService.getAllUsers();
        if (result.success && result.users.length > 0) {
          // Filter out current user
          availableUsers.value = result.users.filter(user => user.id !== props.userId);
          console.log(`📧 Loaded ${availableUsers.value.length} users for internal messaging`);
        } else {
          console.log('📧 No users found for internal messaging');
          availableUsers.value = [];
        }
      } catch (error) {
        console.error('Error loading users:', error);
        availableUsers.value = [];
      }
    };

    // Apply template
    const applyTemplate = () => {
      if (selectedTemplateId.value) {
        const template = templates.value.find(t => t.id === selectedTemplateId.value);
        if (template) {
          emailForm.value.subject = template.subject || '';
          emailForm.value.content = template.content || '';
          toast.success(`Template "${template.name}" applied`);
          console.log('📧 Template applied:', template.name);
        }
      }
    };

    // Handle file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size must be less than 5MB');
          event.target.value = '';
          return;
        }
        
        attachment.value = file;
        toast.success(`File "${file.name}" attached`);
      }
    };

    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Send email
    const sendEmail = async () => {
      // Validate form
      if (recipientType.value === 'internal' && !selectedUserId.value) {
        toast.error('Please select a recipient');
        return;
      }
      if (recipientType.value === 'external' && !emailForm.value.to) {
        toast.error('Please enter recipient email');
        return;
      }
      if (!emailForm.value.subject.trim()) {
        toast.error('Please enter a subject');
        return;
      }
      if (!emailForm.value.content.trim()) {
        toast.error('Please enter message content');
        return;
      }

      isSending.value = true;
      try {
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        if (recipientType.value === 'internal') {
          // Send internal message
          const result = await internalMailService.sendInternalMessage(
            props.userId || currentUser.id,
            selectedUserId.value,
            emailForm.value.subject.trim(),
            emailForm.value.content.trim(),
            'normal'
          );

          if (result.success) {
            toast.success('Internal message sent successfully!');
            emit('email-sent', {
              type: 'internal',
              to: selectedUserId.value,
              subject: emailForm.value.subject,
              messageId: result.messageId
            });
            clearForm();
          } else {
            toast.error('Failed to send internal message');
          }
        } else {
          // Send external email
          const senderInfo = {
            userId: props.userId || currentUser.id,
            name: currentUser.displayName || currentUser.username || 'Unknown User',
            email: currentUser.email || 'noreply@evergreenway.com'
          };

          // Prepare attachment data if exists
          let attachmentData = null;
          if (attachment.value) {
            const reader = new FileReader();
            attachmentData = await new Promise((resolve) => {
              reader.onload = () => {
                resolve({
                  name: attachment.value.name,
                  data: reader.result.split(',')[1],
                  type: attachment.value.type,
                  size: attachment.value.size
                });
              };
              reader.readAsDataURL(attachment.value);
            });
          }

          // Send external email
          const result = await emailService.sendEmail(
            emailForm.value.to,
            emailForm.value.subject,
            emailForm.value.content,
            attachmentData,
            senderInfo
          );

          if (result.success) {
            toast.success('External email sent successfully!');
            emit('email-sent', {
              type: 'external',
              to: emailForm.value.to,
              subject: emailForm.value.subject,
              messageId: result.messageId,
              userId: props.userId
            });
            clearForm();
          } else {
            toast.error('Failed to send external email: ' + result.message);
          }
        }
      } catch (error) {
        console.error('Error sending email:', error);
        toast.error('Failed to send email: ' + error.message);
      } finally {
        isSending.value = false;
      }
    };

    // Clear form
    const clearForm = () => {
      emailForm.value = {
        to: '',
        subject: '',
        content: ''
      };
      attachment.value = null;
      selectedTemplateId.value = '';
      selectedUserId.value = '';
      recipientType.value = 'internal';
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      
      toast.info('Form cleared');
    };

    // Setup reply data
    const setupReplyData = () => {
      if (props.replyData) {
        emailForm.value.to = props.replyData.to || '';
        emailForm.value.subject = props.replyData.subject || '';
        
        // Add reply content template
        if (props.replyData.originalMessage) {
          emailForm.value.content = `\n\n--- Original Message ---\nFrom: ${props.replyData.originalMessage.senderName}\nDate: ${new Date(props.replyData.originalMessage.sentAt).toLocaleString()}\nSubject: ${props.replyData.originalMessage.subject}\n\n${props.replyData.originalMessage.content}`;
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
      loadUsers();
      setupReplyData();
    });

    return {
      isSending,
      templates,
      selectedTemplateId,
      attachment,
      emailForm,
      recipientType,
      selectedUserId,
      availableUsers,
      applyTemplate,
      handleFileUpload,
      formatFileSize,
      sendEmail,
      clearForm
    };
  }
};
</script>

<style scoped>
.user-email-composer {
  max-width: 100%;
}

.card {
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 15px;
}

.form-control:focus {
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
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
