"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Home, 
  Package, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut,
  Store,
  Users,
  ShoppingCart
} from 'lucide-react'
import { useUserStore } from '@/lib/store/user-store'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/seller/dashboard',
    icon: Home,
    roles: ['seller']
  },
  {
    title: 'Add Product',
    href: '/seller/add-product',
    icon: Plus,
    roles: ['seller']
  },
  {
    title: 'Products',
    href: '/seller/products',
    icon: Package,
    roles: ['seller']
  },
  {
    title: 'Orders',
    href: '/seller/orders',
    icon: ShoppingCart,
    roles: ['seller']
  },
  {
    title: 'Analytics',
    href: '/seller/analytics',
    icon: BarChart3,
    roles: ['seller']
  },
  {
    title: 'Customers',
    href: '/seller/customers',
    icon: Users,
    roles: ['seller']
  },
  {
    title: 'Store Settings',
    href: '/seller/settings',
    icon: Store,
    roles: ['seller']
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUserStore()
  const { close, isMobile } = useSidebar()

  const handleSignOut = async () => {
    try {
      // TODO: Implement sign out functionality
      console.log('Sign out clicked')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const filteredNavigation = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  )

  const handleNavClick = () => {
    if (isMobile) {
      close()
    }
  }

  return (
    <Sidebar className="border-r-0">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">E-Commerce</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.role || 'User'} Panel
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarMenu>
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <SidebarMenuItem
                  className={cn(
                    "transition-colors duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuItem>
              </Link>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter>
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {user?.userName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            <Link href="/seller/settings" onClick={handleNavClick}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
