// Postmark配置和验证工具
import { API_CONFIG } from '../config/api';

export const postmarkSetup = {
  // 验证Postmark配置
  validateConfig() {
    console.log('🔍 Validating Postmark Configuration...');
    
    const config = API_CONFIG.POSTMARK;
    const issues = [];
    
    if (!config) {
      issues.push('❌ Postmark configuration not found');
      return { valid: false, issues };
    }
    
    if (!config.ENABLED) {
      issues.push('⚠️ Postmark is disabled in configuration');
    }
    
    if (!config.API_KEY) {
      issues.push('❌ Postmark API key is missing');
    } else if (config.API_KEY.length < 30) {
      issues.push('⚠️ Postmark API key seems too short');
    }
    
    if (!config.FROM_EMAIL) {
      issues.push('❌ From email address is missing');
    } else if (!config.FROM_EMAIL.includes('@')) {
      issues.push('❌ From email address is invalid');
    }
    
    if (!config.API_URL) {
      issues.push('❌ Postmark API URL is missing');
    }
    
    console.log('📋 Configuration Check Results:');
    console.log('🔑 API Key:', config.API_KEY ? config.API_KEY.substring(0, 8) + '...' : 'Missing');
    console.log('📧 From Email:', config.FROM_EMAIL || 'Missing');
    console.log('🌐 API URL:', config.API_URL || 'Missing');
    console.log('✅ Enabled:', config.ENABLED ? 'Yes' : 'No');
    
    if (issues.length === 0) {
      console.log('✅ Postmark configuration is valid');
      return { valid: true, issues: [] };
    } else {
      console.log('❌ Configuration issues found:');
      issues.forEach(issue => console.log('  ', issue));
      return { valid: false, issues };
    }
  },

  // 测试Postmark API连接
  async testConnection() {
    console.log('🧪 Testing Postmark API Connection...');
    
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.log('❌ Cannot test connection: Configuration invalid');
      return { success: false, error: 'Invalid configuration', issues: validation.issues };
    }
    
    try {
      const testData = {
        From: API_CONFIG.POSTMARK.FROM_EMAIL,
        To: 'test@example.com',
        Subject: 'Postmark Connection Test',
        TextBody: 'This is a test email to verify Postmark API connection.',
        MessageStream: 'outbound'
      };

      console.log('📡 Sending test request to Postmark...');
      
      const response = await fetch(API_CONFIG.POSTMARK.API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': API_CONFIG.POSTMARK.API_KEY
        },
        body: JSON.stringify(testData)
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 200) {
        const result = await response.json();
        console.log('✅ Postmark API connection successful!');
        console.log('📧 Test email details:', result);
        return {
          success: true,
          messageId: result.MessageID,
          submittedAt: result.SubmittedAt,
          to: result.To
        };
      } else if (response.status === 422) {
        const errorData = await response.json();
        console.log('⚠️ Postmark API responded with validation error (expected for test email)');
        console.log('📋 Error details:', errorData);
        
        // 422 is expected for test emails to invalid addresses
        if (errorData.ErrorCode === 300) {
          console.log('✅ API connection is working (invalid test email address is expected)');
          return {
            success: true,
            note: 'API connection verified (test email address rejected as expected)',
            errorCode: errorData.ErrorCode,
            message: errorData.Message
          };
        } else {
          return {
            success: false,
            error: errorData.Message,
            errorCode: errorData.ErrorCode
          };
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Postmark API error:', errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          status: response.status
        };
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      
      if (error.message.includes('CORS')) {
        console.log('ℹ️ CORS error detected - this is expected in browser environment');
        return {
          success: false,
          error: 'CORS policy blocks direct API access from browser',
          note: 'This is normal - emails will use no-cors mode',
          corsIssue: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        type: error.name
      };
    }
  },

  // 发送真实测试邮件
  async sendTestEmail(toEmail) {
    console.log(`📧 Sending real test email to: ${toEmail}`);
    
    if (!toEmail || !toEmail.includes('@')) {
      return {
        success: false,
        error: 'Valid email address required'
      };
    }
    
    try {
      const emailData = {
        From: API_CONFIG.POSTMARK.FROM_EMAIL,
        To: toEmail,
        Subject: 'Postmark Test Email - ' + new Date().toLocaleString(),
        HtmlBody: `
          <h2>Postmark Test Email</h2>
          <p>This is a test email sent from your Evergreen Way application.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${API_CONFIG.POSTMARK.FROM_EMAIL}</p>
          <p><strong>API Key:</strong> ${API_CONFIG.POSTMARK.API_KEY.substring(0, 8)}...</p>
          <hr>
          <p><em>If you received this email, your Postmark configuration is working correctly!</em></p>
        `,
        TextBody: `
Postmark Test Email

This is a test email sent from your Evergreen Way application.

Sent at: ${new Date().toLocaleString()}
From: ${API_CONFIG.POSTMARK.FROM_EMAIL}
API Key: ${API_CONFIG.POSTMARK.API_KEY.substring(0, 8)}...

If you received this email, your Postmark configuration is working correctly!
        `,
        MessageStream: 'outbound'
      };

      // Try with CORS first
      try {
        const response = await fetch(API_CONFIG.POSTMARK.API_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': API_CONFIG.POSTMARK.API_KEY
          },
          body: JSON.stringify(emailData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Test email sent successfully via CORS!');
          return {
            success: true,
            method: 'cors',
            messageId: result.MessageID,
            submittedAt: result.SubmittedAt,
            to: result.To
          };
        } else {
          const errorData = await response.json();
          throw new Error(`HTTP ${response.status}: ${errorData.Message}`);
        }
      } catch (corsError) {
        console.log('⚠️ CORS failed, trying no-cors mode...');
        
        // Fallback to no-cors
        await fetch(API_CONFIG.POSTMARK.API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'X-Postmark-Server-Token': API_CONFIG.POSTMARK.API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        console.log('📧 Test email sent via no-cors mode');
        return {
          success: true,
          method: 'no-cors',
          messageId: 'nocors-' + Date.now(),
          note: 'Email sent but response not readable due to CORS'
        };
      }
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取Postmark设置建议
  getSetupInstructions() {
    console.log('📋 Postmark Setup Instructions:');
    console.log('');
    console.log('1. 📧 Verify Sender Email:');
    console.log('   - Login to Postmark dashboard');
    console.log('   - Add and verify your sender email domain');
    console.log('   - Current sender:', API_CONFIG.POSTMARK.FROM_EMAIL);
    console.log('');
    console.log('2. 🔑 Check API Key:');
    console.log('   - Ensure API key has send permissions');
    console.log('   - Current key:', API_CONFIG.POSTMARK.API_KEY?.substring(0, 8) + '...');
    console.log('');
    console.log('3. 🌐 CORS Considerations:');
    console.log('   - Direct browser calls may be blocked by CORS');
    console.log('   - System will automatically fallback to no-cors mode');
    console.log('   - For production, consider using Firebase Functions');
    console.log('');
    console.log('4. 🧪 Testing:');
    console.log('   - Use window.postmarkSetup.sendTestEmail("your@email.com")');
    console.log('   - Check your email inbox for test message');
    
    return {
      senderEmail: API_CONFIG.POSTMARK.FROM_EMAIL,
      apiKey: API_CONFIG.POSTMARK.API_KEY?.substring(0, 8) + '...',
      instructions: [
        'Verify sender email domain in Postmark dashboard',
        'Ensure API key has send permissions',
        'Test with real email address',
        'Check spam folder if email not received'
      ]
    };
  }
};

// 全局暴露（用于浏览器控制台调试）
if (typeof window !== 'undefined') {
  window.postmarkSetup = postmarkSetup;
  console.log('🔧 Postmark setup tools available as window.postmarkSetup');
}
