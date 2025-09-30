import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DB_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DB_URL or DATABASE_URL is not set')
}

// 创建数据库连接
const client = postgres(connectionString, {
  max: 1, // 连接池大小
})

// 导出数据库实例
export const db = drizzle(client, { schema })

export * from './schema'