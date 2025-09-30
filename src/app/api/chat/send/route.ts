import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { settingsStorage } from '@/lib/adaptive-settings-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, model, providerId } = await request.json()

    if (!messages || !model || !providerId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 从用户保存的设置中获取API配置
    const userSettings = await settingsStorage.getUserSettings(session.user.email)

    if (!userSettings) {
      return NextResponse.json({ error: '请先配置AI模型设置' }, { status: 400 })
    }

    // 找到对应的提供商配置
    const provider = userSettings.providers.find(p => p.id === providerId && p.enabled)

    if (!provider) {
      return NextResponse.json({ error: '未找到有效的提供商配置' }, { status: 400 })
    }

    // 根据不同的提供商构建API调用
    let apiUrl = ''
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const config = {
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey // API Key 已经在数据库存储层解密了
    }

    apiUrl = `${config.baseUrl}/v1/chat/completions`
    headers['Authorization'] = `Bearer ${config.apiKey}`

    const requestBody = {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error('API返回数据格式错误')
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
        model: model,
        timestamp: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: {
          message: assistantMessage,
          usage: data.usage
        }
      })

    } catch (apiError: unknown) {
      console.error('API调用错误:', apiError)

      // 如果API调用失败，返回模拟响应
      const mockResponse = {
        role: 'assistant',
        content: `这是一个模拟回复（API调用失败：${apiError instanceof Error ? apiError.message : '未知错误'}）。在实际项目中，这里会调用真正的${providerId}模型API。请确保API密钥配置正确。`,
        model: model,
        timestamp: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: {
          message: mockResponse,
          usage: null,
          warning: 'API调用失败，返回模拟数据'
        }
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '发送消息失败' },
      { status: 500 }
    )
  }
}