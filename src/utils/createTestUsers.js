// 创建测试用户的工具脚本
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';

export const createTestUsers = async () => {
  try {
    console.log('🔧 Creating test users...');
    
    const testUsers = [
      {
        username: 'admin',
        displayName: 'System Administrator',
        email: 'admin@evergreenway.com',
        role: 'admin',
        status: 'active',
        phone: '+1-555-0001',
        address: '123 Admin Street, City, State 12345'
      },
      {
        username: 'dr.johnson',
        displayName: 'Dr. Sarah Johnson',
        email: 'dr.johnson@evergreenway.com',
        role: 'volunteer',
        status: 'active',
        phone: '+1-555-0002',
        address: '456 Medical Ave, City, State 12345',
        specialization: 'General Medicine'
      },
      {
        username: 'mary.smith',
        displayName: 'Mary Smith',
        email: 'mary.smith@evergreenway.com',
        role: 'elderly',
        status: 'active',
        phone: '+1-555-0003',
        address: '789 Senior Lane, City, State 12345',
        age: 72,
        emergencyContact: 'John Smith - +1-555-0004'
      },
      {
        username: 'john.doe',
        displayName: 'John Doe',
        email: 'john.doe@evergreenway.com',
        role: 'volunteer',
        status: 'active',
        phone: '+1-555-0005',
        address: '321 Helper Road, City, State 12345',
        skills: ['Transportation', 'Companionship']
      },
      {
        username: 'nurse.wilson',
        displayName: 'Nurse Emily Wilson',
        email: 'nurse.wilson@evergreenway.com',
        role: 'volunteer',
        status: 'active',
        phone: '+1-555-0006',
        address: '654 Care Street, City, State 12345',
        specialization: 'Home Care Nursing'
      }
    ];

    let createdCount = 0;
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUserQuery = query(
        collection(db, 'users'),
        where('username', '==', userData.username)
      );
      
      const existingUsers = await getDocs(existingUserQuery);
      
      if (existingUsers.empty) {
        // Add timestamps
        const userWithTimestamps = {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: null
        };
        
        await addDoc(collection(db, 'users'), userWithTimestamps);
        console.log(`✅ Created user: ${userData.displayName} (${userData.username})`);
        createdCount++;
      } else {
        console.log(`⏭️ User already exists: ${userData.displayName} (${userData.username})`);
      }
    }
    
    console.log(`🎉 Test user creation completed. Created ${createdCount} new users.`);
    return {
      success: true,
      message: `Created ${createdCount} test users`,
      createdCount
    };
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    return {
      success: false,
      error: error.message,
      createdCount: 0
    };
  }
};

// 删除测试用户的函数（用于清理）
export const deleteTestUsers = async () => {
  try {
    console.log('🗑️ Deleting test users...');
    
    const testUsernames = ['admin', 'dr.johnson', 'mary.smith', 'john.doe', 'nurse.wilson'];
    let deletedCount = 0;
    
    for (const username of testUsernames) {
      const userQuery = query(
        collection(db, 'users'),
        where('username', '==', username)
      );
      
      const users = await getDocs(userQuery);
      
      users.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log(`🗑️ Deleted user: ${username}`);
        deletedCount++;
      });
    }
    
    console.log(`🎉 Test user deletion completed. Deleted ${deletedCount} users.`);
    return {
      success: true,
      message: `Deleted ${deletedCount} test users`,
      deletedCount
    };
    
  } catch (error) {
    console.error('❌ Error deleting test users:', error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0
    };
  }
};

// 在浏览器控制台中可用的全局函数
if (typeof window !== 'undefined') {
  window.createTestUsers = createTestUsers;
  window.deleteTestUsers = deleteTestUsers;
  console.log('🔧 Test user utilities available: window.createTestUsers() and window.deleteTestUsers()');
}
