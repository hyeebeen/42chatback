// 运行时数据库迁移检查
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './db'

let migrationPromise: Promise<void> | null = null

export async function ensureMigrations() {
  // 确保只运行一次迁移
  if (migrationPromise) {
    return migrationPromise
  }

  migrationPromise = runMigrations()
  return migrationPromise
}

async function runMigrations() {
  try {
    console.log('🔄 Checking database migrations...')

    // 只在有数据库连接时运行迁移
    const dbUrl = process.env.DB_URL || process.env.DATABASE_URL
    if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('fake')) {
      console.log('⚠️ No valid database URL, skipping migrations')
      return
    }

    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Database migrations completed')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    // 不要抛出错误，让应用继续运行
    // 如果迁移失败，系统会回退到内存存储
  }
}

// 应用启动时自动运行
if (typeof window === 'undefined') {
  ensureMigrations().catch(console.error)
}