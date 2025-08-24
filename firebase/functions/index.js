const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();

// Postmark configuration
const POSTMARK_API_KEY = functions.config().postmark.api_key || process.env.POSTMARK_API_KEY;
const POSTMARK_FROM_EMAIL = functions.config().postmark.from_email || process.env.POSTMARK_FROM_EMAIL;

// Silicon Flow API configuration
const SILICON_FLOW_API_URL = 'https://api.siliconflow.com/v1/chat/completions'; // 请根据实际API地址修改
const SILICON_FLOW_API_KEY = functions.config().siliconflow.api_key;

exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { to, subject, content, attachment } = data;

    // Validate required fields
    if (!to || !subject || !content) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Check Postmark configuration
    if (!POSTMARK_API_KEY || !POSTMARK_FROM_EMAIL) {
      throw new functions.https.HttpsError('failed-precondition', 'Postmark configuration not found');
    }

    // Prepare email data for Postmark
    const emailData = {
      From: POSTMARK_FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: content,
      TextBody: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      MessageStream: 'outbound'
    };

    // Add attachment if provided
    if (attachment && attachment.data && attachment.filename) {
      emailData.Attachments = [{
        Name: attachment.filename,
        Content: attachment.data,
        ContentType: attachment.type || 'application/octet-stream'
      }];
    }

    // Send email via Postmark API
    const response = await axios.post('https://api.postmarkapp.com/email', emailData, {
      headers: {
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Log email sent
    await admin.firestore().collection('email_logs').add({
      from: context.auth.uid,
      to: to,
      subject: subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      messageId: response.data.MessageID,
      provider: 'postmark'
    });

    return { success: true, message: 'Email sent successfully', messageId: response.data.MessageID };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Log error
    await admin.firestore().collection('email_logs').add({
      from: context.auth.uid,
      to: data.to,
      subject: data.subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'failed',
      error: error.response?.data?.Message || error.message,
      provider: 'postmark'
    });

    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

exports.sendBulkEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { recipients, subject, content, attachment } = data;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || !subject || !content) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Check if user is admin
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can send bulk emails');
    }

    const results = [];
    
    // Send emails to each recipient
    for (const recipient of recipients) {
      try {
        const emailData = {
          From: POSTMARK_FROM_EMAIL,
          To: recipient.email,
          Subject: subject,
          HtmlBody: content,
          TextBody: content.replace(/<[^>]*>/g, ''),
          MessageStream: 'outbound'
        };

        // Add attachment if provided
        if (attachment && attachment.data && attachment.filename) {
          emailData.Attachments = [{
            Name: attachment.filename,
            Content: attachment.data,
            ContentType: attachment.type || 'application/octet-stream'
          }];
        }

        const response = await axios.post('https://api.postmarkapp.com/email', emailData, {
          headers: {
            'X-Postmark-Server-Token': POSTMARK_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        results.push({ email: recipient.email, status: 'sent', messageId: response.data.MessageID });
      } catch (error) {
        results.push({ email: recipient.email, status: 'failed', error: error.response?.data?.Message || error.message });
      }
    }

    // Log bulk email
    await admin.firestore().collection('email_logs').add({
      from: context.auth.uid,
      type: 'bulk',
      recipients: recipients.length,
      subject: subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
      results: results
    });

    return { success: true, results: results };
  } catch (error) {
    console.error('Bulk email sending error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send bulk emails');
  }
});

exports.sendTaskNotification = functions.firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const taskId = context.params.taskId;
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;

    // Only process if task was created or status changed
    if (!before || before.status !== after.status) {
      try {
        if (after.status === 'accepted') {
          // Send notification to elderly user
          const elderlyDoc = await admin.firestore().collection('users').doc(after.elderlyId).get();
          if (elderlyDoc.exists) {
            const elderly = elderlyDoc.data();
            
            const emailData = {
              From: POSTMARK_FROM_EMAIL,
              To: elderly.email,
              Subject: 'Your task has been accepted!',
              HtmlBody: `
                <h2>Task Accepted</h2>
                <p>Hello ${elderly.username},</p>
                <p>Your task "${after.title}" has been accepted by volunteer ${after.volunteerName}.</p>
                <p>Expected completion date: ${new Date(after.completionDeadline).toLocaleDateString()}</p>
                <p>Thank you for using Evergreen Way!</p>
              `,
              TextBody: `Task Accepted\n\nHello ${elderly.username},\n\nYour task "${after.title}" has been accepted by volunteer ${after.volunteerName}.\n\nExpected completion date: ${new Date(after.completionDeadline).toLocaleDateString()}\n\nThank you for using Evergreen Way!`,
              MessageStream: 'outbound'
            };

            await axios.post('https://api.postmarkapp.com/email', emailData, {
              headers: {
                'X-Postmark-Server-Token': POSTMARK_API_KEY,
                'Content-Type': 'application/json'
              }
            });
          }
        } else if (after.status === 'completed') {
          // Send notification to elderly user to rate the volunteer
          const elderlyDoc = await admin.firestore().collection('users').doc(after.elderlyId).get();
          if (elderlyDoc.exists) {
            const elderly = elderlyDoc.data();
            
            const emailData = {
              From: POSTMARK_FROM_EMAIL,
              To: elderly.email,
              Subject: 'Rate your volunteer service',
              HtmlBody: `
                <h2>Task Completed</h2>
                <p>Hello ${elderly.username},</p>
                <p>Your task "${after.title}" has been completed by volunteer ${after.volunteerName}.</p>
                <p>Please log in to rate their service and provide feedback.</p>
                <p>Thank you for using Evergreen Way!</p>
              `,
              TextBody: `Task Completed\n\nHello ${elderly.username},\n\nYour task "${after.title}" has been completed by volunteer ${after.volunteerName}.\n\nPlease log in to rate their service and provide feedback.\n\nThank you for using Evergreen Way!`,
              MessageStream: 'outbound'
            };

            await axios.post('https://api.postmarkapp.com/email', emailData, {
              headers: {
                'X-Postmark-Server-Token': POSTMARK_API_KEY,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      } catch (error) {
        console.error('Task notification error:', error);
      }
    }
  });

// AI Assistant function using Silicon Flow
exports.aiAssistant = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { message, conversationHistory = [] } = data;

    // Validate required fields
    if (!message || !message.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    // Get user context for personalized responses
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const userRole = userData.role || 'user';

    // Comprehensive system manual for AI
    const systemManual = `
# Evergreen Way 老年慈善服务平台 - 系统使用手册

## 系统概述
Evergreen Way是一个专为老年人口健康设计的现代化全栈Web应用程序，旨在为慈善机构提供卓越的用户体验和创新的技术方案，扩大服务范围，简化运营流程，并为老年用户及其家人提供便捷、易用的健康资源与支持服务。

## 用户角色系统

### 1. 老年人用户 (Elderly)
**功能权限：**
- 发布求助任务
- 查看和接受志愿者服务
- 评价志愿者服务
- 预约健康服务
- 查看个人任务历史
- 接收邮件通知

**主要页面：**
- /elderly-home - 老年人主页
- /elderly-dashboard - 任务管理仪表板
- /rate-volunteers - 评价志愿者
- /calendar - 预约健康服务
- /ai-assistant - AI智能助手

### 2. 志愿者用户 (Volunteer)
**功能权限：**
- 浏览可用的任务
- 接受和完成任务
- 查看任务历史
- 接收任务通知
- 查看个人评分

**主要页面：**
- /volunteer-home - 志愿者主页
- /volunteer-dashboard - 任务管理仪表板
- /ai-assistant - AI智能助手

### 3. 管理员用户 (Admin)
**功能权限：**
- 用户管理
- 系统数据管理
- 邮件群发
- 健康服务管理
- 社区活动管理
- 系统监控

**主要页面：**
- /admin-home - 管理员主页
- /admin-dashboard - 管理仪表板
- /user-management - 用户管理
- /data-management - 数据管理
- /email-management - 邮件管理
- /health-services - 健康服务管理
- /community-events - 社区活动管理

## 核心功能模块

### 1. 任务管理系统
**功能描述：**
- 老年人可以发布各种类型的求助任务
- 志愿者可以浏览和接受任务
- 支持任务状态跟踪（open, accepted, in_progress, completed, cancelled）
- 任务完成后可以进行评价

**任务类型：**
- shopping (购物)
- housework (家务)
- companionship (陪伴)
- health (健康)
- transportation (交通)
- other (其他)

**使用流程：**
1. 老年人登录后进入 /elderly-dashboard
2. 点击"Create Task"创建新任务
3. 填写任务标题、类型、描述、截止日期
4. 志愿者在 /volunteer-dashboard 浏览可用任务
5. 点击"Accept"接受任务
6. 完成任务后更新状态为"completed"
7. 老年人可以对志愿者进行评分和评价

### 2. 预约系统
**功能描述：**
- 支持健康服务预约
- 7天内预约限制
- 9:00-18:00时间段
- 每人最多3个预约
- 支持预约取消（时间限制）

**使用流程：**
1. 访问 /calendar 页面
2. 选择日期（7天内）
3. 选择服务类型
4. 选择时间段
5. 确认预约

### 3. 评价系统
**功能描述：**
- 老年人可以对完成的志愿者服务进行评分
- 1-5星评分系统
- 支持文字评价
- 影响志愿者整体评分

**使用流程：**
1. 任务完成后，老年人访问 /rate-volunteers
2. 查看已完成的任务列表
3. 选择要评价的任务
4. 给出星级评分和文字评价
5. 提交评价

### 4. 邮件系统
**功能描述：**
- 支持单发和群发邮件
- 支持附件上传
- 自动任务状态通知
- 邮件发送记录

**使用流程：**
1. 访问 /email-management
2. 选择收件人（单个或多个）
3. 填写邮件主题和内容
4. 可选择添加附件
5. 发送邮件

### 5. AI智能助手
**功能描述：**
- 基于硅基流动AI的智能对话
- 系统使用指导
- 任务分析建议
- 健康建议
- 个性化回答

**使用流程：**
1. 访问 /ai-assistant
2. 直接输入问题或使用快捷问题
3. AI会根据用户角色和问题提供个性化回答
4. 支持任务分析和健康建议功能

## 技术架构

### 前端技术栈
- Vue 3 (Composition API)
- Vite (构建工具)
- Bootstrap 5 (UI框架)
- Vue Router (路由管理)
- Vue Toastification (通知)

### 后端技术栈
- Firebase Authentication (用户认证)
- Firestore (数据库)
- Firebase Functions (云函数)
- Firebase Hosting (静态托管)

### AI集成
- 硅基流动AI API
- 支持上下文对话
- 个性化回答

## 常见问题解答

### Q: 如何创建任务？
A: 登录后进入仪表板，点击"Create Task"按钮，填写任务信息并提交。

### Q: 如何接受任务？
A: 志愿者登录后进入仪表板，在"Available Tasks"部分查看可用任务，点击"Accept"按钮。

### Q: 如何预约健康服务？
A: 访问日历页面，选择日期和服务类型，选择时间段并确认预约。

### Q: 如何评价志愿者？
A: 任务完成后，访问"Rate Volunteers"页面，选择要评价的任务并提交评分和评价。

### Q: 如何发送邮件？
A: 访问"Email Management"页面，选择收件人，填写邮件内容并发送。

## 系统特色功能

### 1. 角色化界面
- 不同用户角色看到不同的功能界面
- 基于角色的权限控制
- 个性化的用户体验

### 2. 实时通知
- 任务状态变化自动通知
- 邮件通知系统
- 实时数据更新

### 3. 数据可视化
- 交互式图表展示
- 统计数据分析
- 用户行为洞察

### 4. 移动端适配
- 响应式设计
- 移动端优化
- 跨设备兼容

## 安全特性
- Firebase Authentication 安全认证
- 基于角色的访问控制
- 数据加密传输
- XSS防护
- 输入验证

## 部署信息
- 前端：Firebase Hosting
- 后端：Firebase Functions
- 数据库：Firestore
- 邮件：SendGrid API
- AI：硅基流动AI API
`;

    // Create conversation context with system manual
    const systemPrompt = `You are an AI assistant for the Evergreen Way elderly care platform. 

${systemManual}

Current User Context:
- User Role: ${userRole}
- User ID: ${context.auth.uid}
- Platform: Evergreen Way - A platform connecting elderly people with volunteers

Guidelines:
- Be helpful, patient, and understanding
- Provide specific, actionable advice based on the user's role
- Use simple, clear language
- Focus on elderly care and volunteer services
- If asked about system features, explain how to use them step by step
- If asked about best practices, provide practical tips
- Keep responses concise but informative
- Always consider the user's role when providing advice
- If the user asks about a feature they don't have access to, explain why and suggest alternatives

Current conversation context: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User message: ${message}`;

    // Prepare messages for Silicon Flow API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // Call Silicon Flow API
    const response = await axios.post(SILICON_FLOW_API_URL, {
      model: 'qwen2.5-72b-instruct', // 或其他可用模型
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;

    // Log the conversation for analytics
    await admin.firestore().collection('ai_conversations').add({
      userId: context.auth.uid,
      userRole: userRole,
      userMessage: message,
      aiResponse: aiResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      model: 'silicon-flow-qwen2.5',
      apiProvider: 'silicon-flow'
    });

    return {
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI Assistant error:', error);
    
    // Log error
    await admin.firestore().collection('ai_conversations').add({
      userId: context.auth.uid,
      userMessage: data.message,
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'error',
      apiProvider: 'silicon-flow'
    });

    throw new functions.https.HttpsError('internal', 'Failed to get AI response');
  }
});

// AI Task Analysis function using Silicon Flow
exports.analyzeTask = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { taskDescription, taskType, userContext } = data;

    if (!taskDescription) {
      throw new functions.https.HttpsError('invalid-argument', 'Task description is required');
    }

    const analysisPrompt = `Analyze this task for the Evergreen Way elderly care platform:

Task Description: ${taskDescription}
Task Type: ${taskType || 'general'}
User Context: ${userContext || 'elderly user'}

Please provide:
1. Task complexity assessment (1-5 scale)
2. Estimated completion time
3. Required skills for volunteers
4. Safety considerations
5. Recommendations for task execution
6. Potential challenges and solutions

Format your response in a clear, structured way.`;

    const messages = [
      { role: 'system', content: 'You are a task analysis expert for elderly care services.' },
      { role: 'user', content: analysisPrompt }
    ];

    const response = await axios.post(SILICON_FLOW_API_URL, {
      model: 'qwen2.5-72b-instruct',
      messages: messages,
      temperature: 0.5,
      max_tokens: 800,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const analysis = response.data.choices[0].message.content;

    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Task analysis error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze task');
  }
});

// AI Health Tips function using Silicon Flow
exports.getHealthTips = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { healthTopic, userAge, userCondition } = data;

    const healthPrompt = `Provide helpful health and wellness tips for elderly users of the Evergreen Way platform.

Topic: ${healthTopic || 'general wellness'}
User Age: ${userAge || 'elderly'}
Health Condition: ${userCondition || 'general'}

Please provide:
1. Practical daily tips
2. Safety precautions
3. When to seek professional help
4. Lifestyle recommendations
5. Exercise suggestions (if applicable)
6. Nutrition advice (if applicable)

Keep tips practical, safe, and easy to follow. Focus on prevention and wellness.`;

    const messages = [
      { role: 'system', content: 'You are a health and wellness expert specializing in elderly care.' },
      { role: 'user', content: healthPrompt }
    ];

    const response = await axios.post(SILICON_FLOW_API_URL, {
      model: 'qwen2.5-72b-instruct',
      messages: messages,
      temperature: 0.6,
      max_tokens: 800,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const healthTips = response.data.choices[0].message.content;

    return {
      success: true,
      healthTips: healthTips,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Health tips error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get health tips');
  }
});
