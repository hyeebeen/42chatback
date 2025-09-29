import { pgTable, text, uuid, varchar, timestamp, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 枚举类型定义
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant'])
export const syncStatusEnum = pgEnum('sync_status', ['synced', 'pending', 'failed'])

// users 表
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// conversations 表
export const conversations = pgTable('conversation', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// messages 表
export const messages = pgTable('message', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: jsonb('content').notNull(),
  model: varchar('model', { length: 100 }),
  searchUsed: boolean('search_used').notNull().default(false),
  syncStatus: syncStatusEnum('sync_status').notNull().default('synced'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// api_configurations 表
export const apiConfigurations = pgTable('api_configuration', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 100 }).notNull(),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  baseUrl: text('base_url'),
  enabledModels: jsonb('enabled_models'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// prompt_templates 表
export const promptTemplates = pgTable('prompt_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// search_configurations 表
export const searchConfigurations = pgTable('search_configuration', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 100 }).notNull(),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  resultCount: integer('result_count').notNull().default(3),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  apiConfigurations: many(apiConfigurations),
  promptTemplates: many(promptTemplates),
  searchConfigurations: many(searchConfigurations),
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))

export const apiConfigurationsRelations = relations(apiConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [apiConfigurations.userId],
    references: [users.id],
  }),
}))

export const promptTemplatesRelations = relations(promptTemplates, ({ one }) => ({
  user: one(users, {
    fields: [promptTemplates.userId],
    references: [users.id],
  }),
}))

export const searchConfigurationsRelations = relations(searchConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [searchConfigurations.userId],
    references: [users.id],
  }),
}))

// 类型定义
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type ApiConfiguration = typeof apiConfigurations.$inferSelect
export type NewApiConfiguration = typeof apiConfigurations.$inferInsert
export type PromptTemplate = typeof promptTemplates.$inferSelect
export type NewPromptTemplate = typeof promptTemplates.$inferInsert
export type SearchConfiguration = typeof searchConfigurations.$inferSelect
export type NewSearchConfiguration = typeof searchConfigurations.$inferInsert