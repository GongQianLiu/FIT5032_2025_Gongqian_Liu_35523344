// 模拟数据生成器
export const generateMockData = () => {
  // 生成任务数据
  const generateTasks = (count = 50) => {
    const taskTypes = ['shopping', 'delivery', 'housework', 'companionship'];
    const statuses = ['pending', 'accepted', 'completed', 'rated', 'expired'];
    const titles = [
      '购买日常用品', '取快递', '打扫房间', '陪伴聊天',
      '购买药品', '送餐服务', '整理衣物', '阅读陪伴',
      '购买食材', '代缴费用', '清洁厨房', '散步陪伴',
      '购买日用品', '取文件', '整理书房', '下棋陪伴'
    ];
    
    const tasks = [];
    for (let i = 0; i < count; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const deadline = new Date(createdAt.getTime() + Math.random() * 3 * 60 * 60 * 1000);
      
      tasks.push({
        id: `task_${i + 1}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        description: `这是第${i + 1}个任务的详细描述，包含具体的需求和要求。`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        requesterId: `user_${Math.floor(Math.random() * 20) + 1}`,
        requesterName: `用户${Math.floor(Math.random() * 20) + 1}`,
        volunteerId: Math.random() > 0.3 ? `volunteer_${Math.floor(Math.random() * 10) + 1}` : null,
        volunteerName: Math.random() > 0.3 ? `志愿者${Math.floor(Math.random() * 10) + 1}` : null,
        deadline: deadline.toISOString(),
        createdAt: createdAt.toISOString(),
        acceptedAt: Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString() : null,
        completedAt: Math.random() > 0.5 ? new Date(createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() : null,
        rating: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : null,
        review: Math.random() > 0.8 ? `这是第${i + 1}个任务的评价内容，用户对服务表示满意。` : null
      });
    }
    return tasks;
  };

  // 生成用户数据
  const generateUsers = (count = 30) => {
    const roles = ['elderly', 'volunteer'];
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      users.push({
        id: `${role}_${i + 1}`,
        username: `${role === 'elderly' ? '老年人' : '志愿者'}${i + 1}`,
        email: `${role}${i + 1}@example.com`,
        role: role,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        address: `地址${i + 1}`,
        rating: role === 'volunteer' ? (Math.random() * 2 + 3).toFixed(1) : null,
        completedTasks: role === 'volunteer' ? Math.floor(Math.random() * 50) : 0
      });
    }
    return users;
  };

  // 生成通知数据
  const generateNotifications = (count = 100) => {
    const types = ['task_accepted', 'task_completed', 'task_reminder', 'welcome'];
    const notifications = [];
    
    for (let i = 0; i < count; i++) {
      notifications.push({
        id: `notification_${i + 1}`,
        userId: `user_${Math.floor(Math.random() * 30) + 1}`,
        title: `通知标题${i + 1}`,
        message: `这是第${i + 1}条通知的详细内容，包含重要的信息更新。`,
        type: types[Math.floor(Math.random() * types.length)],
        isRead: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return notifications;
  };

  return {
    tasks: generateTasks(),
    users: generateUsers(),
    notifications: generateNotifications()
  };
};

// 导出模拟数据
export const mockData = generateMockData();
