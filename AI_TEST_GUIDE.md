# AI功能测试指南

## 🚀 新的AI服务配置

### 当前AI服务优先级
1. **Hugging Face API** (免费，主要服务)
2. **Free AI API** (无需认证的公共服务)
3. **Silicon Flow API** (备用，需要有效密钥)
4. **Enhanced Mock** (智能离线响应)

### 配置详情
```javascript
// Hugging Face (免费)
HUGGING_FACE: {
  API_KEY: 'hf_demo',
  API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  ENABLED: true
}

// Free AI (无需密钥)
FREE_AI: {
  API_URL: 'https://api.openai-proxy.com/v1/chat/completions',
  ENABLED: true
}
```

## 🧪 测试步骤

### 1. 清除浏览器问题
```bash
# 1. 关闭所有浏览器窗口
# 2. 清除缓存 (Ctrl+Shift+Delete)
# 3. 禁用AI相关扩展
# 4. 重新打开浏览器
```

### 2. 启动应用
```bash
npm run dev
```

### 3. 测试AI功能
1. **访问AI助手页面**
2. **检查连接状态** - 应显示"connected"
3. **发送测试消息**:
   ```
   "Hello, how can you help me?"
   "How do I create a task?"
   "I need help with health appointments"
   ```

### 4. 验证响应来源
检查控制台，应该看到以下之一：
- ✅ `AI Assistant ready (hugging-face)`
- ✅ `AI Assistant ready (free-ai)`
- ⚠️ `AI Assistant ready (enhanced-mock)` (离线模式)

## 🔧 浏览器扩展冲突解决

### 常见冲突扩展
- **ChatGPT扩展**
- **Microsoft Copilot**
- **AI Assistant扩展**
- **Grammarly** (有时会冲突)

### 解决方法
1. **临时禁用扩展**:
   - Edge: `⋯` > `扩展` > 禁用AI相关扩展
   - Chrome: `⋯` > `更多工具` > `扩展程序` > 禁用

2. **使用无痕模式**:
   - `Ctrl+Shift+N` (Chrome/Edge)
   - `Ctrl+Shift+P` (Firefox)

3. **切换浏览器**:
   - Firefox (通常最兼容)
   - Safari (Mac)
   - 原生Chrome

## 📊 预期结果

### 成功指标
- ✅ 页面加载无红色错误
- ✅ AI状态显示"connected"
- ✅ 发送消息收到真实AI回复
- ✅ 回复质量好，相关性强
- ✅ 对话历史正常保存

### 失败指标
- ❌ 控制台显示"All AI APIs failed"
- ❌ 只收到模拟响应
- ❌ 浏览器扩展错误持续出现

## 🛠️ 故障排除

### 如果仍然只有模拟响应

#### 方法1: 检查网络连接
```bash
# 测试API连接
curl -X POST https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello"}'
```

#### 方法2: 手动测试免费API
```javascript
// 在浏览器控制台运行
fetch('https://api.openai-proxy.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello' }],
    max_tokens: 100
  })
}).then(r => r.json()).then(console.log);
```

#### 方法3: 检查CORS设置
如果API被阻止，可能需要：
1. 使用HTTPS运行开发服务器
2. 配置代理服务器
3. 使用不同的API端点

### 如果有浏览器扩展错误

#### 完全清理方法
1. **关闭所有浏览器窗口**
2. **清除所有数据**:
   - 缓存
   - Cookie
   - 本地存储
   - 会话存储
3. **重启浏览器**
4. **只启用必要扩展**

#### 开发者模式测试
```bash
# 使用不同端口
npm run dev -- --port 3001

# 或使用HTTPS
npm run dev -- --https
```

## 🎯 最终验证

### 成功标准
当您看到以下情况时，AI功能正常工作：

1. **启动消息**: "AI Assistant ready (hugging-face)" 或 "AI Assistant ready (free-ai)"
2. **真实回复**: 收到的回复不是预设的模板响应
3. **上下文理解**: AI能理解您的问题并给出相关回复
4. **无错误**: 控制台没有红色错误信息

### 测试对话示例
```
用户: "How do I create a task for grocery shopping?"
期望AI回复: 详细的步骤说明，提到dashboard、Create Task按钮等

用户: "What health services are available?"
期望AI回复: 关于健康服务预约、日历功能等的说明
```

## 📞 如果仍有问题

### 联系信息
如果按照以上步骤仍无法解决：

1. **提供详细信息**:
   - 浏览器类型和版本
   - 控制台错误信息
   - 网络环境（公司/家庭/学校）

2. **尝试替代方案**:
   - 使用移动设备测试
   - 尝试不同网络环境
   - 使用VPN（如果在受限网络）

**目标：让您的AI助手使用真实的AI API而不是模拟响应！**
