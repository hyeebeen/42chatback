'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码不正确')
      } else {
        router.push('/chat')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌区域 - 严格按照品牌风格指引 */}
      <div className="login-hero relative hidden md:flex flex-col justify-center border-r bg-muted/30 p-10 lg:p-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-sm space-y-7">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">42chat</span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">活水智聊</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            在熟悉的工作台里，让灵感自然衔接。
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>对话历史一触即达</p>
            <p>提示词随手唤起</p>
            <p>常用模型自在切换</p>
          </div>
          <Separator className="w-12 bg-border" />
          <p className="text-sm text-muted-foreground">还没有账户？<Link href="/register" className="text-primary hover:text-primary/80 transition-colors"> 立即注册</Link></p>
        </div>
      </div>

      {/* 右侧登录表单 */}
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
                <CardTitle className="text-3xl font-bold text-slate-900">登录</CardTitle>
                <p className="text-slate-600">
                  输入邮箱和密码来访问您的账户
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600">
                    记住我
                  </Label>
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
                      <span>登录中...</span>
                    </span>
                  ) : (
                    '登录'
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  还没有账户？{' '}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    立即注册
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