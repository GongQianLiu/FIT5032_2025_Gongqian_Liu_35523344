// AI Service - Direct API integration with Silicon Flow
// Implements BR F.1: AI Assistant

import { API_CONFIG, getAPIHeaders, API_ERROR_MESSAGES, checkAPIServiceStatus } from '../config/api';

export default {
  // Call AI Assistant
  async callAIAssistant(message, conversationHistory = []) {
    try {
      const status = checkAPIServiceStatus();
      if (!status.siliconFlow.ready) {
        throw new Error(API_ERROR_MESSAGES.SILICON_FLOW.NOT_CONFIGURED);
      }

      // Get user context for personalized responses
      const userRole = localStorage.getItem('userRole') || 'user';
      const userId = localStorage.getItem('userId') || 'anonymous';

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
- 邮件：Postmark API
- AI：硅基流动AI API
`;

      // Create conversation context with system manual
      const systemPrompt = `You are an AI assistant for the Evergreen Way elderly care platform. 

${systemManual}

Current User Context:
- User Role: ${userRole}
- User ID: ${userId}
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
      const response = await fetch(API_CONFIG.SILICON_FLOW.API_URL, {
        method: 'POST',
        headers: getAPIHeaders('siliconFlow'),
        body: JSON.stringify({
          model: API_CONFIG.SILICON_FLOW.MODEL,
          messages: messages,
          temperature: API_CONFIG.SILICON_FLOW.TEMPERATURE,
          max_tokens: API_CONFIG.SILICON_FLOW.MAX_TOKENS,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Silicon Flow API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0].message.content;

      return {
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI Assistant error:', error);
      throw error;
    }
  },

  // Analyze task using AI
  async analyzeTask(taskDescription, taskType, userContext) {
    try {
      const status = checkAPIServiceStatus();
      if (!status.siliconFlow.ready) {
        throw new Error(API_ERROR_MESSAGES.SILICON_FLOW.NOT_CONFIGURED);
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

      const response = await fetch(API_CONFIG.SILICON_FLOW.API_URL, {
        method: 'POST',
        headers: getAPIHeaders('siliconFlow'),
        body: JSON.stringify({
          model: API_CONFIG.SILICON_FLOW.MODEL,
          messages: messages,
          temperature: 0.5,
          max_tokens: 800,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Silicon Flow API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const analysis = result.choices[0].message.content;

      return {
        success: true,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Task analysis error:', error);
      throw error;
    }
  },

  // Get health tips using AI
  async getHealthTips(healthTopic, userAge, userCondition) {
    try {
      const status = checkAPIServiceStatus();
      if (!status.siliconFlow.ready) {
        throw new Error(API_ERROR_MESSAGES.SILICON_FLOW.NOT_CONFIGURED);
      }

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

      const response = await fetch(API_CONFIG.SILICON_FLOW.API_URL, {
        method: 'POST',
        headers: getAPIHeaders('siliconFlow'),
        body: JSON.stringify({
          model: API_CONFIG.SILICON_FLOW.MODEL,
          messages: messages,
          temperature: 0.6,
          max_tokens: 800,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Silicon Flow API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const healthTips = result.choices[0].message.content;

      return {
        success: true,
        healthTips: healthTips,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Health tips error:', error);
      throw error;
    }
  },

  // Get fallback response when AI is not available
  getFallbackResponse(message, userRole) {
    const fallbackResponses = {
      elderly: [
        "I'm here to help you with your tasks and appointments. You can create new tasks, schedule health services, or ask me about any features.",
        "Need help with something? I can guide you through creating tasks, making appointments, or using any part of the platform.",
        "Welcome! I can help you manage your tasks, schedule appointments, and navigate the platform. What would you like to know?"
      ],
      volunteer: [
        "I'm here to help you find and manage tasks. You can browse available tasks, track your progress, and get support with any questions.",
        "Need assistance with task management? I can help you find suitable tasks and guide you through the platform features.",
        "Welcome! I can help you find tasks, manage your schedule, and provide support. How can I assist you today?"
      ],
      admin: [
        "I'm here to help you manage the platform. You can monitor users, manage services, and get insights into system performance.",
        "Need help with platform management? I can assist with user management, data analysis, and system administration.",
        "Welcome! I can help you manage the platform, monitor activities, and provide administrative support. What do you need?"
      ]
    };

    const responses = fallbackResponses[userRole] || fallbackResponses.elderly;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      success: true,
      response: randomResponse,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  },

  // Check AI service status
  checkStatus() {
    return checkAPIServiceStatus().siliconFlow;
  }
};
