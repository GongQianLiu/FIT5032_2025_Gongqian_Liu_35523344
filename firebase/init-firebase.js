const admin = require('firebase-admin');

// 初始化 Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 初始化系统配置
async function initializeSystemConfig() {
  console.log('🔧 初始化系统配置...');
  
  const configs = [
    {
      key: 'email_settings',
      value: {
        fromEmail: 'noreply@evergreenway.com',
        replyToEmail: 'support@evergreenway.com',
        maxAttachmentSize: 10485760, // 10MB
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
      },
      description: '邮件发送配置',
      category: 'email',
      isPublic: false
    },
    {
      key: 'task_settings',
      value: {
        maxTitleLength: 100,
        maxDescriptionLength: 1000,
        defaultDeadlineHours: 24,
        maxBudget: 1000,
        taskTypes: ['shopping', 'delivery', 'housework', 'companionship']
      },
      description: '任务相关配置',
      category: 'task',
      isPublic: true
    },
    {
      key: 'notification_settings',
      value: {
        maxUnreadNotifications: 50,
        autoDeleteDays: 30,
        pushNotificationEnabled: true,
        emailNotificationEnabled: true
      },
      description: '通知系统配置',
      category: 'notification',
      isPublic: false
    },
    {
      key: 'system_settings',
      value: {
        maintenanceMode: false,
        maxUsersPerPage: 20,
        maxTasksPerPage: 10,
        defaultLanguage: 'zh-CN',
        supportedLanguages: ['zh-CN', 'en-US']
      },
      description: '系统通用配置',
      category: 'system',
      isPublic: true
    }
  ];

  for (const config of configs) {
    try {
      await db.collection('system_config').doc(config.key).set({
        ...config,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ 配置 ${config.key} 已创建`);
    } catch (error) {
      console.error(`❌ 配置 ${config.key} 创建失败:`, error);
    }
  }
}

// 创建示例用户数据
async function createSampleUsers() {
  console.log('👥 创建示例用户数据...');
  
  const sampleUsers = [
    {
      uid: 'sample_elderly_1',
      email: 'elderly1@example.com',
      username: '张奶奶',
      role: 'elderly',
      displayName: '张奶奶',
      phone: '13800138001',
      address: '北京市朝阳区某某街道123号',
      rating: null,
      completedTasks: 0,
      totalHours: 0,
      isActive: true,
      preferences: {
        notifications: { email: true, push: true },
        language: 'zh-CN'
      }
    },
    {
      uid: 'sample_volunteer_1',
      email: 'volunteer1@example.com',
      username: '李志愿者',
      role: 'volunteer',
      displayName: '李志愿者',
      phone: '13800138002',
      address: '北京市海淀区某某街道456号',
      rating: 4.8,
      completedTasks: 15,
      totalHours: 45,
      isActive: true,
      preferences: {
        notifications: { email: true, push: true },
        language: 'zh-CN'
      }
    }
  ];

  for (const user of sampleUsers) {
    try {
      await db.collection('users').doc(user.uid).set({
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ 用户 ${user.displayName} 已创建`);
    } catch (error) {
      console.error(`❌ 用户 ${user.displayName} 创建失败:`, error);
    }
  }
}

// 创建示例任务数据
async function createSampleTasks() {
  console.log('📋 创建示例任务数据...');
  
  const sampleTasks = [
    {
      title: '购买日常用品',
      description: '需要购买一些日常用品，包括牙膏、洗发水、肥皂等。',
      type: 'shopping',
      status: 'pending',
      requesterId: 'sample_elderly_1',
      requesterName: '张奶奶',
      location: {
        address: '北京市朝阳区某某街道123号',
        coordinates: { latitude: 39.9042, longitude: 116.4074 }
      },
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后
      budget: { amount: 100, currency: 'CNY' },
      priority: 'medium',
      tags: ['日常用品', '购物'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      title: '陪伴聊天',
      description: '希望有人能陪我聊聊天，分享一些生活趣事。',
      type: 'companionship',
      status: 'accepted',
      requesterId: 'sample_elderly_1',
      requesterName: '张奶奶',
      volunteerId: 'sample_volunteer_1',
      volunteerName: '李志愿者',
      location: {
        address: '北京市朝阳区某某街道123号',
        coordinates: { latitude: 39.9042, longitude: 116.4074 }
      },
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12小时后
      completionDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3小时后
      budget: { amount: 50, currency: 'CNY' },
      priority: 'low',
      tags: ['陪伴', '聊天'],
      acceptedAt: new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  for (const task of sampleTasks) {
    try {
      const docRef = await db.collection('tasks').add(task);
      console.log(`✅ 任务 "${task.title}" 已创建 (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ 任务 "${task.title}" 创建失败:`, error);
    }
  }
}

// 主函数
async function initializeFirebase() {
  try {
    console.log('🚀 开始初始化 Firebase 数据...');
    
    await initializeSystemConfig();
    await createSampleUsers();
    await createSampleTasks();
    
    console.log('🎉 Firebase 数据初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行初始化
initializeFirebase();
