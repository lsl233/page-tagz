"use client"

import { LuLink } from "react-icons/lu"
import { useEffect, useState, memo } from "react"

// 缓存已获取的 favicon URL
const faviconCache: Record<string, string | null> = {}

interface FaviconProps {
  url?: string
  icon?: string | null
  className?: string
  size?: number
}

// 使用 memo 包装 Favicon 组件
export const Favicon = memo(function Favicon({ url, icon, className = "", size = 16 }: FaviconProps) {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) return
    if (icon) return // 如果有 icon，直接使用，不需要获取 favicon

    try {
      // 尝试从 URL 中提取域名
      const domain = new URL(url).hostname
      
      // 检查缓存中是否已有此域名的 favicon
      if (faviconCache[domain] !== undefined) {
        setFaviconUrl(faviconCache[domain])
        return
      }
      
      // 尝试常见的 favicon 路径
      const commonPaths = [
        `https://${domain}/favicon.ico`
      ]

      // 检查每个可能的路径
      const checkFavicon = async () => {
        for (const path of commonPaths) {
          try {
            const response = await fetch(path, { 
              method: 'HEAD',
              cache: 'force-cache', // 使用浏览器缓存
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            })
            if (response.ok) {
              setFaviconUrl(path)
              faviconCache[domain] = path // 缓存结果
              return
            }
          } catch (e) {
            continue
          }
        }
        setError(true)
        faviconCache[domain] = null // 缓存失败结果
      }

      checkFavicon()
    } catch (e) {
      setError(true)
    }
  }, [url, icon])

  // 1. 如果有 icon，直接使用
  if (icon) {
    return (
      <img
        src={icon}
        alt="favicon"
        width={size}
        height={size}
        className={className}
        onError={() => setError(true)}
      />
    )
  }

  // 2. 如果有 faviconUrl，使用提取的 favicon
  if (faviconUrl && !error) {
    return (
      <img
        src={faviconUrl}
        alt="favicon"
        width={size}
        height={size}
        className={className}
        onError={() => setError(true)}
      />
    )
  }

  // 3. 如果都失败，显示默认图标
  return <LuLink className={`h-${size} w-${size} ${className}`} />
}); 