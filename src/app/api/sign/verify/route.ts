import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: record } = await supabase
    .from('consent_records')
    .select('*, consent_templates(*), contacts(*)')
    .eq('token', token)
    .single()

  if (!record) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  if (record.status === 'signed') {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  }

  if (new Date(record.token_expires_at) < new Date()) {
    // Update status to expired
    await supabase
      .from('consent_records')
      .update({ status: 'expired' })
      .eq('id', record.id)
    return NextResponse.json({ error: 'Token expired' }, { status: 410 })
  }

  return NextResponse.json({
    id: record.id,
    contact_name: record.contacts?.name,
    template_title: record.consent_templates?.title,
    template_content: record.consent_templates?.content,
  })
}
