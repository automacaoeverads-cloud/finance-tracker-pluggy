'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Shield, Users, Mail, Calendar, Clock, RefreshCw, Trash2 } from 'lucide-react'

const ADMIN_EMAIL = 'automacao.everads@gmail.com'

interface UserRecord {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  confirmed_at: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function deleteUser(userId: string) {
    setDeletingId(userId)
    setConfirmId(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDeletingId(null); return }

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const json = await res.json()
    setDeletingId(null)
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      setError(json.error ?? 'Erro ao deletar usuário.')
    }
  }

  async function loadUsers() {
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Sem sessão ativa.'); setLoading(false); return }

    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Erro desconhecido'); setLoading(false); return }
    setUsers(json.users)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  // Guard: only admin can see this page
  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-rose-500" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Acesso negado</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Você não tem permissão para acessar esta área.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Admin</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Gerenciamento de usuários</p>
          </div>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
          style={{ borderLeft: '4px solid #8b5cf6' }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Total de usuários</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
          style={{ borderLeft: '4px solid #10b981' }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Confirmados</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{users.filter(u => u.confirmed_at).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
          style={{ borderLeft: '4px solid #10b981' }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Ativos hoje</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            {users.filter(u => {
              if (!u.last_sign_in_at) return false
              const today = new Date().toDateString()
              return new Date(u.last_sign_in_at).toDateString() === today
            }).length}
          </p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2.5 p-6 border-b border-slate-100 dark:border-slate-800">
          <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Contas cadastradas</h3>
          <span className="ml-auto text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-rose-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-800">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="hidden sm:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cadastro</th>
                  <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Último acesso</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {u.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{u.email}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{u.id.slice(0, 8)}…</p>
                        </div>
                        {u.email === ADMIN_EMAIL && (
                          <span className="flex-shrink-0 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(u.created_at)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(u.last_sign_in_at)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {u.confirmed_at ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                          ✓ Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                          ⏳ Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.email !== ADMIN_EMAIL && (
                        confirmId === u.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-slate-400 hidden sm:inline">Confirmar?</span>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {deletingId === u.id ? '...' : 'Sim'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(u.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Deletar conta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
