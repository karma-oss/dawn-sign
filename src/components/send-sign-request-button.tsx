'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Template = {
  id: string
  title: string
}

export function SendSignRequestButton({
  contactId,
  templates,
}: {
  contactId: string
  templates: Template[]
}) {
  const [templateId, setTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSend() {
    if (!templateId) return
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/sign/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, template_id: templateId }),
    })

    if (res.ok) {
      setMessage('署名リクエストを送信しました')
      setTemplateId('')
    } else {
      const data = await res.json()
      setMessage(`エラー: ${data.error}`)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-end gap-3">
      <div className="w-64">
        <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? '')}>
          <SelectTrigger data-karma-test-id="template-select">
            <SelectValue placeholder="テンプレートを選択" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleSend}
        disabled={!templateId || loading}
        data-karma-action="send-sign-request"
        data-karma-context="consent-management"
        data-karma-next="email-sent-confirmation"
        data-karma-auth="required"
        data-karma-security="csrf-protected"
        data-karma-test-id="send-sign-request-btn"
        data-karma-role="staff"
      >
        {loading ? '送信中...' : '署名リクエストを送信'}
      </Button>
      {message && (
        <span
          className={`text-sm ${
            message.startsWith('エラー') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message}
        </span>
      )}
    </div>
  )
}
