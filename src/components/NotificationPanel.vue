<template>
  <div class="notification-panel">
    <div class="notification-header">
      <h5 class="mb-0">
        <i class="bi bi-bell me-2"></i>
        Notifications
        <span v-if="unreadCount" class="badge bg-danger ms-2">{{ unreadCount }}</span>
      </h5>
    </div>
    <div class="notification-list">
      <div v-if="notifications.length === 0" class="text-center py-4 text-muted">
        <i class="bi bi-bell-slash fs-4 mb-2 d-block"></i>
        No notifications
      </div>
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.isRead }"
        @click="markAsRead(notification)"
      >
        <div class="notification-icon">
          <i class="bi" :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import notificationService from '../services/notificationService'

export default {
  name: 'NotificationPanel',
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const notifications = ref([])

    const unreadCount = computed(() => 
      notifications.value.filter(n => !n.isRead).length
    )

    const loadNotifications = async () => {
      notifications.value = await notificationService.getNotificationsByUser(props.userId)
    }

    const markAsRead = async (notification) => {
      if (!notification.isRead) {
        // 模拟标记为已读
        notification.isRead = true
      }
    }

    const getNotificationIcon = (type) => {
      const icons = {
        task_accepted: 'bi-check-circle-fill text-success',
        task_completed: 'bi-flag-fill text-primary'
      }
      return icons[type] || 'bi-bell-fill'
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const date = new Date(timestamp)
      const diffHours = (now - date) / (1000 * 60 * 60)

      // If within 24 hours
      if (diffHours < 24) {
        // Less than 1 hour
        if (diffHours < 1) {
          const minutes = Math.floor((now - date) / (1000 * 60))
          return `${minutes} minutes ago`
        }
        // More than 1 hour
        const hours = Math.floor(diffHours)
        return `${hours} hours ago`
      }

      // Show full date if more than 24 hours
      return date.toLocaleDateString()
    }

    // Refresh notifications periodically
    onMounted(() => {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    })

    return {
      notifications,
      unreadCount,
      markAsRead,
      getNotificationIcon,
      formatTime
    }
  }
}
</script>

<style scoped>
.notification-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-header {
  background: #6c5ce7;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px 8px 0 0;
}

.notification-header h5 {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.notification-header h5 i {
  margin-right: 0.5rem;
}

.notification-header .badge {
  font-size: 0.75rem;
  padding: 0.25em 0.5em;
  border-radius: 10px;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.notification-item {
  padding: 1rem;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 0.5rem;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.notification-item.unread {
  background: #f0f0ff;
  border-color: #6c5ce7;
}

.notification-item.unread:hover {
  background: #e8e8ff;
}

.notification-icon {
  margin-bottom: 0.5rem;
}

.notification-icon i {
  font-size: 1.25rem;
  color: #6c5ce7;
}

.notification-content {
  color: #333;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.notification-message {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.notification-time {
  color: #999;
  font-size: 0.75rem;
}

.text-center {
  padding: 2rem;
  color: #666;
}

.text-center i {
  font-size: 2rem;
  color: #ddd;
  margin-bottom: 1rem;
}

@media (max-width: 991.98px) {
  .notification-panel {
    height: 400px;
  }
}

@media (max-width: 767.98px) {
  .notification-panel {
    height: 300px;
  }

  .notification-header {
    padding: 0.75rem 1rem;
  }

  .notification-list {
    padding: 0.5rem;
  }

  .notification-item {
    padding: 0.75rem;
  }
}
</style> 