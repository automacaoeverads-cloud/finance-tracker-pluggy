import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

/**
 * Client Supabase para uso no browser (Client Components).
 * Usa @supabase/ssr que armazena a sessão em cookies,
 * permitindo que o middleware server-side leia a autenticação.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Category = {
  id: string
  name: string
  color: string
  icon: string
  user_id?: string
  created_at: string
}

export type PaymentMethodDB = {
  id: string
  name: string
  icon: string
  color: string
  user_id?: string
  created_at: string
}

export const PAYMENT_METHODS_FALLBACK: { value: string; label: string; icon: string; color: string }[] = [
  { value: 'credito', label: 'Crédito', icon: '💳', color: '#e8d5f5' },
  { value: 'pix_debito', label: 'Pix / Débito', icon: '⚡', color: '#b2f0e8' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵', color: '#c8f5c8' },
]

export const PAYMENT_METHODS = PAYMENT_METHODS_FALLBACK

export type Person = {
  id: string
  name: string
  user_id?: string
  created_at: string
}

export const PERSON_COLORS: Record<string, string> = {
  Arthur: '#b2f0e8',
  Pedro: '#c8e6f5',
  Luana: '#f5d5e8',
}

export function getPersonColor(name: string | null | undefined): string {
  if (!name) return '#e5e7eb'
  return PERSON_COLORS[name] || '#e8d5f5'
}

export type Transaction = {
  id: string
  amount: number
  description: string
  category_id: string
  category?: Category
  payment_method: string | null
  date: string
  created_at: string
  person?: string | null
  paid?: boolean
  user_id?: string
}
