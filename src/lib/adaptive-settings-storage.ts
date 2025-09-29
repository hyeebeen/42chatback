// 自适应存储系统 - 根据环境自动选择存储方式
import { productionSettingsStorage } from './production-settings-storage'

// 定义设置类型
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

// 简化的环境检测 - 直接使用生产存储避免文件系统问题
const isProductionEnvironment = () => {
  // 如果是浏览器环境
  if (typeof window !== 'undefined') {
    return true
  }

  // 如果是无服务器环境
  if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return true
  }

  // 默认使用生产存储，更安全
  return true
}

// 选择存储后端
const getStorageBackend = () => {
  if (isProductionEnvironment()) {
    console.log('Using production storage (memory + environment variables)')
    return productionSettingsStorage
  }

  // 在开发环境也使用生产存储保持一致性
  console.log('Using production storage for consistency')
  return productionSettingsStorage
}

// 获取存储实例
const storageBackend = getStorageBackend()

export const settingsStorage = {
  saveUserSettings: (userId: string, settings: UserSettings) => {
    try {
      return storageBackend.saveUserSettings(userId, settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      // 如果文件存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.saveUserSettings(userId, settings)
      }
      return false
    }
  },

  getUserSettings: (userId: string) => {
    try {
      return storageBackend.getUserSettings(userId)
    } catch (error) {
      console.error('Failed to load settings:', error)
      // 如果文件存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.getUserSettings(userId)
      }
      return null
    }
  },

  getUserEnabledModels: (userId: string) => {
    try {
      return storageBackend.getUserEnabledModels(userId)
    } catch (error) {
      console.error('Failed to load models:', error)
      // 如果文件存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.getUserEnabledModels(userId)
      }
      return []
    }
  }
}