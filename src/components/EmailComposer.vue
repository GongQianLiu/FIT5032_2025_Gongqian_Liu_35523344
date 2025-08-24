<template>
  <div class="email-composer">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-envelope-plus me-2"></i>
          Compose Email
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="sendEmail">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">To *</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="emailForm.to"
                  required
                  placeholder="recipient@example.com"
                >
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label">Template</label>
                <select class="form-select" v-model="selectedTemplate" @change="applyTemplate">
                  <option value="">Select a template...</option>
                  <option v-for="template in templates" :key="template.id" :value="template">
                    {{ template.name }} ({{ template.category }})
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
              rows="10"
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

    <!-- Quick Templates -->
    <div class="card mt-4">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-lightning me-2"></i>
          Quick Templates
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-2">
            <button class="btn btn-outline-primary btn-sm w-100" @click="useQuickTemplate('welcome')">
              <i class="bi bi-hand-thumbs-up me-1"></i>
              Welcome
            </button>
          </div>
          <div class="col-md-4 mb-2">
            <button class="btn btn-outline-info btn-sm w-100" @click="useQuickTemplate('reminder')">
              <i class="bi bi-bell me-1"></i>
              Reminder
            </button>
          </div>
          <div class="col-md-4 mb-2">
            <button class="btn btn-outline-success btn-sm w-100" @click="useQuickTemplate('followup')">
              <i class="bi bi-arrow-repeat me-1"></i>
              Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import emailService from '../services/emailService';

export default {
  name: 'EmailComposer',
  emits: ['email-sent'],
  setup(props, { emit }) {
    const toast = useToast();
    const isSending = ref(false);
    const templates = ref([]);
    const selectedTemplate = ref('');
    const attachment = ref(null);
    
    const emailForm = ref({
      to: '',
      subject: '',
      content: ''
    });

    // Quick templates
    const quickTemplates = {
      welcome: {
        subject: 'Welcome to Evergreen Way Services',
        content: `<p>Dear [Name],</p>
<p>Welcome to Evergreen Way! We're delighted to have you as part of our community.</p>
<p>Our team is here to support you with various services including:</p>
<ul>
<li>Health and wellness support</li>
<li>Companionship services</li>
<li>Transportation assistance</li>
<li>Daily living support</li>
</ul>
<p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
<p>Best regards,<br>The Evergreen Way Team</p>`
      },
      reminder: {
        subject: 'Friendly Reminder - [Service/Appointment]',
        content: `<p>Dear [Name],</p>
<p>This is a friendly reminder about your upcoming [service/appointment] scheduled for [date] at [time].</p>
<p><strong>Details:</strong></p>
<ul>
<li>Service: [Service Type]</li>
<li>Date: [Date]</li>
<li>Time: [Time]</li>
<li>Location: [Location]</li>
</ul>
<p>Please let us know if you need to reschedule or have any questions.</p>
<p>Best regards,<br>The Evergreen Way Team</p>`
      },
      followup: {
        subject: 'Follow-up - How was your experience?',
        content: `<p>Dear [Name],</p>
<p>We hope you're doing well! We wanted to follow up on the recent service you received from our team.</p>
<p>Your feedback is important to us and helps us improve our services. Please let us know:</p>
<ul>
<li>How was your overall experience?</li>
<li>Was the service helpful?</li>
<li>Is there anything we could improve?</li>
<li>Do you need any additional support?</li>
</ul>
<p>Thank you for choosing Evergreen Way. We look forward to continuing to serve you.</p>
<p>Best regards,<br>The Evergreen Way Team</p>`
      }
    };

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
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    // Apply template
    const applyTemplate = () => {
      if (selectedTemplate.value && typeof selectedTemplate.value === 'object') {
        emailForm.value.subject = selectedTemplate.value.subject || '';
        emailForm.value.content = selectedTemplate.value.content || '';
        toast.success(`Template "${selectedTemplate.value.name}" applied`);
        console.log('📧 Template applied:', selectedTemplate.value.name);
      }
    };

    // Use quick template
    const useQuickTemplate = (templateKey) => {
      const template = quickTemplates[templateKey];
      if (template) {
        emailForm.value.subject = template.subject;
        emailForm.value.content = template.content;
        toast.success(`Quick template "${templateKey}" applied`);
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
      isSending.value = true;
      try {
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const senderInfo = {
          userId: currentUser.id,
          name: currentUser.displayName || currentUser.username || 'Unknown User'
        };

        // Prepare attachment data if exists
        let attachmentData = null;
        if (attachment.value) {
          // Convert file to base64 for email service
          const reader = new FileReader();
          attachmentData = await new Promise((resolve) => {
            reader.onload = () => {
              resolve({
                name: attachment.value.name,
                data: reader.result.split(',')[1], // Remove data:type;base64, prefix
                type: attachment.value.type,
                size: attachment.value.size
              });
            };
            reader.readAsDataURL(attachment.value);
          });
        }

        // Send email
        const result = await emailService.sendEmail(
          emailForm.value.to,
          emailForm.value.subject,
          emailForm.value.content,
          attachmentData,
          senderInfo
        );

        if (result.success) {
          toast.success('Email sent successfully!');
          emit('email-sent', {
            to: emailForm.value.to,
            subject: emailForm.value.subject,
            messageId: result.messageId
          });
          clearForm();
        } else {
          toast.error('Failed to send email: ' + result.message);
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
      selectedTemplate.value = '';
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      
      toast.info('Form cleared');
    };

    // Initialize
    onMounted(() => {
      loadTemplates();
    });

    return {
      isSending,
      templates,
      selectedTemplate,
      attachment,
      emailForm,
      applyTemplate,
      useQuickTemplate,
      handleFileUpload,
      formatFileSize,
      sendEmail,
      clearForm
    };
  }
};
</script>

<style scoped>
.email-composer {
  max-width: 100%;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-outline-primary:hover,
.btn-outline-info:hover,
.btn-outline-success:hover {
  transform: translateY(-1px);
}
</style>
