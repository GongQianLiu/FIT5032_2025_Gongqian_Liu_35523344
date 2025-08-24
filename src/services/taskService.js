// Task Service - Handles all task-related operations
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

// Task types
const taskTypes = [
  { value: 'shopping', label: 'Shopping', icon: 'bi-cart' },
  { value: 'housework', label: 'Housework', icon: 'bi-house' },
  { value: 'companionship', label: 'Companionship', icon: 'bi-people' },
  { value: 'delivery', label: 'Delivery', icon: 'bi-truck' },
  { value: 'therapy', label: 'Therapy', icon: 'bi-heart' },
  { value: 'transportation', label: 'Transportation', icon: 'bi-car-front' }
]

// Task statuses
const taskStatuses = [
  { value: 'open', label: 'Open', color: 'primary' },
  { value: 'in_progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' }
]

// Task priorities
const taskPriorities = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'danger' }
]

// Get all tasks
export const getAllTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to load tasks');
  }
}

// Get tasks by elderly user
export const getTasksByElderly = async (elderlyId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('elderlyId', '==', elderlyId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching elderly tasks:', error);
    throw new Error('Failed to load tasks');
  }
}

// Get tasks by volunteer
export const getTasksByVolunteer = async (volunteerId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('volunteerId', '==', volunteerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching volunteer tasks:', error);
    throw new Error('Failed to load tasks');
  }
}

// Get available tasks (open status)
export const getAvailableTasks = async () => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching available tasks:', error);
    throw new Error('Failed to load tasks');
  }
}

// Get tasks by status
export const getTasksByStatus = async (status) => {
  try {
    console.log('getTasksByStatus called with status:', status);

    const q = query(
      collection(db, 'tasks'),
      where('status', '==', status)
      // 临时移除orderBy以避免索引问题
      // orderBy('createdAt', 'desc')
    );

    console.log('Query created, executing...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed, documents found:', querySnapshot.size);

    const tasks = [];
    querySnapshot.forEach((doc) => {
      const taskData = { id: doc.id, ...doc.data() };
      console.log('Task data:', taskData);
      tasks.push(taskData);
    });

    // 在客户端排序
    tasks.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return bTime - aTime;
    });

    console.log('Returning tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw new Error('Failed to load tasks: ' + error.message);
  }
}

// Get tasks by user (elderly or volunteer)
export const getTasksByUser = async (userId, userRole) => {
  try {
    console.log('getTasksByUser called with:', { userId, userRole });
    
    let q;
    if (userRole === 'elderly') {
      q = query(
        collection(db, 'tasks'),
        where('elderlyId', '==', userId)
        // 临时移除orderBy以避免索引问题
        // orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'volunteer') {
      q = query(
        collection(db, 'tasks'),
        where('volunteerId', '==', userId)
        // 临时移除orderBy以避免索引问题
        // orderBy('createdAt', 'desc')
      );
    } else {
      throw new Error('Invalid user role');
    }
    
    console.log('Query created, executing...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed, documents found:', querySnapshot.size);
    
    const tasks = [];
    querySnapshot.forEach((doc) => {
      const taskData = { id: doc.id, ...doc.data() };
      console.log('Task data:', taskData);
      tasks.push(taskData);
    });
    
    console.log('Returning tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks by user:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw new Error('Failed to load tasks: ' + error.message);
  }
}

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    const docRef = doc(db, 'tasks', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error('Failed to load task');
  }
}

// Create new task
export const createTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      status: 'open',
      volunteerId: null,
      volunteerName: null,
      createdAt: serverTimestamp(),
      completedAt: null,
      rating: null,
      review: null
    });
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

// Update task
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
    
    // Get updated task
    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
}

// Accept task (volunteer takes task)
export const acceptTask = async (taskId, volunteerId, volunteerName) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.data();
    if (taskData.status !== 'open') {
      throw new Error('Task is not available');
    }
    
    await updateDoc(taskRef, {
      status: 'in_progress',
      volunteerId,
      volunteerName
    });
    
    return { id: taskId, ...taskData, status: 'in_progress', volunteerId, volunteerName };
  } catch (error) {
    console.error('Error accepting task:', error);
    throw new Error('Failed to accept task');
  }
}

// Complete task
export const completeTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });

    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error completing task:', error);
    throw new Error('Failed to complete task');
  }
}

// Confirm task (elderly user confirms task completion)
export const confirmTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'completed',
      confirmedAt: serverTimestamp()
    });

    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error confirming task:', error);
    throw new Error('Failed to confirm task');
  }
}

// Cancel task
export const cancelTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'cancelled',
      volunteerId: null,
      volunteerName: null
    });
    
    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error cancelling task:', error);
    throw new Error('Failed to cancel task');
  }
}

// Rate and review task
export const rateTask = async (taskId, rating, review) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.data();
    if (taskData.status !== 'completed') {
      throw new Error('Task must be completed before rating');
    }
    
    await updateDoc(taskRef, {
      rating,
      review
    });
    
    return { id: taskId, ...taskData, rating, review };
  } catch (error) {
    console.error('Error rating task:', error);
    throw new Error('Failed to rate task');
  }
}

// Delete task
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}

// Search tasks
export const searchTasks = async (query, filters = {}) => {
  try {
    let q = collection(db, 'tasks');
    
    // Apply filters
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }
    if (filters.elderlyId) {
      q = query(q, where('elderlyId', '==', filters.elderlyId));
    }
    if (filters.volunteerId) {
      q = query(q, where('volunteerId', '==', filters.volunteerId));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      const taskData = { id: doc.id, ...doc.data() };
      
      // Text search if query provided
      if (query) {
        const searchTerm = query.toLowerCase();
        if (taskData.title?.toLowerCase().includes(searchTerm) ||
            taskData.description?.toLowerCase().includes(searchTerm) ||
            taskData.location?.toLowerCase().includes(searchTerm)) {
          tasks.push(taskData);
        }
      } else {
        tasks.push(taskData);
      }
    });
    
    return tasks;
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw new Error('Failed to search tasks');
  }
}

// Get task statistics
export const getTaskStatistics = async () => {
  try {
    const tasks = await getAllTasks();
    
    const total = tasks.length;
    const open = tasks.filter(task => task.status === 'open').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const cancelled = tasks.filter(task => task.status === 'cancelled').length;
    
    const typeStats = taskTypes.map(type => ({
      type: type.value,
      label: type.label,
      count: tasks.filter(task => task.type === type.value).length
    }));
    
    const priorityStats = taskPriorities.map(priority => ({
      priority: priority.value,
      label: priority.label,
      count: tasks.filter(task => task.priority === priority.value).length
    }));
    
    const averageRating = tasks
      .filter(task => task.rating)
      .reduce((sum, task) => sum + task.rating, 0) / 
      tasks.filter(task => task.rating).length || 0;
    
    return {
      total,
      open,
      inProgress,
      completed,
      cancelled,
      typeStats,
      priorityStats,
      averageRating: Math.round(averageRating * 10) / 10
    };
  } catch (error) {
    console.error('Error getting task statistics:', error);
    throw new Error('Failed to get task statistics');
  }
}

// Export constants
export { taskTypes, taskStatuses, taskPriorities }

// Default export
export default {
  getAllTasks,
  getTasksByElderly,
  getTasksByVolunteer,
  getTasksByUser,
  getTasksByStatus,
  getAvailableTasks,
  getTaskById,
  createTask,
  updateTask,
  acceptTask,
  completeTask,
  confirmTask,
  cancelTask,
  rateTask,
  deleteTask,
  searchTasks,
  getTaskStatistics,
  taskTypes,
  taskStatuses,
  taskPriorities
}
