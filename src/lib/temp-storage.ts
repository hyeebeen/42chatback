// 临时用户存储 - 在生产环境中将使用真实数据库
export const tempUsers: Array<{
  id: string
  name: string
  email: string
  hashedPassword: string
  role: string
}> = []