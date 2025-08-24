// 完整邮件系统测试工具
// 测试内部邮件（Firebase）和外部邮件（Netlify Functions + Postmark）

import internalMailService from '../services/internalMailService'
import emailService from '../services/emailService'
import { emailLogService } from '../services/emailLogService'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

// 测试完整的邮件系统
export const testCompleteEmailSystem = async () => {
  try {
    console.log('📧 Testing Complete Email System...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const results = {
      internal: null,
      external: null,
      logs: null
    }

    // 1. 测试内部邮件（Firebase）
    console.log('🔥 Testing INTERNAL emails (Firebase)...')
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const users = []
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      if (users.length >= 2) {
        const fromUser = users[0]
        const toUser = users[1]

        const internalResult = await internalMailService.sendInternalMessage(
          fromUser.id,
          toUser.id,
          'Test Internal Message',
          'This is a test internal message sent via Firebase.',
          'normal'
        )

        results.internal = {
          success: internalResult.success,
          messageId: internalResult.messageId,
          method: 'Firebase',
          from: fromUser.displayName || fromUser.username,
          to: toUser.displayName || toUser.username
        }

        console.log('✅ Internal email test:', internalResult.success ? 'SUCCESS' : 'FAILED')
      } else {
        results.internal = { success: false, error: 'Need at least 2 users' }
        console.log('❌ Internal email test: Need at least 2 users')
      }
    } catch (error) {
      results.internal = { success: false, error: error.message }
      console.log('❌ Internal email test failed:', error.message)
    }

    // 2. 测试外部邮件（Netlify Functions + Postmark）
    console.log('🌐 Testing EXTERNAL emails (Netlify Functions + Postmark)...')
    try {
      const externalResult = await emailService.sendEmail(
        'test@example.com',
        'Test External Email',
        'This is a test external email sent via Netlify Functions and Postmark.',
        null,
        {
          userId: 'test-user',
          name: 'Test User',
          email: 'noreply@evergreenway.com'
        }
      )

      results.external = {
        success: externalResult.success,
        messageId: externalResult.messageId,
        method: 'Netlify Functions + Postmark',
        to: 'test@example.com'
      }

      console.log('✅ External email test:', externalResult.success ? 'SUCCESS' : 'FAILED')
    } catch (error) {
      results.external = { success: false, error: error.message }
      console.log('❌ External email test failed:', error.message)
    }

    // 3. 测试邮件日志
    console.log('📊 Testing email logs...')
    try {
      const logsResult = await emailLogService.getEmailHistory(null, 10)
      results.logs = {
        success: logsResult.success,
        count: logsResult.emails?.length || 0
      }
      console.log('✅ Email logs test:', logsResult.success ? 'SUCCESS' : 'FAILED')
      console.log('📊 Total email logs:', logsResult.emails?.length || 0)
    } catch (error) {
      results.logs = { success: false, error: error.message }
      console.log('❌ Email logs test failed:', error.message)
    }

    // 总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email System Test Results:')
    console.log('  🔥 Internal (Firebase):', results.internal?.success ? '✅ SUCCESS' : '❌ FAILED')
    console.log('  🌐 External (Netlify):', results.external?.success ? '✅ SUCCESS' : '❌ FAILED')
    console.log('  📊 Logs:', results.logs?.success ? '✅ SUCCESS' : '❌ FAILED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return {
      success: true,
      results: results,
      summary: {
        internal: results.internal?.success || false,
        external: results.external?.success || false,
        logs: results.logs?.success || false
      }
    }

  } catch (error) {
    console.error('❌ Complete email system test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 测试邮件系统配置
export const testEmailSystemConfig = async () => {
  try {
    console.log('⚙️ Testing Email System Configuration...')
    
    const config = {
      firebase: {
        available: !!window.firebase || !!db,
        collections: []
      },
      netlify: {
        endpoint: import.meta.env.PROD 
          ? '/.netlify/functions/send-email'
          : 'http://localhost:8888/.netlify/functions/send-email',
        available: false
      },
      environment: {
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        dev: import.meta.env.DEV
      }
    }

    // 测试Firebase集合
    try {
      const collections = ['users', 'internal_messages', 'email_logs']
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName))
        config.firebase.collections.push({
          name: collectionName,
          count: snapshot.size
        })
      }
    } catch (error) {
      console.warn('Firebase collections test failed:', error.message)
    }

    // 测试Netlify Functions
    try {
      const response = await fetch(config.netlify.endpoint, {
        method: 'OPTIONS'
      })
      config.netlify.available = response.ok
    } catch (error) {
      config.netlify.available = false
    }

    console.log('⚙️ Configuration Results:')
    console.log('  🔥 Firebase:', config.firebase.available ? '✅ Available' : '❌ Not Available')
    console.log('  🌐 Netlify Functions:', config.netlify.available ? '✅ Available' : '❌ Not Available')
    console.log('  📊 Collections:', config.firebase.collections.map(c => `${c.name}(${c.count})`).join(', '))
    console.log('  🌍 Environment:', config.environment.mode)

    return { success: true, config }

  } catch (error) {
    console.error('❌ Configuration test failed:', error)
    return { success: false, error: error.message }
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.testCompleteEmailSystem = testCompleteEmailSystem
  window.testEmailSystemConfig = testEmailSystemConfig
  
  console.log('🔧 Complete email system testing utilities loaded:')
  console.log('  - window.testCompleteEmailSystem() - Test both internal and external emails')
  console.log('  - window.testEmailSystemConfig() - Test system configuration')
}

export default {
  testCompleteEmailSystem,
  testEmailSystemConfig
}
