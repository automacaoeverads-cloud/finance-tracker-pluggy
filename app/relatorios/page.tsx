'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Transaction, Category, PaymentMethodDB } from '@/lib/supabase'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { CategoryPieChart, MonthlyAreaChart } from '@/components/Charts'
import PaymentBadge from '@/components/PaymentBadge'

export default function Relatorios() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDB[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*, category:categories(*)').order('date', { ascending: false }),
      supabase.from('payment_methods').select('*').order('name'),
    ]).then(([{ data: cats }, { data: txns }, { data: pms }]) => {
      setCategories(cats || [])
      setTransactions(txns || [])
      setPaymentMethods(pms || [])
    })
  }, [])

  const monthTxns = transactions.filter(t => t.date.startsWith(selectedMonth))
  const totalMonth = monthTxns.reduce((acc, t) => acc + t.amount, 0)

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: monthTxns.filter(t => t.category_id === cat.id).reduce((a, t) => a + t.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
      total: transactions.filter(t => t.date.startsWith(key)).reduce((a, t) => a + t.amount, 0),
    }
  })

  const paymentData = paymentMethods.map(pm => ({
    name: pm.name,
    icon: pm.icon,
    color: pm.color,
    value: monthTxns.filter(t => t.payment_method === pm.name).reduce((a, t) => a + t.amount, 0),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const top5 = [...monthTxns].sort((a, b) => b.amount - a.amount).slice(0, 5)

  const cardClass = "bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800"
  const cardStyle = { boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Relatórios</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Análise detalhada dos seus gastos</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center" style={{ borderLeft: '4px solid #10b981', ...cardStyle }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Total do mês</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalMonth)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center" style={{ borderLeft: '4px solid #10b981', ...cardStyle }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Lançamentos</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white">{monthTxns.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center" style={{ borderLeft: '4px solid #8b5cf6', ...cardStyle }}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Média por gasto</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalMonth / (monthTxns.length || 1))}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass} style={cardStyle}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Por Categoria</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{formatMonth(selectedMonth)}</p>
          {pieData.length > 0 ? <CategoryPieChart data={pieData} /> : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-300 dark:text-slate-600 text-sm">
              <span className="text-3xl mb-2">📊</span>Sem dados para este mês
            </div>
          )}
        </div>
        <div className={cardClass} style={cardStyle}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Evolução Mensal</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Últimos 12 meses</p>
          <MonthlyAreaChart data={monthlyData} />
        </div>
      </div>

      {/* Category breakdown + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass} style={cardStyle}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Distribuição por Categoria</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">{formatMonth(selectedMonth)}</p>
          {pieData.length > 0 ? (
            <div className="space-y-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-9 text-right font-semibold">
                    {totalMonth > 0 ? ((item.value / totalMonth) * 100).toFixed(0) : 0}%
                  </span>
                  <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${totalMonth > 0 ? (item.value / totalMonth) * 100 : 0}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 dark:text-slate-600 py-8 text-sm">Sem dados</p>
          )}
        </div>

        <div className={cardClass} style={cardStyle}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Top 5 Maiores Gastos</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">{formatMonth(selectedMonth)}</p>
          {top5.length > 0 ? (
            <div className="space-y-3">
              {top5.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {t.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-200" style={{ backgroundColor: t.category.color + '80' }}>
                          {t.category.icon} {t.category.name}
                        </span>
                      )}
                      <PaymentBadge method={t.payment_method} methods={paymentMethods} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 dark:text-slate-600 py-8 text-sm">Sem dados</p>
          )}
        </div>
      </div>

      {/* Payment methods breakdown */}
      {paymentData.length > 0 && (
        <div className={cardClass} style={cardStyle}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Por Forma de Pagamento</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">{formatMonth(selectedMonth)}</p>
          <div className="space-y-3">
            {paymentData.map(pm => (
              <div key={pm.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: pm.color + '50' }}>
                  {pm.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{pm.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">{formatCurrency(pm.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalMonth > 0 ? (pm.value / totalMonth) * 100 : 0}%`, backgroundColor: pm.color, filter: 'brightness(0.85)' }} />
                  </div>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 w-9 text-right font-semibold">
                  {totalMonth > 0 ? ((pm.value / totalMonth) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
