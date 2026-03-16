'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Person, getPersonColor } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { UserPlus, Trash2, Users } from 'lucide-react'

export default function Pessoas() {
  const { user } = useAuth()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadPeople() }, [])

  async function loadPeople() {
    setLoading(true)
    const { data } = await supabase.from('people').select('*').order('name')
    setPeople(data || [])
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    const { data, error } = await supabase.from('people').insert({ name, user_id: user?.id }).select().single()
    if (!error && data) {
      setPeople(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
    }
    setAdding(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}"? Lançamentos vinculados perderão esta associação.`)) return
    await supabase.from('people').delete().eq('id', id)
    setPeople(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pessoas</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Gerencie quem pode ser vinculado a um gasto</p>
      </div>

      {/* Add person */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <UserPlus className="w-3.5 h-3.5 text-blue-500" />
          </span>
          Adicionar Pessoa
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nome da pessoa..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50/60 dark:bg-slate-800 dark:text-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:border-slate-700"
            required
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Adicionar'
            )}
          </button>
        </form>
      </div>

      {/* People list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </span>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Pessoas Cadastradas</h3>
          <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {people.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <p className="text-slate-500 font-semibold text-sm">Nenhuma pessoa cadastrada</p>
            <p className="text-xs text-slate-400 mt-1">Adicione a primeira pessoa acima!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {people.map(person => (
              <li
                key={person.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-emerald-900/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0"
                    style={{ backgroundColor: getPersonColor(person.name) }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{person.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(person.id, person.name)}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
