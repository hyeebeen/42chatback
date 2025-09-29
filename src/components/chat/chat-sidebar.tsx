'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Menu, Search, Settings, LogOut } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  selectedConversationId: string | null
  onSelectConversation: (id: string | null) => void
  onNewConversation?: () => void
}

export function ChatSidebar({
  isOpen,
  onToggle,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  // 模拟对话数据
  const conversations = [
    { id: '1', title: '新对话', updatedAt: new Date() },
    { id: '2', title: 'React项目优化', updatedAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '3', title: 'API设计讨论', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ]

  const handleNewConversation = () => {
    console.log('handleNewConversation called in ChatSidebar')
    if (onNewConversation) {
      onNewConversation()
    } else {
      onSelectConversation(null)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (!isOpen) {
    return (
      <div className="w-16 border-r border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-b from-white/80 to-slate-50/60 dark:from-slate-900/90 dark:to-slate-800/70 backdrop-blur-sm flex flex-col items-center py-4 space-y-4 shadow-lg flowing-water">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-all duration-200 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNewConversation} className="hover:bg-gradient-to-r hover:from-[#3A6BF2]/10 hover:to-[#5C7CFF]/10 transition-all duration-200 rounded-xl">
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <ThemeSwitcher />
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col border-r border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-b from-white/80 to-slate-50/60 dark:from-slate-900/90 dark:to-slate-800/70 backdrop-blur-sm transition-all duration-300 shadow-lg flowing-water",
      isOpen ? "w-80" : "w-16"
    )}>
      {/* 顶部工具栏 - 优化设计 */}
      <div className="p-4 space-y-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-all duration-200 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
            <ThemeSwitcher />
          </div>
          <Button
            onClick={handleNewConversation}
            className="bg-gradient-to-r from-[#3A6BF2] to-[#5C7CFF] hover:from-[#2952E8] hover:to-[#4B69E8] text-white shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all duration-200"
            variant="default"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建对话
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 focus:bg-white/90 dark:focus:bg-slate-700/80 focus:border-[#3A6BF2]/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* 对话列表 - 优化设计 */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-2">
          {conversations.map((conversation, index) => (
            <Button
              key={conversation.id}
              variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left transition-all duration-200 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 rounded-lg mx-2",
                selectedConversationId === conversation.id && "bg-gradient-to-r from-[#3A6BF2]/10 to-[#22C7A9]/5 border-l-3 border-[#3A6BF2] shadow-sm"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="font-medium truncate leading-tight">{conversation.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {conversation.updatedAt.toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </Button>
          ))}

          {/* 空状态 */}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sidebar-accent/50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">暂无对话历史</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">开始新对话来聊天吧</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部用户菜单 - 优化设计 */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 transition-all duration-200 rounded-lg">
              <Avatar className="h-9 w-9 mr-3 border-2 border-slate-200/60 dark:border-slate-700/60">
                <AvatarFallback className="bg-gradient-to-br from-[#3A6BF2] to-[#22C7A9] text-white text-sm font-semibold">
                  {session?.user?.name ? getInitials(session.user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold truncate text-slate-900 dark:text-slate-100">
                  {session?.user?.name || '用户'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  在线
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}