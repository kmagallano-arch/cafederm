import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('site_content').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convert array of rows to object keyed by section
  const content: Record<string, any> = {}
  for (const row of data || []) {
    content[row.section] = row.data
  }
  return NextResponse.json(content)
}

export async function PUT(request: Request) {
  const { section, data } = await request.json()

  const { error } = await supabase.from('site_content').upsert({
    id: section,
    section,
    data,
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
