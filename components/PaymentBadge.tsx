import { PAYMENT_METHODS_FALLBACK, PaymentMethodDB } from '@/lib/supabase'

interface Props {
  method: string | null
  methods?: PaymentMethodDB[]
}

export default function PaymentBadge({ method, methods }: Props) {
  if (!method) return <span className="text-slate-300 text-sm">—</span>

  // Busca nos métodos dinâmicos primeiro
  if (methods && methods.length > 0) {
    const pm = methods.find(p => p.name === method)
    if (pm) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-800"
          style={{ backgroundColor: pm.color + '90' }}
        >
          {pm.icon} {pm.name}
        </span>
      )
    }
  }

  // Fallback para métodos hardcoded antigos
  const fallback = PAYMENT_METHODS_FALLBACK.find(p => p.value === method)
  if (fallback) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-800"
        style={{ backgroundColor: fallback.color + '90' }}
      >
        {fallback.icon} {fallback.label}
      </span>
    )
  }

  // Último fallback: mostrar o texto puro com estilo neutro
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700">
      💳 {method}
    </span>
  )
}
