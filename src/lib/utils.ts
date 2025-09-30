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

  try {
    const algorithm = 'aes-256-cbc'
    const key = Buffer.from(process.env.ENCRYPTION_KEY.replace('base64:', ''), 'base64').subarray(0, 32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption failed:', error)
    // 如果加密失败，返回base64编码的字符串作为后备
    return Buffer.from(apiKey).toString('base64')
  }
}

// API密钥解密
export function decryptApiKey(encryptedApiKey: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set')
  }

  try {
    const algorithm = 'aes-256-cbc'
    const key = Buffer.from(process.env.ENCRYPTION_KEY.replace('base64:', ''), 'base64').subarray(0, 32)

    const [ivHex, encrypted] = encryptedApiKey.split(':')
    if (!ivHex || !encrypted) {
      // 如果不是加密格式，尝试base64解码
      try {
        return Buffer.from(encryptedApiKey, 'base64').toString('utf8')
      } catch {
        return encryptedApiKey
      }
    }

    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    // 如果解密失败，返回原始数据（可能是旧格式或未加密）
    return encryptedApiKey
  }
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