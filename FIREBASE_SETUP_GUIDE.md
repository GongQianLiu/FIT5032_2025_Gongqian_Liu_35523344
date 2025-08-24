# 🔥 Firebase项目创建和数据库设置指南

## 📋 **完整步骤**

### **第1步：创建Firebase项目**

1. **访问Firebase控制台**
   - 打开浏览器，访问：https://console.firebase.google.com/
   - 使用您的Google账户登录

2. **创建新项目**
   - 点击"创建项目"按钮
   - 项目名称：`evergreen-way` 或 `elderly-charity-system`
   - 点击"继续"

3. **配置项目**
   - 选择是否启用Google Analytics（推荐启用）
   - 点击"创建项目"
   - 等待项目创建完成

### **第2步：启用Firestore数据库**

1. **进入Firestore**
   - 在左侧菜单中点击"构建" → "Firestore Database"

2. **创建数据库**
   - 点击"创建数据库"
   - 选择"测试模式"（开发阶段使用）
   - 选择数据库位置：
     - 推荐：`asia-east1` (亚洲东部1)
     - 或：`us-central1` (美国中部1)

3. **完成设置**
   - 点击"完成"
   - 等待数据库初始化完成

### **第3步：启用Authentication**

1. **进入Authentication**
   - 在左侧菜单中点击"构建" → "Authentication"

2. **开始使用**
   - 点击"开始使用"

3. **配置登录方式**
   - 点击"登录方法"标签
   - 找到"电子邮件/密码"
   - 点击"编辑"或"启用"
   - 确保状态为"已启用"
   - 点击"保存"

### **第4步：创建Web应用**

1. **返回项目概览**
   - 点击左上角的项目名称

2. **添加Web应用**
   - 在"您的应用"部分，点击Web图标（</>）
   - 应用昵称：`Evergreen Way Web App`
   - 点击"注册应用"

3. **获取配置**
   - 复制显示的 `firebaseConfig` 对象
   - 格式如下：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### **第5步：更新项目配置**

#### **方法1：使用配置更新脚本（推荐）**

1. **运行配置更新脚本**
   ```bash
   node update-firebase-config.js
   ```

2. **粘贴配置**
   - 将您从Firebase控制台复制的 `firebaseConfig` 对象粘贴到提示中
   - 按回车确认

#### **方法2：手动更新**

1. **打开配置文件**
   - 编辑 `src/firebase/config.js`

2. **替换配置**
   - 将占位符配置替换为您从Firebase控制台复制的真实配置

### **第6步：测试连接**

1. **启动项目**
   ```bash
   npm run dev
   ```

2. **测试功能**
   - 访问 http://localhost:5173
   - 尝试注册一个新用户
   - 检查Firebase控制台的Firestore页面，应该能看到新创建的用户数据

## ✅ **验证清单**

- [ ] Firebase项目已创建
- [ ] Firestore数据库已启用
- [ ] Authentication已启用（电子邮件/密码）
- [ ] Web应用已注册
- [ ] 配置已更新到项目中
- [ ] 项目能正常启动
- [ ] 用户注册功能正常
- [ ] 数据能保存到Firestore

## 🎯 **下一步**

完成以上步骤后，您的项目就完全连接到Firebase了！您可以：

1. **注册管理员账户**
   - 在注册页面选择"Admin"角色
   - 使用管理员账户登录

2. **测试所有功能**
   - 用户管理
   - 数据管理
   - 邮件发送
   - 健康服务管理
   - 社区活动管理

3. **部署到Firebase Hosting**
   - 使用 `npm run deploy` 命令

## 🆘 **常见问题**

**Q: 数据库位置选择哪个？**
A: 推荐选择 `asia-east1`（亚洲东部1），访问速度更快。

**Q: 为什么选择"测试模式"？**
A: 开发阶段使用测试模式，允许所有读写操作。生产环境需要配置安全规则。

**Q: 配置更新后项目无法启动？**
A: 检查配置格式是否正确，确保所有引号都正确匹配。

**Q: 注册用户后看不到数据？**
A: 检查Firebase控制台的Firestore页面，数据会自动创建在 `users` 集合中。
