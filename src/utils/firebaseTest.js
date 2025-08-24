// Firebase连接测试工具
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // 测试1: 尝试读取一个集合
    console.log('📖 Testing read access...');
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Read access successful. Documents found:', snapshot.size);
    
    // 测试2: 尝试写入一个测试文档
    console.log('✍️ Testing write access...');
    const testDoc = doc(db, 'test', 'connection-test-' + Date.now());
    await setDoc(testDoc, {
      message: 'Firebase connection test',
      timestamp: new Date(),
      success: true
    });
    console.log('✅ Write access successful');
    
    // 测试3: 检查用户集合
    console.log('👥 Testing users collection...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('✅ Users collection accessible. Users found:', usersSnapshot.size);
    
    // 测试4: 检查任务集合
    console.log('📋 Testing tasks collection...');
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    console.log('✅ Tasks collection accessible. Tasks found:', tasksSnapshot.size);
    
    console.log('🎉 All Firebase tests passed!');
    return {
      success: true,
      usersCount: usersSnapshot.size,
      tasksCount: tasksSnapshot.size,
      message: 'Firebase connection is working properly'
    };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Firebase connection failed'
    };
  }
};

// 创建测试用户数据
export const createTestUsers = async () => {
  console.log('👥 Creating test users...');
  
  const testUsers = [
    {
      id: 'test-elderly-1',
      displayName: 'John Doe',
      email: 'john.doe@example.com',
      role: 'elderly',
      status: 'active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    },
    {
      id: 'test-volunteer-1',
      displayName: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'volunteer',
      status: 'active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    },
    {
      id: 'test-admin-1',
      displayName: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    }
  ];
  
  try {
    for (const user of testUsers) {
      const userDoc = doc(db, 'users', user.id);
      await setDoc(userDoc, user);
      console.log(`✅ Created test user: ${user.displayName}`);
    }
    
    console.log('🎉 All test users created successfully!');
    return { success: true, count: testUsers.length };
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    return { success: false, error: error.message };
  }
};

// 创建测试任务数据
export const createTestTasks = async () => {
  console.log('📋 Creating test tasks...');
  
  const testTasks = [
    {
      id: 'test-task-1',
      title: 'Help with grocery shopping',
      type: 'shopping',
      status: 'open',
      priority: 'high',
      description: 'Need assistance with weekly grocery shopping',
      createdAt: new Date(),
      elderlyUserId: 'test-elderly-1'
    },
    {
      id: 'test-task-2',
      title: 'Companionship visit',
      type: 'companionship',
      status: 'in_progress',
      priority: 'medium',
      description: 'Weekly companionship visit',
      createdAt: new Date(),
      elderlyUserId: 'test-elderly-1',
      volunteerUserId: 'test-volunteer-1'
    },
    {
      id: 'test-task-3',
      title: 'Medical appointment transport',
      type: 'transportation',
      status: 'completed',
      priority: 'high',
      description: 'Transport to doctor appointment',
      createdAt: new Date(),
      elderlyUserId: 'test-elderly-1',
      volunteerUserId: 'test-volunteer-1',
      completedAt: new Date()
    }
  ];
  
  try {
    for (const task of testTasks) {
      const taskDoc = doc(db, 'tasks', task.id);
      await setDoc(taskDoc, task);
      console.log(`✅ Created test task: ${task.title}`);
    }
    
    console.log('🎉 All test tasks created successfully!');
    return { success: true, count: testTasks.length };
    
  } catch (error) {
    console.error('❌ Failed to create test tasks:', error);
    return { success: false, error: error.message };
  }
};

// 运行完整的Firebase测试套件
export const runFullFirebaseTest = async () => {
  console.log('🚀 Running full Firebase test suite...');
  
  const results = {
    connection: await testFirebaseConnection(),
    testUsers: await createTestUsers(),
    testTasks: await createTestTasks()
  };
  
  console.log('📊 Test Results Summary:');
  console.log('Connection:', results.connection.success ? '✅' : '❌');
  console.log('Test Users:', results.testUsers.success ? '✅' : '❌');
  console.log('Test Tasks:', results.testTasks.success ? '✅' : '❌');
  
  return results;
};
