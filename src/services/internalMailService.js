// Internal Mail Service for Evergreen Way
// Handles system-internal email communication via Firebase
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import emailService from './emailService';

class InternalMailService {
  // Helper function to get user information
  async getUserInfo(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          name: userData.displayName || userData.username || 'Unknown User',
          email: userData.email || 'noreply@evergreenway.com'
        };
      } else {
        return {
          name: 'Unknown User',
          email: 'noreply@evergreenway.com'
        };
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        name: 'Unknown User',
        email: 'noreply@evergreenway.com'
      };
    }
  }
  constructor() {
    this.listeners = new Map();
  }

  // Send internal message between system users
  async sendInternalMessage(fromUserId, toUserId, subject, content, priority = 'normal') {
    try {
      // Validate required parameters
      if (!fromUserId) {
        throw new Error('fromUserId is required');
      }
      if (!toUserId) {
        throw new Error('toUserId is required');
      }
      if (!subject) {
        throw new Error('subject is required');
      }
      if (!content) {
        throw new Error('content is required');
      }

      console.log('📧 Sending internal message:', {
        fromUserId,
        toUserId,
        subject: subject.substring(0, 50) + '...',
        contentLength: content.length,
        priority
      });

      // Get user information for both sender and recipient
      const [fromUserResult, toUserResult] = await Promise.all([
        this.getUserInfo(fromUserId),
        this.getUserInfo(toUserId)
      ]);

      const messageData = {
        fromUserId,
        fromUserName: fromUserResult.name || 'Unknown User',
        fromUserEmail: fromUserResult.email || 'noreply@evergreenway.com',
        toUserId,
        toUserName: toUserResult.name || 'Unknown User',
        toUserEmail: toUserResult.email || 'noreply@evergreenway.com',
        subject,
        content,
        priority,
        isRead: false,
        isStarred: false,
        isArchived: false,
        isDeleted: false,
        sentAt: serverTimestamp(),
        type: 'internal'
      };

      const docRef = await addDoc(collection(db, 'internal_messages'), messageData);

      // Also log to email_logs for sent emails tracking
      const emailLogData = {
        senderUserId: fromUserId,
        senderName: messageData.fromUserName,
        senderEmail: messageData.fromUserEmail,
        recipientUserId: toUserId,
        recipientName: messageData.toUserName,
        recipientEmail: messageData.toUserEmail,
        toEmail: messageData.toUserEmail,
        subject: subject,
        content: content,
        sentAt: serverTimestamp(),
        status: 'sent',
        type: 'internal',
        method: 'Internal',
        hasAttachment: false,
        messageId: docRef.id
      };

      await addDoc(collection(db, 'email_logs'), emailLogData);

      return {
        success: true,
        messageId: docRef.id,
        message: 'Internal message sent successfully'
      };
    } catch (error) {
      console.error('Error sending internal message:', error);
      throw new Error('Failed to send internal message: ' + error.message);
    }
  }

  // Send external email (using existing email service)
  async sendExternalEmail(fromUserId, toEmail, subject, content, attachment = null) {
    try {
      // Get sender information
      const senderInfo = await this.getUserInfo(fromUserId);

      // Send via external email service with sender info
      const result = await emailService.sendEmail(toEmail, subject, content, attachment, senderInfo);
      
      // Log the sent email in Firebase
      const emailLogData = {
        fromUserId,
        toEmail,
        subject,
        content,
        hasAttachment: !!attachment,
        sentAt: serverTimestamp(),
        type: 'external',
        status: 'sent',
        messageId: result.messageId || null
      };

      await addDoc(collection(db, 'email_logs'), emailLogData);
      
      return {
        success: true,
        message: 'External email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending external email:', error);
      throw new Error('Failed to send external email: ' + error.message);
    }
  }

  // Get inbox messages for a user
  async getInboxMessages(userId, limitCount = 50) {
    try {
      // Simplified query to avoid index requirements
      const q = query(
        collection(db, 'internal_messages'),
        where('toUserId', '==', userId),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out deleted messages in client-side
        if (!data.isDeleted) {
          messages.push({
            id: doc.id,
            ...data
          });
        }
      });

      // If no messages found, create some sample messages for demonstration
      if (messages.length === 0) {
        console.log('📧 No messages found in Firebase, creating sample messages');
        const sampleMessages = [
          {
            id: 'sample-1',
            fromUserId: 'user-admin-1',
            fromUserName: 'System Administrator',
            toUserId: userId,
            subject: 'Welcome to Evergreen Way Services',
            content: '<p>Dear User,</p><p>Welcome to our internal messaging system! We\'re excited to have you as part of our community.</p><p>Best regards,<br>Admin Team</p>',
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isRead: false,
            isStarred: false,
            isDeleted: false
          },
          {
            id: 'sample-2',
            fromUserId: 'user-doctor-1',
            fromUserName: 'Dr. Sarah Johnson',
            toUserId: userId,
            subject: 'Health Check Reminder',
            content: '<p>Hello,</p><p>This is a friendly reminder about your upcoming health check appointment.</p><p>Please contact us if you need to reschedule.</p><p>Best regards,<br>Dr. Johnson</p>',
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: false,
            isStarred: true,
            isDeleted: false
          },
          {
            id: 'sample-3',
            fromUserId: 'user-volunteer-1',
            fromUserName: 'John Doe',
            toUserId: userId,
            subject: 'Community Event Invitation',
            content: '<p>Hi there!</p><p>We\'re organizing a community event next week and would love to have you join us.</p><p>Details will follow soon.</p><p>Cheers,<br>John</p>',
            sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            isRead: true,
            isStarred: false,
            isDeleted: false
          }
        ];

        return {
          success: true,
          messages: sampleMessages
        };
      }

      // Sort by sentAt in client-side
      messages.sort((a, b) => {
        const aDate = a.sentAt?.toDate ? a.sentAt.toDate() : new Date(a.sentAt || 0);
        const bDate = b.sentAt?.toDate ? b.sentAt.toDate() : new Date(b.sentAt || 0);
        return bDate - aDate;
      });

      return {
        success: true,
        messages: messages.slice(0, limitCount)
      };
    } catch (error) {
      console.error('Error getting inbox messages:', error);
      throw new Error('Failed to get inbox messages: ' + error.message);
    }
  }

  // Get sent messages for a user
  async getSentMessages(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'internal_messages'),
        where('fromUserId', '==', userId),
        orderBy('sentAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        messages
      };
    } catch (error) {
      console.error('Error getting sent messages:', error);
      throw new Error('Failed to get sent messages: ' + error.message);
    }
  }

  // Listen to real-time inbox updates (disabled to avoid index issues)
  listenToInbox(userId, callback) {
    console.log('📧 Real-time inbox listening disabled to avoid Firebase index issues');
    console.log('📧 Using manual refresh instead');

    // Return a dummy unsubscribe function
    const dummyUnsubscribe = () => {
      console.log('📧 Dummy unsubscribe called');
    };

    // Load initial messages manually
    this.getInboxMessages(userId).then(result => {
      if (result.success) {
        callback(result.messages);
      } else {
        callback([]);
      }
    }).catch(error => {
      console.error('Error loading inbox messages:', error);
      callback([]);
    });

    this.listeners.set(`inbox_${userId}`, dummyUnsubscribe);
    return dummyUnsubscribe;
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const messageRef = doc(db, 'internal_messages', messageId);
      await updateDoc(messageRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read: ' + error.message);
    }
  }

  // Star/unstar message
  async toggleStar(messageId, isStarred) {
    try {
      const messageRef = doc(db, 'internal_messages', messageId);
      await updateDoc(messageRef, {
        isStarred: isStarred
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error toggling star:', error);
      throw new Error('Failed to toggle star: ' + error.message);
    }
  }

  // Archive message
  async archiveMessage(messageId) {
    try {
      const messageRef = doc(db, 'internal_messages', messageId);
      await updateDoc(messageRef, {
        isArchived: true,
        archivedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error archiving message:', error);
      throw new Error('Failed to archive message: ' + error.message);
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const messageRef = doc(db, 'internal_messages', messageId);
      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message: ' + error.message);
    }
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, 'internal_messages'),
        where('toUserId', '==', userId),
        where('isRead', '==', false),
        where('isDeleted', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return {
        success: true,
        count: querySnapshot.size
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, count: 0 };
    }
  }

  // Clean up listeners
  // Get user information for email logging
  async getUserInfo(userId) {
    try {
      if (!userId) {
        return {
          userId: null,
          name: 'Anonymous User',
          displayName: 'Anonymous User',
          email: null
        };
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          userId: userId,
          name: userData.displayName || userData.username || 'Unknown User',
          displayName: userData.displayName || userData.username || 'Unknown User',
          email: userData.email || null
        };
      } else {
        return {
          userId: userId,
          name: 'Unknown User',
          displayName: 'Unknown User',
          email: null
        };
      }
    } catch (error) {
      console.warn('Failed to get user info:', error);
      return {
        userId: userId,
        name: 'Unknown User',
        displayName: 'Unknown User',
        email: null
      };
    }
  }

  // Get user inbox (alias for getInboxMessages for compatibility)
  async getUserInbox(userId, limitCount = 50) {
    return await this.getInboxMessages(userId, limitCount);
  }

  // Get all users for recipient selection
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          username: userData.username,
          displayName: userData.displayName || userData.username,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          status: userData.status
        });
      });

      console.log(`📧 Loaded ${users.length} users for recipient selection`);
      return {
        success: true,
        users: users.filter(user => user.isActive !== false) // Only active users (isActive is true or undefined)
      };
    } catch (error) {
      console.error('Error loading users:', error);
      return {
        success: false,
        users: [],
        error: error.message
      };
    }
  }

  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }
}

export default new InternalMailService();
