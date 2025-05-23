"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useTagContext } from "@/contexts/tag-context"
import { useState, useEffect, useCallback, memo } from "react"
import { useDebounce } from "@/hooks/use-debounce"

// 使用 memo 包装 SearchBar 组件
export const SearchBar = memo(function SearchBar() {
  const { setSearchQuery } = useTagContext()
  const [inputValue, setInputValue] = useState("")
  const debouncedValue = useDebounce(inputValue, 300)

  // 使用 useEffect 的依赖阵列确保只在 debouncedValue 变化时更新 searchQuery
  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  // 使用 useCallback 记忆 onChange 处理函数
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search bookmarks, URLs, or tags..." 
        className="pl-9 pr-4" 
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  )
}); 