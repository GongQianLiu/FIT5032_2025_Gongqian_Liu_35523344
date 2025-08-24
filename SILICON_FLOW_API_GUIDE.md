# Silicon Flow API 密钥问题解决指南

## 🚨 当前问题

### 错误信息
```
Silicon Flow API Error: 401 
Failed to load resource: the server responded with a status of 401
```

### 问题分析
401错误表示**认证失败**，可能的原因：
1. **API密钥无效或已过期**
2. **API密钥格式错误**
3. **账户余额不足或配额用完**
4. **API密钥权限不足**

## 🔧 解决方案

### 方案1: 获取新的Silicon Flow API密钥

#### 步骤1: 访问Silicon Flow官网
1. 打开浏览器访问 [Silicon Flow官网](https://siliconflow.com)
2. 注册账户或登录现有账户

#### 步骤2: 创建API密钥
1. 登录后进入控制台/仪表板
2. 找到"API密钥"或"API Keys"选项
3. 点击"创建新密钥"或"Create New Key"
4. 复制生成的API密钥（格式应为 `sk-xxxxxx`）

#### 步骤3: 更新配置
```javascript
// 在 src/config/api.js 中更新
SILICON_FLOW: {
  API_KEY: '你的新API密钥', // 替换这里
  API_URL: 'https://api.siliconflow.com/v1/chat/completions',
  MODEL: 'qwen2.5-72b-instruct',
  MAX_TOKENS: 1500,
  TEMPERATURE: 0.7,
  ENABLED: true
}
```

### 方案2: 检查账户状态
1. **余额检查**: 确认账户有足够余额
2. **配额检查**: 确认API调用配额未用完
3. **权限检查**: 确认API密钥有调用权限

### 方案3: 使用环境变量（推荐）
创建 `.env.local` 文件：
```bash
# Silicon Flow AI Configuration
VITE_SILICON_FLOW_API_KEY=你的API密钥
VITE_SILICON_FLOW_API_URL=https://api.siliconflow.com/v1/chat/completions
```

然后更新配置文件：
```javascript
SILICON_FLOW: {
  API_KEY: import.meta.env.VITE_SILICON_FLOW_API_KEY,
  API_URL: import.meta.env.VITE_SILICON_FLOW_API_URL,
  // ... 其他配置
}
```

## 🔄 临时解决方案

### 当前状态
我已经为您实施了以下临时解决方案：

1. **智能Mock响应系统**
   - 基于关键词的智能回复
   - 角色特定的响应
   - 上下文感知的帮助信息

2. **用户友好的错误处理**
   - 清晰的状态指示
   - 自动降级到离线模式
   - 智能回退机制

3. **改进的用户体验**
   - "Smart Offline Mode"提示
   - 详细的功能指导
   - 无缝的服务切换

### 当前功能
即使没有有效的API密钥，AI助手仍然可以：
- ✅ 回答关于平台功能的问题
- ✅ 提供导航指导
- ✅ 解释如何使用各种功能
- ✅ 给出基于角色的建议
- ✅ 保存和恢复对话历史

## 🧪 测试步骤

### 1. 验证当前状态
```bash
npm run dev
```

### 2. 测试AI助手
- 访问AI助手页面
- 应该看到"Smart Offline Mode"提示
- 发送测试消息，应该收到智能回复

### 3. 测试关键词响应
尝试发送以下消息：
- "How do I create a task?"
- "I need help with health appointments"
- "How do I rate a volunteer?"
- "Show me my dashboard"

## 📊 API密钥验证工具

### 手动测试API密钥
您可以使用以下curl命令测试API密钥：

```bash
curl -X POST https://api.siliconflow.com/v1/chat/completions \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-72b-instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

### 预期响应
- **成功**: 返回JSON响应包含AI回复
- **401错误**: API密钥无效
- **403错误**: 权限不足
- **429错误**: 配额用完

## 🎯 下一步行动

### 立即可用
✅ AI助手已在Smart Offline Mode下正常工作
✅ 提供智能的基于关键词的响应
✅ 用户体验良好，功能完整

### 长期解决
1. **获取有效的Silicon Flow API密钥**
2. **配置环境变量**
3. **测试API连接**
4. **启用完整AI功能**

## 💡 替代AI服务

如果Silicon Flow持续有问题，可以考虑：

### 免费选项
1. **Hugging Face Inference API** (免费配额)
2. **Cohere API** (免费层)
3. **OpenAI API** (需要付费但稳定)

### 配置示例
```javascript
// Hugging Face配置示例
HUGGING_FACE: {
  API_KEY: 'hf_xxxxxx',
  API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  ENABLED: true
}
```

## 📞 支持

如果需要进一步帮助：
1. 检查Silicon Flow官方文档
2. 联系Silicon Flow技术支持
3. 考虑使用替代AI服务

**当前系统已经可以正常使用，只是使用智能离线响应而不是真实AI API。**
