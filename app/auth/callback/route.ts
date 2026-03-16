import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const res = NextResponse.redirect(`${origin}${next}`)
    const supabase = createSupabaseMiddlewareClient(req, res)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return res
  }

  // Erro: redirecionar para home com flag
  return NextResponse.redirect(`${origin}/?error=oauth`)
}
