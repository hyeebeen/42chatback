import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// API密钥加密
export function encryptApiKey(apiKey: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set')
  }

  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY.replace('base64:', ''), 'base64')
  const iv = crypto.randomBytes(16)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cipher = crypto.createCipher(algorithm, key) as any
  if (cipher.setAAD) {
    cipher.setAAD(Buffer.alloc(0))
  }

  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag ? cipher.getAuthTag() : Buffer.alloc(0)

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// API密钥解密
export function decryptApiKey(encryptedApiKey: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set')
  }

  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY.replace('base64:', ''), 'base64')

  const [, authTagHex, encrypted] = encryptedApiKey.split(':')
  const authTag = Buffer.from(authTagHex, 'hex')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decipher = crypto.createDecipher(algorithm, key) as any
  if (decipher.setAuthTag && authTag.length > 0) {
    decipher.setAuthTag(authTag)
  }

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// 生成用户头像首字母
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// 格式化时间
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}小时前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}天前`
  }

  return date.toLocaleDateString('zh-CN')
}