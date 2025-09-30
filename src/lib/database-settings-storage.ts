// 数据库存储系统 - 真正的持久化存储
import { db, apiConfigurations, promptTemplates } from '@/lib/db'
import { encryptApiKey, decryptApiKey } from '@/lib/utils'
import { eq } from 'drizzle-orm'

// 定义设置类型
interface UserSettings {
  userId: string
  providers: Array<{
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
    status: 'success' | 'error'
  }>
  promptTemplates: Array<{
    id: string
    title: string
    content: string
    createdAt: Date
  }>
}

interface AIModel {
  id: string
  name: string
  provider: string
  displayName: string
  description: string
}

export const databaseSettingsStorage = {
  // 保存用户设置到数据库
  saveUserSettings: async (userId: string, settings: UserSettings): Promise<boolean> => {
    try {
      console.log('保存设置到数据库:', userId)

      // 开始事务处理
      await db.transaction(async (tx) => {
        // 1. 删除用户现有的API配置
        await tx.delete(apiConfigurations).where(eq(apiConfigurations.userId, userId))

        // 2. 删除用户现有的prompt模板
        await tx.delete(promptTemplates).where(eq(promptTemplates.userId, userId))

        // 3. 保存新的API配置
        for (const provider of settings.providers) {
          if (provider.enabled && provider.apiKey) {
            const encryptedApiKey = encryptApiKey(provider.apiKey)

            await tx.insert(apiConfigurations).values({
              userId,
              provider: provider.id,
              encryptedApiKey,
              baseUrl: provider.baseUrl,
              enabledModels: provider.availableModels.split(',').map(m => m.trim()).filter(Boolean),
            })
          }
        }

        // 4. 保存新的prompt模板
        for (const template of settings.promptTemplates) {
          await tx.insert(promptTemplates).values({
            userId,
            title: template.title,
            content: template.content,
          })
        }
      })

      console.log('设置保存到数据库成功')
      return true
    } catch (error) {
      console.error('保存设置到数据库失败:', error)
      return false
    }
  },

  // 从数据库获取用户设置
  getUserSettings: async (userId: string): Promise<UserSettings | null> => {
    try {
      console.log('从数据库加载设置:', userId)

      // 获取用户的API配置
      const userApiConfigs = await db
        .select()
        .from(apiConfigurations)
        .where(eq(apiConfigurations.userId, userId))

      // 获取用户的prompt模板
      const userPromptTemplates = await db
        .select()
        .from(promptTemplates)
        .where(eq(promptTemplates.userId, userId))

      // 构建提供商列表
      const providers = userApiConfigs.map(config => {
        try {
          const decryptedApiKey = decryptApiKey(config.encryptedApiKey)
          const models = Array.isArray(config.enabledModels)
            ? config.enabledModels.join(', ')
            : (config.enabledModels as string || '')

          return {
            id: config.provider,
            name: config.provider,
            displayName: getProviderDisplayName(config.provider),
            description: getProviderDescription(config.provider),
            officialUrl: getProviderOfficialUrl(config.provider),
            docsUrl: getProviderDocsUrl(config.provider),
            apiKey: decryptedApiKey,
            baseUrl: config.baseUrl || getDefaultBaseUrl(config.provider),
            availableModels: models,
            enabled: true,
            status: 'success' as const
          }
        } catch (error) {
          console.error('解密API密钥失败:', error)
          return null
        }
      }).filter(Boolean) as UserSettings['providers']

      // 构建prompt模板列表
      const templates = userPromptTemplates.map(template => ({
        id: template.id,
        title: template.title,
        content: template.content as string,
        createdAt: template.createdAt
      }))

      // 如果没有任何配置，返回默认模板
      if (providers.length === 0 && templates.length === 0) {
        return {
          userId,
          providers: [],
          promptTemplates: getDefaultPromptTemplates()
        }
      }

      const settings: UserSettings = {
        userId,
        providers,
        promptTemplates: templates.length > 0 ? templates : getDefaultPromptTemplates()
      }

      console.log('从数据库加载设置成功, 提供商数量:', providers.length)
      return settings
    } catch (error) {
      console.error('从数据库加载设置失败:', error)
      return null
    }
  },

  // 获取用户已启用的AI模型
  getUserEnabledModels: async (userId: string): Promise<AIModel[]> => {
    try {
      const settings = await databaseSettingsStorage.getUserSettings(userId)
      if (!settings) return []

      const enabledProviders = settings.providers.filter(p => p.enabled)
      const models: AIModel[] = []

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
    } catch (error) {
      console.error('获取用户模型失败:', error)
      return []
    }
  }
}

// 辅助函数 - 获取提供商显示名称
function getProviderDisplayName(providerId: string): string {
  const displayNames: Record<string, string> = {
    'deepseek': 'DeepSeek',
    'kimi': 'Moonshot (Kimi)',
    'openai': 'OpenAI',
    'qwen': 'Qwen (通义千问)',
    'gemini': 'Google Gemini',
    'openrouter': 'OpenRouter',
    'claude': 'Anthropic Claude',
    'zhipu': 'ZhipuAI (智谱清言)'
  }
  return displayNames[providerId] || providerId
}

// 辅助函数 - 获取提供商描述
function getProviderDescription(providerId: string): string {
  const descriptions: Record<string, string> = {
    'deepseek': '中国领先的AI模型提供商',
    'kimi': '月之暗面开发的长文本AI助手',
    'openai': '全球领先的AI研究公司',
    'qwen': '阿里巴巴开发的大语言模型',
    'gemini': '谷歌最新的多模态AI模型',
    'openrouter': '提供多种AI模型的API聚合平台',
    'claude': 'Anthropic开发的安全可靠的AI助手',
    'zhipu': '清华系AI公司开发的对话模型'
  }
  return descriptions[providerId] || '第三方AI模型提供商'
}

// 辅助函数 - 获取提供商官网
function getProviderOfficialUrl(providerId: string): string {
  const urls: Record<string, string> = {
    'deepseek': 'https://www.deepseek.com',
    'kimi': 'https://kimi.moonshot.cn',
    'openai': 'https://openai.com',
    'qwen': 'https://tongyi.aliyun.com',
    'gemini': 'https://ai.google.dev',
    'openrouter': 'https://openrouter.ai',
    'claude': 'https://anthropic.com',
    'zhipu': 'https://zhipuai.cn'
  }
  return urls[providerId] || '#'
}

// 辅助函数 - 获取提供商文档
function getProviderDocsUrl(providerId: string): string {
  const urls: Record<string, string> = {
    'deepseek': 'https://platform.deepseek.com/api-docs',
    'kimi': 'https://platform.moonshot.cn/docs',
    'openai': 'https://platform.openai.com/docs',
    'qwen': 'https://help.aliyun.com/zh/dashscope',
    'gemini': 'https://ai.google.dev/docs',
    'openrouter': 'https://openrouter.ai/docs',
    'claude': 'https://docs.anthropic.com',
    'zhipu': 'https://maas.aminer.cn/dev/api'
  }
  return urls[providerId] || '#'
}

// 辅助函数 - 获取默认基础URL
function getDefaultBaseUrl(providerId: string): string {
  const urls: Record<string, string> = {
    'deepseek': 'https://api.deepseek.com',
    'kimi': 'https://api.moonshot.cn',
    'openai': 'https://api.openai.com',
    'qwen': 'https://dashscope.aliyuncs.com/compatible-mode',
    'gemini': 'https://generativelanguage.googleapis.com',
    'openrouter': 'https://openrouter.ai/api',
    'claude': 'https://api.anthropic.com',
    'zhipu': 'https://open.bigmodel.cn/api/paas'
  }
  return urls[providerId] || 'https://api.openai.com'
}

// 辅助函数 - 获取默认prompt模板
function getDefaultPromptTemplates() {
  return [
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
    },
    {
      id: '3',
      title: '问题排查',
      content: '我遇到了以下问题，请帮我分析原因和解决方案：\n\n问题描述：[详细描述问题]\n\n错误信息：\n```\n[粘贴错误信息]\n```\n\n期望结果：[描述期望的结果]',
      createdAt: new Date()
    }
  ]
}

// 为了兼容性，也导出原来的接口名称
export const settingsStorage = databaseSettingsStorage