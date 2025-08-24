# 图表调试指南

## 🔧 当前修复内容

### 1. Canvas渲染时序问题修复
```javascript
// ✅ 使用nextTick确保DOM准备就绪
const createChart = () => {
  nextTick(() => {
    if (!chartCanvas.value) {
      console.warn('Chart canvas not available, retrying...');
      setTimeout(() => createChart(), 100);
      return;
    }
    // 图表创建逻辑...
  });
};
```

### 2. 数据加载增强
```javascript
// ✅ 详细的数据加载日志
const loadInitialData = async () => {
  console.log('Loading initial data from Firebase...');
  
  // 加载数据...
  console.log('Loaded tasks:', tasks.length);
  console.log('Loaded users:', users.length);
  
  // 如果没有真实数据，使用Mock数据
  if (tasks.length === 0 && users.length === 0) {
    console.log('No real data found, using mock data');
    tasksData.value = generateMockTasks();
    usersData.value = generateMockUsers();
  }
};
```

### 3. 改进的Mock数据
```javascript
// ✅ 更丰富的Mock数据，包含评分和日期
const generateMockTasks = () => [
  { id: '1', title: 'Shopping Help', type: 'shopping', status: 'completed', 
    priority: 'high', createdAt: new Date('2024-01-15'), rating: { rating: 5 } },
  // ... 8个任务
];

const generateMockUsers = () => [
  { id: '1', role: 'elderly', displayName: 'John Doe', createdAt: new Date('2024-01-01') },
  // ... 8个用户
];
```

## 🧪 调试步骤

### 1. 检查控制台输出
打开浏览器开发者工具，查看控制台是否显示：

**期望看到的消息：**
```
Loading initial data from Firebase...
Loaded tasks: X
Loaded users: Y
Generating chart data with: {tasks: X, users: Y}
Chart data loaded: X tasks, Y users
```

**如果看到Mock数据消息：**
```
No real data found, using mock data
Chart data loaded: 8 tasks, 8 users
```

### 2. 检查Firebase数据
如果使用Mock数据，说明Firebase中没有数据。需要：

1. **检查Firebase连接**
   - 确认`firebase/config.js`配置正确
   - 检查网络连接

2. **检查数据库集合**
   - 确认Firebase Firestore中有`tasks`和`users`集合
   - 确认集合中有数据

3. **检查权限**
   - 确认Firestore安全规则允许读取

### 3. 手动添加测试数据
如果Firebase中没有数据，可以手动添加：

**Tasks集合示例数据：**
```json
{
  "title": "Help with shopping",
  "type": "shopping",
  "status": "open",
  "priority": "high",
  "createdAt": "2024-08-24T00:00:00Z",
  "description": "Need help with grocery shopping"
}
```

**Users集合示例数据：**
```json
{
  "displayName": "John Doe",
  "role": "elderly",
  "email": "john@example.com",
  "createdAt": "2024-08-24T00:00:00Z"
}
```

## 🔍 故障排除

### 问题1: Canvas context错误
**症状**: `Cannot read properties of null (reading 'getContext')`
**解决**: 已修复，使用nextTick和重试机制

### 问题2: 图表不显示
**可能原因**:
1. 数据为空
2. Chart.js库未加载
3. Canvas元素未准备好

**检查步骤**:
1. 控制台是否有"Chart data not ready"警告
2. 是否看到"Chart data loaded"成功消息
3. 网络标签页中Chart.js是否成功加载

### 问题3: 统计卡片显示0
**可能原因**: 数据加载失败或数据格式不正确
**检查**: 控制台中的数据加载日志

## 🎯 测试清单

### ✅ 基本功能测试
- [ ] 页面加载无JavaScript错误
- [ ] 控制台显示数据加载消息
- [ ] 统计卡片显示非零数据
- [ ] 图表区域显示图表（不是空白）
- [ ] 可以切换图表类型

### ✅ 数据测试
- [ ] 如果Firebase有数据，显示真实数据
- [ ] 如果Firebase无数据，显示Mock数据
- [ ] 统计数据与图表数据一致

### ✅ 交互测试
- [ ] 图表类型切换正常
- [ ] 时间范围切换正常
- [ ] 图表样式切换正常
- [ ] 全屏模式正常

## 🚀 下一步

如果图表仍然不显示：

1. **检查Chart.js加载**
   ```javascript
   console.log('Chart.js loaded:', typeof Chart !== 'undefined');
   ```

2. **检查Canvas元素**
   ```javascript
   console.log('Canvas element:', chartCanvas.value);
   ```

3. **检查数据格式**
   ```javascript
   console.log('Chart data:', chartData.value);
   ```

4. **简化测试**
   - 临时注释掉实时监听器
   - 只使用Mock数据测试

## 📞 如果仍有问题

请提供以下信息：
1. 控制台的完整错误日志
2. 网络标签页中的请求状态
3. Firebase Firestore中的数据截图
4. 浏览器和版本信息

**当前修复应该解决Canvas错误和数据显示问题！**
