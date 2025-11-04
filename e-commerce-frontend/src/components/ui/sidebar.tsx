"use client"

import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Menu, X } from 'lucide-react'

interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMobile, setIsMobile] = useState(false)
  const defaultOpenRef = React.useRef(defaultOpen)
  const isInitializedRef = React.useRef(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Only set initial state once
      if (!isInitializedRef.current) {
        if (mobile) {
          setIsOpen(false)
        } else {
          setIsOpen(defaultOpenRef.current)
        }
        isInitializedRef.current = true
      } else {
        // On resize, close sidebar if switching to mobile
        if (mobile) {
          setIsOpen(false)
        }
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, []) // Empty dependency array is now safe

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isOpen, isMobile } = useSidebar()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => useSidebar().close()}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0",
          isMobile ? "fixed left-0 top-0 z-50 shadow-lg" : "relative",
          className
        )}
      >
        <div className={cn("h-full overflow-hidden", isOpen ? "block" : "hidden")}>
          {children}
        </div>
      </div>
    </>
  )
}

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-gray-200", className)}>
      {children}
    </div>
  )
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      {children}
    </div>
  )
}

interface SidebarTriggerProps {
  className?: string
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { toggle, isOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn("h-8 w-8 p-0", className)}
    >
      {isOpen ? (
        <X className="h-4 w-4" />
      ) : (
        <Menu className="h-4 w-4" />
      )}
    </Button>
  )
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

export function SidebarMenu({ children, className }: SidebarMenuProps) {
  return (
    <nav className={cn("space-y-2", className)}>
      {children}
    </nav>
  )
}

interface SidebarMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function SidebarMenuItem({ children, className, onClick }: SidebarMenuItemProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface SidebarFooterProps {
  children: React.ReactNode
  className?: string
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("p-4 border-t border-gray-200", className)}>
      {children}
    </div>
  )
}
