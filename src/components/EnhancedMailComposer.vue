<template>
  <div class="mail-composer">
    <div class="composer-header">
      <h5 class="mb-0">
        <i class="bi bi-envelope-plus me-2"></i>
        {{ isReply ? 'Reply' : 'Compose Message' }}
      </h5>
      <div class="composer-actions">
        <button class="btn btn-outline-secondary btn-sm me-2" @click="saveDraft">
          <i class="bi bi-save"></i> Save Draft
        </button>
        <button class="btn btn-outline-info btn-sm" @click="previewMessage">
          <i class="bi bi-eye"></i> Preview
        </button>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="composer-form">
      <!-- Recipient Selection -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-person me-1"></i>
          To:
        </label>
        <div class="recipient-input">
          <div class="btn-group me-2" role="group">
            <input 
              type="radio" 
              class="btn-check" 
              name="recipientType" 
              id="internal" 
              value="internal"
              v-model="recipientType"
            >
            <label class="btn btn-outline-primary" for="internal">
              <i class="bi bi-people"></i> Internal User
            </label>

            <input 
              type="radio" 
              class="btn-check" 
              name="recipientType" 
              id="external" 
              value="external"
              v-model="recipientType"
            >
            <label class="btn btn-outline-primary" for="external">
              <i class="bi bi-envelope"></i> External Email
            </label>
          </div>
        </div>

        <!-- Internal User Selection -->
        <div v-if="recipientType === 'internal'" class="mt-2">
          <select class="form-select" v-model="formData.toUserId" required>
            <option value="">Select a user...</option>
            <option v-for="user in systemUsers" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
        </div>

        <!-- External Email Input -->
        <div v-else class="mt-2">
          <input 
            type="email" 
            class="form-control" 
            v-model="formData.toEmail"
            placeholder="Enter email address..."
            required
          >
        </div>
      </div>

      <!-- Subject -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-chat-text me-1"></i>
          Subject:
        </label>
        <input 
          type="text" 
          class="form-control" 
          v-model="formData.subject"
          placeholder="Enter subject..."
          required
        >
      </div>

      <!-- Priority -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-flag me-1"></i>
          Priority:
        </label>
        <select class="form-select" v-model="formData.priority">
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
      </div>

      <!-- Message Content -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-card-text me-1"></i>
          Message:
        </label>
        <div class="editor-toolbar mb-2">
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-secondary" @click="formatText('bold')" title="Bold">
              <i class="bi bi-type-bold"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="formatText('italic')" title="Italic">
              <i class="bi bi-type-italic"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="formatText('underline')" title="Underline">
              <i class="bi bi-type-underline"></i>
            </button>
          </div>
          <div class="btn-group btn-group-sm ms-2" role="group">
            <button type="button" class="btn btn-outline-secondary" @click="insertList('ul')" title="Bullet List">
              <i class="bi bi-list-ul"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="insertList('ol')" title="Numbered List">
              <i class="bi bi-list-ol"></i>
            </button>
          </div>
        </div>
        <div 
          ref="contentEditor"
          class="form-control content-editor"
          contenteditable="true"
          @input="updateContent"
          @paste="handlePaste"
          style="min-height: 200px; max-height: 400px; overflow-y: auto;"
        ></div>
        <small class="form-text text-muted">
          You can use basic formatting. For external emails, formatting will be preserved.
        </small>
      </div>

      <!-- Attachment (for external emails only) -->
      <div v-if="recipientType === 'external'" class="mb-3">
        <label class="form-label">
          <i class="bi bi-paperclip me-1"></i>
          Attachment:
        </label>
        <input 
          type="file" 
          class="form-control" 
          @change="handleFileSelect"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        >
        <div v-if="selectedFile" class="mt-2">
          <div class="alert alert-info d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-file-earmark me-2"></i>
              {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </span>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Template Selection -->
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-file-text me-1"></i>
          Quick Templates:
        </label>
        <div class="template-buttons">
          <button 
            v-for="template in quickTemplates" 
            :key="template.id"
            type="button"
            class="btn btn-outline-secondary btn-sm me-2 mb-2"
            @click="applyTemplate(template)"
          >
            {{ template.name }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="composer-footer">
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-send me-2"></i>
          {{ isLoading ? 'Sending...' : 'Send Message' }}
        </button>
        <button type="button" class="btn btn-outline-secondary ms-2" @click="clearForm">
          <i class="bi bi-x-circle me-2"></i>
          Clear
        </button>
        <button type="button" class="btn btn-outline-info ms-2" @click="$emit('cancel')">
          <i class="bi bi-arrow-left me-2"></i>
          Cancel
        </button>
      </div>
    </form>

    <!-- Preview Modal -->
    <div class="modal fade" id="previewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Message Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="preview-content">
              <div class="mb-3">
                <strong>To:</strong> 
                {{ recipientType === 'internal' ? getSelectedUserName() : formData.toEmail }}
              </div>
              <div class="mb-3">
                <strong>Subject:</strong> {{ formData.subject }}
              </div>
              <div class="mb-3" v-if="formData.priority !== 'normal'">
                <strong>Priority:</strong> 
                <span class="badge" :class="getPriorityBadgeClass()">{{ formData.priority }}</span>
              </div>
              <div class="mb-3">
                <strong>Message:</strong>
                <div class="preview-message" v-html="formData.content"></div>
              </div>
              <div v-if="selectedFile" class="mb-3">
                <strong>Attachment:</strong> {{ selectedFile.name }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="sendFromPreview">
              <i class="bi bi-send me-2"></i>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../utils/authUtils';
import internalMailService from '../services/internalMailService';
import { Modal } from 'bootstrap';

export default {
  name: 'EnhancedMailComposer',
  props: {
    replyData: {
      type: Object,
      default: null
    }
  },
  emits: ['message-sent', 'cancel'],
  setup(props, { emit }) {
    const toast = useToast();
    const authStore = useAuthStore();
    
    // State
    const isLoading = ref(false);
    const recipientType = ref('internal');
    const selectedFile = ref(null);
    const contentEditor = ref(null);
    
    const formData = reactive({
      toUserId: '',
      toEmail: '',
      subject: '',
      content: '',
      priority: 'normal'
    });

    // Mock system users (in real app, fetch from Firebase)
    const systemUsers = ref([
      { id: 'user1', name: 'Dr. Sarah Johnson', role: 'Doctor' },
      { id: 'user2', name: 'Nurse Mary Wilson', role: 'Nurse' },
      { id: 'user3', name: 'Admin John Smith', role: 'Administrator' },
      { id: 'user4', name: 'Volunteer Lisa Brown', role: 'Volunteer' }
    ]);

    const quickTemplates = ref([
      {
        id: 1,
        name: 'Appointment Reminder',
        subject: 'Appointment Reminder',
        content: '<p>Dear [Name],</p><p>This is a reminder about your upcoming appointment on [Date] at [Time].</p><p>Please confirm your attendance.</p><p>Best regards,<br>Evergreen Way Team</p>'
      },
      {
        id: 2,
        name: 'Health Check Follow-up',
        subject: 'Health Check Follow-up',
        content: '<p>Dear [Name],</p><p>Following your recent health check, we wanted to follow up on your results and next steps.</p><p>Please contact us if you have any questions.</p><p>Best regards,<br>Healthcare Team</p>'
      },
      {
        id: 3,
        name: 'Service Information',
        subject: 'Service Information',
        content: '<p>Dear [Name],</p><p>We wanted to share information about our services that might be helpful for you.</p><p>Please let us know if you need any assistance.</p><p>Best regards,<br>Evergreen Way Team</p>'
      }
    ]);

    // Computed
    const isReply = computed(() => !!props.replyData);

    // Methods
    const initializeReply = () => {
      if (props.replyData) {
        recipientType.value = 'internal';
        formData.toUserId = props.replyData.to;
        formData.subject = props.replyData.subject;
        
        if (props.replyData.originalMessage) {
          const original = props.replyData.originalMessage;
          formData.content = `<br><br>--- Original Message ---<br><strong>From:</strong> ${original.fromUserId}<br><strong>Date:</strong> ${new Date(original.sentAt?.toDate()).toLocaleString()}<br><strong>Subject:</strong> ${original.subject}<br><br>${original.content}`;
        }
      }
    };

    const updateContent = () => {
      if (contentEditor.value) {
        formData.content = contentEditor.value.innerHTML;
      }
    };

    const formatText = (command) => {
      document.execCommand(command, false, null);
      updateContent();
    };

    const insertList = (type) => {
      document.execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList', false, null);
      updateContent();
    };

    const handlePaste = (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
      updateContent();
    };

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error('File size must be less than 10MB');
          return;
        }
        selectedFile.value = file;
      }
    };

    const removeFile = () => {
      selectedFile.value = null;
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const applyTemplate = (template) => {
      formData.subject = template.subject;
      if (contentEditor.value) {
        contentEditor.value.innerHTML = template.content;
        formData.content = template.content;
      }
    };

    const getSelectedUserName = () => {
      const user = systemUsers.value.find(u => u.id === formData.toUserId);
      return user ? `${user.name} (${user.role})` : '';
    };

    const getPriorityBadgeClass = () => {
      switch (formData.priority) {
        case 'high': return 'bg-danger';
        case 'low': return 'bg-secondary';
        default: return 'bg-primary';
      }
    };

    const validateForm = () => {
      if (recipientType.value === 'internal' && !formData.toUserId) {
        toast.error('Please select a recipient');
        return false;
      }
      if (recipientType.value === 'external' && !formData.toEmail) {
        toast.error('Please enter an email address');
        return false;
      }
      if (!formData.subject.trim()) {
        toast.error('Please enter a subject');
        return false;
      }
      if (!formData.content.trim()) {
        toast.error('Please enter a message');
        return false;
      }
      return true;
    };

    const sendMessage = async () => {
      if (!validateForm()) return;

      try {
        isLoading.value = true;

        const currentUser = authStore.getCurrentUser();
        if (!currentUser?.id) {
          toast.error('Please login first');
          return;
        }

        if (recipientType.value === 'internal') {
          // Send internal message
          await internalMailService.sendInternalMessage(
            currentUser.id,
            formData.toUserId,
            formData.subject,
            formData.content,
            formData.priority
          );
          toast.success('Internal message sent successfully!');
        } else {
          // Send external email
          const result = await internalMailService.sendExternalEmail(
            currentUser.id,
            formData.toEmail,
            formData.subject,
            formData.content,
            selectedFile.value
          );

          // Check if it was sent via mock mode
          if (result && result.mock) {
            toast.warning('Email sent in development mode (external email services unavailable)');
            console.log('Mock email details:', {
              to: formData.toEmail,
              subject: formData.subject,
              content: formData.content.substring(0, 100) + '...'
            });
          } else {
            toast.success('External email sent successfully!');
          }
        }

        emit('message-sent', {
          type: recipientType.value,
          recipient: recipientType.value === 'internal' ? formData.toUserId : formData.toEmail,
          subject: formData.subject
        });

        clearForm();
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const sendFromPreview = () => {
      const modal = Modal.getInstance(document.getElementById('previewModal'));
      modal.hide();
      sendMessage();
    };

    const previewMessage = () => {
      if (!validateForm()) return;
      
      const modal = new Modal(document.getElementById('previewModal'));
      modal.show();
    };

    const saveDraft = () => {
      // In a real app, save to Firebase
      toast.info('Draft saved locally');
    };

    const clearForm = () => {
      Object.assign(formData, {
        toUserId: '',
        toEmail: '',
        subject: '',
        content: '',
        priority: 'normal'
      });
      
      if (contentEditor.value) {
        contentEditor.value.innerHTML = '';
      }
      
      selectedFile.value = null;
      recipientType.value = 'internal';
    };

    // Lifecycle
    onMounted(() => {
      initializeReply();
      nextTick(() => {
        if (contentEditor.value && formData.content) {
          contentEditor.value.innerHTML = formData.content;
        }
      });
    });

    return {
      isLoading,
      recipientType,
      selectedFile,
      contentEditor,
      formData,
      systemUsers,
      quickTemplates,
      isReply,
      updateContent,
      formatText,
      insertList,
      handlePaste,
      handleFileSelect,
      removeFile,
      formatFileSize,
      applyTemplate,
      getSelectedUserName,
      getPriorityBadgeClass,
      sendMessage,
      sendFromPreview,
      previewMessage,
      saveDraft,
      clearForm
    };
  }
};
</script>

<style scoped>
.mail-composer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.composer-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.composer-form {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.recipient-input {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.editor-toolbar {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.content-editor {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-family: inherit;
  line-height: 1.5;
}

.content-editor:focus {
  outline: none;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.composer-footer {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: 1rem;
}

.preview-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

.preview-message {
  background: white;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .composer-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .composer-actions {
    display: flex;
    justify-content: center;
  }

  .recipient-input {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-group {
    margin-bottom: 0.5rem;
  }
}
</style>
