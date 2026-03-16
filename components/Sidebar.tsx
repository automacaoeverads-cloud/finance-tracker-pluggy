'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Tag, PlusCircle, TrendingUp, X, BarChart2, Users, CreditCard, Moon, Sun, LogOut, Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'

const ADMIN_EMAIL = 'automacao.everads@gmail.com'

const baseLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: List },
  { href: '/lancamentos/novo', label: 'Novo Gasto', icon: PlusCircle },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/formas-pagamento', label: 'Pagamentos', icon: CreditCard },
  { href: '/pessoas', label: 'Pessoas', icon: Users },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL
  const links = isAdmin ? [...baseLinks, { href: '/admin', label: 'Admin', icon: Shield }] : baseLinks

  const content = (
    <aside className="h-full w-[260px] bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Finance</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wide">TRACKER</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group',
                active
                  ? 'bg-emerald-500/20 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                active
                  ? 'bg-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
              )}>
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-emerald-400">
              {user?.email?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{user?.email ?? 'Usuário'}</p>
            <p className="text-[10px] text-slate-500">Conta ativa</p>
          </div>
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Logout */}
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors flex-shrink-0"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden md:flex fixed left-0 top-0 h-full w-[260px] z-30">
        {content}
      </div>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-50 w-[260px] flex-shrink-0">{content}</div>
        </div>
      )}
    </>
  )
}
