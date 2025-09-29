// 临时存储用户设置（模拟数据库功能）
// 在真实项目中，这应该是数据库操作
import fs from 'fs'
import path from 'path'

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

// 临时文件存储路径
const TEMP_STORAGE_DIR = path.join(process.cwd(), '.temp-storage')
const SETTINGS_FILE = path.join(TEMP_STORAGE_DIR, 'settings.json')

// 确保存储目录存在
if (!fs.existsSync(TEMP_STORAGE_DIR)) {
  fs.mkdirSync(TEMP_STORAGE_DIR, { recursive: true })
}

// 从文件加载设置
const loadSettingsFromFile = (): Record<string, UserSettings> => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load settings from file:', error)
  }
  return {}
}

// 保存设置到文件
const saveSettingsToFile = (allSettings: Record<string, UserSettings>) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(allSettings, null, 2))
  } catch (error) {
    console.error('Failed to save settings to file:', error)
  }
}

export const settingsStorage = {
  // 保存用户设置
  saveUserSettings: (userId: string, settings: UserSettings) => {
    const allSettings = loadSettingsFromFile()
    allSettings[userId] = settings
    saveSettingsToFile(allSettings)
    console.log('Settings saved for user:', userId, settings)
  },

  // 获取用户设置
  getUserSettings: (userId: string): UserSettings | null => {
    const allSettings = loadSettingsFromFile()
    const settings = allSettings[userId]
    console.log('Settings loaded for user:', userId, settings)
    console.log('Available users:', Object.keys(allSettings))
    return settings || null
  },

  // 获取用户已启用的AI模型
  getUserEnabledModels: (userId: string) => {
    const allSettings = loadSettingsFromFile()
    const settings = allSettings[userId]
    if (!settings) return []

    const enabledProviders = settings.providers.filter(p => p.enabled)
    const models = []

    for (const provider of enabledProviders) {
      // 解析可用模型字符串
      const modelNames = provider.availableModels.split(',').map(m => m.trim()).filter(Boolean)

      if (modelNames.length > 0) {
        // 为每个模型创建条目
        for (const modelName of modelNames) {
          models.push({
            id: modelName,
            name: modelName,
            provider: provider.id,
            displayName: provider.displayName,
            description: `${provider.displayName} - ${modelName}`
          })
        }
      } else {
        // 如果没有具体模型名称，使用默认模型
        const defaultModels = getDefaultModelsForProvider(provider.id)
        for (const model of defaultModels) {
          models.push({
            id: model.id,
            name: model.name,
            provider: provider.id,
            displayName: provider.displayName,
            description: `${provider.displayName} - ${model.description}`
          })
        }
      }
    }

    return models
  }
}

// 为不同提供商获取默认模型
function getDefaultModelsForProvider(providerId: string) {
  const defaultModels: Record<string, Array<{id: string, name: string, description: string}>> = {
    openai: [
      { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI最先进的模型' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '快速响应的对话模型' }
    ],
    deepseek: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: '专注推理的AI模型' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: '专注代码生成的模型' }
    ],
    kimi: [
      { id: 'moonshot-v1-8k', name: 'Moonshot 8K', description: '支持长文本的智能助手' },
      { id: 'moonshot-v1-32k', name: 'Moonshot 32K', description: '超长文本处理能力' }
    ],
    qwen: [
      { id: 'qwen-turbo', name: 'Qwen Turbo', description: '通义千问快速模型' },
      { id: 'qwen-plus', name: 'Qwen Plus', description: '通义千问增强模型' }
    ],
    gemini: [
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google多模态AI模型' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: '支持图像理解的模型' }
    ],
    openrouter: [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: '通过OpenRouter访问' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: '通过OpenRouter访问' }
    ]
  }

  return defaultModels[providerId] || []
}