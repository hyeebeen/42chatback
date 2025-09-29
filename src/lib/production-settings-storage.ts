// 生产环境存储系统 - 使用环境变量和内存存储
interface UserSettings {
  userId: string
  providers: Array<{
    id: string
    name: string
    displayName: string
    apiKey: string
    baseUrl: string
    availableModels: string
    enabled: boolean
  }>
  promptTemplates: Array<{
    id: string
    title: string
    content: string
    createdAt: Date
  }>
}

// 内存存储 - 在生产环境中每个请求都是独立的，所以这主要用于开发环境
const memoryStorage: Record<string, UserSettings> = {}

// 从环境变量获取预配置的提供商
const getPreConfiguredProviders = () => {
  const providers = []

  // DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      id: 'deepseek',
      name: 'deepseek',
      displayName: 'DeepSeek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com',
      availableModels: 'deepseek-chat, deepseek-reasoner',
      enabled: true
    })
  }

  // Moonshot (Kimi)
  if (process.env.KIMI_API_KEY) {
    providers.push({
      id: 'kimi',
      name: 'kimi',
      displayName: 'Moonshot (Kimi)',
      apiKey: process.env.KIMI_API_KEY,
      baseUrl: 'https://api.moonshot.cn',
      availableModels: 'moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k',
      enabled: true
    })
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: 'openai',
      name: 'openai',
      displayName: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com',
      availableModels: 'gpt-4, gpt-4-turbo, gpt-3.5-turbo',
      enabled: true
    })
  }

  // Qwen
  if (process.env.QWEN_API_KEY) {
    providers.push({
      id: 'qwen',
      name: 'qwen',
      displayName: 'Qwen (通义千问)',
      apiKey: process.env.QWEN_API_KEY,
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
      availableModels: 'qwen-turbo, qwen-plus, qwen-max',
      enabled: true
    })
  }

  // Gemini
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      id: 'gemini',
      name: 'gemini',
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com',
      availableModels: 'gemini-pro, gemini-pro-vision',
      enabled: true
    })
  }

  // OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      id: 'openrouter',
      name: 'openrouter',
      displayName: 'OpenRouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api',
      availableModels: 'anthropic/claude-3-opus, anthropic/claude-3-sonnet',
      enabled: true
    })
  }

  return providers
}

export const productionSettingsStorage = {
  // 保存用户设置 - 在生产环境中只保存到内存
  saveUserSettings: (userId: string, settings: UserSettings) => {
    console.log('保存设置到内存:', userId)
    memoryStorage[userId] = { ...settings, userId }
    return true // 表示保存成功
  },

  // 获取用户设置
  getUserSettings: (userId: string): UserSettings | null => {
    // 优先从内存获取
    if (memoryStorage[userId]) {
      return memoryStorage[userId]
    }

    // 如果内存中没有，返回环境变量预配置的设置
    const preConfiguredProviders = getPreConfiguredProviders()
    if (preConfiguredProviders.length > 0) {
      const settings: UserSettings = {
        userId,
        providers: preConfiguredProviders,
        promptTemplates: [
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
        ]
      }

      // 保存到内存中供后续使用
      memoryStorage[userId] = settings
      return settings
    }

    return null
  },

  // 获取用户已启用的AI模型
  getUserEnabledModels: (userId: string) => {
    const settings = productionSettingsStorage.getUserSettings(userId)
    if (!settings) return []

    const enabledProviders = settings.providers.filter(p => p.enabled)
    const models = []

    for (const provider of enabledProviders) {
      // 解析可用模型字符串
      const modelNames = provider.availableModels.split(',').map(m => m.trim()).filter(Boolean)

      for (const modelName of modelNames) {
        models.push({
          id: modelName,
          name: modelName,
          provider: provider.id,
          displayName: provider.displayName,
          description: `${provider.displayName} - ${modelName}`
        })
      }
    }

    return models
  }
}

// 为了兼容性，也导出原来的接口名称
export const settingsStorage = productionSettingsStorage