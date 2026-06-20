import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, responded_by, decline_reason } = body

  const validStatuses = ['pending', 'accepted', 'declined', 'preparing', 'arrived']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const updates: Record<string, any> = { status }

  // Only stamp responded_at the first time the alert leaves "pending"
  if (status === 'accepted' || status === 'declined') {
    updates.responded_at = new Date().toISOString()
  }
  if (responded_by) {
    updates.responded_by = responded_by
  }
  if (decline_reason) {
    updates.decline_reason = decline_reason
  }

  const { data: updatedAlert, error } = await supabase
    .from('alerts')
    .update(updates)
    .eq('id', id)
    .select('*, cases(*)')
    .single()

  if (error) {
    console.error('Alert update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If declined, add this hospital to the case's declined_hospitals list
  // so it's filtered out of future suggestions for the same case.
  if (status === 'declined' && updatedAlert?.case_id && updatedAlert?.hospital_id) {
    const { data: currentCase } = await supabase
      .from('cases')
      .select('declined_hospitals')
      .eq('id', updatedAlert.case_id)
      .single()

    const declinedList: string[] = currentCase?.declined_hospitals || []
    if (!declinedList.includes(updatedAlert.hospital_id)) {
      await supabase
        .from('cases')
        .update({ declined_hospitals: [...declinedList, updatedAlert.hospital_id] })
        .eq('id', updatedAlert.case_id)
    }
  }

  // If accepted, mark the case as assigned to this hospital
  if (status === 'accepted' && updatedAlert?.case_id && updatedAlert?.hospital_id) {
    await supabase
      .from('cases')
      .update({ assigned_hospital_id: updatedAlert.hospital_id })
      .eq('id', updatedAlert.case_id)
  }

  return NextResponse.json({ alert: updatedAlert })
}
