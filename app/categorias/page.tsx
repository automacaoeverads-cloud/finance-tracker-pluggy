'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Category } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Trash2, Plus, Pencil, Tag, X, Check } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/utils'

const ICONS = ['🍽️', '🚗', '🏠', '🎮', '🛍️', '💊', '✈️', '📚', '💼', '🎵', '🐾', '💡', '📱', '🏋️', '☕']

export default function Categorias() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', color: '#BFDBFE', icon: '🍽️' })

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name) return
    if (editingId) {
      await supabase.from('categories').update(form).eq('id', editingId)
    } else {
      await supabase.from('categories').insert({ ...form, user_id: user?.id })
    }
    setForm({ name: '', color: '#BFDBFE', icon: '🍽️' })
    setShowForm(false)
    setEditingId(null)
    loadCategories()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta categoria?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, color: cat.color, icon: cat.icon })
    setEditingId(cat.id)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', color: '#BFDBFE', icon: '🍽️' })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Categorias</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{categories.length}</span> categorias ativas
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', color: '#BFDBFE', icon: '🍽️' }) }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
              </span>
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
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
                placeholder="Ex: Alimentação"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50/60 dark:bg-slate-800 dark:text-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:border-slate-700"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CATEGORY_COLORS).map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(p => ({ ...p, color }))}
                    className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 relative"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#3B82F6' : 'transparent',
                    }}
                  >
                    {form.color === color && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Ícone</label>
              <div className="flex flex-wrap gap-1">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(p => ({ ...p, icon }))}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                      form.icon === icon
                        ? 'bg-blue-100 ring-2 ring-blue-300'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={cancelForm}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
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
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all duration-200"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + '50' }}
                >
                  {cat.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{cat.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Categoria</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 text-blue-300" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold">Nenhuma categoria ainda</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Crie a primeira para organizar seus gastos!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
