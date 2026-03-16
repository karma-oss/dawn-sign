import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { token, signature_data } = body

  if (!token || !signature_data) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify token
  const { data: record } = await supabase
    .from('consent_records')
    .select('*')
    .eq('token', token)
    .single()

  if (!record) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  if (record.status === 'signed') return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  if (new Date(record.token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 })
  }

  // Get IP and User-Agent from headers
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Update consent record
  const { data: updated, error } = await supabase
    .from('consent_records')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signature_data,
      ip_address: ip,
      user_agent: userAgent,
    })
    .eq('id', record.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
