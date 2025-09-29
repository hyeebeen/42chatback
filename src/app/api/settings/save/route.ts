import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { settingsStorage } from '@/lib/temp-settings-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { providers, promptTemplates } = await request.json()

    // 这里应该保存到数据库，目前暂时使用localStorage模拟
    // 在真实项目中，需要连接数据库保存用户设置

    const settings = {
      userId: session.user.email,
      providers: providers.map((p: { id: string; name: string; displayName: string; apiKey: string; baseUrl: string; availableModels: string; enabled: boolean }) => ({
        ...p,
        // 加密API Key（这里简化处理，实际应该使用加密算法）
        apiKey: Buffer.from(p.apiKey).toString('base64')
      })),
      promptTemplates,
      updatedAt: new Date().toISOString()
    }

    // 保存用户设置到临时存储
    settingsStorage.saveUserSettings(session.user.email, settings)

    return NextResponse.json({
      success: true,
      message: '设置保存成功',
      data: {
        providersCount: providers.length,
        promptTemplatesCount: promptTemplates.length
      }
    })

  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json(
      { error: '保存设置失败' },
      { status: 500 }
    )
  }
}