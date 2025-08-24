<template>
  <div class="export-panel">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-download me-2"></i>
          Export Data
        </h5>
      </div>
      <div class="card-body">
        <!-- Data Type Selection -->
        <div class="mb-3">
          <label for="dataType" class="form-label">Select Data Type</label>
          <select 
            id="dataType" 
            class="form-select" 
            v-model="selectedDataType"
            @change="loadData"
          >
            <option value="">Choose data type...</option>
            <option value="users">Users</option>
            <option value="tasks">Tasks</option>
            <option value="healthServices">Health Services</option>
            <option value="events">Events</option>
            <option value="comprehensive">Comprehensive Report</option>
          </select>
        </div>

        <!-- Export Format Selection -->
        <div class="mb-3">
          <label class="form-label">Export Format</label>
          <div class="d-flex gap-2 flex-wrap">
            <button 
              v-for="format in availableFormats" 
              :key="format"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: selectedFormat === format }"
              @click="selectedFormat = format"
              :aria-label="`Export as ${format.toUpperCase()}`"
            >
              <i :class="getFormatIcon(format)"></i>
              {{ format.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Data Preview -->
        <div v-if="dataPreview.length > 0" class="mb-3">
          <h6>Data Preview ({{ dataPreview.length }} items)</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th v-for="header in dataHeaders" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dataPreview.slice(0, 5)" :key="index">
                  <td v-for="header in dataHeaders" :key="header">
                    {{ item[header] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
            <small class="text-muted">
              Showing first 5 items of {{ dataPreview.length }} total
            </small>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="d-flex gap-2">
          <button 
            class="btn btn-primary"
            @click="exportData"
            :disabled="!canExport"
            :aria-label="`Export ${selectedDataType} as ${selectedFormat}`"
          >
            <i class="bi bi-download me-1"></i>
            Export {{ selectedFormat.toUpperCase() }}
          </button>
          
          <button 
            class="btn btn-outline-secondary"
            @click="clearSelection"
            aria-label="Clear selection"
          >
            <i class="bi bi-x-circle me-1"></i>
            Clear
          </button>
        </div>

        <!-- Export History -->
        <div v-if="exportHistory.length > 0" class="mt-3">
          <h6>Recent Exports</h6>
          <div class="list-group list-group-flush">
            <div 
              v-for="(exportItem, index) in exportHistory.slice(0, 3)" 
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center py-2"
            >
              <div>
                <small class="text-muted">{{ exportItem.timestamp }}</small>
                <div>{{ exportItem.filename }}</div>
              </div>
              <span class="badge bg-success">{{ exportItem.format.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import exportService from '../utils/exportService.js';
import accessibility from '../utils/accessibility.js';
import taskService from '../services/taskService.js';
import userService from '../services/userService.js';

export default {
  name: 'ExportPanel',
  setup() {
    const toast = useToast();
    
    const selectedDataType = ref('');
    const selectedFormat = ref('csv');
    const dataPreview = ref([]);
    const dataHeaders = ref([]);
    const exportHistory = ref([]);

    const availableFormats = ['csv', 'pdf', 'excel', 'json'];

    const canExport = computed(() => {
      return selectedDataType.value && selectedFormat.value && dataPreview.value.length > 0;
    });

    const getFormatIcon = (format) => {
      const icons = {
        csv: 'bi bi-file-earmark-text',
        pdf: 'bi bi-file-earmark-pdf',
        excel: 'bi bi-file-earmark-spreadsheet',
        json: 'bi bi-file-earmark-code'
      };
      return icons[format] || 'bi bi-download';
    };

    const loadData = async () => {
      if (!selectedDataType.value) {
        dataPreview.value = [];
        dataHeaders.value = [];
        return;
      }

      try {
        // Load real data from Firebase
        let data = [];

        switch (selectedDataType.value) {
          case 'users':
            data = await userService.getAllUsers();
            break;
          case 'tasks':
            data = await taskService.getAllTasks();
            break;
          case 'healthServices':
            // For now, use empty array as we don't have health services service yet
            data = [];
            break;
          case 'events':
            // For now, use empty array as we don't have events service yet
            data = [];
            break;
          default:
            data = [];
        }

        dataPreview.value = data;
        dataHeaders.value = data.length > 0 ? Object.keys(data[0]) : [];

        // Announce to screen reader
        accessibility.screenReader.announce(
          `Loaded ${data.length} ${selectedDataType.value} for export`
        );

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data for export');
      }
    };

    const exportData = async () => {
      if (!canExport.value) return;

      try {
        const timestamp = new Date().toLocaleString();
        let result;

        switch (selectedFormat.value) {
          case 'csv':
            switch (selectedDataType.value) {
              case 'users':
                exportService.csv.exportUsers(dataPreview.value);
                break;
              case 'tasks':
                exportService.csv.exportTasks(dataPreview.value);
                break;
              case 'healthServices':
                exportService.csv.exportHealthServices(dataPreview.value);
                break;
              case 'events':
                exportService.csv.exportEvents(dataPreview.value);
                break;
            }
            result = { success: true };
            break;

          case 'pdf':
            switch (selectedDataType.value) {
              case 'users':
                result = await exportService.pdf.exportUsersPDF(dataPreview.value);
                break;
              case 'tasks':
                result = await exportService.pdf.exportTasksPDF(dataPreview.value);
                break;
              case 'healthServices':
                result = await exportService.pdf.exportHealthServicesPDF(dataPreview.value);
                break;
            }
            break;

          case 'excel':
            result = await exportService.excel.exportUsersExcel(dataPreview.value);
            break;

          case 'json':
            const report = await exportService.reports.generateComprehensiveReport({
              [selectedDataType.value]: dataPreview.value
            });
            result = { success: true };
            break;
        }

        if (result?.success) {
          const filename = `${selectedDataType.value}_${new Date().toISOString().split('T')[0]}.${selectedFormat.value}`;
          
          // Add to export history
          exportHistory.value.unshift({
            timestamp,
            filename,
            format: selectedFormat.value,
            dataType: selectedDataType.value
          });

          // Keep only last 10 exports
          if (exportHistory.value.length > 10) {
            exportHistory.value = exportHistory.value.slice(0, 10);
          }

          // Announce success
          exportService.accessibility.announceExport(selectedFormat.value, filename);
          toast.success(`Exported ${selectedDataType.value} as ${selectedFormat.value.toUpperCase()}`);

        } else {
          throw new Error(result?.error || 'Export failed');
        }

      } catch (error) {
        console.error('Export error:', error);
        toast.error(`Export failed: ${error.message}`);
      }
    };

    const clearSelection = () => {
      selectedDataType.value = '';
      selectedFormat.value = 'csv';
      dataPreview.value = [];
      dataHeaders.value = [];
    };

    onMounted(() => {
      // Initialize accessibility features
      accessibility.focusIndicators.addFocusIndicators();
    });

    return {
      selectedDataType,
      selectedFormat,
      dataPreview,
      dataHeaders,
      exportHistory,
      availableFormats,
      canExport,
      getFormatIcon,
      loadData,
      exportData,
      clearSelection
    };
  }
};
</script>

<style scoped>
.export-panel {
  max-width: 600px;
}

.btn.active {
  background-color: #007bff;
  color: white;
}

.list-group-item {
  border: none;
  padding: 0.5rem 0;
}

.list-group-item:not(:last-child) {
  border-bottom: 1px solid #dee2e6;
}

.table {
  font-size: 0.875rem;
}

.table th,
.table td {
  padding: 0.25rem;
  vertical-align: middle;
}

/* Accessibility improvements */
.btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }
  
  .table {
    border: 2px solid #000;
  }
  
  .table th,
  .table td {
    border: 1px solid #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .form-select {
    transition: none;
  }
}
</style>
