"use client"

/**
 * 记录书签点击次数
 * @param bookmarkId 书签ID
 * @returns Promise<void>
 */
export const recordBookmarkClick = async (bookmarkId: string): Promise<void> => {
  try {
    await fetch(`/api/bookmarks/${bookmarkId}/click`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    // 静默失败 - 不影响用户体验
    console.error("Error recording bookmark click:", error)
  }
}

/**
 * 批量记录书签点击次数（并发版本）
 * @param bookmarkIds 书签ID数组
 * @returns Promise<{ successCount: number, totalCount: number, failedResults?: any[] }>
 */
export const recordBookmarkClicksBatch = async (
  bookmarkIds: string[]
): Promise<{ successCount: number, totalCount: number, failedResults?: any[] }> => {
  try {
    const response = await fetch('/api/bookmarks/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookmarkIds })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error recording bookmark clicks batch:", error)
    throw new Error("Failed to update bookmark click counts")
  }
}

/**
 * 批量记录书签点击次数（高效版本 - 单一SQL查询）
 * @param bookmarkIds 书签ID数组
 * @returns Promise<{ updatedCount: number, requestedCount: number, updatedBookmarks: any[] }>
 */
export const recordBookmarkClicksBatchEfficient = async (
  bookmarkIds: string[]
): Promise<{ updatedCount: number, requestedCount: number, updatedBookmarks: any[] }> => {
  try {
    const response = await fetch('/api/bookmarks/click-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookmarkIds })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error recording bookmark clicks batch efficient:", error)
    throw new Error("Failed to update bookmark click counts")
  }
}

/**
 * 获取书签的标签
 * @param bookmarkId 书签ID
 * @returns Promise<string[]> 标签ID数组
 */
export const fetchBookmarkTags = async (bookmarkId: string): Promise<string[]> => {
  try {
    const response = await fetch(`/api/bookmarks/${bookmarkId}/tags`)
    if (!response.ok) {
      throw new Error("Failed to fetch bookmark tags")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching bookmark tags:", error)
    throw new Error("Failed to load bookmark tags")
  }
}

/**
 * 获取指定标签的所有书签
 * @param tagId 标签ID
 * @returns Promise<any[]> 书签数组
 */
export const fetchBookmarksByTag = async (tagId: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/bookmarks?tagId=${tagId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch bookmarks")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    throw new Error("Failed to load bookmarks")
  }
} 