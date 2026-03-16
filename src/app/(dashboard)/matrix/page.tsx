import { getStaffWithOrg } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusColors: Record<string, string> = {
  signed: 'bg-green-500',
  sent: 'bg-yellow-500',
  expired: 'bg-red-500',
  unsent: 'bg-gray-300',
}

const statusLabels: Record<string, string> = {
  signed: '署名済',
  sent: '送信済',
  expired: '期限切れ',
  unsent: '未送信',
}

export default async function MatrixPage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()
  const orgId = staff.organization_id

  const [{ data: contacts }, { data: templates }, { data: records }] =
    await Promise.all([
      supabase
        .from('contacts')
        .select('id, name')
        .eq('organization_id', orgId)
        .order('name'),
      supabase
        .from('consent_templates')
        .select('id, title')
        .eq('organization_id', orgId)
        .order('title'),
      supabase
        .from('consent_records')
        .select('contact_id, template_id, status')
        .in(
          'contact_id',
          (
            await supabase
              .from('contacts')
              .select('id')
              .eq('organization_id', orgId)
          ).data?.map((c) => c.id) ?? []
        ),
    ])

  // Build lookup map: contact_id -> template_id -> status
  const statusMap: Record<string, Record<string, string>> = {}
  records?.forEach((r) => {
    if (!statusMap[r.contact_id]) statusMap[r.contact_id] = {}
    statusMap[r.contact_id][r.template_id] = r.status
  })

  return (
    <div data-karma-context="consent-matrix" data-karma-auth="required">
      <h1 className="mb-6 text-2xl font-bold">同意マトリクス</h1>

      <div className="mb-4 flex gap-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-sm">
            <span className={`inline-block h-3 w-3 rounded-full ${statusColors[key]}`} />
            {label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">患者 × 同意書</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!contacts?.length || !templates?.length ? (
            <p className="text-sm text-gray-500">
              コンタクトまたはテンプレートがありません
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium">
                    患者名
                  </th>
                  {templates.map((t) => (
                    <th
                      key={t.id}
                      className="px-3 py-2 text-center font-medium"
                    >
                      <span className="block max-w-[120px] truncate">
                        {t.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium">
                      {c.name}
                    </td>
                    {templates.map((t) => {
                      const status = statusMap[c.id]?.[t.id] ?? 'unsent'
                      return (
                        <td key={t.id} className="px-3 py-2 text-center">
                          <span
                            className={`inline-block h-4 w-4 rounded-full ${statusColors[status]}`}
                            title={statusLabels[status]}
                            data-karma-entity="consent-matrix-cell"
                            data-karma-state={status}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
