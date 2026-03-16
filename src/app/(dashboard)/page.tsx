import { getStaffWithOrg } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const staff = await getStaffWithOrg()
  const supabase = await createClient()
  const orgId = staff.organization_id

  const [unsigned, signed, expired] = await Promise.all([
    supabase
      .from('consent_records')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .in(
        'contact_id',
        (
          await supabase
            .from('contacts')
            .select('id')
            .eq('organization_id', orgId)
        ).data?.map((c) => c.id) ?? []
      ),
    supabase
      .from('consent_records')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'signed')
      .in(
        'contact_id',
        (
          await supabase
            .from('contacts')
            .select('id')
            .eq('organization_id', orgId)
        ).data?.map((c) => c.id) ?? []
      ),
    supabase
      .from('consent_records')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'expired')
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

  const stats = [
    {
      title: '未署名',
      count: unsigned.count ?? 0,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: '署名完了',
      count: signed.count ?? 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: '期限切れ',
      count: expired.count ?? 0,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div data-karma-context="dashboard" data-karma-auth="required">
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      <p className="mb-4 text-sm text-gray-500">
        {staff.organizations?.name} - {staff.name}
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={stat.bg}
            data-karma-entity="consent-stat"
            data-karma-state={stat.title}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
