# Firestore 数据模型设计

## 1. 用户集合 (users)

```javascript
{
  uid: "string",                    // Firebase Auth UID
  email: "string",                  // 用户邮箱
  username: "string",               // 用户名
  role: "elderly" | "volunteer",    // 用户角色
  displayName: "string",            // 显示名称
  phone: "string",                  // 电话号码
  address: "string",                // 地址
  avatar: "string",                 // 头像URL
  rating: number,                   // 平均评分 (志愿者)
  completedTasks: number,           // 完成任务数 (志愿者)
  totalHours: number,               // 总服务时长 (志愿者)
  createdAt: timestamp,             // 创建时间
  updatedAt: timestamp,             // 更新时间
  isActive: boolean,                // 是否活跃
  preferences: {                    // 用户偏好设置
    notifications: {
      email: boolean,
      push: boolean
    },
    language: "zh-CN" | "en-US"
  }
}
```

## 2. 任务集合 (tasks)

```javascript
{
  id: "string",                     // 任务ID
  title: "string",                  // 任务标题
  description: "string",            // 任务描述
  type: "shopping" | "delivery" | "housework" | "companionship", // 任务类型
  status: "pending" | "accepted" | "completed" | "rated" | "expired" | "disputed", // 任务状态
  requesterId: "string",            // 请求者ID
  requesterName: "string",          // 请求者姓名
  volunteerId: "string",            // 志愿者ID (可选)
  volunteerName: "string",          // 志愿者姓名 (可选)
  location: {                       // 任务地点
    address: "string",
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  deadline: timestamp,              // 截止时间
  completionDeadline: timestamp,    // 完成期限
  budget: {                         // 预算信息
    amount: number,
    currency: "CNY"
  },
  priority: "low" | "medium" | "high", // 优先级
  tags: ["string"],                 // 标签
  attachments: [{                   // 附件
    name: "string",
    url: "string",
    type: "string"
  }],
  createdAt: timestamp,             // 创建时间
  acceptedAt: timestamp,            // 接受时间
  completedAt: timestamp,           // 完成时间
  confirmedAt: timestamp,           // 确认时间
  ratedAt: timestamp,               // 评价时间
  rating: {                         // 评价信息
    score: number,                  // 评分 (1-5)
    review: "string",               // 评价内容
    tags: ["string"]                // 评价标签
  },
  complaint: {                      // 投诉信息
    reason: "string",
    description: "string",
    status: "pending" | "resolved" | "rejected",
    resolvedAt: timestamp
  }
}
```

## 3. 通知集合 (notifications)

```javascript
{
  id: "string",                     // 通知ID
  userId: "string",                 // 用户ID
  title: "string",                  // 通知标题
  message: "string",                // 通知内容
  type: "task_created" | "task_accepted" | "task_completed" | "task_reminder" | "welcome" | "system", // 通知类型
  priority: "low" | "medium" | "high", // 优先级
  isRead: boolean,                  // 是否已读
  actionUrl: "string",              // 操作链接
  metadata: {                       // 元数据
    taskId: "string",
    volunteerId: "string",
    requesterId: "string"
  },
  createdAt: timestamp,             // 创建时间
  readAt: timestamp                 // 阅读时间
}
```

## 4. 邮件日志集合 (email_logs)

```javascript
{
  id: "string",                     // 日志ID
  to: "string",                     // 收件人
  subject: "string",                // 邮件主题
  content: "string",                // 邮件内容
  type: "string",                   // 邮件类型
  status: "sent" | "failed" | "pending", // 发送状态
  error: "string",                  // 错误信息
  hasAttachment: boolean,           // 是否有附件
  attachmentInfo: {                 // 附件信息
    name: "string",
    size: number,
    type: "string"
  },
  taskId: "string",                 // 关联任务ID
  trigger: "manual" | "task_status_change" | "scheduled", // 触发方式
  sentAt: timestamp,                // 发送时间
  createdAt: timestamp              // 创建时间
}
```

## 5. 评分集合 (ratings)

```javascript
{
  id: "string",                     // 评分ID
  taskId: "string",                 // 任务ID
  ratedUserId: "string",            // 被评分用户ID
  raterUserId: "string",            // 评分用户ID
  score: number,                    // 评分 (1-5)
  review: "string",                 // 评价内容
  tags: ["string"],                 // 评价标签
  isAnonymous: boolean,             // 是否匿名
  createdAt: timestamp,             // 创建时间
  updatedAt: timestamp              // 更新时间
}
```

## 6. 系统配置集合 (system_config)

```javascript
{
  id: "string",                     // 配置ID
  key: "string",                    // 配置键
  value: any,                       // 配置值
  description: "string",            // 配置描述
  category: "email" | "task" | "notification" | "system", // 配置分类
  isPublic: boolean,                // 是否公开
  createdAt: timestamp,             // 创建时间
  updatedAt: timestamp              // 更新时间
}
```

## 7. 统计集合 (statistics)

```javascript
{
  id: "string",                     // 统计ID
  type: "daily" | "weekly" | "monthly", // 统计类型
  date: "YYYY-MM-DD",               // 统计日期
  metrics: {                        // 统计指标
    totalUsers: number,             // 总用户数
    activeUsers: number,            // 活跃用户数
    totalTasks: number,             // 总任务数
    completedTasks: number,         // 完成任务数
    totalEmails: number,            // 总邮件数
    successfulEmails: number,       // 成功邮件数
    averageRating: number           // 平均评分
  },
  breakdown: {                      // 详细分类
    byRole: {
      elderly: number,
      volunteer: number
    },
    byTaskType: {
      shopping: number,
      delivery: number,
      housework: number,
      companionship: number
    },
    byStatus: {
      pending: number,
      accepted: number,
      completed: number,
      rated: number
    }
  },
  createdAt: timestamp              // 创建时间
}
```
