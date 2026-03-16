import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { contact_id, template_id } = body

  if (!contact_id || !template_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get contact
  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contact_id)
    .single()

  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  if (!contact.email) return NextResponse.json({ error: 'Contact has no email' }, { status: 400 })

  // Get template
  const { data: template } = await supabase
    .from('consent_templates')
    .select('*')
    .eq('id', template_id)
    .single()

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  // Generate token
  const token = randomBytes(32).toString('hex')
  const expiryHours = parseInt(process.env.SIGN_TOKEN_EXPIRY_HOURS ?? '72')
  const tokenExpiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()

  // Create consent record
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

  // Send email via Resend
  const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${token}`
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
      to: contact.email,
      subject: `【署名のお願い】${template.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${template.title}</h2>
          <p>${contact.name} 様</p>
          <p>以下のリンクから同意書の確認・署名をお願いいたします。</p>
          <a href="${signUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            同意書を確認・署名する
          </a>
          <p style="color: #666; font-size: 14px;">このリンクの有効期限は${expiryHours}時間です。</p>
        </div>
      `,
    })
  } catch (emailError) {
    // Email failed but record was created - update status
    console.error('Email send failed:', emailError)
  }

  // Update contact last_contacted_at
  await supabase
    .from('contacts')
    .update({ last_contacted_at: new Date().toISOString() })
    .eq('id', contact_id)

  return NextResponse.json(record, { status: 201 })
}
