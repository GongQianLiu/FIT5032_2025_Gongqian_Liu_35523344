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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export default {
  // 任务相关操作
  tasks: {
    // 获取任务列表
    async getTasks(filters = {}) {
      try {
        let q = collection(db, 'tasks');
        
        // 应用过滤器
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.requesterId) {
          q = query(q, where('requesterId', '==', filters.requesterId));
        }
        if (filters.volunteerId) {
          q = query(q, where('volunteerId', '==', filters.volunteerId));
        }
        
        // 按创建时间排序
        q = query(q, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        
        return tasks;
      } catch (error) {
        console.error('获取任务失败:', error);
        return [];
      }
    },

    // 创建任务
    async createTask(taskData) {
      try {
        const docRef = await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdAt: serverTimestamp(),
          status: 'pending'
        });
        return { id: docRef.id, ...taskData };
      } catch (error) {
        throw new Error('创建任务失败');
      }
    },

    // 接受任务
    async acceptTask(taskId, volunteerId, volunteerName) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await getDoc(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('任务不存在');
        }
        
        const taskData = taskDoc.data();
        if (taskData.status !== 'pending') {
          throw new Error('任务不可用');
        }

        const acceptedAt = new Date();
        const completionDeadline = this.getCompletionDeadline(taskData.type, acceptedAt);

        await updateDoc(taskRef, {
          status: 'accepted',
          volunteerId: volunteerId,
          volunteerName: volunteerName,
          acceptedAt: acceptedAt.toISOString(),
          completionDeadline: completionDeadline.toISOString()
        });

        return { id: taskId, ...taskData };
      } catch (error) {
        throw new Error('接受任务失败');
      }
    },

    // 完成任务
    async completeTask(taskId) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: 'completed',
          completedAt: new Date().toISOString()
        });
        return { id: taskId };
      } catch (error) {
        throw new Error('完成任务失败');
      }
    },

    // 确认任务
    async confirmTask(taskId) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        });
        return { id: taskId };
      } catch (error) {
        throw new Error('确认任务失败');
      }
    },

    // 评价任务
    async rateTask(taskId, ratingData) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          rating: ratingData.rating,
          review: ratingData.review,
          status: 'rated',
          ratedAt: new Date().toISOString()
        });
        return { id: taskId };
      } catch (error) {
        throw new Error('评价任务失败');
      }
    },

    // 投诉任务
    async submitComplaint(taskId, complaint) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: 'disputed',
          complaint: complaint,
          complaintStatus: 'pending',
          complaintAt: new Date().toISOString()
        });
        return { id: taskId };
      } catch (error) {
        throw new Error('提交投诉失败');
      }
    },

    // 获取完成期限
    getCompletionDeadline(taskType, acceptedAt) {
      const deadline = new Date(acceptedAt);
      switch(taskType) {
        case 'shopping':
          deadline.setHours(deadline.getHours() + 3);
          break;
        case 'delivery':
          deadline.setHours(deadline.getHours() + 2);
          break;
        case 'housework':
          deadline.setHours(deadline.getHours() + 4);
          break;
        case 'companionship':
          deadline.setHours(deadline.getHours() + 3);
          break;
        default:
          deadline.setHours(deadline.getHours() + 2);
      }
      return deadline;
    }
  },

  // 通知相关操作
  notifications: {
    // 获取用户通知
    async getNotifications(userId) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
        
        return notifications;
      } catch (error) {
        console.error('获取通知失败:', error);
        return [];
      }
    },

    // 创建通知
    async createNotification(notificationData) {
      try {
        const docRef = await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          createdAt: serverTimestamp(),
          isRead: false
        });
        return { id: docRef.id, ...notificationData };
      } catch (error) {
        throw new Error('创建通知失败');
      }
    },

    // 标记通知为已读
    async markAsRead(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
          isRead: true
        });
        return { id: notificationId };
      } catch (error) {
        throw new Error('标记通知失败');
      }
    }
  },

  // 用户相关操作
  users: {
    // 检查用户是否存在
    async isUserExists(email) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      } catch (error) {
        console.error('检查用户失败:', error);
        return false;
      }
    },

    // 获取用户信息
    async getUser(userId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
      } catch (error) {
        console.error('获取用户失败:', error);
        return null;
      }
    }
  }
};
