<template>
  <div class="page-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <span class="navbar-brand">
          <i class="bi bi-table me-2"></i>
          DataTable Test Page
        </span>
      </div>
    </nav>

    <div class="main-content">
      <div class="container-fluid">
        <div class="page-header mb-4">
          <h1>Enhanced DataTable Test</h1>
          <p class="text-muted">Testing the new DataTable component with advanced filtering and fixed pagination</p>
        </div>

        <!-- Test Users Table -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-people me-2"></i>
              Users Table (Fixed 10 rows per page)
            </h5>
          </div>
          <div class="card-body">
            <DataTable
              :data="testUsers"
              :columns="userColumns"
              :filterColumns="userFilterColumns"
              @edit-user="handleEditUser"
              @view-user="handleViewUser"
              @toggle-user-status="handleToggleUserStatus"
              @delete-user="handleDeleteUser"
            />
          </div>
        </div>

        <!-- Test Tasks Table -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-list-task me-2"></i>
              Tasks Table (Fixed 10 rows per page)
            </h5>
          </div>
          <div class="card-body">
            <DataTable
              :data="testTasks"
              :columns="taskColumns"
              :filterColumns="taskFilterColumns"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import DataTable from '../components/DataTable.vue';

export default {
  name: 'TestDataTable',
  components: {
    DataTable
  },
  setup() {
    const toast = useToast();

    // Test data for users
    const testUsers = ref([
      { id: 1, displayName: 'John Doe', email: 'john@example.com', role: 'elderly', status: 'active', createdAt: '2024-01-15' },
      { id: 2, displayName: 'Jane Smith', email: 'jane@example.com', role: 'volunteer', status: 'active', createdAt: '2024-01-16' },
      { id: 3, displayName: 'Bob Wilson', email: 'bob@example.com', role: 'admin', status: 'active', createdAt: '2024-01-17' },
      { id: 4, displayName: 'Alice Brown', email: 'alice@example.com', role: 'elderly', status: 'inactive', createdAt: '2024-01-18' },
      { id: 5, displayName: 'Charlie Davis', email: 'charlie@example.com', role: 'volunteer', status: 'active', createdAt: '2024-01-19' },
      { id: 6, displayName: 'Diana Evans', email: 'diana@example.com', role: 'elderly', status: 'suspended', createdAt: '2024-01-20' },
      { id: 7, displayName: 'Frank Miller', email: 'frank@example.com', role: 'volunteer', status: 'active', createdAt: '2024-01-21' },
      { id: 8, displayName: 'Grace Lee', email: 'grace@example.com', role: 'admin', status: 'active', createdAt: '2024-01-22' },
      { id: 9, displayName: 'Henry Taylor', email: 'henry@example.com', role: 'elderly', status: 'active', createdAt: '2024-01-23' },
      { id: 10, displayName: 'Ivy Chen', email: 'ivy@example.com', role: 'volunteer', status: 'inactive', createdAt: '2024-01-24' },
      { id: 11, displayName: 'Jack Johnson', email: 'jack@example.com', role: 'elderly', status: 'active', createdAt: '2024-01-25' },
      { id: 12, displayName: 'Kelly White', email: 'kelly@example.com', role: 'volunteer', status: 'active', createdAt: '2024-01-26' },
      { id: 13, displayName: 'Leo Garcia', email: 'leo@example.com', role: 'admin', status: 'active', createdAt: '2024-01-27' },
      { id: 14, displayName: 'Mia Rodriguez', email: 'mia@example.com', role: 'elderly', status: 'active', createdAt: '2024-01-28' },
      { id: 15, displayName: 'Noah Martinez', email: 'noah@example.com', role: 'volunteer', status: 'suspended', createdAt: '2024-01-29' }
    ]);

    // Test data for tasks
    const testTasks = ref([
      { id: 1, title: 'Grocery Shopping', status: 'pending', requesterName: 'John Doe', volunteerName: '', createdAt: '2024-02-01' },
      { id: 2, title: 'Medical Appointment', status: 'accepted', requesterName: 'Jane Smith', volunteerName: 'Bob Wilson', createdAt: '2024-02-02' },
      { id: 3, title: 'House Cleaning', status: 'completed', requesterName: 'Alice Brown', volunteerName: 'Charlie Davis', createdAt: '2024-02-03' },
      { id: 4, title: 'Dog Walking', status: 'pending', requesterName: 'Diana Evans', volunteerName: '', createdAt: '2024-02-04' },
      { id: 5, title: 'Pharmacy Visit', status: 'accepted', requesterName: 'Frank Miller', volunteerName: 'Grace Lee', createdAt: '2024-02-05' },
      { id: 6, title: 'Garden Work', status: 'completed', requesterName: 'Henry Taylor', volunteerName: 'Ivy Chen', createdAt: '2024-02-06' },
      { id: 7, title: 'Technology Help', status: 'pending', requesterName: 'Jack Johnson', volunteerName: '', createdAt: '2024-02-07' },
      { id: 8, title: 'Transportation', status: 'accepted', requesterName: 'Kelly White', volunteerName: 'Leo Garcia', createdAt: '2024-02-08' },
      { id: 9, title: 'Meal Preparation', status: 'completed', requesterName: 'Mia Rodriguez', volunteerName: 'Noah Martinez', createdAt: '2024-02-09' },
      { id: 10, title: 'Social Visit', status: 'pending', requesterName: 'John Doe', volunteerName: '', createdAt: '2024-02-10' },
      { id: 11, title: 'Library Visit', status: 'accepted', requesterName: 'Jane Smith', volunteerName: 'Bob Wilson', createdAt: '2024-02-11' },
      { id: 12, title: 'Bill Payment', status: 'completed', requesterName: 'Alice Brown', volunteerName: 'Charlie Davis', createdAt: '2024-02-12' }
    ]);

    // User table configuration
    const userColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'displayName', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true, formatter: 'role' },
      { key: 'status', label: 'Status', sortable: true, formatter: 'status' },
      { key: 'createdAt', label: 'Created', sortable: true, formatter: 'date' },
      { key: 'actions', label: 'Actions', sortable: false, formatter: 'userActions' }
    ];

    const userFilterColumns = [
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' }
    ];

    // Task table configuration
    const taskColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'requesterName', label: 'Requester', sortable: true },
      { key: 'volunteerName', label: 'Volunteer', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true }
    ];

    const taskFilterColumns = [
      { key: 'status', label: 'Status' },
      { key: 'requesterName', label: 'Requester' },
      { key: 'volunteerName', label: 'Volunteer' }
    ];

    // Event handlers
    const handleEditUser = (user) => {
      toast.info(`Edit user: ${user.displayName}`);
    };

    const handleViewUser = (user) => {
      toast.info(`View user: ${user.displayName}`);
    };

    const handleToggleUserStatus = (user) => {
      toast.info(`Toggle status for: ${user.displayName}`);
    };

    const handleDeleteUser = (user) => {
      toast.warning(`Delete user: ${user.displayName}`);
    };

    return {
      testUsers,
      testTasks,
      userColumns,
      userFilterColumns,
      taskColumns,
      taskFilterColumns,
      handleEditUser,
      handleViewUser,
      handleToggleUserStatus,
      handleDeleteUser
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-content {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0 !important;
}
</style>
