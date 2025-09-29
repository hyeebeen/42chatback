import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/utils'
import { tempUsers } from '@/lib/temp-storage'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: '所有字段都是必需的' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在 (临时实现)
    const existingUser = tempUsers.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 创建用户 (临时实现)
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      hashedPassword,
      role: 'user',
    }

    tempUsers.push(newUser)

    return NextResponse.json(
      {
        message: '注册成功！现在可以使用该账户登录。',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    )
  }
}