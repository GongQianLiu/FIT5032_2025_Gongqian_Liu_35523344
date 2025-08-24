# Evergreen Way - 老年慈善服务平台

一个基于Vue 3 + Firebase的现代化老年慈善服务平台，连接老年人和志愿者，促进社区互助。

## 🚀 功能特性

### D类功能实现
- **BR(D.1)**: Firebase身份验证 - 安全的用户注册和登录系统
- **BR(D.2)**: SendGrid邮件功能 - 自动邮件通知和附件支持
- **BR(D.3)**: 交互式表格 - 支持排序、搜索、分页的数据管理
- **BR(D.4)**: Firebase云端部署 - 完全托管的在线版本

### F类创新功能
- **AI助手**: 集成硅基流动AI的智能对话助手
- **任务分析**: AI驱动的任务复杂度评估和建议
- **健康建议**: 个性化的健康和生活建议
- **智能导航**: 基于用户角色的系统使用指导

### 核心功能
- 👥 用户角色管理（老年人/志愿者/管理员）
- 📋 任务发布和管理
- ⭐ 服务评价系统
- 🔔 实时通知系统
- 📊 数据统计和分析
- 📧 自动邮件通知
- 🤖 AI智能助手

## 🛠️ 技术栈

- **前端**: Vue 3 + Vite + Bootstrap 5
- **后端**: Firebase (Firestore + Functions + Hosting)
- **认证**: Firebase Authentication
- **邮件**: SendGrid API
- **AI**: 硅基流动AI API
- **数据库**: Firestore
- **部署**: Firebase Hosting

## 📦 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Firebase CLI
- 硅基流动AI账户（用于API访问）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd old_Service_system
```

2. **安装依赖**
```bash
npm install
```

3. **配置Firebase**
   - 创建Firebase项目
   - 更新 `src/firebase/config.js` 中的配置
   - 配置SendGrid API密钥

4. **配置AI助手**
   - 获取硅基流动AI API密钥
   - 在Firebase Functions中配置密钥：
   ```bash
   firebase functions:config:set siliconflow.api_key="your_silicon_flow_api_key"
   ```

5. **本地开发**
```bash
npm run dev
```

6. **构建部署**
```bash
npm run build
firebase deploy
```

## 🤖 AI助手配置

### 获取硅基流动AI API密钥
1. 访问硅基流动AI平台
2. 登录账户
3. 创建API密钥
4. 复制生成的API密钥

### 配置Firebase Functions
```bash
# 设置硅基流动AI API密钥
firebase functions:config:set siliconflow.api_key="your_silicon_flow_api_key"

# 部署Functions
firebase deploy --only functions
```

### AI功能特性
- **智能对话**: 基于上下文的自然语言交互
- **任务分析**: 自动评估任务复杂度和提供建议
- **健康建议**: 个性化的健康和生活指导
- **系统导航**: 智能帮助用户找到所需功能
- **离线模式**: 当AI服务不可用时自动切换到备用响应

## 📖 详细文档

请查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整的部署指南。

## 🏗️ 项目结构

```
src/
├── components/          # Vue组件
│   ├── DataTable.vue   # 交互式表格组件
│   ├── Login.vue       # 登录组件
│   ├── Register.vue    # 注册组件
│   └── AIAssistant.vue # AI智能助手组件
├── views/              # 页面组件
│   ├── ElderlyDashboard.vue    # 老年人仪表板
│   ├── VolunteerDashboard.vue  # 志愿者仪表板
│   ├── DataManagement.vue      # 数据管理页面
│   ├── RateVolunteers.vue      # 评价志愿者页面
│   ├── ElderlyHome.vue         # 老年人主页
│   ├── VolunteerHome.vue       # 志愿者主页
│   ├── AdminHome.vue           # 管理员主页
│   └── AIAssistantPage.vue    # AI助手页面
├── services/           # 服务层
│   ├── firebaseAuth.js # Firebase认证服务
│   ├── firestoreService.js # Firestore数据服务
│   ├── emailService.js # 邮件服务
│   └── aiService.js    # AI助手服务
├── firebase/           # Firebase配置
│   ├── config.js       # Firebase初始化配置
│   └── functions/      # Cloud Functions
│       └── index.js    # AI助手和邮件功能
└── utils/              # 工具函数
    └── mockData.js     # 模拟数据生成器
```

## 🔧 配置说明

### Firebase配置
在 `