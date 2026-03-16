import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr + 'T00:00:00'))
}

export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr + '-01T00:00:00')
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}

export const CATEGORY_COLORS: Record<string, string> = {
  '#b2f0e8': 'Verde-água',
  '#c8f5c8': 'Verde',
  '#c8e6f5': 'Azul',
  '#e8d5f5': 'Lilás',
  '#f5d5e8': 'Rosa',
  '#f5f0c8': 'Amarelo',
  '#f5e0c8': 'Laranja',
  '#f5c8c8': 'Vermelho',
}
