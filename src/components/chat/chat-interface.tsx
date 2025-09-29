'use client'

import { useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatMain } from './chat-main'

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧边栏 */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* 主聊天区域 */}
      <ChatMain
        conversationId={selectedConversationId}
        onNewConversation={() => setSelectedConversationId(null)}
      />
    </div>
  )
}