import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
