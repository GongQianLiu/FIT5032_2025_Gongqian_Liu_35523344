// 创建测试邮件数据的工具
import { db } from '../firebase/config'
import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore'

// 邮件模板
const emailTemplates = [
  {
    subject: "Task Assignment Notification",
    content: "Hello! A new task has been assigned to you. Please check your dashboard for details.",
    type: "internal"
  },
  {
    subject: "Task Completion Confirmation",
    content: "Thank you for completing the task. The elderly user has been notified.",
    type: "internal"
  },
  {
    subject: "Service Request Update",
    content: "Your service request has been updated. Please review the changes in your dashboard.",
    type: "internal"
  },
  {
    subject: "Weekly Volunteer Report",
    content: "Here's your weekly volunteer activity report. Thank you for your continued service!",
    type: "internal"
  },
  {
    subject: "Community Event Invitation",
    content: "You're invited to our upcoming community event. We hope to see you there!",
    type: "internal"
  },
  {
    subject: "System Maintenance Notice",
    content: "The system will undergo maintenance this weekend. Please plan accordingly.",
    type: "internal"
  },
  {
    subject: "Thank You Message",
    content: "Thank you for your excellent service. Your help makes a real difference in our community.",
    type: "internal"
  },
  {
    subject: "Appointment Reminder",
    content: "This is a reminder about your upcoming appointment. Please confirm your attendance.",
    type: "internal"
  }
]

// 创建测试邮件数据
export const createTestEmails = async () => {
  try {
    console.log('📧 Starting to create test email data...')
    
    // 获取所有用户
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = []
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })

    if (users.length < 2) {
      console.error('❌ Need at least 2 users to create test emails')
      return { success: false, message: 'Need at least 2 users' }
    }

    console.log(`📧 Found ${users.length} users`)

    // 创建内部消息
    const internalMessages = []
    const emailLogs = []

    // 为每个用户创建一些邮件
    for (let i = 0; i < users.length; i++) {
      const fromUser = users[i]
      
      // 每个用户发送3-5封邮件给其他用户
      const emailCount = Math.floor(Math.random() * 3) + 3
      
      for (let j = 0; j < emailCount; j++) {
        // 随机选择收件人（不是自己）
        const otherUsers = users.filter(u => u.id !== fromUser.id)
        const toUser = otherUsers[Math.floor(Math.random() * otherUsers.length)]
        
        // 随机选择邮件模板
        const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)]
        
        // 创建时间（过去30天内的随机时间）
        const daysAgo = Math.floor(Math.random() * 30)
        const hoursAgo = Math.floor(Math.random() * 24)
        const minutesAgo = Math.floor(Math.random() * 60)
        const sentDate = new Date()
        sentDate.setDate(sentDate.getDate() - daysAgo)
        sentDate.setHours(sentDate.getHours() - hoursAgo)
        sentDate.setMinutes(sentDate.getMinutes() - minutesAgo)

        // 内部消息数据
        const internalMessage = {
          fromUserId: fromUser.id,
          fromUserName: fromUser.displayName || fromUser.username || 'Unknown User',
          fromUserEmail: fromUser.email || 'noreply@evergreenway.com',
          toUserId: toUser.id,
          toUserName: toUser.displayName || toUser.username || 'Unknown User',
          toUserEmail: toUser.email || 'noreply@evergreenway.com',
          subject: template.subject,
          content: template.content,
          isRead: Math.random() > 0.3, // 70% 已读
          isStarred: Math.random() > 0.8, // 20% 标星
          isArchived: false,
          isDeleted: false,
          sentAt: sentDate,
          type: 'internal'
        }

        // 邮件日志数据
        const emailLog = {
          senderUserId: fromUser.id,
          senderName: fromUser.displayName || fromUser.username || 'Unknown User',
          senderEmail: fromUser.email || 'noreply@evergreenway.com',
          recipientUserId: toUser.id,
          recipientName: toUser.displayName || toUser.username || 'Unknown User',
          recipientEmail: toUser.email || 'noreply@evergreenway.com',
          subject: template.subject,
          content: template.content,
          sentAt: sentDate,
          status: 'sent',
          type: 'internal',
          hasAttachment: false
        }

        internalMessages.push(internalMessage)
        emailLogs.push(emailLog)
      }
    }

    console.log(`📧 Creating ${internalMessages.length} internal messages...`)
    
    // 批量创建内部消息
    for (const message of internalMessages) {
      await addDoc(collection(db, 'internal_messages'), {
        ...message,
        sentAt: serverTimestamp() // 使用服务器时间戳
      })
    }

    console.log(`📧 Creating ${emailLogs.length} email logs...`)
    
    // 批量创建邮件日志
    for (const log of emailLogs) {
      await addDoc(collection(db, 'email_logs'), {
        ...log,
        sentAt: serverTimestamp() // 使用服务器时间戳
      })
    }

    console.log('✅ Test email data created successfully!')
    
    return {
      success: true,
      message: `Created ${internalMessages.length} internal messages and ${emailLogs.length} email logs`,
      internalMessages: internalMessages.length,
      emailLogs: emailLogs.length
    }

  } catch (error) {
    console.error('❌ Failed to create test email data:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 删除所有测试邮件数据
export const deleteTestEmails = async () => {
  try {
    console.log('📧 Deleting all test email data...')
    
    // 删除内部消息
    const internalMessagesSnapshot = await getDocs(collection(db, 'internal_messages'))
    console.log(`📧 Deleting ${internalMessagesSnapshot.size} internal messages...`)
    
    for (const doc of internalMessagesSnapshot.docs) {
      await deleteDoc(doc.ref)
    }

    // 删除邮件日志
    const emailLogsSnapshot = await getDocs(collection(db, 'email_logs'))
    console.log(`📧 Deleting ${emailLogsSnapshot.size} email logs...`)
    
    for (const doc of emailLogsSnapshot.docs) {
      await deleteDoc(doc.ref)
    }

    console.log('✅ All test email data deleted successfully!')
    
    return {
      success: true,
      message: `Deleted ${internalMessagesSnapshot.size} internal messages and ${emailLogsSnapshot.size} email logs`
    }

  } catch (error) {
    console.error('❌ Failed to delete test email data:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 获取邮件统计
export const getEmailStats = async () => {
  try {
    const internalMessagesSnapshot = await getDocs(collection(db, 'internal_messages'))
    const emailLogsSnapshot = await getDocs(collection(db, 'email_logs'))
    
    return {
      internalMessages: internalMessagesSnapshot.size,
      emailLogs: emailLogsSnapshot.size
    }
  } catch (error) {
    console.error('❌ Failed to get email stats:', error)
    return {
      internalMessages: 0,
      emailLogs: 0
    }
  }
}

// 导出工具函数到全局
if (typeof window !== 'undefined') {
  window.createTestEmails = createTestEmails
  window.deleteTestEmails = deleteTestEmails
  window.getEmailStats = getEmailStats
  
  console.log('📧 Test email utilities loaded:')
  console.log('  - window.createTestEmails() - Create test email data')
  console.log('  - window.deleteTestEmails() - Delete all test email data')
  console.log('  - window.getEmailStats() - Get email statistics')
}

export default {
  createTestEmails,
  deleteTestEmails,
  getEmailStats
}
