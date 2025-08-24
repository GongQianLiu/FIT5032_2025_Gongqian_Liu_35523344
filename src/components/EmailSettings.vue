<template>
  <div class="email-settings">
    <div class="row">
      <!-- Email Configuration -->
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-gear me-2"></i>
              Email Configuration
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveSettings">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Default From Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      v-model="settings.fromEmail"
                      placeholder="noreply@evergreenway.com"
                    >
                    <div class="form-text">
                      This email will be used as the sender for outgoing emails
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Default From Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="settings.fromName"
                      placeholder="Evergreen Way Team"
                    >
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email Signature</label>
                    <textarea 
                      class="form-control" 
                      v-model="settings.signature"
                      rows="4"
                      placeholder="Best regards,&#10;The Evergreen Way Team&#10;&#10;Contact us: support@evergreenway.com"
                    ></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Auto-reply Message</label>
                    <textarea 
                      class="form-control" 
                      v-model="settings.autoReply"
                      rows="4"
                      placeholder="Thank you for your email. We will respond within 24 hours."
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check mb-3">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      v-model="settings.enableAutoReply"
                      id="enableAutoReply"
                    >
                    <label class="form-check-label" for="enableAutoReply">
                      Enable Auto-reply
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check mb-3">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      v-model="settings.enableEmailLogging"
                      id="enableEmailLogging"
                    >
                    <label class="form-check-label" for="enableEmailLogging">
                      Enable Email Logging
                    </label>
                  </div>
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <span v-if="isSaving">
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </span>
                <span v-else>
                  <i class="bi bi-check-lg me-1"></i>
                  Save Settings
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Email Service Status -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-activity me-2"></i>
              Email Service Status
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <div class="text-center">
                  <div class="status-indicator" :class="serviceStatus.postmark ? 'status-success' : 'status-error'">
                    <i class="bi" :class="serviceStatus.postmark ? 'bi-check-circle' : 'bi-x-circle'"></i>
                  </div>
                  <h6 class="mt-2">Postmark API</h6>
                  <small class="text-muted">{{ serviceStatus.postmark ? 'Connected' : 'Disconnected' }}</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="status-indicator" :class="serviceStatus.firebase ? 'status-success' : 'status-warning'">
                    <i class="bi" :class="serviceStatus.firebase ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                  </div>
                  <h6 class="mt-2">Firebase Functions</h6>
                  <small class="text-muted">{{ serviceStatus.firebase ? 'Available' : 'Backup Only' }}</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="text-center">
                  <div class="status-indicator" :class="serviceStatus.logging ? 'status-success' : 'status-error'">
                    <i class="bi" :class="serviceStatus.logging ? 'bi-check-circle' : 'bi-x-circle'"></i>
                  </div>
                  <h6 class="mt-2">Email Logging</h6>
                  <small class="text-muted">{{ serviceStatus.logging ? 'Active' : 'Inactive' }}</small>
                </div>
              </div>
            </div>
            
            <div class="mt-3 text-center">
              <button class="btn btn-outline-primary btn-sm" @click="testEmailServices">
                <i class="bi bi-play-circle me-1"></i>
                Test Email Services
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-lightning me-2"></i>
              Quick Actions
            </h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="sendTestEmail">
                <i class="bi bi-envelope-check me-1"></i>
                Send Test Email
              </button>
              <button class="btn btn-outline-info btn-sm" @click="viewEmailLogs">
                <i class="bi bi-clock-history me-1"></i>
                View Email Logs
              </button>
              <button class="btn btn-outline-success btn-sm" @click="exportSettings">
                <i class="bi bi-download me-1"></i>
                Export Settings
              </button>
              <button class="btn btn-outline-warning btn-sm" @click="resetSettings">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        <!-- Email Statistics -->
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Email Statistics (Last 7 Days)
            </h6>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6">
                <h4 class="text-primary">{{ emailStats.total }}</h4>
                <small class="text-muted">Total Sent</small>
              </div>
              <div class="col-6">
                <h4 class="text-success">{{ emailStats.successRate }}%</h4>
                <small class="text-muted">Success Rate</small>
              </div>
            </div>
            <div class="row text-center mt-3">
              <div class="col-6">
                <h5 class="text-info">{{ emailStats.successful }}</h5>
                <small class="text-muted">Successful</small>
              </div>
              <div class="col-6">
                <h5 class="text-danger">{{ emailStats.failed }}</h5>
                <small class="text-muted">Failed</small>
              </div>
            </div>
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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { emailServiceTest } from '../utils/emailServiceTest';
import { emailLogService } from '../services/emailLogService';

export default {
  name: 'EmailSettings',
  emits: ['view-logs'],
  setup(props, { emit }) {
    const toast = useToast();
    const isSaving = ref(false);
    
    const settings = ref({
      fromEmail: 'noreply@evergreenway.com',
      fromName: 'Evergreen Way Team',
      signature: 'Best regards,\nThe Evergreen Way Team\n\nContact us: support@evergreenway.com',
      autoReply: 'Thank you for your email. We will respond within 24 hours.',
      enableAutoReply: false,
      enableEmailLogging: true
    });

    const serviceStatus = ref({
      postmark: false,
      firebase: false,
      logging: false
    });

    const emailStats = ref({
      total: 0,
      successful: 0,
      failed: 0,
      successRate: 0
    });

    // Load settings
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'system_settings', 'email_config'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          settings.value = { ...settings.value, ...data };
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    // Save settings
    const saveSettings = async () => {
      isSaving.value = true;
      try {
        await setDoc(doc(db, 'system_settings', 'email_config'), {
          ...settings.value,
          updatedAt: serverTimestamp()
        });
        toast.success('Settings saved successfully');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
      } finally {
        isSaving.value = false;
      }
    };

    // Test email services
    const testEmailServices = async () => {
      toast.info('Testing email services...');
      try {
        const results = await emailServiceTest.runFullEmailTest();
        
        serviceStatus.value = {
          postmark: results.postmark?.success || false,
          firebase: results.firebase?.success || false,
          logging: results.logging?.success || false
        };

        const workingServices = Object.values(serviceStatus.value).filter(Boolean).length;
        if (workingServices === 3) {
          toast.success('All email services are working!');
        } else if (workingServices > 0) {
          toast.warning(`${workingServices}/3 email services working`);
        } else {
          toast.error('No email services are working');
        }
      } catch (error) {
        toast.error('Failed to test email services');
      }
    };

    // Load email statistics
    const loadEmailStats = async () => {
      try {
        const result = await emailLogService.getEmailStats(7);
        if (result.success) {
          emailStats.value = result.stats;
        }
      } catch (error) {
        console.error('Error loading email stats:', error);
      }
    };

    // Send test email
    const sendTestEmail = () => {
      const email = prompt('Enter your email address to receive a test email:');
      if (email && email.includes('@')) {
        // This would integrate with the email service
        toast.info(`Test email would be sent to ${email}`);
      }
    };

    // View email logs
    const viewEmailLogs = () => {
      emit('view-logs');
    };

    // Export settings
    const exportSettings = () => {
      const dataStr = JSON.stringify(settings.value, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'email_settings.json';
      link.click();
      toast.success('Settings exported successfully');
    };

    // Reset settings
    const resetSettings = () => {
      if (confirm('Are you sure you want to reset all settings to default?')) {
        settings.value = {
          fromEmail: 'noreply@evergreenway.com',
          fromName: 'Evergreen Way Team',
          signature: 'Best regards,\nThe Evergreen Way Team\n\nContact us: support@evergreenway.com',
          autoReply: 'Thank you for your email. We will respond within 24 hours.',
          enableAutoReply: false,
          enableEmailLogging: true
        };
        toast.success('Settings reset to default');
      }
    };

    // Initialize
    onMounted(() => {
      loadSettings();
      loadEmailStats();
      testEmailServices();
    });

    return {
      isSaving,
      settings,
      serviceStatus,
      emailStats,
      saveSettings,
      testEmailServices,
      sendTestEmail,
      viewEmailLogs,
      exportSettings,
      resetSettings
    };
  }
};
</script>

<style scoped>
.status-indicator {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 24px;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-1px);
}
</style>
