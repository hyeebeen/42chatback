'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('密码不匹配')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (response.ok) {
        router.push('/login?message=注册成功，请登录')
      } else {
        const data = await response.json()
        setError(data.message || '注册失败')
      }
    } catch {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌区域 */}
      <div className="hidden md:flex flex-col justify-center border-r relative" style={{
        background: 'linear-gradient(165deg, rgba(58,107,242,0.16) 0%, rgba(34,199,169,0.12) 60%, transparent 100%)',
        backgroundColor: '#F8FAFC'
      }}>
        <div className="p-10 lg:p-16 max-w-md">
          <div className="space-y-8">
            {/* 品牌标识 */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.35em] text-slate-500 font-medium">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
                <span>42CHAT</span>
              </div>
            </div>

            {/* 主标题区域 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                  活水智聊
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full"></div>
              </div>

              <p className="text-xl text-slate-600 leading-relaxed font-light">
                一次注册，建立你的长期 AI 档案。
              </p>
            </div>

            {/* 特色功能 */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span className="text-slate-600 leading-relaxed">集中管理 API Key</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                <span className="text-slate-600 leading-relaxed">沉淀对话与模板</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                <span className="text-slate-600 leading-relaxed">云端同步对话历史</span>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center space-x-4">
              <div className="h-px bg-gradient-to-r from-slate-300 to-transparent flex-1"></div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            </div>

            {/* 登录链接 */}
            <p className="text-sm text-slate-600">
              已有账户？{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 右侧注册表单 */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* 移动端品牌信息 */}
          <div className="flex md:hidden items-center justify-center mb-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
              <span className="text-lg font-bold text-slate-900">42Chat</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="space-y-6 text-center">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-slate-900">注册</CardTitle>
                <p className="text-slate-600">
                  创建账户开始使用活水智聊
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">用户名</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="输入您的用户名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">确认密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>注册中...</span>
                    </span>
                  ) : (
                    '注册'
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  已有账户？{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    立即登录
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}