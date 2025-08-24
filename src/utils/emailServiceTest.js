// 邮件服务测试工具
import { emailLogService } from '../services/emailLogService';

export const emailServiceTest = {
  // 测试Firebase Functions连接
  async testFirebaseFunctions() {
    console.log('🔥 Testing Firebase Functions...');
    
    try {
      const functionsUrl = 'https://us-central1-old-serice.cloudfunctions.net/sendEmail';
      
      const testData = {
        to: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email',
        from: 'system@oldservice.com'
      };

      console.log('📡 Sending request to:', functionsUrl);
      
      const response = await fetch(functionsUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          method: 'firebase'
        };
      }

      const result = await response.json();
      console.log('✅ Firebase Functions response:', result);
      
      return {
        success: true,
        result: result,
        method: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase Functions test failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'firebase'
      };
    }
  },

  // 测试Postmark API连接
  async testPostmarkAPI() {
    console.log('📮 Testing Postmark API...');
    
    try {
      const postmarkUrl = 'https://api.postmarkapp.com/email';
      const apiKey = 'e297544f-690e-4de4-b14d-15133b77e652';
      
      const testData = {
        From: 'noreply@evergreenway.com',
        To: 'test@example.com',
        Subject: 'Test Email',
        TextBody: 'This is a test email',
        MessageStream: 'outbound'
      };

      console.log('📡 Sending request to:', postmarkUrl);
      
      const response = await fetch(postmarkUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': apiKey
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          method: 'postmark'
        };
      }

      const result = await response.json();
      console.log('✅ Postmark API response:', result);
      
      return {
        success: true,
        result: result,
        method: 'postmark'
      };
    } catch (error) {
      console.error('❌ Postmark API test failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'postmark'
      };
    }
  },

  // 测试邮件日志服务
  async testEmailLogging() {
    console.log('📝 Testing Email Logging Service...');
    
    try {
      const testLogData = {
        to: 'test@example.com',
        subject: 'Test Log Entry',
        content: 'This is a test email log entry for testing purposes.',
        sendMethod: 'test',
        messageId: 'test-' + Date.now(),
        success: true,
        senderUserId: 'test-user',
        senderName: 'Test User'
      };

      console.log('📝 Logging test email data...');
      const result = await emailLogService.logEmailSent(testLogData);
      
      if (result.success) {
        console.log('✅ Email logging successful:', result.logId);
        return {
          success: true,
          logId: result.logId,
          method: 'logging'
        };
      } else {
        console.log('❌ Email logging failed:', result.error);
        return {
          success: false,
          error: result.error,
          method: 'logging'
        };
      }
    } catch (error) {
      console.error('❌ Email logging test failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'logging'
      };
    }
  },

  // 运行完整的邮件服务测试
  async runFullEmailTest() {
    console.log('🚀 Running Full Email Service Test Suite...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const results = {
      postmark: await this.testPostmarkAPI(),
      firebase: await this.testFirebaseFunctions(),
      logging: await this.testEmailLogging()
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Results Summary:');
    console.log('🔥 Firebase Functions:', results.firebase.success ? '✅ Working' : '❌ Failed');
    console.log('📮 Postmark API:', results.postmark.success ? '✅ Working' : '❌ Failed');
    console.log('📝 Email Logging:', results.logging.success ? '✅ Working' : '❌ Failed');
    
    // 分析结果
    const workingMethods = Object.values(results).filter(r => r.success).length;
    console.log(`\n🎯 Working Methods: ${workingMethods}/3`);
    
    if (workingMethods === 0) {
      console.log('⚠️ No email methods are working. All emails will use mock service.');
    } else if (workingMethods === 3) {
      console.log('🎉 All email methods are working perfectly!');
    } else {
      console.log('ℹ️ Some email methods are working. System will use fallbacks as needed.');
    }

    // 提供建议
    if (!results.firebase.success) {
      console.log('\n💡 Firebase Functions Issue:');
      console.log('   - Check if the Cloud Function is deployed');
      console.log('   - Verify the function URL is correct');
      console.log('   - Check CORS configuration');
    }

    if (!results.postmark.success) {
      console.log('\n💡 Postmark API Issue:');
      console.log('   - Verify API key is valid');
      console.log('   - Check if sender email is verified');
      console.log('   - Review CORS policy');
    }

    if (!results.logging.success) {
      console.log('\n💡 Email Logging Issue:');
      console.log('   - Check Firebase connection');
      console.log('   - Verify Firestore permissions');
      console.log('   - Check email_logs collection access');
    }

    return results;
  },

  // 获取邮件历史统计
  async getEmailStats() {
    try {
      console.log('📊 Getting email statistics...');
      const result = await emailLogService.getEmailStats(7); // Last 7 days
      
      if (result.success) {
        console.log('📊 Email Stats (Last 7 days):');
        console.log(`   Total: ${result.stats.total}`);
        console.log(`   Successful: ${result.stats.successful}`);
        console.log(`   Failed: ${result.stats.failed}`);
        console.log(`   Success Rate: ${result.stats.successRate}%`);
        console.log('   By Method:', result.stats.byMethod);
        
        return result.stats;
      } else {
        console.log('❌ Failed to get email stats:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting email stats:', error);
      return null;
    }
  }
};

// 全局暴露测试函数（用于浏览器控制台调试）
if (typeof window !== 'undefined') {
  window.emailServiceTest = emailServiceTest;
  console.log('🔧 Email Service Test tools available in console as window.emailServiceTest');
}
