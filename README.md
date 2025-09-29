# 活水智聊 (42Chat) - 开发版本

这是活水智聊 (42Chat) 的开发版本，一个统一多模型AI对话的效率中枢。

## 🚀 项目状态

### ✅ 已完成功能

1. **项目基础架构**
   - Next.js 15 + TypeScript + Tailwind CSS
   - shadcn/ui 组件系统
   - 响应式设计和主题切换支持

2. **数据库设计**
   - Drizzle ORM + PostgreSQL
   - 完整的数据库 Schema 定义
   - 支持用户、对话、消息、API配置等核心实体

3. **用户认证系统**
   - NextAuth.js 集成
   - 邮箱密码登录
   - 会话管理和保护路由

4. **用户界面**
   - 登录/注册页面（符合品牌设计指南）
   - 聊天界面基础架构
   - 可折叠的侧边栏
   - 消息气泡样式
   - 模型选择器
   - 输入区域和功能开关

### 🔄 待实现功能

1. **核心聊天功能**
   - 实际的AI模型集成
   - 流式消息响应 (SSE)
   - 对话历史持久化
   - 消息同步机制

2. **多模型支持**
   - API配置管理
   - 模型切换逻辑
   - 统一的AI服务适配器

3. **高级功能**
   - 联网搜索集成
   - 文件上传处理
   - 提示词模板管理
   - 对话导出功能

4. **设置和管理**
   - 设置页面
   - 用户管理（admin功能）
   - API密钥管理

## 🛠 开发指南

### 环境要求

- Node.js 18+
- PostgreSQL 数据库

### 安装和运行

1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   复制 `.env.example` 到 `.env.local` 并填入实际配置

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 访问 http://localhost:3000

### 数据库相关命令

```bash
# 生成数据库迁移文件
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# 打开数据库管理界面
npm run db:studio
```

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router 页面
│   ├── api/            # API 路由
│   ├── chat/           # 聊天页面
│   ├── login/          # 登录页面
│   └── register/       # 注册页面
├── components/         # React 组件
│   ├── ui/            # shadcn/ui 基础组件
│   ├── chat/          # 聊天相关组件
│   ├── layout/        # 布局组件
│   └── providers/     # Context 提供者
├── lib/               # 工具库
│   ├── db/           # 数据库相关
│   ├── auth.ts       # 认证配置
│   └── utils.ts      # 工具函数
└── types/            # TypeScript 类型定义
```

## 🎨 设计系统

项目遵循活水智聊品牌设计指南：
- 主色：#3A6BF2 (稳定的电光蓝)
- 强调色：#22C7A9 (辅助强调色)
- 支持亮色/暗色主题
- 使用 Inter 字体

## 📝 开发注意事项

1. **数据库连接**：当前使用占位符连接字符串，部署时需要配置实际的 PostgreSQL 数据库
2. **AI 模型集成**：聊天功能目前为模拟实现，需要集成真实的AI服务
3. **安全性**：生产环境需要设置强密钥和加密配置
4. **环境变量**：确保所有敏感信息都通过环境变量配置

## 🚀 部署指南

项目设计为部署到 Vercel 平台，详细部署步骤请参考 `docs/deploy_runbook_for_ai.md`。

## 📚 相关文档

- [产品需求文档](../docs/prd.md)
- [API文档](../docs/api.md)
- [数据库Schema](../docs/schema.md)
- [品牌设计指南](../docs/brand-style-guide.md)
- [部署指南](../docs/deploy_runbook_for_ai.md)

---

**注意：这是一个开发版本，适合本地开发和测试。生产部署需要额外的配置和安全措施。**