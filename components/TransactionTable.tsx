'use client'

import { Transaction, getPersonColor, PaymentMethodDB } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentBadge from '@/components/PaymentBadge'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

interface Props {
  transactions: Transaction[]
  onDelete?: (id: string) => void
  showEditLink?: boolean
  paymentMethods?: PaymentMethodDB[]
  onTogglePaid?: (id: string, paid: boolean) => void
}

export default function TransactionTable({ transactions, onDelete, showEditLink = false, paymentMethods, onTogglePaid }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-semibold">Nenhum lançamento encontrado</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Adicione seu primeiro gasto!</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Mobile layout: card compacto ── */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((t) => (
          <div key={t.id} className="py-2.5 flex items-center gap-2">
            {/* Dot de status */}
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.paid ? 'bg-emerald-400' : 'bg-amber-400'}`} />

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              {/* Linha 1: descrição + valor */}
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">{formatCurrency(t.amount)}</span>
              </div>
              {/* Linha 2: data + badges todos na mesma linha */}
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-0.5">{formatDate(t.date)}</span>
                {t.category && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-800"
                    style={{ backgroundColor: t.category.color + '80' }}>
                    {t.category.icon} {t.category.name}
                  </span>
                )}
                <PaymentBadge method={t.payment_method} methods={paymentMethods} />
                {t.person && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium text-slate-700"
                    style={{ backgroundColor: getPersonColor(t.person) }}>
                    {t.person}
                  </span>
                )}
                {onTogglePaid && (
                  t.paid
                    ? <button onClick={() => onTogglePaid(t.id, false)} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">✓ Pago</button>
                    : <button onClick={() => onTogglePaid(t.id, true)} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">⏳ Pendente</button>
                )}
              </div>
            </div>

            {/* Ações compactas */}
            {(onDelete || showEditLink) && (
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                {showEditLink && (
                  <Link href={`/lancamentos/${t.id}/editar`}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-emerald-500 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(t.id)}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop layout: tabela ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data</th>
              <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descrição</th>
              <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pagamento</th>
              <th className="hidden lg:table-cell text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pessoa</th>
              <th className="text-left py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pago</th>
              <th className="text-right py-3 px-3 md:px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Valor</th>
              {(onDelete || showEditLink) && <th className="py-3 px-3 md:px-4"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                <td className="py-3.5 px-3 md:px-4 text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                <td className="py-3.5 px-3 md:px-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.description}</p>
                </td>
                <td className="hidden md:table-cell py-3.5 px-4">
                  {t.category ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-slate-700"
                      style={{ backgroundColor: t.category.color + '80' }}>
                      {t.category.icon} {t.category.name}
                    </span>
                  ) : <span className="text-sm text-slate-300 dark:text-slate-600">—</span>}
                </td>
                <td className="py-3.5 px-3 md:px-4">
                  <PaymentBadge method={t.payment_method} methods={paymentMethods} />
                </td>
                <td className="hidden lg:table-cell py-3.5 px-3 md:px-4">
                  {t.person ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-700"
                      style={{ backgroundColor: getPersonColor(t.person) }}>
                      {t.person}
                    </span>
                  ) : <span className="text-sm text-slate-300 dark:text-slate-600">—</span>}
                </td>
                <td className="py-3.5 px-3 md:px-4">
                  {t.paid ? (
                    <span onClick={() => onTogglePaid?.(t.id, false)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-emerald-200 transition-colors select-none">
                      ✓ Pago
                    </span>
                  ) : (
                    <span onClick={() => onTogglePaid?.(t.id, true)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-amber-200 transition-colors select-none">
                      ⏳ Pendente
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(t.amount)}</td>
                {(onDelete || showEditLink) && (
                  <td className="py-3.5 px-3 md:px-4">
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {showEditLink && (
                        <Link href={`/lancamentos/${t.id}/editar`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
