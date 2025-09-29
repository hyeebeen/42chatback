import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const connectionString = process.env.DATABASE_URL

// 创建数据库连接
const client = postgres(connectionString, {
  max: 1, // 连接池大小
})

// 导出数据库实例
export const db = drizzle(client, { schema })

export * from './schema'