<template>
  <div class="page-container">
    <!-- Enhanced Navbar -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link to="/data-management" class="navbar-brand">
          <i class="bi bi-database-fill me-2"></i>
          <span class="brand-text">Evergreen Way</span>
          <small class="brand-subtitle">Data Management</small>
        </router-link>
        
        <div class="d-flex align-items-center gap-2">
          <router-link to="/admin-dashboard" class="btn btn-outline-light">
            <i class="bi bi-arrow-left"></i> Back
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container-fluid">
        <!-- Enhanced Page Header -->
        <div class="page-header">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="header-content">
                <h1 class="page-title">
                  <i class="bi bi-database-gear me-3"></i>
                  Data Management Center
                </h1>
                <p class="page-description">
                  Comprehensive data management with advanced search, filtering, and export capabilities
                </p>
              </div>
            </div>
            <div class="col-md-4 text-end">
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ totalTasks }}</span>
                  <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ totalUsers }}</span>
                  <span class="stat-label">Total Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="quick-actions-panel mb-4">
          <div class="row">
            <div class="col-md-3">
              <div class="action-card" @click="focusTaskTable">
                <div class="action-icon">
                  <i class="bi bi-list-task"></i>
                </div>
                <div class="action-content">
                  <h6>Task Management</h6>
                  <p>View and manage all tasks</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="focusUserTable">
                <div class="action-icon">
                  <i class="bi bi-people"></i>
                </div>
                <div class="action-content">
                  <h6>User Management</h6>
                  <p>View and manage all users</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="exportTasksCSV">
                <div class="action-icon">
                  <i class="bi bi-download"></i>
                </div>
                <div class="action-content">
                  <h6>Export Data</h6>
                  <p>Export data in various formats</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="action-card" @click="showAnalytics">
                <div class="action-icon">
                  <i class="bi bi-graph-up"></i>
                </div>
                <div class="action-content">
                  <h6>Analytics</h6>
                  <p>View data insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Task Data Table -->
        <div class="data-section mb-5" id="task-section">
          <div class="enhanced-card">
            <div class="card-header">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h3 class="mb-0">
                    <i class="bi bi-list-task me-2"></i>
                    Task Data Management
                  </h3>
                </div>
                <div class="col-md-6 text-end">
                  <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" @click="exportTasksCSV" :disabled="isExporting">
                      <i class="bi bi-file-earmark-text me-1"></i> CSV
                    </button>
                    <button class="btn btn-outline-success" @click="exportTasksPDF" :disabled="isExporting">
                      <i class="bi bi-file-earmark-pdf me-1"></i> PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <DataTable
                :data="tasksData"
                :columns="taskColumns"
                :filterColumns="taskFilterColumns"
              />
            </div>
          </div>
        </div>

        <!-- Enhanced User Data Table -->
        <div class="data-section" id="user-section">
          <div class="enhanced-card">
            <div class="card-header">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h3 class="mb-0">
                    <i class="bi bi-people-fill me-2"></i>
                    User Data Management
                  </h3>
                </div>
                <div class="col-md-6 text-end">
                  <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" @click="exportUsersCSV" :disabled="isExporting">
                      <i class="bi bi-file-earmark-text me-1"></i> CSV
                    </button>
                    <button class="btn btn-outline-success" @click="exportUsersPDF" :disabled="isExporting">
                      <i class="bi bi-file-earmark-pdf me-1"></i> PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <DataTable
                :data="usersData"
                :columns="userColumns"
                :filterColumns="userFilterColumns"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import DataTable from '../components/DataTable.vue';
import taskService from '../services/taskService.js';
import userService from '../services/userService.js';
import exportService from '../utils/exportService.js';

export default {
  name: 'DataManagement',
  components: {
    DataTable
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    
    // Data state
    const tasksData = ref([]);
    const usersData = ref([]);
    const isLoading = ref(false);
    const isExporting = ref(false);
    
    // Computed properties
    const totalTasks = computed(() => tasksData.value.length);
    const totalUsers = computed(() => usersData.value.length);

    // Table configurations
    const taskColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'requesterName', label: 'Requester', sortable: true },
      { key: 'volunteerName', label: 'Volunteer', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true }
    ];

    const taskFilterColumns = [
      { key: 'status', label: 'Status' },
      { key: 'requesterName', label: 'Requester' },
      { key: 'volunteerName', label: 'Volunteer' }
    ];

    const userColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'username', label: 'Username', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'phone', label: 'Phone', sortable: true },
      { key: 'createdAt', label: 'Joined', sortable: true }
    ];

    const userFilterColumns = [
      { key: 'role', label: 'Role' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' }
    ];

    // Data loading
    const loadData = async () => {
      isLoading.value = true;
      try {
        // Load real data from Firebase
        const [tasks, users] = await Promise.all([
          taskService.getAllTasks(),
          userService.getAllUsers()
        ]);

        tasksData.value = tasks;
        usersData.value = users;
        toast.success('Data loaded successfully');
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // Navigation methods
    const focusTaskTable = () => {
      document.getElementById('task-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const focusUserTable = () => {
      document.getElementById('user-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const showAnalytics = () => {
      toast.info('Analytics feature coming soon!');
    };

    // Export functions
    const exportTasksCSV = () => {
      isExporting.value = true;
      try {
        exportService.csv.exportTasks(tasksData.value);
        toast.success('Tasks exported as CSV successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export tasks as CSV');
      } finally {
        isExporting.value = false;
      }
    };

    const exportTasksPDF = async () => {
      isExporting.value = true;
      try {
        const result = await exportService.pdf.exportTasksPDF(tasksData.value);
        if (result.success) {
          toast.success('Tasks exported as PDF successfully');
        } else {
          toast.error('Failed to export tasks as PDF');
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export tasks as PDF');
      } finally {
        isExporting.value = false;
      }
    };

    const exportUsersCSV = () => {
      isExporting.value = true;
      try {
        exportService.csv.exportUsers(usersData.value);
        toast.success('Users exported as CSV successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export users as CSV');
      } finally {
        isExporting.value = false;
      }
    };

    const exportUsersPDF = async () => {
      isExporting.value = true;
      try {
        const result = await exportService.pdf.exportUsersPDF(usersData.value);
        if (result.success) {
          toast.success('Users exported as PDF successfully');
        } else {
          toast.error('Failed to export users as PDF');
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export users as PDF');
      } finally {
        isExporting.value = false;
      }
    };

    const handleLogout = () => {
      router.push('/login');
    };

    // Initialize
    onMounted(() => {
      loadData();
    });

    return {
      // Data
      tasksData,
      usersData,
      isLoading,
      isExporting,
      totalTasks,
      totalUsers,
      
      // Table configuration
      taskColumns,
      taskSearchableColumns,
      userColumns,
      userSearchableColumns,
      
      // Methods
      focusTaskTable,
      focusUserTable,
      showAnalytics,
      exportTasksCSV,
      exportTasksPDF,
      exportUsersCSV,
      exportUsersPDF,
      handleLogout
    };
  }
};
</script>

<style scoped>
/* Page Layout */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Enhanced Navbar */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

.navbar-brand {
  color: white !important;
  font-weight: 700;
  font-size: 1.5rem;
  text-decoration: none;
}

.brand-text {
  display: block;
  line-height: 1.2;
}

.brand-subtitle {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  opacity: 0.9;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 0;
}

/* Enhanced Page Header */
.page-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}

.header-content {
  text-align: left;
}

.page-title {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
}

.header-stats {
  display: flex;
  gap: 2rem;
  justify-content: flex-end;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  min-width: 100px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* Quick Actions Panel */
.quick-actions-panel {
  margin-bottom: 2rem;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  height: 100%;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
  transition: color 0.3s ease;
}

.action-card:hover .action-icon {
  color: white;
}

.action-content h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Enhanced Cards */
.enhanced-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  overflow: hidden;
  margin-bottom: 2rem;
}

.enhanced-card .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem;
  border-radius: 0;
}

.enhanced-card .card-header h3 {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

/* Buttons */
.btn {
  border-radius: 10px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-outline-primary {
  border-color: #667eea;
  color: #667eea;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-stats {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .stat-item {
    min-width: auto;
  }

  .action-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .navbar-brand {
    font-size: 1.2rem;
  }
}
</style>
