# 42Chat 部署运行手册

## 项目概述
42Chat 是一个基于 Next.js 15 的多 AI 模型对话平台，支持 DeepSeek、Moonshot(Kimi)、OpenAI、Qwen、Gemini、OpenRouter 等多个 AI 提供商。

## 技术栈
- **前端**: Next.js 15.5.4 + React 19 + TypeScript
- **认证**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks
- **数据存储**: 临时文件存储（生产环境建议数据库）

## 部署准备

### 1. 环境要求
- Node.js 18.17 或更高版本
- npm 或 yarn
- Git

### 2. 环境变量配置
创建 `.env.local` 文件，包含以下变量：

```bash
# NextAuth 配置
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# AI 提供商 API Keys (可选，用户可在界面中配置)
DEEPSEEK_API_KEY=your-deepseek-key
OPENAI_API_KEY=your-openai-key
KIMI_API_KEY=your-kimi-key
```

## 部署选项

### 选项 1: Vercel 部署（推荐）

#### 步骤 1: 准备代码
```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 步骤 2: Vercel 部署
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置环境变量：
   - `NEXTAUTH_URL`: https://your-app-name.vercel.app
   - `NEXTAUTH_SECRET`: 生成一个随机密钥

#### 步骤 3: 部署配置
```json
// vercel.json (可选)
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 选项 2: 自建服务器部署

#### 步骤 1: 服务器准备
```bash
# 在服务器上安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

#### 步骤 2: 代码部署
```bash
# 克隆仓库
git clone https://github.com/your-username/42chat.git
cd 42chat

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "42chat" -- start
```

#### 步骤 3: Nginx 配置
```nginx
# /etc/nginx/sites-available/42chat
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 选项 3: Docker 部署

#### Dockerfile
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=your-secret-key
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## 部署后配置

### 1. SSL 证书配置
```bash
# 使用 Certbot 获取 Let's Encrypt 证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 数据持久化（可选）
如果需要持久化用户设置，建议集成数据库：
- PostgreSQL
- MySQL
- MongoDB

### 3. 监控和日志
```bash
# PM2 监控
pm2 monit

# 查看日志
pm2 logs 42chat

# 设置日志轮转
pm2 install pm2-logrotate
```

## 故障排除

### 常见问题
1. **NextAuth 错误**: 检查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 配置
2. **API 超时**: 调整服务器超时设置
3. **构建失败**: 检查 Node.js 版本和依赖

### 日志位置
- 开发环境: 控制台输出
- 生产环境: PM2 日志或容器日志

## 性能优化

### 1. 缓存策略
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store' }
        ]
      }
    ]
  }
}
```

### 2. 数据库连接池
建议在生产环境中使用连接池管理数据库连接。

## 安全考虑

### 1. 环境变量保护
- 不要在代码中硬编码 API 密钥
- 使用环境变量管理敏感信息

### 2. API 限流
```typescript
// 实现 API 限流
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最大请求数
}
```

### 3. CORS 配置
```typescript
// 配置 CORS 策略
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
    : 'http://localhost:3000'
}
```

## 维护指南

### 定期任务
1. 更新依赖包
2. 监控服务器资源
3. 备份用户数据
4. 检查安全更新

### 升级流程
1. 在测试环境验证更新
2. 备份生产数据
3. 执行滚动更新
4. 验证功能正常

## 联系支持
如遇问题，请检查：
1. 环境变量配置
2. 网络连接
3. API 密钥有效性
4. 服务器资源使用情况