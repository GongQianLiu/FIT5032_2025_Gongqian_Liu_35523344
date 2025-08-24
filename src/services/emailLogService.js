// 邮件日志服务 - 将邮件发送记录存储到Firebase
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, deleteDoc } from 'firebase/firestore';

export const emailLogService = {
  // 记录邮件发送日志
  async logEmailSent(emailData) {
    try {
      const logEntry = {
        // 基本信息
        to: emailData.to,
        from: emailData.from || 'system@oldservice.com',
        subject: emailData.subject,
        
        // 内容信息
        contentPreview: emailData.content ? emailData.content.substring(0, 200) + '...' : '',
        contentLength: emailData.content ? emailData.content.length : 0,
        hasAttachment: !!emailData.attachment,
        attachmentName: emailData.attachment ? emailData.attachment.name : null,
        
        // 发送信息
        sendMethod: emailData.sendMethod || 'unknown', // 'firebase', 'postmark', 'mock'
        messageId: emailData.messageId || null,
        success: emailData.success || false,
        
        // 时间戳
        sentAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
        
        // 用户信息
        senderUserId: emailData.senderUserId || null,
        senderName: emailData.senderName || 'System',
        
        // 状态信息
        status: emailData.success ? 'sent' : 'failed',
        errorMessage: emailData.error || null,
        
        // 元数据
        userAgent: navigator.userAgent,
        ipAddress: null, // 客户端无法获取真实IP
        environment: window.location.hostname === 'localhost' ? 'development' : 'production'
      };

      const docRef = await addDoc(collection(db, 'email_logs'), logEntry);
      console.log('📧 Email log saved to Firebase:', docRef.id);
      
      return {
        success: true,
        logId: docRef.id,
        message: 'Email log saved successfully'
      };
    } catch (error) {
      console.error('❌ Failed to save email log:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save email log'
      };
    }
  },

  // 获取邮件发送历史
  async getEmailHistory(userId = null, limitCount = 50) {
    try {
      let q;

      if (userId) {
        // 获取特定用户的邮件历史（移除orderBy避免索引问题）
        q = query(
          collection(db, 'email_logs'),
          where('senderUserId', '==', userId),
          limit(limitCount)
        );
      } else {
        // 获取所有邮件历史
        q = query(
          collection(db, 'email_logs'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const emailHistory = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        emailHistory.push({
          id: doc.id,
          ...data,
          // 安全处理时间戳
          sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : new Date(data.timestamp || data.sentAt)
        });
      });

      // 在客户端排序
      emailHistory.sort((a, b) => {
        const aTime = a.sentAt || new Date(0);
        const bTime = b.sentAt || new Date(0);
        return bTime - aTime;
      });

      return {
        success: true,
        emails: emailHistory,
        count: emailHistory.length
      };
    } catch (error) {
      console.error('❌ Failed to get email history:', error);
      return {
        success: false,
        error: error.message,
        emails: []
      };
    }
  },

  // 获取邮件发送统计
  async getEmailStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'email_logs'),
        where('sentAt', '>=', startDate),
        orderBy('sentAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const stats = {
        total: 0,
        successful: 0,
        failed: 0,
        byMethod: {},
        byDay: {},
        recentEmails: []
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (data.success) {
          stats.successful++;
        } else {
          stats.failed++;
        }

        // 按发送方式统计
        const method = data.sendMethod || 'unknown';
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;

        // 按日期统计
        const date = data.sentAt?.toDate ? data.sentAt.toDate().toDateString() : new Date(data.timestamp).toDateString();
        stats.byDay[date] = (stats.byDay[date] || 0) + 1;

        // 最近邮件
        if (stats.recentEmails.length < 10) {
          stats.recentEmails.push({
            id: doc.id,
            to: data.to,
            subject: data.subject,
            success: data.success,
            sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : new Date(data.timestamp),
            sendMethod: data.sendMethod
          });
        }
      });

      stats.successRate = stats.total > 0 ? ((stats.successful / stats.total) * 100).toFixed(1) : 0;

      return {
        success: true,
        stats: stats
      };
    } catch (error) {
      console.error('❌ Failed to get email stats:', error);
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  },

  // 获取用户邮件日志 (别名方法，兼容现有代码)
  async getUserEmailLogs(userId, limitCount = 50) {
    return await this.getEmailHistory(userId, limitCount);
  },

  // 清理旧的邮件日志（保留最近90天）
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        collection(db, 'email_logs'),
        where('sentAt', '<', cutoffDate)
      );

      const querySnapshot = await getDocs(q);
      let deletedCount = 0;

      // 注意：在生产环境中，大量删除操作应该在服务器端进行
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
        deletedCount++;
      }

      return {
        success: true,
        deletedCount: deletedCount,
        message: `Cleaned up ${deletedCount} old email logs`
      };
    } catch (error) {
      console.error('❌ Failed to cleanup old logs:', error);
      return {
        success: false,
        error: error.message,
        deletedCount: 0
      };
    }
  }
};
