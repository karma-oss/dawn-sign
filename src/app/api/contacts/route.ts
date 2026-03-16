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
    .from('contacts')
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
    .from('contacts')
    .insert({
      organization_id: staff.organization_id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      internal_id: body.internal_id,
      tags: body.tags || [],
      notes: body.notes,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
