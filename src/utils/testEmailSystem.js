// 测试邮件系统的工具
import internalMailService from '../services/internalMailService'
import { emailLogService } from '../services/emailLogService'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

// 测试内部邮件发送
export const testInternalEmail = async () => {
  try {
    console.log('📧 Testing internal email system...')
    
    // 获取所有用户
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = []
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })

    if (users.length < 2) {
      console.error('❌ Need at least 2 users to test email system')
      return { success: false, message: 'Need at least 2 users' }
    }

    const fromUser = users[0]
    const toUser = users[1]

    console.log(`📧 Sending test email from ${fromUser.displayName} to ${toUser.displayName}`)

    // 发送测试邮件
    const result = await internalMailService.sendInternalMessage(
      fromUser.id,
      toUser.id,
      'Test Email Subject',
      'This is a test email content to verify the email system is working correctly.',
      'normal'
    )

    if (result.success) {
      console.log('✅ Internal email sent successfully:', result.messageId)
      
      // 测试收件箱
      const inboxResult = await internalMailService.getInboxMessages(toUser.id)
      console.log('📧 Inbox messages:', inboxResult.messages?.length || 0)
      
      // 测试已发送邮件
      const sentResult = await emailLogService.getUserEmailLogs(fromUser.id)
      console.log('📧 Sent emails:', sentResult.emails?.length || 0)
      
      return {
        success: true,
        messageId: result.messageId,
        inboxCount: inboxResult.messages?.length || 0,
        sentCount: sentResult.emails?.length || 0
      }
    } else {
      console.error('❌ Failed to send internal email:', result.message)
      return { success: false, message: result.message }
    }

  } catch (error) {
    console.error('❌ Error testing email system:', error)
    return { success: false, message: error.message }
  }
}

// 测试邮件统计
export const testEmailStats = async () => {
  try {
    console.log('📧 Testing email statistics...')
    
    // 获取内部消息统计
    const internalMessagesSnapshot = await getDocs(collection(db, 'internal_messages'))
    const emailLogsSnapshot = await getDocs(collection(db, 'email_logs'))
    
    const stats = {
      internalMessages: internalMessagesSnapshot.size,
      emailLogs: emailLogsSnapshot.size
    }
    
    console.log('📧 Email statistics:', stats)
    return { success: true, stats }
    
  } catch (error) {
    console.error('❌ Error getting email stats:', error)
    return { success: false, message: error.message }
  }
}

// 测试用户邮件数据
export const testUserEmails = async (userId) => {
  try {
    console.log(`📧 Testing emails for user: ${userId}`)
    
    // 测试收件箱
    const inboxResult = await internalMailService.getInboxMessages(userId)
    console.log('📧 Inbox messages:', inboxResult.messages?.length || 0)
    
    // 测试已发送
    const sentResult = await emailLogService.getUserEmailLogs(userId)
    console.log('📧 Sent emails:', sentResult.emails?.length || 0)
    
    // 测试邮件历史
    const historyResult = await emailLogService.getEmailHistory(userId)
    console.log('📧 Email history:', historyResult.emails?.length || 0)
    
    return {
      success: true,
      inbox: inboxResult.messages?.length || 0,
      sent: sentResult.emails?.length || 0,
      history: historyResult.emails?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Error testing user emails:', error)
    return { success: false, message: error.message }
  }
}

// 清理测试数据
export const cleanupTestEmails = async () => {
  try {
    console.log('📧 Cleaning up test emails...')
    
    // 这里可以添加清理逻辑，比如删除包含"Test Email"的邮件
    // 为了安全起见，暂时不实现自动删除
    
    console.log('📧 Manual cleanup required - please use deleteTestEmails() if needed')
    return { success: true, message: 'Manual cleanup required' }
    
  } catch (error) {
    console.error('❌ Error cleaning up test emails:', error)
    return { success: false, message: error.message }
  }
}

// 导出工具函数到全局
if (typeof window !== 'undefined') {
  window.testInternalEmail = testInternalEmail
  window.testEmailStats = testEmailStats
  window.testUserEmails = testUserEmails
  window.cleanupTestEmails = cleanupTestEmails
  
  console.log('📧 Email testing utilities loaded:')
  console.log('  - window.testInternalEmail() - Test internal email sending')
  console.log('  - window.testEmailStats() - Get email statistics')
  console.log('  - window.testUserEmails(userId) - Test user email data')
  console.log('  - window.cleanupTestEmails() - Cleanup test emails')
}

export default {
  testInternalEmail,
  testEmailStats,
  testUserEmails,
  cleanupTestEmails
}
