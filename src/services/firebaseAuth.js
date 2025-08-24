import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default {
  // 检查用户是否已存在
  async isUserExists(email) {
    try {
      // 方法1: 检查Firebase Auth中是否已存在该邮箱
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        return true;
      }

      // 方法2: 检查Firestore中是否已存在该邮箱的用户记录
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('检查用户是否存在时出错:', error);
      // 如果检查失败，为了安全起见，假设用户已存在
      return true;
    }
  },

  // 用户注册
  async register(email, password, username, role) {
    try {
      // 验证角色是否有效
      const validRoles = ['elderly', 'volunteer', 'admin'];
      if (!validRoles.includes(role)) {
        throw new Error('无效的用户角色');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 更新用户资料
      await updateProfile(user, {
        displayName: username
      });

      // 在Firestore中保存用户信息
      const userData = {
        uid: user.uid,
        email: user.email,
        username: username,
        role: role,
        createdAt: new Date().toISOString(),
        displayName: username,
        isActive: true,
        lastLogin: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        id: user.uid,
        email: user.email,
        username: username,
        role: role,
        isActive: true
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // 用户登录
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 从Firestore获取用户详细信息
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('用户信息不存在，请联系管理员');
      }

      const userData = userDoc.data();

      // 检查用户是否被禁用
      if (userData.isActive === false) {
        throw new Error('账户已被禁用，请联系管理员');
      }

      // 更新最后登录时间
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      });

      return {
        id: user.uid,
        email: user.email,
        username: userData.username || user.displayName,
        role: userData.role || 'elderly',
        isActive: userData.isActive !== false,
        createdAt: userData.createdAt
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // 用户登出
  async logout() {
    try {
      await signOut(auth);
      // 清除本地存储的用户信息
      localStorage.removeItem('currentUser');
    } catch (error) {
      throw new Error('登出失败');
    }
  },

  // 获取当前用户
  getCurrentUser() {
    return auth.currentUser;
  },

  // 获取当前用户的完整信息（包括角色）
  async getCurrentUserInfo() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: currentUser.uid,
        email: currentUser.email,
        username: userData.username || currentUser.displayName,
        role: userData.role || 'elderly',
        isActive: userData.isActive !== false,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  // 更新用户角色（仅管理员可用）
  async updateUserRole(userId, newRole) {
    try {
      const validRoles = ['elderly', 'volunteer', 'admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('无效的用户角色');
      }

      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      return { success: true, message: '用户角色更新成功' };
    } catch (error) {
      throw new Error('更新用户角色失败: ' + error.message);
    }
  },

  // 禁用/启用用户（仅管理员可用）
  async toggleUserStatus(userId, isActive) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: isActive,
        updatedAt: new Date().toISOString()
      });

      return { 
        success: true, 
        message: `用户已${isActive ? '启用' : '禁用'}` 
      };
    } catch (error) {
      throw new Error('更新用户状态失败: ' + error.message);
    }
  },

  // 验证用户权限
  hasPermission(userRole, requiredRole) {
    const roleHierarchy = {
      'elderly': 1,
      'volunteer': 2,
      'admin': 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // 错误消息处理
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': '该邮箱已被注册',
      'auth/invalid-email': '邮箱格式不正确',
      'auth/operation-not-allowed': '邮箱密码登录未启用',
      'auth/weak-password': '密码强度太弱',
      'auth/user-disabled': '用户账户已被禁用',
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/invalid-credential': '邮箱或密码错误',
      'auth/too-many-requests': '请求过于频繁，请稍后再试'
    };
    return errorMessages[errorCode] || '认证失败';
  }
};
