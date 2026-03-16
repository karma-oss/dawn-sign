'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

type Contact = {
  id: string
  name: string
  email: string | null
  phone: string | null
  internal_id: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    internal_id: '',
    tags: '',
    notes: '',
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    const res = await fetch('/api/contacts')
    const data = await res.json()
    setContacts(data)
    setLoading(false)
  }

  function openCreateDialog() {
    setEditingContact(null)
    setForm({ name: '', email: '', phone: '', internal_id: '', tags: '', notes: '' })
    setDialogOpen(true)
  }

  function openEditDialog(contact: Contact) {
    setEditingContact(contact)
    setForm({
      name: contact.name,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      internal_id: contact.internal_id ?? '',
      tags: contact.tags?.join(', ') ?? '',
      notes: contact.notes ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    if (editingContact) {
      await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setDialogOpen(false)
    fetchContacts()
  }

  async function handleDelete(id: string) {
    if (!confirm('このコンタクトを削除しますか？')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    fetchContacts()
  }

  const filtered = contacts.filter(
    (c) =>
      c.name.includes(search) ||
      c.email?.includes(search) ||
      c.internal_id?.includes(search)
  )

  return (
    <div data-karma-context="contact-management" data-karma-auth="required">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">コンタクト</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                data-karma-action="create-contact"
                data-karma-test-id="create-contact-btn"
              />
            }
            onClick={openCreateDialog}
          >
            新規追加
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'コンタクト編集' : '新規コンタクト'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  data-karma-test-id="contact-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メール</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-karma-test-id="contact-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_id">患者ID</Label>
                <Input
                  id="internal_id"
                  value={form.internal_id}
                  onChange={(e) =>
                    setForm({ ...form, internal_id: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">タグ（カンマ区切り）</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                data-karma-action={editingContact ? 'update-contact' : 'save-contact'}
                data-karma-test-id="save-contact-btn"
              >
                {editingContact ? '更新' : '追加'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-base">コンタクト一覧</CardTitle>
            <Input
              placeholder="検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              data-karma-test-id="contact-search-input"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">読み込み中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500">コンタクトがありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>電話</TableHead>
                  <TableHead>患者ID</TableHead>
                  <TableHead>タグ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    data-karma-entity="contact"
                    data-karma-test-id={`contact-row-${contact.id}`}
                  >
                    <TableCell>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {contact.name}
                      </Link>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.internal_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(contact)}
                          data-karma-action="edit-contact"
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(contact.id)}
                          data-karma-action="delete-contact"
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
