import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase-server'

/**
 * Middleware de segurança do Finance Tracker
 *
 * 1. Bloqueia /api/setup-db em produção
 * 2. Protege todas as rotas autenticadas server-side via Supabase SSR
 * 3. Renova cookies de sessão automaticamente
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Bloquear /api/setup-db em produção ────────────────────────
  if (pathname === '/api/setup-db') {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Endpoint desabilitado em produção.' },
        { status: 404 }
      )
    }
    return NextResponse.next()
  }

  // ── A landing page (/) e callback OAuth são públicos ─────────
  if (pathname === '/' || pathname === '/auth/callback') {
    return NextResponse.next()
  }

  // ── Rotas de API admin: auth verificada internamente ─────────
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── Verificar sessão para todas as páginas protegidas ─────────
  const res = NextResponse.next()
  const supabase = createSupabaseMiddlewareClient(req, res)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Sem sessão válida: redirecionar para a landing page (que contém o login)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // Sessão válida: continuar (cookies renovados no `res`)
  return res
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em tudo exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico e outros assets públicos
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
