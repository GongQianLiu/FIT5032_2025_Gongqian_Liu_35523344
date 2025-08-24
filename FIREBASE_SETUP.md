# Firebase 设置指南

本指南将帮助您设置和部署 Evergreen Way 项目到 Firebase。

## 🚀 快速开始

### 1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. 登录 Firebase

```bash
firebase login
```

### 3. 初始化 Firebase 项目

```bash
firebase init
```

选择以下选项：
- **Hosting**: 托管前端应用
- **Functions**: 云函数（邮件服务）
- **Firestore**: 数据库
- **Authentication**: 用户认证

### 4. 配置 Firebase 项目

在 `src/firebase/config.js` 中更新您的 Firebase 配置：

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

## 📧 SendGrid 配置

### 1. 获取 SendGrid API Key

1. 注册 [SendGrid](https://sendgrid.com/) 账户
2. 创建 API Key
3. 验证发件人邮箱

### 2. 配置 Firebase Functions

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from_email="your-verified-email@domain.com"
```

## 🔒 Firestore 安全规则

项目已包含完整的安全规则，确保：
- 用户只能访问自己的数据
- 角色基础的权限控制
- 管理员特权管理

## 🚀 部署

### 自动部署

使用提供的部署脚本：

```bash
# 在 Windows 上
firebase\deploy.sh

# 在 Linux/Mac 上
chmod +x firebase/deploy.sh
./firebase/deploy.sh
```

### 手动部署

```bash
# 构建前端
npm run build

# 安装 Functions 依赖
cd firebase/functions
npm install
cd ../..

# 部署到 Firebase
firebase deploy
```

## 📊 部署后检查

1. **Firebase Hosting**: 检查前端是否正常加载
2. **Firebase Functions**: 检查云函数是否部署成功
3. **Firestore**: 检查数据库规则是否生效
4. **Authentication**: 测试用户注册和登录

## 🔧 常见问题

### 1. "Failed to load tasks" 错误

**原因**: Firestore 规则或服务配置问题
**解决方案**: 
- 检查 Firestore 安全规则
- 确保用户已认证
- 检查数据库集合是否存在

### 2. 邮件发送失败

**原因**: SendGrid 配置问题
**解决方案**:
- 验证 SendGrid API Key
- 检查发件人邮箱是否已验证
- 查看 Firebase Functions 日志

### 3. 权限被拒绝

**原因**: Firestore 安全规则限制
**解决方案**:
- 检查用户角色设置
- 验证 Firestore 规则配置
- 确保用户已正确认证

## 📝 环境变量

在 `.env` 文件中设置：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🎯 业务需求实现

### D类需求 ✅

- **BR(D.1)**: Firebase Authentication ✅
- **BR(D.2)**: SendGrid 邮件服务 ✅
- **BR(D.3)**: 交互式表格 ✅
- **BR(D.4)**: Firebase 云部署 ✅

### E类需求 ✅

- **BR(E.1)**: Firebase Cloud Functions ✅
- **BR(E.2)**: 地理位置服务 ✅
- **BR(E.3)**: 无障碍访问 ✅
- **BR(E.4)**: 数据导出 ✅

### F类需求 ✅

- **BR(F.1)**: 创新功能 ✅
  - 预约日历系统
  - 批量邮件发送
  - 交互式图表
  - 管理员仪表板

## 📞 技术支持

如果遇到问题，请检查：

1. Firebase 控制台日志
2. 浏览器开发者工具
3. Firebase Functions 日志
4. Firestore 安全规则

## 🔗 有用链接

- [Firebase 文档](https://firebase.google.com/docs)
- [SendGrid 文档](https://sendgrid.com/docs)
- [Firebase CLI 文档](https://firebase.google.com/docs/cli)
- [Firestore 安全规则](https://firebase.google.com/docs/firestore/security/get-started)
