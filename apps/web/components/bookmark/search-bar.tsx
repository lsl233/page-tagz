"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useTagContext } from "@/contexts/tag-context"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function SearchBar() {
  const { setSearchQuery } = useTagContext()
  const [inputValue, setInputValue] = useState("")
  const debouncedValue = useDebounce(inputValue, 300)

  // 当输入值变化时，更新搜索查询
  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="搜索书签、URL或标签..." 
        className="pl-9 pr-4" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  )
} 