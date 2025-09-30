'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Settings,
  Key,
  FileText,
  Users,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  TestTube2,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Save
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ChatSidebar } from '@/components/chat/chat-sidebar'

// AI模型提供商类型
interface AIProvider {
  id: string
  name: string
  displayName: string
  description: string
  officialUrl: string
  docsUrl: string
  apiKey: string
  baseUrl: string
  availableModels: string
  enabled: boolean
  status: 'idle' | 'testing' | 'success' | 'error'
  errorMessage?: string
}

// 提示词模板类型
interface PromptTemplate {
  id: string
  title: string
  content: string
  createdAt: Date
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('models')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // AI模型提供商状态
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'deepseek',
      name: 'deepseek',
      displayName: 'DeepSeek',
      description: '专注于推理和代码生成的AI模型',
      officialUrl: 'https://platform.deepseek.com/api_keys',
      docsUrl: 'https://api-docs.deepseek.com/',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
      availableModels: '',
      enabled: false,
      status: 'idle'
    },
    {
      id: 'kimi',
      name: 'kimi',
      displayName: 'Moonshot (Kimi)',
      description: '支持超长文本处理的智能助手',
      officialUrl: 'https://platform.moonshot.ai/console/api-keys',
      docsUrl: 'https://platform.moonshot.ai/docs/guide/start-using-kimi-api',
      apiKey: '',
      baseUrl: 'https://api.moonshot.cn',
      availableModels: '',
      enabled: false,
      status: 'idle'
    },
    {
      id: 'qwen',
      name: 'qwen',
      displayName: 'Qwen (通义千问)',
      description: '阿里云开发的大语言模型',
      officialUrl: 'https://dashscope.console.aliyun.com/apiKey',
      docsUrl: 'https://help.aliyun.com/zh/model-studio/first-api-call-to-qwen',
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
      availableModels: '',
      enabled: false,
      status: 'idle'
    },
    {
      id: 'openai',
      name: 'openai',
      displayName: 'OpenAI',
      description: 'GPT系列模型的原厂服务',
      officialUrl: 'https://platform.openai.com/api-keys',
      docsUrl: 'https://platform.openai.com/docs/api-reference',
      apiKey: '',
      baseUrl: 'https://api.openai.com',
      availableModels: '',
      enabled: false,
      status: 'idle'
    },
    {
      id: 'gemini',
      name: 'gemini',
      displayName: 'Google Gemini',
      description: 'Google开发的多模态AI模型',
      officialUrl: 'https://aistudio.google.com/app/apikey',
      docsUrl: 'https://ai.google.dev/gemini-api/docs/api-key',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com',
      availableModels: '',
      enabled: false,
      status: 'idle'
    },
    {
      id: 'openrouter',
      name: 'openrouter',
      displayName: 'OpenRouter',
      description: '统一访问多种AI模型的平台',
      officialUrl: 'https://openrouter.ai/settings/keys',
      docsUrl: 'https://openrouter.ai/docs/quickstart',
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api',
      availableModels: '',
      enabled: false,
      status: 'idle'
    }
  ])

  // 提示词模板状态
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    {
      id: '1',
      title: '代码审查',
      content: '请帮我审查以下代码，重点关注性能、安全性和最佳实践：\n\n```\n[在此处粘贴代码]\n```',
      createdAt: new Date()
    },
    {
      id: '2',
      title: '文档编写',
      content: '请帮我为以下功能编写清晰的文档，包括使用说明和示例：\n\n功能描述：[在此处描述功能]\n\n要求：\n1. 简洁明了\n2. 包含代码示例\n3. 说明注意事项',
      createdAt: new Date()
    }
  ])

  const [isAddingPrompt, setIsAddingPrompt] = useState(false)
  const [newPrompt, setNewPrompt] = useState({ title: '', content: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // 测试API连接
  const testAPIConnection = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider || !provider.apiKey) return

    setProviders(prev => prev.map(p =>
      p.id === providerId ? { ...p, status: 'testing' } : p
    ))

    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl
        })
      })

      const data = await response.json()

      if (data.success) {
        setProviders(prev => prev.map(p =>
          p.id === providerId ? {
            ...p,
            status: 'success',
            errorMessage: undefined,
            availableModels: data.availableModels
          } : p
        ))
      } else {
        throw new Error(data.error || '连接测试失败')
      }
    } catch (error: unknown) {
      let errorMessage = '连接失败：'

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage += '网络错误，请检查网络连接'
        } else {
          errorMessage += error.message || '未知错误'
        }
      } else {
        errorMessage += '未知错误'
      }

      setProviders(prev => prev.map(p =>
        p.id === providerId ? {
          ...p,
          status: 'error',
          errorMessage
        } : p
      ))
    }
  }

  // 更新提供商信息
  const updateProvider = (providerId: string, field: keyof AIProvider, value: string | boolean) => {
    setProviders(prev => prev.map(p =>
      p.id === providerId ? { ...p, [field]: value, status: 'idle' } : p
    ))
  }

  // 添加提示词模板
  const addPromptTemplate = () => {
    if (newPrompt.title && newPrompt.content) {
      const template: PromptTemplate = {
        id: Date.now().toString(),
        title: newPrompt.title,
        content: newPrompt.content,
        createdAt: new Date()
      }
      setPromptTemplates(prev => [template, ...prev])
      setNewPrompt({ title: '', content: '' })
      setIsAddingPrompt(false)
    }
  }

  // 删除提示词模板
  const deletePromptTemplate = (id: string) => {
    setPromptTemplates(prev => prev.filter(p => p.id !== id))
  }

  // 保存单个提供商设置
  const saveProviderSettings = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider || provider.status !== 'success') return

    setProviders(prev => prev.map(p =>
      p.id === providerId ? { ...p, status: 'testing' } : p  // 重用testing状态显示保存中
    ))

    try {
      // 获取现有的所有设置
      const existingResponse = await fetch('/api/settings/load')
      let existingProviders: AIProvider[] = []
      let existingPromptTemplates: PromptTemplate[] = promptTemplates

      if (existingResponse.ok) {
        const existingData = await existingResponse.json()
        if (existingData.data) {
          existingProviders = existingData.data.providers || []
          existingPromptTemplates = existingData.data.promptTemplates || promptTemplates
        }
      }

      // 更新或添加当前提供商
      const updatedProviders = existingProviders.filter(p => p.id !== providerId)
      updatedProviders.push({
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        description: provider.description,
        officialUrl: provider.officialUrl,
        docsUrl: provider.docsUrl,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        availableModels: provider.availableModels,
        enabled: true, // 保存时自动启用
        status: 'success' as const
      })

      const response = await fetch('/api/settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providers: updatedProviders,
          promptTemplates: existingPromptTemplates
        }),
      })

      if (response.ok) {
        setProviders(prev => prev.map(p =>
          p.id === providerId ? { ...p, enabled: true, status: 'success' } : p
        ))
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      setProviders(prev => prev.map(p =>
        p.id === providerId ? { ...p, status: 'error', errorMessage: '保存失败：' + (error as Error).message } : p
      ))
    }
  }

  // 保存所有设置
  const saveAllSettings = async () => {
    setIsSaving(true)
    setSaveStatus('saving')

    try {
      // 只保存已启用且已成功连接的提供商
      const enabledProviders = providers.filter(p => p.enabled && p.status === 'success')

      const response = await fetch('/api/settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providers: enabledProviders.map(p => ({
            id: p.id,
            name: p.name,
            displayName: p.displayName,
            description: p.description,
            officialUrl: p.officialUrl,
            docsUrl: p.docsUrl,
            apiKey: p.apiKey,
            baseUrl: p.baseUrl,
            availableModels: p.availableModels,
            enabled: p.enabled,
            status: p.status
          })),
          promptTemplates
        }),
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // 加载已保存的设置
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/load')
      if (response.ok) {
        const data = await response.json()
        if (data.providers) {
          setProviders(prev => prev.map(p => {
            const saved = data.providers.find((sp: { id: string }) => sp.id === p.id)
            return saved ? { ...p, ...saved } : p
          }))
        }
        if (data.promptTemplates) {
          setPromptTemplates(data.promptTemplates)
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 组件挂载时加载设置
  React.useEffect(() => {
    loadSettings()
  }, [])

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversationId(id)
    if (id) {
      router.push('/chat')
    }
  }

  const handleNewConversation = async () => {
    console.log('handleNewConversation called in settings page')
    setIsNavigating(true)
    setSelectedConversationId(null)
    await router.push('/chat')
    setIsNavigating(false)
  }

  return (
    <div className="flex h-screen bg-background chat-background">
      {/* 左侧边栏 */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-4 py-3 sticky top-0 z-10 flowing-water">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/chat')}
                className="hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                返回聊天
              </Button>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#3A6BF2]" />
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">设置</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={saveAllSettings}
                disabled={isSaving || providers.filter(p => p.enabled && p.status === 'success').length === 0}
                className="bg-gradient-to-r from-[#3A6BF2] to-[#5C7CFF] hover:from-[#2952E8] hover:to-[#4B69E8] text-white h-7 px-3 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? '保存中...' : '保存所有设置'}
              </Button>

              {saveStatus === 'success' && (
                <Badge variant="outline" className="text-green-600 border-green-600/20 bg-green-50 dark:bg-green-900/20 text-xs">
                  <Check className="h-2 w-2 mr-1" />
                  已保存
                </Badge>
              )}

              {saveStatus === 'error' && (
                <Badge variant="outline" className="text-red-600 border-red-600/20 bg-red-50 dark:bg-red-900/20 text-xs">
                  <X className="h-2 w-2 mr-1" />
                  保存失败
                </Badge>
              )}

              <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 text-xs">
                {session?.user?.name || '用户'}
              </Badge>
            </div>
          </div>
        </div>

        {/* 主要内容 - 可滚动 */}
        <div className="flex-1 overflow-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 h-9">
            <TabsTrigger value="models" className="flex items-center space-x-1 text-sm">
              <Key className="h-3 w-3" />
              <span>模型设置</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center space-x-1 text-sm">
              <FileText className="h-3 w-3" />
              <span>提示词库</span>
            </TabsTrigger>
            {session?.user?.email === 'admin@example.com' && (
              <TabsTrigger value="users" className="flex items-center space-x-1 text-sm">
                <Users className="h-3 w-3" />
                <span>用户管理</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* 模型设置 */}
          <TabsContent value="models" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 interactive-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Key className="h-4 w-4 text-[#3A6BF2]" />
                  <span>AI模型配置</span>
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  配置您的AI模型API密钥，支持多个提供商。所有密钥将被加密存储。
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="p-4 rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                    {/* 头部信息 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {provider.displayName}
                          </h3>
                          <Switch
                            checked={provider.enabled}
                            onCheckedChange={(checked) => updateProvider(provider.id, 'enabled', checked)}
                          />
                          {provider.status === 'success' && (
                            <Badge variant="outline" className="text-green-600 border-green-600/20 bg-green-50 dark:bg-green-900/20 text-xs px-1.5 py-0">
                              <Check className="h-2 w-2 mr-1" />
                              已连接
                            </Badge>
                          )}
                          {provider.status === 'error' && (
                            <Badge variant="outline" className="text-red-600 border-red-600/20 bg-red-50 dark:bg-red-900/20 text-xs px-1.5 py-0">
                              <X className="h-2 w-2 mr-1" />
                              连接失败
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                          {provider.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(provider.officialUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 h-6 px-2 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            获取API Key
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(provider.docsUrl, '_blank')}
                            className="text-slate-600 hover:text-slate-700 border-slate-200 hover:border-slate-300 h-6 px-2 text-xs"
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            文档
                          </Button>
                        </div>
                      </div>
                      <div className="ml-3 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAPIConnection(provider.id)}
                          disabled={!provider.apiKey || provider.status === 'testing'}
                          className="h-7 px-2 text-xs"
                        >
                          <TestTube2 className="h-3 w-3 mr-1" />
                          {provider.status === 'testing' ? '测试中...' : '测试连接'}
                        </Button>

                        {provider.status === 'success' && (
                          <Button
                            size="sm"
                            onClick={() => saveProviderSettings(provider.id)}
                            className="bg-gradient-to-r from-[#22C7A9] to-[#16B98D] hover:from-[#1FB89E] hover:to-[#14A085] text-white h-7 px-2 text-xs"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            保存设置
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 配置表单 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${provider.id}-api-key`} className="text-xs font-medium">
                          API Key *
                        </Label>
                        <Input
                          id={`${provider.id}-api-key`}
                          type="password"
                          placeholder={provider.id === 'openai' ? 'sk-proj-...' : provider.id === 'qwen' ? 'sk-...' : 'sk-...'}
                          value={provider.apiKey}
                          onChange={(e) => updateProvider(provider.id, 'apiKey', e.target.value)}
                          className="bg-white/80 dark:bg-slate-800/80 h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${provider.id}-base-url`} className="text-xs font-medium">
                          Base URL
                        </Label>
                        <Input
                          id={`${provider.id}-base-url`}
                          value={provider.baseUrl}
                          onChange={(e) => updateProvider(provider.id, 'baseUrl', e.target.value)}
                          className="bg-white/80 dark:bg-slate-800/80 h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* 可用模型 */}
                    {provider.availableModels && (
                      <div className="mt-2 space-y-1">
                        <Label className="text-xs font-medium">可用模型</Label>
                        <Input
                          value={provider.availableModels}
                          onChange={(e) => updateProvider(provider.id, 'availableModels', e.target.value)}
                          placeholder="例如: gpt-4, gpt-3.5-turbo"
                          className="bg-white/80 dark:bg-slate-800/80 h-8 text-xs"
                          readOnly
                        />
                      </div>
                    )}

                    {/* 错误信息 */}
                    {provider.status === 'error' && provider.errorMessage && (
                      <div className="mt-2 flex items-start space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200/50 dark:border-red-800/50">
                        <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{provider.errorMessage}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 提示词库 */}
          <TabsContent value="prompts" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 interactive-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-[#22C7A9]" />
                      <span>提示词模板库</span>
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      创建和管理您的常用提示词模板，提高对话效率。
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingPrompt(true)}
                    className="bg-gradient-to-r from-[#3A6BF2] to-[#5C7CFF] hover:from-[#2952E8] hover:to-[#4B69E8] text-white shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增模板
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingPrompt && (
                  <div className="space-y-4 p-4 rounded-lg border border-slate-200/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                    <div className="space-y-2">
                      <Label htmlFor="new-prompt-title">模板标题</Label>
                      <Input
                        id="new-prompt-title"
                        placeholder="例如：代码审查、文档编写"
                        value={newPrompt.title}
                        onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/80 dark:bg-slate-800/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-prompt-content">模板内容</Label>
                      <Textarea
                        id="new-prompt-content"
                        placeholder="输入您的提示词模板内容..."
                        value={newPrompt.content}
                        onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        className="bg-white/80 dark:bg-slate-800/80"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={addPromptTemplate}
                        disabled={!newPrompt.title || !newPrompt.content}
                        className="bg-gradient-to-r from-[#22C7A9] to-[#16B98D] hover:from-[#1FB89E] hover:to-[#14A085] text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPrompt(false)
                          setNewPrompt({ title: '', content: '' })
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  </div>
                )}

                {promptTemplates.map((template) => (
                  <div key={template.id} className="space-y-3 p-4 rounded-lg border border-slate-200/40 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-700/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {template.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePromptTemplate(template.id)}
                          className="text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-3 rounded border">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {template.content.length > 200
                          ? `${template.content.substring(0, 200)}...`
                          : template.content}
                      </pre>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      创建时间: {template.createdAt.toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                ))}

                {promptTemplates.length === 0 && !isAddingPrompt && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无提示词模板</p>
                    <p className="text-sm">点击&ldquo;新增模板&rdquo;创建您的第一个模板</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 用户管理 (仅管理员可见) */}
          {session?.user?.email === 'admin@example.com' && (
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 interactive-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#EF4444]" />
                    <span>用户管理</span>
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    管理系统用户和模型访问权限。
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>用户管理功能正在开发中</p>
                    <p className="text-sm">即将支持用户列表查看和权限管理</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        </div>
      </div>
    </div>
  )
}