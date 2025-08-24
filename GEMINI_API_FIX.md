# Gemini API 格式修复

## 🔧 问题分析

### 500错误原因
根据您的提示，API不能包含分行或空格，我发现了以下问题：

1. **systemContext包含换行符** - 已修复
2. **用户消息包含`\n\n`** - 已修复
3. **JSON格式可能有问题** - 需要进一步验证

### 已修复的问题
```javascript
// 修复前 (有换行符)
content: `User Context: ${context}\n\nUser Question: ${message}`

// 修复后 (无换行符)
content: `User Context: ${context} User Question: ${message}`.replace(/\n/g, ' ').trim()
```

## 🧪 测试API调用格式

### 正确的API调用格式
根据您的教程，应该是这样的：
```javascript
{
  "model": "gemini-1.5-pro",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "hello"
    }
  ]
}
```

### 当前实现
```javascript
{
  model: API_CONFIG.GEMINI.MODEL,
  messages: [
    {
      role: 'system',
      content: this.systemContext.replace(/\n/g, ' ').trim()
    },
    {
      role: 'user',
      content: `User Context: ${context} User Question: ${message}`.replace(/\n/g, ' ').trim()
    }
  ],
  max_tokens: API_CONFIG.GEMINI.MAX_TOKENS,
  temperature: API_CONFIG.GEMINI.TEMPERATURE
}
```

## 🔍 进一步调试

### 1. 检查请求体
在浏览器控制台运行：
```javascript
// 检查实际发送的请求
console.log('Gemini API Request Body:', JSON.stringify({
  model: 'gemini-1.5-pro',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'hello'
    }
  ],
  max_tokens: 1500,
  temperature: 0.7
}));
```

### 2. 手动测试API
```bash
curl -X POST https://www.chataiapi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-eC1I52vBo0X5UhVpRp7kO0lQFKaARXRVksrjmpMb9txGj8y3" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-1.5-pro","messages":[{"role":"user","content":"hello"}],"max_tokens":100}'
```

## 🛠️ 可能的解决方案

### 方案1: 简化消息内容
```javascript
// 最简单的测试
{
  role: 'user',
  content: message.replace(/\n/g, ' ').trim()
}
```

### 方案2: 检查模型名称
```javascript
// 尝试不同的模型
MODEL: 'claude-3-5-sonnet-20240620' // 按您教程中的示例
```

### 方案3: 移除可选参数
```javascript
// 最基本的请求
{
  model: API_CONFIG.GEMINI.MODEL,
  messages: [
    {
      role: 'user',
      content: message
    }
  ]
}
```

## 🔧 立即修复

### 当前修复状态
- ✅ 移除了systemContext中的所有换行符
- ✅ 移除了用户消息中的`\n\n`
- ✅ 添加了`.replace(/\n/g, ' ').trim()`处理
- ✅ 清理了未使用的变量

### 测试步骤
1. **刷新页面**
2. **发送简单消息**: "hello"
3. **检查控制台**: 查看是否还有500错误
4. **验证响应**: 如果成功，应该收到Gemini回复

## 📊 错误分析

### 500错误详情
```
upstream error: do request failed (request id: 202508241119428679726203RSn8RPv)
```

这表明：
- API密钥认证成功（不是401错误）
- 请求到达了ChatAI服务器
- 但在转发给Gemini时失败
- 可能是请求格式问题

### 可能的原因
1. **消息格式**: 换行符或特殊字符
2. **模型名称**: 可能不支持`gemini-1.5-pro`
3. **参数问题**: max_tokens或temperature值
4. **内容长度**: systemContext太长

## 🎯 下一步测试

### 如果仍有500错误
1. **尝试更简单的请求**:
   ```javascript
   {
     model: 'claude-3-5-sonnet-20240620',
     messages: [{ role: 'user', content: 'hello' }]
   }
   ```

2. **检查模型可用性**: 联系ChatAI确认支持的模型

3. **减少内容长度**: 使用更短的system prompt

### 如果成功
- 逐步增加复杂度
- 添加system消息
- 增加参数配置
- 测试长消息

## 📞 技术支持

### 联系ChatAI
如果问题持续：
1. 提供完整的错误信息
2. 询问支持的模型列表
3. 确认API格式要求
4. 检查服务状态

**目标：让Gemini API正常工作，提供真实AI响应！**
