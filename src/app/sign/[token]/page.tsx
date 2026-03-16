'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ConsentData = {
  id: string
  contact_name: string
  template_title: string
  template_content: string
}

export default function SignPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ConsentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const sigRef = useRef<SignatureCanvas | null>(null)

  useEffect(() => {
    async function verify() {
      const res = await fetch(`/api/sign/verify?token=${token}`)
      if (res.ok) {
        setData(await res.json())
      } else {
        const err = await res.json()
        setError(err.error)
      }
      setLoading(false)
    }
    verify()
  }, [token])

  async function handleSubmit() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert('署名を入力してください')
      return
    }

    setSubmitting(true)
    const signatureData = sigRef.current.toDataURL('image/png')

    const res = await fetch('/api/sign/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, signature_data: signatureData }),
    })

    if (res.ok) {
      setCompleted(true)
    } else {
      const err = await res.json()
      setError(err.error)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium text-red-600">
              {error === 'Token expired'
                ? 'このリンクは有効期限が切れています'
                : error === 'Already signed'
                ? 'この同意書は既に署名済みです'
                : error === 'Invalid token'
                ? '無効なリンクです'
                : error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">署名が完了しました</p>
            <p className="mt-2 text-gray-500">ご協力ありがとうございます。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 p-4"
      data-karma-context="patient-consent-signing"
      data-karma-auth="token"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{data?.template_title}</CardTitle>
            <p className="text-sm text-gray-500">{data?.contact_name} 様</p>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{data?.template_content ?? ''}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">署名</CardTitle>
            <p className="text-sm text-gray-500">
              下の枠内に署名してください
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  className: 'w-full h-48',
                  style: { width: '100%', height: '192px' },
                }}
                penColor="black"
              />
            </div>
            <div className="mt-3 flex gap-3">
              <Button
                variant="outline"
                onClick={() => sigRef.current?.clear()}
                data-karma-action="clear-signature"
                data-karma-test-id="clear-signature-btn"
              >
                クリア
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
                data-karma-action="submit-signature"
                data-karma-context="patient-consent-signing"
                data-karma-next="signature-complete"
                data-karma-auth="token"
                data-karma-test-id="submit-signature-btn"
              >
                {submitting ? '送信中...' : '署名して同意する'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
