import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase/config';
import firebaseAuth from './firebaseAuth';

export default {
  // 获取所有用户
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef
        // 临时移除orderBy以避免索引问题
        // orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }
  },

  // 根据角色获取用户
  async getUsersByRole(role) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('role', '==', role)
        // 临时移除orderBy以避免索引问题
        // orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }
  },

  // 获取单个用户信息
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('用户不存在');
      }
      
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
  },

  // 更新用户角色
  async updateUserRole(userId, newRole) {
    try {
      return await firebaseAuth.updateUserRole(userId, newRole);
    } catch (error) {
      console.error('更新用户角色失败:', error);
      throw error;
    }
  },

  // 禁用/启用用户
  async toggleUserStatus(userId, isActive) {
    try {
      return await firebaseAuth.toggleUserStatus(userId, isActive);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      throw error;
    }
  },

  // 删除用户
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true, message: '用户删除成功' };
    } catch (error) {
      console.error('删除用户失败:', error);
      throw new Error('删除用户失败');
    }
  },

  // 获取用户统计信息
  async getUserStatistics() {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        elderly: 0,
        volunteers: 0,
        admins: 0,
        active: 0,
        inactive: 0,
        recentLogins: 0
      };
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      users.forEach(user => {
        // 按角色统计
        switch (user.role) {
          case 'elderly':
            stats.elderly++;
            break;
          case 'volunteer':
            stats.volunteers++;
            break;
          case 'admin':
            stats.admins++;
            break;
        }
        
        // 按状态统计
        if (user.isActive !== false) {
          stats.active++;
        } else {
          stats.inactive++;
        }
        
        // 最近登录统计
        if (user.lastLogin && new Date(user.lastLogin) > oneWeekAgo) {
          stats.recentLogins++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw new Error('获取用户统计失败');
    }
  },

  // 搜索用户
  async searchUsers(searchTerm) {
    try {
      const users = await this.getAllUsers();
      
      return users.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('搜索用户失败:', error);
      throw new Error('搜索用户失败');
    }
  },

  // 获取活跃用户（最近7天有登录）
  async getActiveUsers() {
    try {
      const users = await this.getAllUsers();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return users.filter(user => 
        user.lastLogin && new Date(user.lastLogin) > oneWeekAgo
      );
    } catch (error) {
      console.error('获取活跃用户失败:', error);
      throw new Error('获取活跃用户失败');
    }
  },

  // 批量更新用户状态
  async batchUpdateUserStatus(userIds, isActive) {
    try {
      const promises = userIds.map(userId => 
        this.toggleUserStatus(userId, isActive)
      );
      
      await Promise.all(promises);
  return {
        success: true, 
        message: `已${isActive ? '启用' : '禁用'} ${userIds.length} 个用户` 
      };
    } catch (error) {
      console.error('批量更新用户状态失败:', error);
      throw new Error('批量更新用户状态失败');
    }
  },

  // 验证用户权限
  hasPermission(userRole, requiredRole) {
    return firebaseAuth.hasPermission(userRole, requiredRole);
  }
};
