import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { settingsStorage } from '@/lib/adaptive-settings-storage'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 从存储中加载用户设置
    const userSettings = await settingsStorage.getUserSettings(session.user.email)

    return NextResponse.json({
      success: true,
      data: {
        providers: userSettings?.providers || [],
        promptTemplates: userSettings?.promptTemplates || []
      }
    })

  } catch (error) {
    console.error('Load settings error:', error)
    return NextResponse.json(
      { error: '加载设置失败' },
      { status: 500 }
    )
  }
}