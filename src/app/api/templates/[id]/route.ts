import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    .update({
      title: body.title,
      content: body.content,
      is_required: body.is_required,
      valid_days: body.valid_days || null,
    })
    .eq('id', id)
    .eq('organization_id', staff.organization_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  if (!staff) return NextResponse.json({ error: 'No staff' }, { status: 403 })

  const { error } = await supabase
    .from('consent_templates')
    .delete()
    .eq('id', id)
    .eq('organization_id', staff.organization_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
