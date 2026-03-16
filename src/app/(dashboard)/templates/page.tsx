'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Template = {
  id: string
  title: string
  content: string
  is_required: boolean
  valid_days: number | null
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_required: false,
    valid_days: '',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    const res = await fetch('/api/templates')
    const data = await res.json()
    setTemplates(data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: '', content: '', is_required: false, valid_days: '' })
    setDialogOpen(true)
  }

  function openEdit(t: Template) {
    setEditing(t)
    setForm({
      title: t.title,
      content: t.content,
      is_required: t.is_required,
      valid_days: t.valid_days?.toString() ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      valid_days: form.valid_days ? parseInt(form.valid_days) : null,
    }

    if (editing) {
      await fetch(`/api/templates/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setDialogOpen(false)
    fetchTemplates()
  }

  async function handleDelete(id: string) {
    if (!confirm('このテンプレートを削除しますか？')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
  }

  return (
    <div data-karma-context="template-management" data-karma-auth="required">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">テンプレート</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                data-karma-action="create-template"
                data-karma-test-id="create-template-btn"
              />
            }
            onClick={openCreate}
          >
            新規作成
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'テンプレート編集' : '新規テンプレート'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  data-karma-test-id="template-title-input"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_days">有効日数</Label>
                  <Input
                    id="valid_days"
                    type="number"
                    value={form.valid_days}
                    onChange={(e) =>
                      setForm({ ...form, valid_days: e.target.value })
                    }
                    placeholder="例: 365"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={form.is_required}
                    onChange={(e) =>
                      setForm({ ...form, is_required: e.target.checked })
                    }
                  />
                  <Label htmlFor="is_required">必須同意書</Label>
                </div>
              </div>

              <Tabs defaultValue="edit">
                <TabsList>
                  <TabsTrigger value="edit">編集</TabsTrigger>
                  <TabsTrigger value="preview">プレビュー</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    rows={12}
                    placeholder="Markdownで同意書内容を記述..."
                    data-karma-test-id="template-content-input"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose max-w-none rounded-md border p-4">
                    <ReactMarkdown>{form.content || '*内容がありません*'}</ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                type="submit"
                className="w-full"
                data-karma-action={editing ? 'update-template' : 'save-template'}
                data-karma-test-id="save-template-btn"
              >
                {editing ? '更新' : '作成'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">読み込み中...</p>
      ) : templates.length === 0 ? (
        <p className="text-center text-gray-500">テンプレートがありません</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card
              key={t.id}
              data-karma-entity="consent-template"
              data-karma-test-id={`template-card-${t.id}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{t.title}</span>
                  {t.is_required && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                      必須
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 line-clamp-3 text-sm text-gray-600">
                  {t.content.slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {t.valid_days ? `${t.valid_days}日間有効` : '無期限'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(t.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
