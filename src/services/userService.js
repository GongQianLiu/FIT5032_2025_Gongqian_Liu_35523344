const API_URL = 'http://localhost:3000/api';

export default {
  // 获取所有用户
  async getUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();
      return users;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return [];
    }
  },

  // 检查用户名是否存在
  async isUserExists(username) {
    try {
      const users = await this.getUsers();
      return users.some(user => user.username === username);
    } catch (error) {
      console.error('检查用户名失败:', error);
      return false;
    }
  },

  // 添加新用户
  async addUser(user) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return true;
    } catch (error) {
      console.error('添加用户失败:', error);
      return false;
    }
  },

  // 验证用户登录
  async validateUser(username, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('验证用户失败:', error);
      return null;
    }
  },

  // 按角色获取用户
  async getUsersByRole(role) {
    try {
      const users = await this.getUsers();
      return users.filter(user => user.role === role);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return [];
    }
  }
}; 