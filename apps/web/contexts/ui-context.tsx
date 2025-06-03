"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type UIContextType = {
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean
  setLeftSidebarCollapsed: (collapsed: boolean) => void
  setRightSidebarCollapsed: (collapsed: boolean) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  collapseAllSidebars: () => void
  expandAllSidebars: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(prev => !prev)
  }

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(prev => !prev)
  }

  const collapseAllSidebars = () => {
    setLeftSidebarCollapsed(true)
    setRightSidebarCollapsed(true)
  }

  const expandAllSidebars = () => {
    setLeftSidebarCollapsed(false)
    setRightSidebarCollapsed(false)
  }

  return (
    <UIContext.Provider value={{
      leftSidebarCollapsed,
      rightSidebarCollapsed,
      setLeftSidebarCollapsed,
      setRightSidebarCollapsed,
      toggleLeftSidebar,
      toggleRightSidebar,
      collapseAllSidebars,
      expandAllSidebars
    }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUIContext() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider")
  }
  return context
} 