/**
 * 测试批量更新书签点击次数功能
 * 这个文件用于开发和测试目的
 */

import { recordBookmarkClicksBatch, recordBookmarkClicksBatchEfficient } from './api'

// 类型定义
export interface BatchUpdateResult {
  successCount: number
  totalCount: number
  failedResults?: any[]
}

export interface BatchUpdateResultEfficient {
  updatedCount: number
  requestedCount: number
  updatedBookmarks: Array<{
    id: string
    clickCount: number
  }>
}

/**
 * 测试并发版本的批量更新
 */
export const testBatchUpdateConcurrent = async (bookmarkIds: string[]): Promise<BatchUpdateResult> => {
  console.log(`Testing concurrent batch update for ${bookmarkIds.length} bookmarks`)
  
  const startTime = Date.now()
  const result = await recordBookmarkClicksBatch(bookmarkIds)
  const endTime = Date.now()
  
  console.log(`Concurrent batch update completed in ${endTime - startTime}ms`)
  console.log(`Result:`, result)
  
  return result
}

/**
 * 测试高效版本的批量更新（单一SQL查询）
 */
export const testBatchUpdateEfficient = async (bookmarkIds: string[]): Promise<BatchUpdateResultEfficient> => {
  console.log(`Testing efficient batch update for ${bookmarkIds.length} bookmarks`)
  
  const startTime = Date.now()
  const result = await recordBookmarkClicksBatchEfficient(bookmarkIds)
  const endTime = Date.now()
  
  console.log(`Efficient batch update completed in ${endTime - startTime}ms`)
  console.log(`Result:`, result)
  
  return result
}

/**
 * 比较两种批量更新方法的性能
 */
export const compareBatchUpdateMethods = async (bookmarkIds: string[]) => {
  console.log(`Comparing batch update methods for ${bookmarkIds.length} bookmarks`)
  
  try {
    // 测试并发版本
    const concurrentResult = await testBatchUpdateConcurrent([...bookmarkIds])
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 测试高效版本
    const efficientResult = await testBatchUpdateEfficient([...bookmarkIds])
    
    console.log('Performance comparison completed:')
    console.log('Concurrent method:', concurrentResult)
    console.log('Efficient method:', efficientResult)
    
    return {
      concurrent: concurrentResult,
      efficient: efficientResult
    }
  } catch (error) {
    console.error('Error during batch update comparison:', error)
    throw error
  }
} 