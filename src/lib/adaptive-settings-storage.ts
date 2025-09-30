// 自适应存储系统 - 根据环境自动选择存储方式
import { productionSettingsStorage } from './production-settings-storage'
import { databaseSettingsStorage } from './database-settings-storage'

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

// 检测是否可以使用数据库存储
const canUseDatabaseStorage = () => {
  // 检查是否有数据库连接URL
  const dbUrl = process.env.DB_URL || process.env.DATABASE_URL
  return !!(dbUrl && process.env.ENCRYPTION_KEY)
}

// 选择存储后端
const getStorageBackend = () => {
  if (canUseDatabaseStorage()) {
    console.log('Using database storage (PostgreSQL with encryption)')
    return databaseSettingsStorage
  }

  console.log('Using production storage (memory + environment variables)')
  return productionSettingsStorage
}

// 获取存储实例
const storageBackend = getStorageBackend()

export const settingsStorage = {
  saveUserSettings: async (userId: string, settings: UserSettings) => {
    try {
      return await storageBackend.saveUserSettings(userId, settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      // 如果数据库存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.saveUserSettings(userId, settings)
      }
      return false
    }
  },

  getUserSettings: async (userId: string) => {
    try {
      return await storageBackend.getUserSettings(userId)
    } catch (error) {
      console.error('Failed to load settings:', error)
      // 如果数据库存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.getUserSettings(userId)
      }
      return null
    }
  },

  getUserEnabledModels: async (userId: string) => {
    try {
      return await storageBackend.getUserEnabledModels(userId)
    } catch (error) {
      console.error('Failed to load models:', error)
      // 如果数据库存储失败，尝试使用生产存储
      if (storageBackend !== productionSettingsStorage) {
        console.log('Falling back to production storage')
        return productionSettingsStorage.getUserEnabledModels(userId)
      }
      return []
    }
  }
}