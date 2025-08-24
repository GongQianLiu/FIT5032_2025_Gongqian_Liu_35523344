<template>
  <div>
    <!-- Task Type Formatter -->
    <template v-if="formatterType === 'TaskTypeFormatter'">
      <span :class="'badge bg-' + getTypeClass(value)">
        {{ getTypeLabel(value) }}
      </span>
    </template>

    <!-- Status Formatter -->
    <template v-else-if="formatterType === 'StatusFormatter'">
      <span :class="'badge ' + getStatusClass(value)">
        {{ getStatusLabel(value) }}
      </span>
    </template>

    <!-- Priority Formatter -->
    <template v-else-if="formatterType === 'PriorityFormatter'">
      <span :class="'badge bg-' + getPriorityClass(value)">
        {{ getPriorityLabel(value) }}
      </span>
    </template>

    <!-- DateTime Formatter -->
    <template v-else-if="formatterType === 'DateTimeFormatter'">
      {{ formatDateTime(value) }}
    </template>

    <!-- Available Task Actions Formatter -->
    <template v-else-if="formatterType === 'AvailableTaskActionsFormatter'">
      <button
        class="btn btn-primary btn-sm"
        @click="acceptTask(row)"
        :disabled="isAccepting"
      >
        <i class="bi bi-check-circle"></i>
        Accept
      </button>
    </template>

    <!-- My Task Actions Formatter -->
    <template v-else-if="formatterType === 'MyTaskActionsFormatter'">
      <div class="btn-group">
        <button
          v-if="row.status === 'in_progress'"
          class="btn btn-success btn-sm"
          @click="completeTask(row)"
          :disabled="isCompleting"
        >
          <i class="bi bi-check-circle"></i>
          Complete
        </button>
        <button
          v-if="row.status === 'open'"
          class="btn btn-warning btn-sm"
          @click="editTask(row)"
        >
          <i class="bi bi-pencil"></i>
          Edit
        </button>
        <button
          v-if="row.status === 'open'"
          class="btn btn-danger btn-sm"
          @click="deleteTask(row)"
        >
          <i class="bi bi-trash"></i>
          Delete
        </button>
      </div>
    </template>

    <!-- Elderly Task Actions Formatter -->
    <template v-else-if="formatterType === 'ElderlyTaskActionsFormatter'">
      <div class="btn-group">
        <button
          v-if="row.status === 'pending_confirmation'"
          class="btn btn-success btn-sm"
          @click="confirmTask(row)"
        >
          <i class="bi bi-check-circle"></i>
          Confirm
        </button>
        <button
          v-if="row.status === 'pending_confirmation'"
          class="btn btn-danger btn-sm ms-2"
          @click="showComplaintModal(row)"
        >
          <i class="bi bi-exclamation-circle"></i>
          Report Issue
        </button>
        <button
          v-if="row.status === 'completed' && !row.rating"
          class="btn btn-primary btn-sm"
          @click="showRatingModal(row)"
        >
          <i class="bi bi-star"></i>
          Rate
        </button>
      </div>
    </template>

    <!-- Role Formatter -->
    <template v-else-if="formatterType === 'role'">
      <span :class="'badge bg-' + getRoleClass(value)">
        {{ getRoleLabel(value) }}
      </span>
    </template>

    <!-- Date Formatter -->
    <template v-else-if="formatterType === 'date'">
      {{ formatDate(value) }}
    </template>

    <!-- Status Formatter for Users -->
    <template v-else-if="formatterType === 'status'">
      <span :class="'badge bg-' + getUserStatusClass(value)">
        {{ getUserStatusLabel(value) }}
      </span>
    </template>

    <!-- User Actions Formatter -->
    <template v-else-if="formatterType === 'userActions'">
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-primary" @click="editUser(row)">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-info" @click="viewUser(row)">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-warning" @click="toggleUserStatus(row)">
          <i :class="row.status === 'active' ? 'bi bi-pause' : 'bi bi-play'"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" @click="deleteUser(row)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </template>

    <!-- Default: show value as is -->
    <template v-else>
      {{ value }}
    </template>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TaskFormatters',
  props: {
    value: {
      type: [String, Number, Date, Object, undefined],
      required: false,
      default: null
    },
    row: {
      type: Object,
      required: true
    },
    formatterType: {
      type: String,
      required: true
    }
  },
  emits: ['accept-task', 'complete-task', 'edit-task', 'delete-task', 'confirm-task', 'show-complaint-modal', 'show-rating-modal', 'edit-user', 'view-user', 'toggle-user-status', 'delete-user'],
  setup(props, { emit }) {
    // Task Type formatting
    const getTypeClass = (type) => {
      if (!type) return 'secondary';
      const classes = {
        shopping: 'info',
        housework: 'success',
        companionship: 'primary',
        delivery: 'warning',
        therapy: 'danger',
        transportation: 'secondary',
        other: 'secondary'
      };
      return classes[type] || 'secondary';
    };

    const getTypeLabel = (type) => {
      if (!type) return 'N/A';
      const labels = {
        shopping: 'Shopping',
        housework: 'Housework',
        companionship: 'Companionship',
        delivery: 'Delivery',
        therapy: 'Therapy',
        transportation: 'Transportation',
        other: 'Other'
      };
      return labels[type] || type;
    };

    // Status formatting
    const getStatusClass = (status) => {
      if (!status) return 'bg-secondary';
      const classes = {
        open: 'bg-warning',
        in_progress: 'bg-info',
        completed: 'bg-success',
        cancelled: 'bg-secondary',
        pending_confirmation: 'bg-primary'
      };
      return classes[status] || 'bg-secondary';
    };

    const getStatusLabel = (status) => {
      if (!status) return 'N/A';
      const labels = {
        open: 'Open',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        pending_confirmation: 'Pending Confirmation'
      };
      return labels[status] || status;
    };

    // Priority formatting
    const getPriorityClass = (priority) => {
      if (!priority) return 'secondary';
      const classes = {
        low: 'success',
        medium: 'warning',
        high: 'danger'
      };
      return classes[priority] || 'secondary';
    };

    const getPriorityLabel = (priority) => {
      if (!priority) return 'N/A';
      const labels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      };
      return labels[priority] || priority;
    };

    // DateTime formatting
    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-';
      
      // Handle Firestore Timestamp objects
      if (dateStr && typeof dateStr === 'object' && dateStr.toDate) {
        return dateStr.toDate().toLocaleString();
      }
      
      // Handle regular dates
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString();
      } catch (error) {
        return '-';
      }
    };

    // Action handlers
    const acceptTask = (task) => {
      emit('accept-task', task);
    };

    const completeTask = (task) => {
      emit('complete-task', task);
    };

    const editTask = (task) => {
      emit('edit-task', task);
    };

    const deleteTask = (task) => {
      emit('delete-task', task);
    };

    const confirmTask = (task) => {
      emit('confirm-task', task);
    };

    const showComplaintModal = (task) => {
      emit('show-complaint-modal', task);
    };

    const showRatingModal = (task) => {
      emit('show-rating-modal', task);
    };

    // User-related methods
    const getRoleClass = (role) => {
      const classes = {
        elderly: 'primary',
        volunteer: 'success',
        admin: 'danger'
      };
      return classes[role] || 'secondary';
    };

    const getRoleLabel = (role) => {
      const labels = {
        elderly: 'Elderly',
        volunteer: 'Volunteer',
        admin: 'Admin'
      };
      return labels[role] || role;
    };

    const getUserStatusClass = (status) => {
      const classes = {
        active: 'success',
        inactive: 'secondary',
        suspended: 'warning',
        banned: 'danger'
      };
      return classes[status] || 'secondary';
    };

    const getUserStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        banned: 'Banned'
      };
      return labels[status] || status;
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return new Date(date).toLocaleDateString();
    };

    const editUser = (user) => {
      emit('edit-user', user);
    };

    const viewUser = (user) => {
      emit('view-user', user);
    };

    const toggleUserStatus = (user) => {
      emit('toggle-user-status', user);
    };

    const deleteUser = (user) => {
      emit('delete-user', user);
    };

    return {
      getTypeClass,
      getTypeLabel,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      formatDateTime,
      acceptTask,
      completeTask,
      editTask,
      deleteTask,
      confirmTask,
      showComplaintModal,
      showRatingModal,
      getRoleClass,
      getRoleLabel,
      getUserStatusClass,
      getUserStatusLabel,
      formatDate,
      editUser,
      viewUser,
      toggleUserStatus,
      deleteUser
    };
  }
};
</script>

<style scoped>
.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}
</style>
