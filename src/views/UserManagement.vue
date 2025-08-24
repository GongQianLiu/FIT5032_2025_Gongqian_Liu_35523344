<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/admin-dashboard" class="navbar-brand">
          <i class="bi bi-shield-fill"></i>
          Evergreen Way - User Management
        </router-link>
        <div class="d-flex">
          <router-link to="/admin-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/admin-dashboard" class="btn btn-outline-light me-2">
            <i class="bi bi-speedometer2"></i>
            Dashboard
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="main-content">
      <div class="container-fluid">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1>User Management</h1>
              <p class="text-muted">Manage all user accounts in the system</p>
            </div>
            <div>
              <button class="btn btn-outline-info btn-sm me-2" @click="testFirebaseConnection">
                <i class="bi bi-wifi me-1"></i>
                Test Firebase
              </button>
              <button class="btn btn-outline-warning btn-sm me-2" @click="testEmailServices">
                <i class="bi bi-envelope-check me-1"></i>
                Test Email
              </button>
              <button class="btn btn-outline-success btn-sm me-2" @click="testPostmarkDirect">
                <i class="bi bi-send-check me-1"></i>
                Test Postmark
              </button>
              <button class="btn btn-success me-2" @click="exportUserData">
                <i class="bi bi-download"></i>
                Export Data
              </button>
              <button class="btn btn-primary" @click="showAddUserModal">
                <i class="bi bi-person-plus"></i>
                Add User
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-people"></i>
              User List ({{ users.length }})
            </h5>
          </div>
          <div class="card-body">
            <DataTable
              :data="users"
              :columns="userColumns"
              :filterColumns="userFilterColumns"
              @edit-user="editUser"
              @view-user="viewUser"
              @toggle-user-status="toggleUserStatus"
              @delete-user="deleteUser"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal fade" id="addUserModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i>
              Add New User
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNewUser">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Username *</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newUserForm.username"
                      required
                      placeholder="Enter username"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="newUserForm.email"
                      required
                      placeholder="Enter email"
                    >
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Display Name</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="newUserForm.displayName"
                      placeholder="Enter display name"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Password *</label>
                    <input
                      type="password"
                      class="form-control"
                      v-model="newUserForm.password"
                      required
                      placeholder="Enter password"
                    >
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select class="form-select" v-model="newUserForm.role">
                      <option value="elderly">Elderly</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="newUserForm.status">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveNewUser" :disabled="isSaving">
              <span v-if="isSaving">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </span>
              <span v-else>
                <i class="bi bi-check-lg me-1"></i>
                Create User
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import DataTable from '../components/DataTable.vue';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { testFirebaseConnection, createTestUsers, createTestTasks } from '../utils/firebaseTest';
import { emailServiceTest } from '../utils/emailServiceTest';
import { postmarkSetup } from '../utils/postmarkSetup';

export default {
  name: 'UserManagement',
  components: {
    DataTable
  },
  setup() {
    const router = useRouter();
    const toast = useToast();

    // DataTable配置
    const userColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'displayName', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true, formatter: 'role' },
      { key: 'createdAt', label: 'Registration Date', sortable: true, formatter: 'date' },
      { key: 'lastLoginAt', label: 'Last Login', sortable: true, formatter: 'date' },
      { key: 'status', label: 'Status', sortable: true, formatter: 'status' },
      { key: 'actions', label: 'Actions', sortable: false, formatter: 'userActions' }
    ];

    const userFilterColumns = [
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' }
    ];

    const users = ref([]);
    const isLoading = ref(false);
    const isSaving = ref(false);

    // New user form
    const newUserForm = ref({
      username: '',
      email: '',
      displayName: '',
      role: 'elderly',
      status: 'active',
      password: ''
    });

    // Load users from Firebase
    const loadUsers = async () => {
      try {
        isLoading.value = true;
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();

          // Safe date handling
          let createdAt = new Date();
          if (userData.createdAt) {
            if (typeof userData.createdAt.toDate === 'function') {
              createdAt = userData.createdAt.toDate();
            } else if (userData.createdAt instanceof Date) {
              createdAt = userData.createdAt;
            } else if (typeof userData.createdAt === 'string') {
              createdAt = new Date(userData.createdAt);
            }
          }

          let lastLoginAt = null;
          if (userData.lastLoginAt) {
            if (typeof userData.lastLoginAt.toDate === 'function') {
              lastLoginAt = userData.lastLoginAt.toDate();
            } else if (userData.lastLoginAt instanceof Date) {
              lastLoginAt = userData.lastLoginAt;
            } else if (typeof userData.lastLoginAt === 'string') {
              lastLoginAt = new Date(userData.lastLoginAt);
            }
          }

          usersList.push({
            id: doc.id,
            displayName: userData.displayName || userData.username || 'Unknown',
            email: userData.email || '',
            role: userData.role || 'unknown',
            createdAt: createdAt,
            lastLoginAt: lastLoginAt,
            status: userData.status || 'active'
          });
        });

        users.value = usersList;
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        isLoading.value = false;
      }
    };

    const getRoleName = (role) => {
      const names = {
        elderly: 'Elderly',
        volunteer: 'Volunteer',
        admin: 'Admin'
      };
      return names[role] || role;
    };

    const getRoleColor = (role) => {
      const colors = {
        elderly: 'info',
        volunteer: 'success',
        admin: 'danger'
      };
      return colors[role] || 'secondary';
    };

    const getStatusName = (status) => {
      const names = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended'
      };
      return names[status] || status;
    };

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        inactive: 'danger',
        suspended: 'warning'
      };
      return colors[status] || 'secondary';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US');
    };

    const showAddUserModal = () => {
      // Reset form
      newUserForm.value = {
        username: '',
        email: '',
        displayName: '',
        role: 'elderly',
        status: 'active',
        password: ''
      };

      // Show modal
      nextTick(() => {
        const modalElement = document.getElementById('addUserModal');
        if (modalElement) {
          try {
            // Check if bootstrap is available
            if (typeof window.bootstrap !== 'undefined') {
              const modal = new window.bootstrap.Modal(modalElement);
              modal.show();
              console.log('📧 Add user modal opened');
            } else {
              console.error('Bootstrap not available');
              toast.error('Bootstrap library not loaded');
            }
          } catch (error) {
            console.error('Error opening modal:', error);
            toast.error('Failed to open add user dialog: ' + error.message);
          }
        } else {
          console.error('Modal element not found');
          toast.error('Add user dialog not found');
        }
      });
    };

    // Save new user
    const saveNewUser = async () => {
      if (!newUserForm.value.username || !newUserForm.value.email || !newUserForm.value.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      isSaving.value = true;
      try {
        // Create new user object
        const newUser = {
          id: Date.now().toString(), // Simple ID generation
          username: newUserForm.value.username,
          email: newUserForm.value.email,
          displayName: newUserForm.value.displayName || newUserForm.value.username,
          role: newUserForm.value.role,
          status: newUserForm.value.status,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };

        // Add to Firebase (you can implement this later)
        // await addDoc(collection(db, 'users'), newUser);

        // For now, just add to local array
        users.value.unshift(newUser);

        toast.success('User created successfully');

        // Close modal
        const modalElement = document.getElementById('addUserModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        console.log('📧 New user created:', newUser);
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user');
      } finally {
        isSaving.value = false;
      }
    };

    const editUser = (user) => {
      toast.info(`Edit user: ${user.displayName}`);
    };

    const viewUser = (user) => {
      toast.info(`View user details: ${user.displayName}`);
    };

    const toggleUserStatus = async (user) => {
      try {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { status: newStatus });

        user.status = newStatus;
        toast.success(`User status updated to: ${getStatusName(newStatus)}`);
      } catch (error) {
        console.error('Error updating user status:', error);
        toast.error('Failed to update user status');
      }
    };

    const deleteUser = async (user) => {
      if (confirm(`Are you sure you want to delete user "${user.displayName}"?`)) {
        try {
          await deleteDoc(doc(db, 'users', user.id));
          await loadUsers();
          toast.success('User deleted successfully');
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        }
      }
    };

    const exportUserData = () => {
      // Mock export functionality
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Role,Registration Date,Status\n"
        + users.value.map(user => 
          `${user.displayName},${user.email},${getRoleName(user.role)},${formatDate(user.createdAt)},${getStatusName(user.status)}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('User data exported successfully');
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Test Firebase connection
    const testFirebaseConnectionHandler = async () => {
      try {
        toast.info('Testing Firebase connection...');
        const result = await testFirebaseConnection();

        if (result.success) {
          toast.success(`Firebase connected! Users: ${result.usersCount}, Tasks: ${result.tasksCount}`);

          // If no users found, offer to create test data
          if (result.usersCount === 0) {
            if (confirm('No users found. Would you like to create test data?')) {
              await createTestUsers();
              await createTestTasks();
              toast.success('Test data created successfully!');
              loadUsers(); // Reload users
            }
          }
        } else {
          toast.error(`Firebase connection failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Firebase test error:', error);
        toast.error('Firebase test failed: ' + error.message);
      }
    };

    // Test Email Services
    const testEmailServices = async () => {
      try {
        toast.info('Testing email services... Check console for details');
        console.log('🚀 Starting Email Service Tests...');

        const results = await emailServiceTest.runFullEmailTest();

        // Count working services
        const workingServices = Object.values(results).filter(r => r.success).length;
        const totalServices = Object.keys(results).length;

        if (workingServices === totalServices) {
          toast.success(`All email services working! (${workingServices}/${totalServices})`);
        } else if (workingServices > 0) {
          toast.warning(`Some email services working (${workingServices}/${totalServices}). Check console for details.`);
        } else {
          toast.error('No email services working. All emails will use mock mode.');
        }

        // Show detailed results
        console.log('📊 Detailed Test Results:');
        Object.entries(results).forEach(([service, result]) => {
          console.log(`${service}:`, result.success ? '✅' : '❌', result.error || 'OK');
        });

      } catch (error) {
        console.error('Email service test error:', error);
        toast.error('Email service test failed: ' + error.message);
      }
    };

    // Test Postmark Direct
    const testPostmarkDirect = async () => {
      try {
        toast.info('Testing Postmark configuration... Check console for details');
        console.log('🚀 Starting Postmark Direct Test...');

        // Validate configuration
        const validation = postmarkSetup.validateConfig();
        if (!validation.valid) {
          toast.error('Postmark configuration invalid. Check console for details.');
          return;
        }

        // Test connection
        const connectionResult = await postmarkSetup.testConnection();

        if (connectionResult.success) {
          toast.success('Postmark API connection successful!');

          // Ask if user wants to send a real test email
          const testEmail = prompt('Postmark connection verified! Enter your email to send a real test email (optional):');
          if (testEmail && testEmail.includes('@')) {
            toast.info('Sending test email...');
            const emailResult = await postmarkSetup.sendTestEmail(testEmail);

            if (emailResult.success) {
              toast.success(`Test email sent to ${testEmail}! Check your inbox.`);
            } else {
              toast.error('Failed to send test email: ' + emailResult.error);
            }
          }
        } else if (connectionResult.corsIssue) {
          toast.warning('CORS detected (normal). Postmark will work in no-cors mode.');
        } else {
          toast.error('Postmark connection failed: ' + connectionResult.error);
        }

        // Show setup instructions
        postmarkSetup.getSetupInstructions();

      } catch (error) {
        console.error('Postmark test error:', error);
        toast.error('Postmark test failed: ' + error.message);
      }
    };

    // Initialize data when component mounts
    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      isLoading,
      isSaving,
      newUserForm,
      userColumns,
      userFilterColumns,
      getRoleName,
      getRoleColor,
      getStatusName,
      getStatusColor,
      formatDate,
      showAddUserModal,
      saveNewUser,
      editUser,
      viewUser,
      toggleUserStatus,
      deleteUser,
      exportUserData,
      handleLogout,
      testFirebaseConnection: testFirebaseConnectionHandler,
      testEmailServices,
      testPostmarkDirect
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.navbar {
  background: #2c3e50;
  padding: 0.75rem 0;
  color: white;
  flex-shrink: 0;
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f8f9fa;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.user-info h6 {
  margin: 0;
  font-weight: 600;
}
</style>
