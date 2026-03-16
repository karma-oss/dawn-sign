import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return NextResponse.json({ error: 'No staff' }, { status: 403 })

  const { data, error } = await supabase
    .from('consent_templates')
    .select('*')
    .eq('organization_id', staff.organization_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return NextResponse.json({ error: 'No staff' }, { status: 403 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('consent_templates')
    .insert({
      organization_id: staff.organization_id,
      title: body.title,
      content: body.content,
      is_required: body.is_required ?? false,
      valid_days: body.valid_days || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
