const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://old-serice.web.app', 'https://old-serice.firebaseapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// 初始化Firebase Admin
admin.initializeApp();

// 设置SendGrid API密钥
sgMail.setApiKey(functions.config().sendgrid.key);

// 获取Firestore实例
const db = admin.firestore();

// 获取Storage实例
const storage = admin.storage();

// 发送邮件函数 - 使用Postmark API
exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { to, subject, content, type, attachment } = req.body;

      if (!to || !subject || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Use Postmark API
      const postmarkApiKey = 'e297544f-690e-4de4-b14d-15133b77e652';
      const fromEmail = 'noreply@evergreenway.com';

      const emailData = {
        From: fromEmail,
        To: to,
        Subject: subject,
        HtmlBody: content,
        TextBody: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        MessageStream: 'outbound'
      };

      // Add attachment if provided
      if (attachment) {
        emailData.Attachments = [{
          Name: attachment.filename,
          Content: attachment.data,
          ContentType: attachment.type || 'application/octet-stream'
        }];
      }

      const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': postmarkApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!postmarkResponse.ok) {
        const errorData = await postmarkResponse.json();
        throw new Error(`Postmark API Error: ${errorData.Message || postmarkResponse.statusText}`);
      }

      const result = await postmarkResponse.json();

      // 记录邮件发送日志
      await admin.firestore().collection('email_logs').add({
        to: to,
        subject: subject,
        type: type || 'general',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        messageId: result.MessageID
      });

      res.status(200).json({
        success: true,
        message: 'Email sent successfully via Postmark',
        messageId: result.MessageID
      });
    } catch (error) {
      console.error('Email sending error:', error);
      
      // 记录错误日志
      await admin.firestore().collection('email_logs').add({
        to: req.body.to,
        subject: req.body.subject,
        type: req.body.type,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        error: error.message
      });

      res.status(500).json({ error: 'Failed to send email' });
    }
  });
});

// 发送带附件的邮件函数
exports.sendEmailWithAttachment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { to, subject, content } = req.body;
      const attachment = req.files?.attachment;

      if (!to || !subject || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const msg = {
        to: to,
        from: functions.config().sendgrid.from_email,
        subject: subject,
        html: content,
      };

      // 如果有附件，添加到邮件中
      if (attachment) {
        msg.attachments = [{
          content: attachment.data.toString('base64'),
          filename: attachment.name,
          type: attachment.mimetype,
          disposition: 'attachment'
        }];
      }

      await sgMail.send(msg);

      // 记录邮件发送日志
      await admin.firestore().collection('email_logs').add({
        to: to,
        subject: subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        hasAttachment: !!attachment
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });
});

// 任务状态变化时自动发送邮件
exports.onTaskStatusChange = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const taskId = context.params.taskId;

    // 检查状态是否发生变化
    if (newData.status === previousData.status) {
      return null;
    }

    try {
      // 获取用户信息
      const userDoc = await admin.firestore().collection('users').doc(newData.requesterId).get();
      const userData = userDoc.data();

      if (!userData || !userData.email) {
        console.log('User not found or no email:', newData.requesterId);
        return null;
      }

      let emailSubject = '';
      let emailContent = '';

      // 根据状态变化发送不同的邮件
      switch (newData.status) {
        case 'accepted':
          emailSubject = '您的求助请求已被接受';
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E8B57;">Evergreen Way</h2>
              <p>亲爱的 ${userData.username}，</p>
              <p>您的求助请求"${newData.title}"已被志愿者 ${newData.volunteerName} 接受。</p>
              <p>预计完成时间：${new Date(newData.completionDeadline).toLocaleString('zh-CN')}</p>
              <p>感谢您使用Evergreen Way！</p>
            </div>
          `;
          break;

        case 'completed':
          emailSubject = '您的求助请求已完成';
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E8B57;">Evergreen Way</h2>
              <p>亲爱的 ${userData.username}，</p>
              <p>您的求助请求"${newData.title}"已完成。</p>
              <p>请登录系统确认任务完成情况并评价志愿者服务。</p>
              <p>感谢您使用Evergreen Way！</p>
            </div>
          `;
          break;

        default:
          return null;
      }

      // 发送邮件
      const msg = {
        to: userData.email,
        from: functions.config().sendgrid.from_email,
        subject: emailSubject,
        html: emailContent,
      };

      await sgMail.send(msg);

      // 记录邮件发送日志
      await admin.firestore().collection('email_logs').add({
        to: userData.email,
        subject: emailSubject,
        taskId: taskId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        trigger: 'task_status_change'
      });

             console.log('Email sent for task status change:', taskId);
     } catch (error) {
       console.error('Error sending email for task status change:', error);
     }
   });

// 用户注册时创建用户文档
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // 创建用户文档
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0],
      role: 'user', // 默认角色，后续可更新
      displayName: user.displayName || user.email.split('@')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          push: true
        },
        language: 'zh-CN'
      }
    });

    // 发送欢迎邮件
    if (user.email) {
      try {
        const welcomeEmail = {
          to: user.email,
          from: functions.config().sendgrid.from_email,
          subject: '欢迎加入Evergreen Way',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E8B57;">Evergreen Way</h2>
              <p>亲爱的 ${user.displayName || user.email.split('@')[0]}，</p>
              <p>欢迎您加入Evergreen Way社区！</p>
              <p>我们致力于连接老年人和志愿者，创造互助友爱的社区环境。</p>
              <p>如果您有任何问题，请随时联系我们。</p>
              <p>感谢您使用Evergreen Way！</p>
            </div>
          `
        };

        await sgMail.send(welcomeEmail);

        // 记录邮件日志
        await db.collection('email_logs').add({
          to: user.email,
          subject: welcomeEmail.subject,
          type: 'welcome',
          status: 'sent',
          trigger: 'user_created',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }
    }

    console.log('User document created for:', user.uid);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// 任务创建时发送通知
exports.onTaskCreated = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const taskData = snap.data();
    const taskId = context.params.taskId;

    try {
      // 创建通知
      await db.collection('notifications').add({
        userId: taskData.requesterId,
        title: '任务创建成功',
        message: `您的任务"${taskData.title}"已成功创建，等待志愿者接受。`,
        type: 'task_created',
        priority: 'medium',
        isRead: false,
        actionUrl: `/task/${taskId}`,
        metadata: {
          taskId: taskId,
          requesterId: taskData.requesterId
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 发送邮件通知
      const userDoc = await db.collection('users').doc(taskData.requesterId).get();
      if (userDoc.exists && userDoc.data().email) {
        const emailData = userDoc.data();
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">Evergreen Way</h2>
            <p>亲爱的 ${emailData.displayName}，</p>
            <p>您的求助请求"${taskData.title}"已成功创建。</p>
            <p><strong>任务详情：</strong></p>
            <ul>
              <li>类型：${taskData.type}</li>
              <li>描述：${taskData.description}</li>
              <li>截止时间：${new Date(taskData.deadline.toDate()).toLocaleString('zh-CN')}</li>
            </ul>
            <p>志愿者将尽快与您联系。</p>
            <p>感谢您使用Evergreen Way！</p>
          </div>
        `;

        const msg = {
          to: emailData.email,
          from: functions.config().sendgrid.from_email,
          subject: '新的求助请求已创建',
          html: emailContent
        };

        await sgMail.send(msg);

        // 记录邮件日志
        await db.collection('email_logs').add({
          to: emailData.email,
          subject: msg.subject,
          type: 'task_created',
          status: 'sent',
          taskId: taskId,
          trigger: 'task_created',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log('Task creation notification sent for:', taskId);
    } catch (error) {
      console.error('Error sending task creation notification:', error);
    }
  });

// 定期清理过期任务
exports.cleanupExpiredTasks = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  try {
    const now = admin.firestore.Timestamp.now();
    const expiredTasks = await db.collection('tasks')
      .where('deadline', '<', now)
      .where('status', '==', 'pending')
      .get();

    const batch = db.batch();
    expiredTasks.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`Marked ${expiredTasks.size} tasks as expired`);
  } catch (error) {
    console.error('Error cleaning up expired tasks:', error);
  }
});

// 生成每日统计
exports.generateDailyStats = functions.pubsub.schedule('every day 00:00').onRun(async (context) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // 获取统计数据
    const usersSnapshot = await db.collection('users').get();
    const tasksSnapshot = await db.collection('tasks').get();
    const emailsSnapshot = await db.collection('email_logs').get();

    const stats = {
      type: 'daily',
      date: dateStr,
      metrics: {
        totalUsers: usersSnapshot.size,
        activeUsers: usersSnapshot.docs.filter(doc => doc.data().isActive).length,
        totalTasks: tasksSnapshot.size,
        completedTasks: tasksSnapshot.docs.filter(doc => doc.data().status === 'completed').length,
        totalEmails: emailsSnapshot.size,
        successfulEmails: emailsSnapshot.docs.filter(doc => doc.data().status === 'sent').length,
        averageRating: 0 // 需要计算平均评分
      },
      breakdown: {
        byRole: {
          elderly: usersSnapshot.docs.filter(doc => doc.data().role === 'elderly').length,
          volunteer: usersSnapshot.docs.filter(doc => doc.data().role === 'volunteer').length
        },
        byTaskType: {
          shopping: tasksSnapshot.docs.filter(doc => doc.data().type === 'shopping').length,
          delivery: tasksSnapshot.docs.filter(doc => doc.data().type === 'delivery').length,
          housework: tasksSnapshot.docs.filter(doc => doc.data().type === 'housework').length,
          companionship: tasksSnapshot.docs.filter(doc => doc.data().type === 'companionship').length
        },
        byStatus: {
          pending: tasksSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
          accepted: tasksSnapshot.docs.filter(doc => doc.data().status === 'accepted').length,
          completed: tasksSnapshot.docs.filter(doc => doc.data().status === 'completed').length,
          rated: tasksSnapshot.docs.filter(doc => doc.data().status === 'rated').length
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('statistics').add(stats);
    console.log('Daily statistics generated for:', dateStr);
  } catch (error) {
    console.error('Error generating daily stats:', error);
  }
});
