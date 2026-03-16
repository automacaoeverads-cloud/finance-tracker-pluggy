'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, PaymentMethodDB } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Trash2, Plus, Pencil, CreditCard, X, Check } from 'lucide-react'

const ICONS = ['💳', '⚡', '💵', '🏦', '🏧', '📱', '💰', '🪙', '🏪', '💎', '🎯', '🔑']
const COLORS = [
  '#BFDBFE', '#c8e6f5', '#b2f0e8', '#c8f5c8',
  '#e8d5f5', '#f5d5e8', '#f5f0c8', '#f5e0c8', '#f5c8c8',
]

export default function FormasPagamento() {
  const { user } = useAuth()
  const [methods, setMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', icon: '💳', color: '#BFDBFE' })

  useEffect(() => { loadMethods() }, [])

  async function loadMethods() {
    const { data } = await supabase.from('payment_methods').select('*').order('name')
    setMethods(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      await supabase.from('payment_methods').update({ name: form.name, icon: form.icon, color: form.color }).eq('id', editingId)
    } else {
      await supabase.from('payment_methods').insert({ name: form.name, icon: form.icon, color: form.color, user_id: user?.id })
    }
    cancelForm()
    loadMethods()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}"? Lançamentos vinculados perderão esta forma de pagamento.`)) return
    await supabase.from('payment_methods').delete().eq('id', id)
    setMethods(prev => prev.filter(m => m.id !== id))
  }

  function startEdit(m: PaymentMethodDB) {
    setForm({ name: m.name, icon: m.icon, color: m.color })
    setEditingId(m.id)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', icon: '💳', color: '#BFDBFE' })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Formas de Pagamento</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{methods.length}</span> formas cadastradas
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', icon: '💳', color: '#BFDBFE' }) }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Forma
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              </span>
              {editingId ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
            </h3>
            <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Nome */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Nome</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Nubank, Itaú, PIX..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50/60 dark:bg-slate-800 dark:text-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:border-slate-700"
              />
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Ícone</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(p => ({ ...p, icon }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      form.icon === icon ? 'bg-blue-100 ring-2 ring-blue-300' : 'hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(p => ({ ...p, color }))}
                    className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 relative flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#3B82F6' : 'transparent',
                    }}
                  >
                    {form.color === color && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Preview:</span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200"
                style={{ backgroundColor: form.color + '90' }}
              >
                {form.icon} {form.name}
              </span>
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={cancelForm} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map(m => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all duration-200"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: m.color + '60' }}
                >
                  {m.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{m.name}</p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-slate-600 mt-0.5"
                    style={{ backgroundColor: m.color + '80' }}
                  >
                    {m.icon} {m.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(m)}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m.id, m.name)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {methods.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-300" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold">Nenhuma forma cadastrada</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Crie a primeira para organizar seus gastos!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
