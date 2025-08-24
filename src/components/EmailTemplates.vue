<template>
  <div class="email-templates">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>
        <i class="bi bi-file-earmark-text me-2"></i>
        Email Templates
      </h3>
      <button 
        class="btn btn-primary"
        @click="showCreateTemplate"
      >
        <i class="bi bi-plus-lg me-1"></i>
        Create Template
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading templates...</p>
    </div>

    <!-- Templates Grid -->
    <div v-else-if="templates.length > 0" class="row">
      <div v-for="template in templates" :key="template.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ template.name }}</h6>
            <span class="badge" :class="getCategoryBadgeClass(template.category)">
              {{ template.category }}
            </span>
          </div>
          <div class="card-body">
            <p class="card-text text-muted small">{{ template.description }}</p>
            <p class="card-text">
              <strong>Subject:</strong> {{ template.subject }}
            </p>
            <div class="template-preview">
              <small class="text-muted">Preview:</small>
              <div class="border rounded p-2 mt-1 bg-light" style="max-height: 100px; overflow-y: auto;">
                <small v-html="getTemplatePreview(template.content)"></small>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="btn-group w-100">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="useTemplate(template)"
                title="Use Template"
              >
                <i class="bi bi-envelope"></i> Use
              </button>
              <button 
                class="btn btn-outline-secondary btn-sm"
                @click="editTemplate(template)"
                title="Edit Template"
              >
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button 
                class="btn btn-outline-danger btn-sm"
                @click="deleteTemplate(template)"
                title="Delete Template"
              >
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Templates State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-file-earmark-text display-1 text-muted"></i>
      <h4 class="text-muted mt-3">No Email Templates</h4>
      <p class="text-muted">Create your first email template to get started.</p>
      <button class="btn btn-primary" @click="showCreateTemplate">
        <i class="bi bi-plus-lg me-1"></i>
        Create Template
      </button>
    </div>

    <!-- Create/Edit Template Modal -->
    <div class="modal fade" id="templateModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingTemplate ? 'Edit Template' : 'Create Template' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTemplate">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Template Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="templateForm.name"
                      required
                      placeholder="e.g., Welcome Email"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Category</label>
                    <select class="form-select" v-model="templateForm.category">
                      <option value="general">General</option>
                      <option value="welcome">Welcome</option>
                      <option value="notification">Notification</option>
                      <option value="reminder">Reminder</option>
                      <option value="health">Health</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Description</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="templateForm.description"
                  placeholder="Brief description of this template"
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Subject Line *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="templateForm.subject"
                  required
                  placeholder="Email subject line"
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Email Content *</label>
                <textarea 
                  class="form-control" 
                  v-model="templateForm.content"
                  rows="10"
                  required
                  placeholder="Email content (HTML supported)"
                ></textarea>
                <div class="form-text">
                  You can use HTML tags for formatting. Use placeholders like [Name], [Date] for dynamic content.
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveTemplate">
              {{ editingTemplate ? 'Update Template' : 'Create Template' }}
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
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'EmailTemplates',
  emits: ['use-template'],
  setup(props, { emit }) {
    const toast = useToast();
    const isLoading = ref(false);
    const templates = ref([]);
    const editingTemplate = ref(null);
    
    const templateForm = ref({
      name: '',
      description: '',
      subject: '',
      content: '',
      category: 'general'
    });

    // Load templates
    const loadTemplates = async () => {
      isLoading.value = true;
      try {
        const querySnapshot = await getDocs(collection(db, 'email_templates'));
        const templatesList = [];

        querySnapshot.forEach((doc) => {
          templatesList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // If no templates exist, create some default ones
        if (templatesList.length === 0) {
          await createDefaultTemplates();
          // Reload after creating defaults
          const newQuerySnapshot = await getDocs(collection(db, 'email_templates'));
          newQuerySnapshot.forEach((doc) => {
            templatesList.push({
              id: doc.id,
              ...doc.data()
            });
          });
        }

        templates.value = templatesList;
        console.log(`📧 Loaded ${templatesList.length} email templates`);
      } catch (error) {
        console.error('Error loading templates:', error);
        // If Firebase fails, use local templates
        templates.value = getDefaultTemplates();
        console.log('📧 Using default templates due to Firebase error');
      } finally {
        isLoading.value = false;
      }
    };

    // Show create template modal
    const showCreateTemplate = () => {
      editingTemplate.value = null;
      templateForm.value = {
        name: '',
        description: '',
        subject: '',
        content: '',
        category: 'general'
      };

      // Clean up any existing backdrop first
      const existingBackdrops = document.querySelectorAll('.modal-backdrop');
      existingBackdrops.forEach(backdrop => backdrop.remove());

      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Use setTimeout to ensure DOM is fully ready
      setTimeout(() => {
        const modalElement = document.getElementById('templateModal');
        if (modalElement) {
          try {
            if (typeof window.bootstrap !== 'undefined') {
              // Dispose existing modal instance if any
              const existingModal = window.bootstrap.Modal.getInstance(modalElement);
              if (existingModal) {
                existingModal.dispose();
              }

              // Create new modal instance with proper options
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

              // Show modal
              modal.show();

              console.log('📧 Template modal opened successfully');
            } else {
              console.error('Bootstrap not available');
              toast.error('Bootstrap library not loaded');
            }
          } catch (error) {
            console.error('Error opening template modal:', error);
            toast.error('Failed to open template dialog: ' + error.message);
          }
        } else {
          console.error('Template modal not found');
          toast.error('Template dialog not found');
        }
      }, 100);
    };

    // Use template
    const useTemplate = (template) => {
      console.log('📧 Using template:', template.name);
      emit('use-template', template);
      toast.success(`Template "${template.name}" selected for use`);
    };

    // Edit template
    const editTemplate = (template) => {
      editingTemplate.value = template;
      templateForm.value = {
        name: template.name,
        description: template.description || '',
        subject: template.subject,
        content: template.content,
        category: template.category || 'general'
      };

      // Clean up any existing backdrop first
      const existingBackdrops = document.querySelectorAll('.modal-backdrop');
      existingBackdrops.forEach(backdrop => backdrop.remove());

      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      setTimeout(() => {
        const modalElement = document.getElementById('templateModal');
        if (modalElement) {
          try {
            if (typeof window.bootstrap !== 'undefined') {
              // Dispose existing modal instance if any
              const existingModal = window.bootstrap.Modal.getInstance(modalElement);
              if (existingModal) {
                existingModal.dispose();
              }

              // Create new modal instance
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
              console.log('📧 Edit template modal opened successfully');
            } else {
              console.error('Bootstrap not available');
              toast.error('Bootstrap library not loaded');
            }
          } catch (error) {
            console.error('Error opening template modal:', error);
            toast.error('Failed to open template dialog: ' + error.message);
          }
        }
      }, 100);
    };

    // Save template
    const saveTemplate = async () => {
      try {
        // Validate form
        if (!templateForm.value.name || !templateForm.value.subject || !templateForm.value.content) {
          toast.error('Please fill in all required fields');
          return;
        }

        const templateData = {
          ...templateForm.value,
          updatedAt: serverTimestamp()
        };

        if (editingTemplate.value) {
          // Update existing template
          await updateDoc(doc(db, 'email_templates', editingTemplate.value.id), templateData);
          toast.success('Template updated successfully');
        } else {
          // Create new template
          templateData.createdAt = serverTimestamp();
          await addDoc(collection(db, 'email_templates'), templateData);
          toast.success('Template created successfully');
        }

        // Close modal and reload templates
        const modalElement = document.getElementById('templateModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        // Reset form
        editingTemplate.value = null;
        templateForm.value = {
          name: '',
          description: '',
          subject: '',
          content: '',
          category: 'general'
        };

        loadTemplates();
      } catch (error) {
        console.error('Error saving template:', error);
        toast.error('Failed to save template: ' + error.message);
      }
    };

    // Delete template
    const deleteTemplate = async (template) => {
      if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
        try {
          await deleteDoc(doc(db, 'email_templates', template.id));
          toast.success('Template deleted successfully');
          loadTemplates();
        } catch (error) {
          console.error('Error deleting template:', error);
          toast.error('Failed to delete template');
        }
      }
    };

    // Get category badge class
    const getCategoryBadgeClass = (category) => {
      const classes = {
        general: 'bg-secondary',
        welcome: 'bg-success',
        notification: 'bg-info',
        reminder: 'bg-warning',
        health: 'bg-danger',
        service: 'bg-primary'
      };
      return classes[category] || 'bg-secondary';
    };

    // Get default templates
    const getDefaultTemplates = () => {
      return [
        {
          id: 'default-1',
          name: 'Welcome Email',
          description: 'Welcome new users to Evergreen Way',
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
<p>Best regards,<br>The Evergreen Way Team</p>`,
          category: 'welcome',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'default-2',
          name: 'Appointment Reminder',
          description: 'Remind users about upcoming appointments',
          subject: 'Appointment Reminder - [Date] at [Time]',
          content: `<p>Dear [Name],</p>
<p>This is a friendly reminder about your upcoming appointment:</p>
<p><strong>Details:</strong></p>
<ul>
<li>Service: [Service Type]</li>
<li>Date: [Date]</li>
<li>Time: [Time]</li>
<li>Location: [Location]</li>
</ul>
<p>Please let us know if you need to reschedule or have any questions.</p>
<p>Best regards,<br>The Evergreen Way Team</p>`,
          category: 'reminder',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'default-3',
          name: 'Health Check Follow-up',
          description: 'Follow up after health services',
          subject: 'Health Check Follow-up',
          content: `<p>Dear [Name],</p>
<p>We hope you're feeling well after your recent health check.</p>
<p>This is a follow-up to ensure you have everything you need:</p>
<ul>
<li>Do you have any questions about your results?</li>
<li>Are you following the recommended care plan?</li>
<li>Do you need any additional support?</li>
</ul>
<p>Please don't hesitate to reach out if you need assistance.</p>
<p>Best regards,<br>Your Healthcare Team</p>`,
          category: 'health',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'default-4',
          name: 'Service Feedback Request',
          description: 'Request feedback on services provided',
          subject: 'How was your experience with our services?',
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
<p>Best regards,<br>The Evergreen Way Team</p>`,
          category: 'service',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    };

    // Create default templates in Firebase
    const createDefaultTemplates = async () => {
      try {
        const defaultTemplates = getDefaultTemplates();
        for (const template of defaultTemplates) {
          const { id, ...templateData } = template;
          await addDoc(collection(db, 'email_templates'), {
            ...templateData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        console.log('📧 Created default email templates');
      } catch (error) {
        console.error('Error creating default templates:', error);
      }
    };

    // Helper methods
    const getTemplatePreview = (content) => {
      if (!content) return '';
      // Remove HTML tags for preview but keep line breaks
      const textContent = content.replace(/<[^>]*>/g, '').replace(/\n/g, '<br>');
      return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
    };

    // Initialize
    onMounted(() => {
      loadTemplates();

      // Add modal close event listener to reset form
      const modalElement = document.getElementById('templateModal');
      if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
          editingTemplate.value = null;
          templateForm.value = {
            name: '',
            description: '',
            subject: '',
            content: '',
            category: 'general'
          };
        });
      }
    });

    return {
      isLoading,
      templates,
      editingTemplate,
      templateForm,
      showCreateTemplate,
      editTemplate,
      saveTemplate,
      useTemplate,
      deleteTemplate,
      getCategoryBadgeClass,
      getTemplatePreview
    };
  }
};
</script>

<style scoped>
.email-templates {
  max-width: 100%;
}

.template-preview {
  margin-top: 1rem;
}

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.75em;
}
</style>
