# Evergreen Way - Firebase 部署指南

## 项目概述

这是一个基于Vue 3 + Firebase的老年慈善服务平台，实现了以下D类功能：

- **BR(D.1)**: Firebase身份验证
- **BR(D.2)**: SendGrid邮件发送功能
- **BR(D.3)**: 交互式表格数据（支持排序、搜索、分页）
- **BR(D.4)**: Firebase Hosting云端部署

## 技术栈

- **前端**: Vue 3 + Vite + Bootstrap 5
- **后端**: Firebase (Firestore + Functions + Hosting)
- **认证**: Firebase Authentication
- **邮件**: SendGrid API
- **数据库**: Firestore

## 部署步骤

### 1. 环境准备

确保已安装以下工具：
- Node.js (v18+)
- npm 或 yarn
- Firebase CLI

```bash
# 安装Firebase CLI
npm install -g firebase-tools
```

### 2. Firebase项目设置

#### 2.1 创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目
3. 记录项目ID

#### 2.2 启用服务

在Firebase控制台中启用以下服务：

- **Authentication**: 启用邮箱/密码认证
- **Firestore Database**: 创建数据库
- **Hosting**: 启用网站托管
- **Functions**: 启用云函数

#### 2.3 配置Firestore规则

在Firestore控制台中设置安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 任务数据
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // 通知数据
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    // 邮件日志
    match /email_logs/{logId} {
      allow read, write: if false; // 仅管理员可访问
    }
  }
}
```

### 3. 项目配置

#### 3.1 更新Firebase配置

编辑 `src/firebase/config.js`，替换为你的Firebase项目配置：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### 3.2 配置SendGrid

1. 注册 [SendGrid](https://sendgrid.com/) 账户
2. 获取API密钥
3. 验证发件人邮箱

#### 3.3 设置Firebase Functions配置

```bash
# 设置SendGrid API密钥
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"

# 设置发件人邮箱
firebase functions:config:set sendgrid.from_email="your-verified-email@domain.com"
```

### 4. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装Functions依赖
cd functions
npm install
cd ..
```

### 5. 本地测试

```bash
# 启动开发服务器
npm run dev

# 启动Firebase模拟器（可选）
firebase emulators:start
```

### 6. 构建和部署

#### 6.1 构建前端

```bash
# 构建生产版本
npm run build
```

#### 6.2 部署到Firebase

```bash
# 登录Firebase
firebase login

# 初始化项目（如果未初始化）
firebase init

# 部署所有服务
firebase deploy

# 或者分别部署
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### 7. 验证部署

1. 访问你的Firebase Hosting URL
2. 测试用户注册和登录功能
3. 测试任务创建和管理功能
4. 测试邮件发送功能
5. 测试数据表格功能

## 功能说明

### 1. Firebase身份验证 (BR D.1)

- 支持邮箱/密码注册和登录
- 用户角色管理（老年人/志愿者）
- 自动路由保护

### 2. 邮件功能 (BR D.2)

- 任务状态变化时自动发送邮件
- 支持HTML格式邮件
- 支持附件发送
- 邮件发送日志记录

### 3. 交互式表格 (BR D.3)

- 任务数据表格
- 用户数据表格
- 支持排序、搜索、分页
- 每页默认显示10行
- 支持单列搜索

### 4. 云端部署 (BR D.4)

- Firebase Hosting自动部署
- CDN加速
- HTTPS加密
- 自动扩展

## 项目结构

```
old_Service_system/
├── src/
│   ├── components/          # Vue组件
│   ├── views/              # 页面组件
│   ├── services/           # 服务层
│   ├── firebase/           # Firebase配置
│   └── utils/              # 工具函数
├── functions/              # Firebase Functions
├── public/                 # 静态资源
├── firebase.json           # Firebase配置
└── package.json            # 项目依赖
```

## 故障排除

### 常见问题

1. **Firebase配置错误**
   - 检查 `src/firebase/config.js` 中的配置是否正确
   - 确保项目ID匹配

2. **邮件发送失败**
   - 检查SendGrid API密钥是否正确
   - 确保发件人邮箱已验证
   - 查看Firebase Functions日志

3. **权限错误**
   - 检查Firestore安全规则
   - 确保用户已正确认证

4. **部署失败**
   - 检查Firebase CLI版本
   - 确保已登录Firebase账户
   - 检查项目权限

### 日志查看

```bash
# 查看Functions日志
firebase functions:log

# 查看Hosting日志
firebase hosting:log
```

## 维护和更新

### 更新依赖

```bash
# 更新前端依赖
npm update

# 更新Functions依赖
cd functions
npm update
cd ..
```

### 重新部署

```bash
# 重新部署所有服务
firebase deploy

# 仅重新部署Functions
firebase deploy --only functions
```

## 联系支持

如有问题，请检查：
1. Firebase控制台错误日志
2. 浏览器开发者工具控制台
3. Firebase Functions日志

---

**注意**: 请确保在生产环境中使用强密码和适当的安全措施。
