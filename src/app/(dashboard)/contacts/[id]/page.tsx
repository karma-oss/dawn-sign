import { createClient } from '@/lib/supabase/server'
import { getStaffWithOrg } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SendSignRequestButton } from '@/components/send-sign-request-button'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  unsent: { label: '未送信', color: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: '送信済み', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  signed: { label: '署名完了', color: 'text-green-600', bg: 'bg-green-100' },
  expired: { label: '期限切れ', color: 'text-red-600', bg: 'bg-red-100' },
}

function StatusLight({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.unsent
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
      data-karma-state={status}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          status === 'signed'
            ? 'bg-green-500'
            : status === 'sent'
            ? 'bg-yellow-500'
            : status === 'expired'
            ? 'bg-red-500'
            : 'bg-gray-400'
        }`}
      />
      {config.label}
    </span>
  )
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await getStaffWithOrg()
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (!contact) notFound()

  const { data: records } = await supabase
    .from('consent_records')
    .select('*, consent_templates(*)')
    .eq('contact_id', id)
    .order('created_at', { ascending: false })

  const { data: templates } = await supabase
    .from('consent_templates')
    .select('*')
    .eq('organization_id', contact.organization_id)

  return (
    <div data-karma-context="contact-detail" data-karma-auth="required">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{contact.name}</h1>
        <div className="mt-1 flex gap-4 text-sm text-gray-500">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.internal_id && <span>ID: {contact.internal_id}</span>}
        </div>
        {contact.tags?.length > 0 && (
          <div className="mt-2 flex gap-1">
            {contact.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {contact.notes && (
          <p className="mt-2 text-sm text-gray-600">{contact.notes}</p>
        )}
      </div>

      <div className="mb-6">
        <SendSignRequestButton
          contactId={contact.id}
          templates={templates ?? []}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">同意書ステータス</CardTitle>
        </CardHeader>
        <CardContent>
          {!records || records.length === 0 ? (
            <p className="text-sm text-gray-500">同意書レコードがありません</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  data-karma-entity="consent-record"
                  data-karma-state={record.status}
                >
                  <div>
                    <p className="font-medium">
                      {record.consent_templates?.title ?? '不明なテンプレート'}
                    </p>
                    <p className="text-xs text-gray-500">
                      作成: {new Date(record.created_at).toLocaleDateString('ja-JP')}
                      {record.signed_at &&
                        ` / 署名: ${new Date(record.signed_at).toLocaleDateString('ja-JP')}`}
                    </p>
                  </div>
                  <StatusLight status={record.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
