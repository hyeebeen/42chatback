import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { settingsStorage } from '@/lib/adaptive-settings-storage'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 从临时存储中获取用户已配置的模型
    const availableModels = settingsStorage.getUserEnabledModels(session.user.email)

    return NextResponse.json({
      success: true,
      data: availableModels
    })

  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { error: '获取模型列表失败' },
      { status: 500 }
    )
  }
}