'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PaymentMethodDB, Person } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import TransactionTable from '@/components/TransactionTable'
import { Search, SlidersHorizontal, Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import Link from 'next/link'

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"

export default function Lancamentos() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterMinValue, setFilterMinValue] = useState('')
  const [filterMaxValue, setFilterMaxValue] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterPaid, setFilterPaid] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cats }, { data: txns }, { data: ppl }, { data: pms }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('payment_methods').select('*').order('name'),
    ])
    setCategories(cats || [])
    setTransactions(txns || [])
    setPeople(ppl || [])
    setPaymentMethods(pms || [])
    setLoading(false)
  }

  async function handleTogglePaid(id: string, paid: boolean) {
    await supabase.from('transactions').update({ paid }).eq('id', id)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid } : t))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este lançamento?')) return
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const filtered = transactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && t.category_id !== filterCategory) return false
    if (filterPayment && t.payment_method !== filterPayment) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (filterMinValue && t.amount < parseFloat(filterMinValue)) return false
    if (filterMaxValue && t.amount > parseFloat(filterMaxValue)) return false
    if (filterPerson && t.person !== filterPerson) return false
    if (filterPaid === 'paid' && !t.paid) return false
    if (filterPaid === 'pending' && t.paid) return false
    return true
  })

  const total = filtered.reduce((acc, t) => acc + t.amount, 0)
  const hasExtraFilters = filterCategory || filterPayment || filterPerson || filterPaid || filterMonth || filterMinValue || filterMaxValue

  function clearAll() {
    setSearch(''); setFilterCategory(''); setFilterPayment(''); setFilterMonth('')
    setFilterMinValue(''); setFilterMaxValue(''); setFilterPerson(''); setFilterPaid('')
  }

  return (
    <div className="space-y-5 max-w-7xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Lançamentos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> registros ·{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
          </p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Gasto</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>

        {/* Primary filter row: always visible */}
        <div className="p-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => setShowMoreFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
              hasExtraFilters
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasExtraFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {showMoreFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {(search || hasExtraFilters) && (
            <button onClick={clearAll}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Extra filters — expandable */}
        {showMoreFilters && (
          <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputClass}>
                <option value="">Todas as categorias</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className={inputClass}>
                <option value="">Todas as formas</option>
                {paymentMethods.length > 0
                  ? paymentMethods.map(pm => <option key={pm.id} value={pm.name}>{pm.icon} {pm.name}</option>)
                  : <><option value="Crédito">💳 Crédito</option><option value="Pix / Débito">⚡ Pix/Débito</option><option value="Dinheiro">💵 Dinheiro</option></>
                }
              </select>
              <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)} className={inputClass}>
                <option value="">Todas as pessoas</option>
                {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)} className={inputClass}>
                <option value="">Todos os status</option>
                <option value="paid">✓ Pagos</option>
                <option value="pending">⏳ Pendentes</option>
              </select>
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={inputClass} />
              <div className="flex gap-2">
                <input type="number" placeholder="mín" value={filterMinValue} onChange={e => setFilterMinValue(e.target.value)} className={inputClass} />
                <input type="number" placeholder="máx" value={filterMaxValue} onChange={e => setFilterMaxValue(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <TransactionTable transactions={filtered} onDelete={handleDelete} showEditLink paymentMethods={paymentMethods} onTogglePaid={handleTogglePaid} />
          </div>
        )}
      </div>
    </div>
  )
}
