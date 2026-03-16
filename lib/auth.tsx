'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthCtx {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── signIn via API route (com rate limiting server-side) ─────────────────
  async function signIn(email: string, password: string) {
    let res: Response
    try {
      res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch {
      return { error: 'Erro de conexão. Verifique sua internet.' }
    }

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error ?? 'Erro ao fazer login.' }
    }

    // Restaurar sessão no cliente Supabase com os tokens retornados
    const { error: sessionErr } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    })

    return { error: sessionErr?.message ?? null }
  }

  // ─── signUp com proteção contra email enumeration ─────────────────────────
  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      // Mascarar "User already registered" para não revelar emails cadastrados
      const isEnumerable =
        error.message?.toLowerCase().includes('already registered') ||
        (error as { code?: string }).code === 'user_already_exists'

      if (isEnumerable) {
        // Retornar mensagem genérica — não confirmar nem negar existência do email
        return { error: 'Não foi possível criar a conta com este email. Tente fazer login.' }
      }

      return { error: error.message }
    }

    // Auto sign-in após cadastro
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    return { error: loginErr?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
