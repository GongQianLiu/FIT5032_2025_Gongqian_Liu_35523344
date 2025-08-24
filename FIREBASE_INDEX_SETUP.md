# Firebase索引设置指南

## 🔥 当前索引问题

根据控制台错误信息，需要为`internal_messages`集合创建复合索引：

```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/old-serice/firestore/indexes?create_composite=ClRwcm9qZWN0cy9vbGQtc2VyaWNlL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9pbnRlcm5hbF9tZXNzYWdlcy9pbmRleGVzL18QARoNCglpc0RlbGV0ZWQQARoMCgh0b1VzZXJJZBABGgoKBnNlbnRBdBACGgwKCF9fbmFtZV9fEAI
```

## 📋 需要创建的索引

### 1. internal_messages 集合索引

**字段组合：**
- `isDeleted` (升序)
- `toUserId` (升序) 
- `sentAt` (降序)

**查询模式：**
```javascript
query(
  collection(db, 'internal_messages'),
  where('isDeleted', '==', false),
  where('toUserId', '==', userId),
  orderBy('sentAt', 'desc')
)
```

### 2. email_logs 集合索引（新增）

为了支持邮件历史查询，建议创建以下索引：

**索引1：按发送者查询**
- `senderUserId` (升序)
- `sentAt` (降序)

**索引2：按时间范围查询**
- `sentAt` (升序)
- `success` (升序)

**索引3：按发送方式查询**
- `sendMethod` (升序)
- `sentAt` (降序)

## 🛠️ 创建索引步骤

### 方法1：通过Firebase控制台（推荐）

1. **访问Firebase控制台**
   ```
   https://console.firebase.google.com/project/old-serice/firestore/indexes
   ```

2. **点击错误链接自动创建**
   - 直接点击控制台错误中提供的链接
   - Firebase会自动填充索引配置
   - 点击"创建索引"按钮

3. **手动创建其他索引**
   - 在Firestore > 索引页面
   - 点击"创建索引"
   - 选择集合和字段
   - 设置排序方向

### 方法2：通过Firebase CLI

1. **安装Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **登录Firebase**
   ```bash
   firebase login
   ```

3. **初始化项目**
   ```bash
   firebase init firestore
   ```

4. **编辑firestore.indexes.json**
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "internal_messages",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "isDeleted", "order": "ASCENDING" },
           { "fieldPath": "toUserId", "order": "ASCENDING" },
           { "fieldPath": "sentAt", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "email_logs",
         "queryScope": "COLLECTION", 
         "fields": [
           { "fieldPath": "senderUserId", "order": "ASCENDING" },
           { "fieldPath": "sentAt", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "email_logs",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "sentAt", "order": "ASCENDING" },
           { "fieldPath": "success", "order": "ASCENDING" }
         ]
       },
       {
         "collectionGroup": "email_logs", 
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "sendMethod", "order": "ASCENDING" },
           { "fieldPath": "sentAt", "order": "DESCENDING" }
         ]
       }
     ],
     "fieldOverrides": []
   }
   ```

5. **部署索引**
   ```bash
   firebase deploy --only firestore:indexes
   ```

## ⚡ 快速修复

### 临时解决方案

如果索引创建需要时间，可以临时修改查询以避免复合索引：

1. **修改internal_messages查询**
   ```javascript
   // 原查询（需要索引）
   query(
     collection(db, 'internal_messages'),
     where('isDeleted', '==', false),
     where('toUserId', '==', userId),
     orderBy('sentAt', 'desc'),
     limit(50)
   )
   
   // 临时查询（单字段索引）
   query(
     collection(db, 'internal_messages'),
     where('toUserId', '==', userId),
     orderBy('sentAt', 'desc'),
     limit(50)
   )
   // 然后在客户端过滤 isDeleted
   ```

2. **修改email_logs查询**
   ```javascript
   // 简化查询，避免复合索引
   query(
     collection(db, 'email_logs'),
     orderBy('sentAt', 'desc'),
     limit(50)
   )
   ```

## 🎯 索引创建状态检查

### 检查索引状态
```javascript
// 在浏览器控制台运行
console.log('Current Firestore indexes status:');
// Firebase会在控制台显示索引状态
```

### 索引创建时间
- **单字段索引**: 通常几分钟内完成
- **复合索引**: 可能需要几分钟到几小时
- **大数据集**: 可能需要更长时间

## 📊 索引优化建议

### 1. 查询优化
- 尽量使用单字段索引
- 避免不必要的复合查询
- 使用分页减少数据量

### 2. 数据结构优化
- 考虑数据去规范化
- 使用合适的字段类型
- 避免深层嵌套查询

### 3. 性能监控
- 监控查询性能
- 定期检查索引使用情况
- 删除未使用的索引

## 🚨 注意事项

1. **索引限制**
   - 每个项目最多200个索引
   - 每个索引最多100个字段
   - 索引大小有限制

2. **成本考虑**
   - 索引会增加存储成本
   - 写操作会更新索引
   - 定期清理无用索引

3. **部署时间**
   - 索引创建是异步的
   - 大数据集需要更长时间
   - 创建期间查询可能失败

## ✅ 验证索引

### 创建完成后验证
1. **检查Firebase控制台**
   - 索引状态显示为"已启用"
   - 没有错误或警告

2. **测试查询**
   - 运行之前失败的查询
   - 检查控制台是否还有索引错误

3. **性能测试**
   - 查询响应时间改善
   - 没有超时错误

**完成索引创建后，邮件系统和内部消息系统将正常工作！**
