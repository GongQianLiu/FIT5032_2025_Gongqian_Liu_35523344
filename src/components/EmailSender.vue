<template>
  <div class="email-sender">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-envelope-fill me-2"></i>
          Send Email
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSendEmail">
          <div class="mb-3">
            <label for="to" class="form-label">Recipient Email</label>
            <input
              type="email"
              class="form-control"
              id="to"
              v-model="formData.to"
              required
              placeholder="Enter recipient email"
            />
          </div>

          <div class="mb-3">
            <label for="subject" class="form-label">Email Subject</label>
            <input
              type="text"
              class="form-control"
              id="subject"
              v-model="formData.subject"
              required
              placeholder="Enter email subject"
            />
          </div>

          <div class="mb-3">
            <label for="content" class="form-label">Email Content</label>
            <textarea
              class="form-control"
              id="content"
              v-model="formData.content"
              rows="5"
              required
              placeholder="Enter email content"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="attachment" class="form-label">Attachment</label>
            <input
              type="file"
              class="form-control"
              id="attachment"
              @change="handleFileChange"
              ref="fileInput"
            />
            <div class="form-text">Supports all common file formats, max 10MB</div>
          </div>

          <div v-if="selectedFile" class="mb-3">
            <div class="alert alert-info">
              <i class="bi bi-file-earmark me-2"></i>
              Selected file: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              <button
                type="button"
                class="btn btn-sm btn-outline-danger ms-2"
                @click="removeFile"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-send me-2"></i>
              {{ isLoading ? 'Sending...' : 'Send Email' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import emailService from '../services/emailService';

export default {
  name: 'EmailSender',
  setup() {
    const toast = useToast();
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const fileInput = ref(null);

    const formData = ref({
      to: '',
      subject: '',
      content: ''
    });

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        // 检查文件大小 (10MB限制)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('文件大小不能超过10MB');
          event.target.value = '';
          return;
        }
        selectedFile.value = file;
      }
    };

    const removeFile = () => {
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSendEmail = async () => {
      try {
        isLoading.value = true;

        if (selectedFile.value) {
          // 发送带附件的邮件
          await emailService.sendEmailWithAttachment(
            formData.value.to,
            formData.value.subject,
            formData.value.content,
            selectedFile.value
          );

          toast.success('Email sent successfully!');
          // Reset form
          formData.value = { to: '', subject: '', content: '' };
          removeFile();
        } else {
          // Send regular email
          await emailService.sendCustomEmail(
            formData.value.to,
            formData.value.subject,
            formData.value.content
          );

          toast.success('Email sent successfully!');
          // Reset form
          formData.value = { to: '', subject: '', content: '' };
        }
      } catch (error) {
        console.error('Email sending error:', error);
        toast.error('Failed to send email. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };

    return {
      formData,
      isLoading,
      selectedFile,
      fileInput,
      handleFileChange,
      removeFile,
      formatFileSize,
      handleSendEmail
    };
  }
};
</script>

<style scoped>
.email-sender {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 1rem 1.5rem;
}

.card-header h5 {
  margin: 0;
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.alert {
  border-radius: 6px;
  padding: 0.75rem 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%);
}

.btn-primary:disabled {
  background: #6c757d;
  opacity: 0.65;
}
</style>
