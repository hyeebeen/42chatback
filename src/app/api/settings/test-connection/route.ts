import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { providerId, apiKey, baseUrl } = await request.json()

    if (!providerId || !apiKey || !baseUrl) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 构建测试请求
    let testUrl = ''
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // 根据不同提供商设置测试URL和认证头
    switch (providerId) {
      case 'openai':
        testUrl = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'deepseek':
        testUrl = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'kimi':
        testUrl = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'openrouter':
        testUrl = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'qwen':
        testUrl = `${baseUrl}/v1/models`
        headers['Authorization'] = `Bearer ${apiKey}`
        break
      case 'gemini':
        testUrl = `${baseUrl}/v1beta/models?key=${apiKey}`
        break
      default:
        return NextResponse.json({ error: '不支持的提供商' }, { status: 400 })
    }

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        // 添加超时处理
        signal: AbortSignal.timeout(10000) // 10秒超时
      })

      if (response.ok) {
        const data = await response.json()
        let availableModels: string[] = []

        // 根据不同API的响应格式解析模型列表
        if (providerId === 'gemini') {
          if (data.models && Array.isArray(data.models)) {
            availableModels = data.models
              .slice(0, 5)
              .map((model: { name?: string; displayName?: string }) => model.name?.replace('models/', '') || model.displayName)
              .filter(Boolean)
          }
        } else {
          if (data.data && Array.isArray(data.data)) {
            availableModels = data.data
              .slice(0, 5)
              .map((model: { id: string }) => model.id)
              .filter(Boolean)
          }
        }

        return NextResponse.json({
          success: true,
          availableModels: availableModels.length > 0 ? availableModels.join(', ') : '连接成功',
          message: '连接测试成功'
        })
      } else {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        // 尝试解析错误响应
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // 忽略JSON解析错误，使用默认错误消息
        }

        return NextResponse.json({
          success: false,
          error: errorMessage
        }, { status: 400 })
      }
    } catch (fetchError: unknown) {
      let errorMessage = '连接失败'

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = '连接超时，请检查网络或API地址'
        } else if (fetchError.message.includes('ENOTFOUND')) {
          errorMessage = '无法解析域名，请检查API地址'
        } else if (fetchError.message.includes('ECONNREFUSED')) {
          errorMessage = '连接被拒绝，请检查API地址和端口'
        } else if (fetchError.message.includes('certificate')) {
          errorMessage = 'SSL证书错误'
        } else {
          errorMessage = fetchError.message || '网络错误'
        }
      } else {
        errorMessage = '网络错误'
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json(
      { error: '测试连接失败' },
      { status: 500 }
    )
  }
}