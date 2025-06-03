# 书签点击次数批量更新

## 概述

现在支持批量更新多个书签的点击次数，而不仅仅是更新单个书签。提供了两种不同的实现方法：

## API 端点

### 1. 并发版本 `/api/bookmarks/click`
- **方法**: POST
- **描述**: 使用并发查询更新多个书签
- **适用场景**: 需要详细错误处理的场景

**请求体**:
```json
{
  "bookmarkIds": ["bookmark-id-1", "bookmark-id-2", "bookmark-id-3"]
}
```

**响应**:
```json
{
  "success": true,
  "message": "Successfully updated 3 out of 3 bookmarks",
  "successCount": 3,
  "totalCount": 3,
  "failedResults": []
}
```

### 2. 高效版本 `/api/bookmarks/click-batch`
- **方法**: POST
- **描述**: 使用单一SQL查询更新多个书签
- **适用场景**: 高性能批量更新（推荐）
- **限制**: 最多100个书签

**请求体**:
```json
{
  "bookmarkIds": ["bookmark-id-1", "bookmark-id-2", "bookmark-id-3"]
}
```

**响应**:
```json
{
  "success": true,
  "message": "Successfully updated 3 bookmarks",
  "updatedCount": 3,
  "requestedCount": 3,
  "updatedBookmarks": [
    {"id": "bookmark-id-1", "clickCount": 5},
    {"id": "bookmark-id-2", "clickCount": 3},
    {"id": "bookmark-id-3", "clickCount": 8}
  ]
}
```

## 客户端函数

### 1. recordBookmarkClicksBatch()
```typescript
import { recordBookmarkClicksBatch } from '@/lib/api'

const result = await recordBookmarkClicksBatch(['id1', 'id2', 'id3'])
console.log(`Updated ${result.successCount} out of ${result.totalCount} bookmarks`)
```

### 2. recordBookmarkClicksBatchEfficient() (推荐)
```typescript
import { recordBookmarkClicksBatchEfficient } from '@/lib/api'

const result = await recordBookmarkClicksBatchEfficient(['id1', 'id2', 'id3'])
console.log(`Updated ${result.updatedCount} bookmarks`)
```

## 实际使用示例

### 在 BookmarkToolbar 中的使用
```typescript
const handleOpenAllBookmarks = async () => {
  // 打开所有书签
  window.postMessage({ 
    type: 'OPEN_ALL_BOOKMARKS', 
    data: filteredBookmarks.map(bookmark => bookmark.url) 
  }, '*')

  // 批量更新点击次数
  try {
    const bookmarkIds = filteredBookmarks.map(bookmark => bookmark.id)
    const result = await recordBookmarkClicksBatchEfficient(bookmarkIds)
    
    if (result.updatedCount !== result.requestedCount) {
      toast.warning(`只更新了 ${result.updatedCount} 个书签，共 ${result.requestedCount} 个`)
    }
  } catch (error) {
    console.error("更新点击次数失败:", error)
  }
}
```

## 性能对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 并发版本 | 详细错误处理、失败重试 | 多次数据库查询、较慢 | 需要精确错误处理 |
| 高效版本 | 单一SQL查询、快速 | 错误处理较简单 | 高性能批量更新 |

## 错误处理

### 输入验证
- 空数组或非数组：返回 400 错误
- 超过100个书签（高效版本）：返回 400 错误

### 数据库错误
- 书签不存在：并发版本会记录失败；高效版本会忽略
- 连接错误：返回 500 错误

## 测试

使用测试文件进行性能和功能测试：

```typescript
import { compareBatchUpdateMethods } from '@/lib/test-batch-update'

// 比较两种方法的性能
const results = await compareBatchUpdateMethods(['id1', 'id2', 'id3'])
``` 