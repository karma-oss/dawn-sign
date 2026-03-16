'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メールを確認してください。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/'
      }
    }

    setLoading(false)
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
      data-karma-context="authentication"
      data-karma-auth="none"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">DAWN SIGN</CardTitle>
          <CardDescription>
            {isSignUp ? 'アカウントを作成' : 'ログイン'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-karma-test-id="email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-karma-test-id="password-input"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-karma-action={isSignUp ? 'sign-up' : 'sign-in'}
              data-karma-test-id="submit-btn"
            >
              {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
            >
              {isSignUp
                ? 'すでにアカウントをお持ちの方'
                : 'アカウントをお持ちでない方'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
