import { NextRequest, NextResponse } from 'next/server'

/**
 * Rota de setup do banco — DESABILITADA em produção pelo middleware.
 * Em desenvolvimento, retorna as migrations SQL para execução manual.
 */
export async function GET(req: NextRequest) {
  // Dupla proteção: além do middleware, verificar aqui também
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Endpoint desabilitado em produção.' },
      { status: 404 }
    )
  }

  const migrations = `
-- ============================================
-- Finance Tracker — Schema completo
-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wqaugqgixkostcscfnsq/sql
-- ============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#b2f0e8',
  icon text NOT NULL DEFAULT '🏷️',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS em categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_categories" ON categories;
CREATE POLICY "users_own_categories" ON categories
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Formas de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💳',
  color text NOT NULL DEFAULT '#e8d5f5',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(name, user_id)
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_payment_methods" ON payment_methods;
CREATE POLICY "users_own_payment_methods" ON payment_methods
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Pessoas
CREATE TABLE IF NOT EXISTS people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_people" ON people;
CREATE POLICY "users_own_people" ON people
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Lançamentos
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  payment_method text,
  date date NOT NULL,
  person text,
  paid boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_transactions" ON transactions;
CREATE POLICY "users_own_transactions" ON transactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_person_idx ON transactions(person);
CREATE INDEX IF NOT EXISTS categories_user_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS people_user_idx ON people(user_id);
  `.trim()

  return NextResponse.json({
    message: 'Execute o SQL abaixo no Supabase SQL Editor.',
    sql: migrations,
  })
}
