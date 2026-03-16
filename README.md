# Finance Tracker

Site para controle de gastos pessoais. Paleta verde-água, moderno e direto.

## Stack
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Supabase (Postgres)
- Recharts

## Setup

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase-schema.sql`
3. Copie a **Project URL** e a **anon key** (em Settings > API)

### 2. Variáveis de ambiente
Crie `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
```

### 3. Rodar local
```bash
npm install
npm run dev
```

### Deploy Vercel
Configure as variáveis de ambiente no painel da Vercel e conecte o repositório.
