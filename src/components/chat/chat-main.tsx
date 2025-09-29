'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Share, Upload, Send, Circle, RefreshCw } from 'lucide-react'

interface ChatMainProps {
  conversationId: string | null
  onNewConversation: () => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

export function ChatMain({ conversationId, onNewConversation }: ChatMainProps) {
  // TODO: 这些参数将在后续实现中使用
  console.log('ConversationId:', conversationId, 'onNewConversation:', onNewConversation)

  const [input, setInput] = useState('')
  const [isSearchEnabled, setIsSearchEnabled] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [isLoading, setIsLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState<Array<{
    id: string
    name: string
    provider: string
    description: string
  }>>([])
  const [modelProvider, setModelProvider] = useState('openai')
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // 模拟消息数据
  const [messages, setMessages] = useState<Message[]>([])

  // 监听 conversationId 变化，实现新建对话功能
  useEffect(() => {
    if (conversationId === null) {
      setMessages([])
      setInput('')
    }
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // 构建对话历史
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages,
          model: selectedModel,
          providerId: modelProvider
        }),
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      const data = await response.json()

      if (data.success && data.data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message.content,
          timestamp: new Date(),
          model: selectedModel,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('API响应格式错误')
      }

    } catch (error) {
      console.error('发送消息失败:', error)

      // 如果API调用失败，显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发送消息时出现错误。请检查您的网络连接和API配置。',
        timestamp: new Date(),
        model: selectedModel,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 加载可用模型
  const loadAvailableModels = async () => {
    setIsLoadingModels(true)
    try {
      const response = await fetch('/api/chat/models')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setAvailableModels(data.data)
          // 设置默认模型
          if (data.data.length > 0 && !selectedModel) {
            setSelectedModel(data.data[0].id)
            setModelProvider(data.data[0].provider)
          }
          console.log('模型列表已加载:', data.data.length, '个模型')
        }
      }
    } catch (error) {
      console.error('加载模型列表失败:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  // 处理模型选择
  const handleModelChange = (modelId: string) => {
    console.log('模型切换:', modelId)
    setSelectedModel(modelId)
    const model = availableModels.find(m => m.id === modelId)
    if (model) {
      setModelProvider(model.provider)
      console.log('当前模型:', model.name, '提供商:', model.displayName)
    }
  }

  // 组件挂载时加载模型
  useEffect(() => {
    loadAvailableModels()
  }, [])

  // 页面重新获得焦点时刷新模型列表
  useEffect(() => {
    const handleFocus = () => {
      console.log('页面重新获得焦点，刷新模型列表')
      loadAvailableModels()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const syncStatus = 'synced' // 'synced' | 'syncing' | 'failed'

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-background chat-background">
      {/* 顶部工具栏 - 优化视觉层次 */}
      <div className="flex-shrink-0 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-6 py-4 z-10 flowing-water">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-64 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 interactive-shadow">
                <SelectValue placeholder="选择模型">
                  {selectedModel && availableModels.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({availableModels.find(m => m.id === selectedModel)?.displayName})
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {availableModels.length > 0 ? (
                  (() => {
                    // 按提供商分组模型
                    const groupedModels = availableModels.reduce((acc, model) => {
                      if (!acc[model.provider]) {
                        acc[model.provider] = []
                      }
                      acc[model.provider].push(model)
                      return acc
                    }, {} as Record<string, typeof availableModels>)

                    return Object.entries(groupedModels).map(([provider, models]) => (
                      <div key={provider}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          {models[0]?.displayName || provider}
                        </div>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id} className="pl-4">
                            <div className="flex flex-col w-full">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {model.id !== model.name ? model.id : `${model.displayName} 模型`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  })()
                ) : (
                  <SelectItem value="no-models" disabled>
                    暂无可用模型，请先在设置中配置
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAvailableModels()}
                disabled={isLoadingModels}
                className="h-8 w-8 p-0 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 interactive-shadow"
                title="刷新模型列表"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 interactive-shadow flowing-border">
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50">
              <Circle
                className={`h-2.5 w-2.5 fill-current transition-colors ${
                  syncStatus === 'synced' ? 'text-emerald-500' :
                  syncStatus === 'syncing' ? 'text-amber-500' :
                  'text-red-500'
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {syncStatus === 'synced' ? '已同步' :
                 syncStatus === 'syncing' ? '同步中' :
                 '同步失败'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 消息区域 - 全新的聊天气泡设计 */}
      <ScrollArea className="flex-1 min-h-0 px-4 py-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">开始新对话</h3>
              <p className="text-muted-foreground text-center">选择一个模型并输入您的问题，开始智能对话</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22C7A9] to-[#16B98D] flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 border border-teal-400/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}

                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`relative px-6 py-4 backdrop-blur-sm transition-all duration-300 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#3A6BF2] to-[#5C7CFF] text-white rounded-2xl rounded-br-md shadow-lg shadow-blue-500/20 border border-blue-400/20'
                        : 'bg-white/80 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-bl-md shadow-md hover:shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/95'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>

                    <div className={`flex items-center gap-2 mt-3 text-xs ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      <span>
                        {message.timestamp.toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.model && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{message.model}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-400 dark:to-slate-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-500/20 border border-slate-400/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="max-w-[75%]">
                <div className="relative px-4 py-3 rounded-2xl bg-card border border-border rounded-bl-sm shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 - 现代化设计 */}
      <div className="flex-shrink-0 border-t bg-card/30 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* 功能开关 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="search"
                checked={isSearchEnabled}
                onCheckedChange={setIsSearchEnabled}
              />
              <Label htmlFor="search" className="text-sm font-medium">联网搜索</Label>
            </div>

            <Button variant="outline" size="sm" className="bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 interactive-shadow flowing-border">
              <Upload className="h-4 w-4 mr-2" />
              上传文件
            </Button>
          </div>

          {/* 输入框区域 */}
          <div className="relative w-full">
            <div className="flex items-end space-x-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all duration-200 w-full">
              <Textarea
                placeholder="输入您的消息... (Enter发送, Shift+Enter换行)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 resize-none border-0 bg-transparent p-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground/60"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl bg-gradient-to-r from-[#3A6BF2] to-[#5C7CFF] hover:from-[#2952E8] hover:to-[#4B69E8] transition-all duration-200 shrink-0 shadow-lg shadow-blue-500/20 border border-blue-400/20 w-10 h-10"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}