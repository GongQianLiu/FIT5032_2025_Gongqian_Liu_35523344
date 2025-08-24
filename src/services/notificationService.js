// Notification Service - Handles all notification-related operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Notification types
const notificationTypes = [
  { value: 'task_created', label: 'Task Created', icon: 'bi-plus-circle', color: 'primary' },
  { value: 'task_accepted', label: 'Task Accepted', icon: 'bi-check-circle', color: 'success' },
  { value: 'task_completed', label: 'Task Completed', icon: 'bi-check2-all', color: 'success' },
  { value: 'task_cancelled', label: 'Task Cancelled', icon: 'bi-x-circle', color: 'danger' },
  { value: 'reminder', label: 'Reminder', icon: 'bi-clock', color: 'warning' },
  { value: 'rating_received', label: 'Rating Received', icon: 'bi-star', color: 'info' },
  { value: 'system', label: 'System', icon: 'bi-gear', color: 'secondary' }
]

// Get notifications by user ID
export const getNotificationsByUser = async (userId) => {
  try {
    // 临时移除orderBy以避免索引问题
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // 如果Firestore查询失败，返回模拟数据
    await new Promise(resolve => setTimeout(resolve, 300));
    return notifications.value.filter(notification => notification.userId === userId);
  }
}

// Get unread notifications by user ID
export const getUnreadNotificationsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw new Error('Failed to load notifications');
  }
}

// Get notification by ID
export const getNotificationById = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw new Error('Failed to load notification');
  }
}

// Create new notification
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
    
    const docSnap = await getDoc(notificationRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }
}

// Delete all notifications for a user
export const deleteAllNotificationsForUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw new Error('Failed to delete notifications');
  }
}

// Get notification count for a user
export const getNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
}

// Create task notification
export const createTaskNotification = async (userId, type, taskData) => {
  try {
    const notificationData = {
      userId,
      type,
      title: getNotificationTitle(type, taskData),
      message: getNotificationMessage(type, taskData),
      data: taskData
    };
    
    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error creating task notification:', error);
    throw new Error('Failed to create task notification');
  }
}

// Create rating notification
export const createRatingNotification = async (volunteerId, ratingData) => {
  try {
    const notificationData = {
      userId: volunteerId,
      type: 'rating_received',
      title: 'New Rating Received',
      message: `You received a ${ratingData.rating}-star rating for "${ratingData.taskTitle}"`,
      data: ratingData
    };
    
    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error creating rating notification:', error);
    throw new Error('Failed to create rating notification');
  }
}

// Create system notification
export const createSystemNotification = async (userId, title, message, data = {}) => {
  try {
    const notificationData = {
      userId,
      type: 'system',
      title,
      message,
      data
    };
    
    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw new Error('Failed to create system notification');
  }
}

// Search notifications
export const searchNotifications = async (query, filters = {}) => {
  try {
    let q = collection(db, 'notifications');
    
    // Apply filters
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.isRead !== undefined) {
      q = query(q, where('isRead', '==', filters.isRead));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      const notificationData = { id: doc.id, ...doc.data() };
      
      // Text search if query provided
      if (query) {
        const searchTerm = query.toLowerCase();
        if (notificationData.title?.toLowerCase().includes(searchTerm) ||
            notificationData.message?.toLowerCase().includes(searchTerm)) {
          notifications.push(notificationData);
        }
      } else {
        notifications.push(notificationData);
      }
    });
    
    return notifications;
  } catch (error) {
    console.error('Error searching notifications:', error);
    throw new Error('Failed to search notifications');
  }
}

// Get notification statistics
export const getNotificationStatistics = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    const total = notifications.length;
    const read = notifications.filter(n => n.isRead).length;
    const unread = total - read;
    
    const typeStats = notificationTypes.map(type => ({
      type: type.value,
      label: type.label,
      count: notifications.filter(n => n.type === type.value).length
    }));
    
    // Recent notifications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentNotifications = notifications.filter(
      n => new Date(n.createdAt?.toDate?.() || n.createdAt) >= thirtyDaysAgo
    ).length;
    
    return {
      total,
      read,
      unread,
      typeStats,
      recentNotifications
    };
  } catch (error) {
    console.error('Error getting notification statistics:', error);
    throw new Error('Failed to get notification statistics');
  }
}

// Helper functions
const getNotificationTitle = (type, taskData) => {
  switch (type) {
    case 'task_created':
      return 'New Task Created';
    case 'task_accepted':
      return 'Task Accepted';
    case 'task_completed':
      return 'Task Completed';
    case 'task_cancelled':
      return 'Task Cancelled';
    case 'reminder':
      return 'Task Deadline Reminder';
    default:
      return 'Notification';
  }
}

const getNotificationMessage = (type, taskData) => {
  switch (type) {
    case 'task_created':
      return `Your task "${taskData.title}" has been created successfully`;
    case 'task_accepted':
      return `You have accepted the task "${taskData.title}"`;
    case 'task_completed':
      return `The task "${taskData.title}" has been completed by ${taskData.volunteerName}`;
    case 'task_cancelled':
      return `The task "${taskData.title}" has been cancelled`;
    case 'reminder':
      return `Your task "${taskData.title}" is due tomorrow`;
    default:
      return 'You have a new notification';
  }
}

// Export constants
export { notificationTypes }

// Default export
export default {
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotificationsForUser,
  getNotificationCount,
  createTaskNotification,
  createRatingNotification,
  createSystemNotification,
  searchNotifications,
  getNotificationStatistics,
  notificationTypes
}
