'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Category, PaymentMethodDB, Person } from '@/lib/supabase'
import { CheckCircle, Pencil } from 'lucide-react'

export default function EditarLancamento() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', category_id: '', payment_method: '', date: '', person: '', paid: false,
  })

  useEffect(() => {
    async function loadData() {
      const [{ data: cats }, { data: ppl }, { data: pms }, { data: txn }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('people').select('*').order('name'),
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('transactions').select('*').eq('id', id).single(),
      ])
      setCategories(cats || [])
      setPeople(ppl || [])
      setPaymentMethods(pms || [])
      if (txn) {
        setForm({
          description: txn.description, amount: String(txn.amount),
          category_id: txn.category_id || '', payment_method: txn.payment_method || '',
          date: txn.date, person: txn.person || '', paid: txn.paid ?? false,
        })
      }
      setFetching(false)
    }
    loadData()
  }, [id])

  function isAutoPaid(paymentMethod: string) {
    const lower = paymentMethod.toLowerCase()
    return lower.includes('pix') || lower.includes('dinheiro')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'payment_method' && isAutoPaid(value) ? { paid: true } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) return
    setLoading(true)
    const { error } = await supabase.from('transactions').update({
      description: form.description, amount: parseFloat(form.amount),
      category_id: form.category_id || null, payment_method: form.payment_method || null,
      date: form.date, person: form.person || null, paid: form.paid,
    }).eq('id', id)
    setLoading(false)
    if (!error) { setSuccess(true); setTimeout(() => router.push('/lancamentos'), 1200) }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50/60 dark:bg-slate-800 dark:text-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:border-slate-700"
  const labelClass = "block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2"

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Gasto</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Atualize os dados do lançamento</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Pencil className="w-4 h-4 text-blue-600" />
          </span>
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Dados do Gasto</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Descrição *</label>
            <input name="description" value={form.description} onChange={handleChange}
              placeholder="Ex: Almoço no restaurante" className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valor (R$) *</label>
              <input name="amount" type="number" step="0.01" min="0.01" value={form.amount}
                onChange={handleChange} placeholder="0,00" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Data *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Categoria</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pagamento</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange} className={inputClass}>
                <option value="">Não informado</option>
                {paymentMethods.length > 0
                  ? paymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.icon} {pm.name}</option>)
                  : <>
                      <option value="Crédito">💳 Crédito</option>
                      <option value="Pix / Débito">⚡ Pix / Débito</option>
                      <option value="Dinheiro">💵 Dinheiro</option>
                    </>
                }
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Quem gastou</label>
            <select name="person" value={form.person} onChange={handleChange} className={inputClass}>
              <option value="">Não informado</option>
              {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, paid: !prev.paid }))}
              className={`w-full py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                form.paid ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
            >
              {form.paid ? '✓ Pago' : '⏳ Pendente — clique para marcar como pago'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.push('/lancamentos')}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || success}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
              {success ? (<><CheckCircle className="w-4 h-4" /> Salvo!</>)
                : loading ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />)
                : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
