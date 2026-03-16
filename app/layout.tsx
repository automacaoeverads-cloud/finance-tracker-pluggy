'use client'

import './globals.css'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider, useAuth } from '@/lib/auth'
import { TrendingUp, Menu, Mail, Lock, Eye, EyeOff, ArrowRight, BarChart2, ShieldCheck, Zap, CheckCircle } from 'lucide-react'

type AuthTab = 'landing' | 'login' | 'register'

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<AuthTab>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: err } = await signIn(email, password)
    setSubmitting(false)
    if (err) setError('Email ou senha incorretos.')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setSubmitting(true)
    const { error: err } = await signUp(email, password)
    setSubmitting(false)
    if (err) setError(err)
  }

  function goAuth(t: 'login' | 'register') {
    setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); setTab(t)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020d0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-900/50 animate-pulse">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="w-6 h-6 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // ── LANDING PAGE ──────────────────────────────────────────────
  if (!user && tab === 'landing') {
    return (
      <div className="min-h-screen bg-[#020d0a] flex flex-col overflow-hidden">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-700/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[80px]" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/60">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Finance Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goAuth('login')}
              className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => goAuth('register')}
              className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-all"
            >
              Criar conta
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CONTROLE FINANCEIRO PESSOAL
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight max-w-3xl">
            Seu dinheiro,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              sob controle
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-xl leading-relaxed">
            Dashboard financeiro completo. Registre gastos, acompanhe categorias e visualize para onde seu dinheiro vai — em tempo real.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            <button
              onClick={() => goAuth('register')}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold text-base transition-all shadow-xl shadow-emerald-900/40"
            >
              Começar agora — grátis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => goAuth('login')}
              className="px-7 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-semibold text-base transition-all"
            >
              Já tenho conta
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-slate-500 mb-16">
            {[
              { icon: CheckCircle, text: 'Sem cartão de crédito' },
              { icon: ShieldCheck, text: 'Dados privados e seguros' },
              { icon: Zap, text: 'Configuração em 1 minuto' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
            {[
              {
                icon: BarChart2,
                title: 'Dashboard completo',
                desc: 'Gráficos de evolução, distribuição por categoria e formas de pagamento',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
              },
              {
                icon: ShieldCheck,
                title: 'Multi-usuário',
                desc: 'Cada conta vê apenas seus próprios dados. Privacidade total.',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
              },
              {
                icon: Zap,
                title: 'Rápido e simples',
                desc: 'Registre um gasto em menos de 10 segundos. Sem complicação.',
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
                border: 'border-teal-500/20',
              },
            ].map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`rounded-2xl p-5 border ${border} ${bg} text-left backdrop-blur-sm`}>
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <p className="font-semibold text-white text-sm mb-1.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── AUTH FORM (Login / Register) ──────────────────────────────
  if (!user && (tab === 'login' || tab === 'register')) {
    const isLogin = tab === 'login'
    return (
      <div className="min-h-screen bg-[#020d0a] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-green-900/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative w-full max-w-sm z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <button onClick={() => setTab('landing')} className="inline-flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-900/60 group-hover:shadow-emerald-900/80 transition-shadow">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Finance Tracker</span>
            </button>
            <p className="text-slate-500 text-sm mt-2">
              {isLogin ? 'Bem-vindo de volta 👋' : 'Crie sua conta grátis'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            <button
              onClick={() => goAuth('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                isLogin
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => goAuth('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                !isLogin
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-7 border border-white/10 shadow-2xl">
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <span className="text-rose-400 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 mt-2"
              >
                {submitting
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : isLogin ? 'Entrar na conta' : 'Criar minha conta'
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-600 font-medium">ou continue com</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google OAuth */}
            <button
              onClick={signInWithGoogle}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </div>

          <button
            onClick={() => setTab('landing')}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-5 transition-colors"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  // ── AUTHENTICATED APP ──────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-slate-950 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-[260px]">
        <header className="md:hidden sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">Finance Tracker</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Finance Tracker</title>
        <meta name="description" content="Controle seus gastos de forma simples e bonita" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
