import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contact_id, template_id } = await request.json()
  if (!contact_id || !template_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: contact } = await supabase
    .from('contacts').select('*').eq('id', contact_id).single()
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  const { data: template } = await supabase
    .from('consent_templates').select('*').eq('id', template_id).single()
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const token = randomBytes(32).toString('hex')
  const tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour

  const { data: record, error: insertError } = await supabase
    .from('consent_records')
    .insert({
      contact_id,
      template_id,
      status: 'sent',
      token,
      token_expires_at: tokenExpiresAt,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ token, record }, { status: 201 })
}
