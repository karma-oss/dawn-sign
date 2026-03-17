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
    .from('contacts')
    .update({
      name: body.name,
      email: body.email,
      phone: body.phone,
      internal_id: body.internal_id,
      tags: body.tags,
      notes: body.notes,
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
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('organization_id', staff.organization_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
