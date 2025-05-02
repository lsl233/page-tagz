"use client"

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置定时器延迟更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清除之前的定时器
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
} 