'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PaymentMethodDB, getPersonColor, Person } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import TransactionTable from '@/components/TransactionTable'
import { CategoryPieChart, MonthlyAreaChart } from '@/components/Charts'
import { TrendingDown, Clock, CheckCircle, BarChart2, SlidersHorizontal, X, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [loading, setLoading] = useState(true)

  const todayMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const [filterMonth, setFilterMonth] = useState(todayMonth)
  const [filterPerson, setFilterPerson] = useState('')

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

  const hasFilters = filterMonth !== todayMonth || filterPerson !== ''

  const filtered = transactions.filter(t => {
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (filterPerson && t.person !== filterPerson) return false
    return true
  })

  const totalFiltered = filtered.reduce((acc, t) => acc + t.amount, 0)
  const pendingAmount = filtered.filter(t => !t.paid).reduce((a, t) => a + t.amount, 0)
  const pendingCount = filtered.filter(t => !t.paid).length
  const paidAmount = filtered.filter(t => t.paid).reduce((a, t) => a + t.amount, 0)
  const paidCount = filtered.filter(t => t.paid).length
  const avgFiltered = totalFiltered / (filtered.length || 1)

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: filtered.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const base = filterPerson
      ? transactions.filter(t => t.date.startsWith(key) && t.person === filterPerson)
      : transactions.filter(t => t.date.startsWith(key))
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
      total: base.reduce((a, t) => a + t.amount, 0),
    }
  })

  const allPeople = Array.from(new Set(filtered.map(t => t.person).filter(Boolean))) as string[]
  const personData = allPeople.map(name => ({
    name,
    value: filtered.filter(t => t.person === name).reduce((a, t) => a + t.amount, 0),
    color: getPersonColor(name),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const recent = filtered.slice(0, 8)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {filterPerson ? `${filterPerson} · ` : ''}{formatMonth(filterMonth)}
          </p>
        </div>
        <Link
          href="/lancamentos/novo"
          className="hidden sm:flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          Novo Gasto
        </Link>
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          />
          <select
            value={filterPerson}
            onChange={e => setFilterPerson(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <option value="">Todas as pessoas</option>
            {people.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setFilterMonth(todayMonth); setFilterPerson('') }}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros · {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
          </button>
        )}
        {!hasFilters && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-2 font-medium">
            {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={filterPerson ? `Total — ${filterPerson}` : 'Total no período'}
          value={formatCurrency(totalFiltered)}
          subtitle={`${filtered.length} lançamentos`}
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          accent="#10b981"
        />
        <StatCard
          title="Pendente"
          value={formatCurrency(pendingAmount)}
          subtitle={`${pendingCount} a pagar`}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          accent="#f59e0b"
        />
        <StatCard
          title="Pago"
          value={formatCurrency(paidAmount)}
          subtitle={`${paidCount} pagos`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          accent="#10b981"
        />
        <StatCard
          title="Média por gasto"
          value={formatCurrency(avgFiltered)}
          subtitle="no período filtrado"
          icon={<BarChart2 className="w-5 h-5 text-green-500" />}
          iconBg="bg-green-100 dark:bg-green-900/40"
          accent="#059669"
        />
      </div>

      {/* ── Charts: Evolução + Categorias ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Evolução Mensal</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-5">
            Últimos 6 meses{filterPerson ? ` — ${filterPerson}` : ''}
          </p>
          <MonthlyAreaChart data={monthlyData} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Por Categoria</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-4">{formatMonth(filterMonth)}</p>
          {pieData.length > 0 ? (
            <CategoryPieChart data={pieData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-slate-300 dark:text-slate-600 text-sm">
              <span className="text-3xl mb-2">📊</span>
              Sem dados neste período
            </div>
          )}
        </div>
      </div>

      {/* ── Lançamentos recentes ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
        style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">
              {filterPerson ? `Lançamentos — ${filterPerson}` : 'Lançamentos Recentes'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {recent.length} mais recentes do período
            </p>
          </div>
          <Link
            href="/lancamentos"
            className="flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-700 font-semibold transition-colors"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recent.length > 0 ? (
          <TransactionTable transactions={recent} paymentMethods={paymentMethods} />
        ) : (
          <div className="text-center py-14 text-slate-300 dark:text-slate-600 text-sm">
            <span className="text-3xl block mb-2">📝</span>
            Nenhum lançamento neste período
          </div>
        )}
      </div>

      {/* ── Gastos por pessoa ── */}
      {!filterPerson && personData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Gastos por Pessoa</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-5">
            {formatMonth(filterMonth)} — quanto cada pessoa gastou
          </p>
          <div className="space-y-3">
            {personData.map(person => (
              <div key={person.name} className="flex items-center gap-3">
                <button
                  onClick={() => setFilterPerson(person.name)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0 shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: person.color }}
                  title={`Filtrar por ${person.name}`}
                >
                  {person.name.charAt(0).toUpperCase()}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <button
                      onClick={() => setFilterPerson(person.name)}
                      className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {person.name}
                    </button>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">{formatCurrency(person.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalFiltered > 0 ? (person.value / totalFiltered) * 100 : 0}%`,
                        backgroundColor: person.color,
                        filter: 'brightness(0.82)',
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 w-9 text-right font-semibold">
                  {totalFiltered > 0 ? ((person.value / totalFiltered) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
