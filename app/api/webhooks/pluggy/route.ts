import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPluggyClient } from '@/lib/pluggy'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { event, itemId } = body
  console.log('[Pluggy Webhook]', event, itemId)

  if (event === 'item/created' || event === 'item/updated') {
    const client = await getPluggyClient()
    const item = await client.fetchItem(itemId)
    await supabaseAdmin.from('bank_connections').upsert({
      item_id: itemId,
      connector_name: item.connector?.name,
      connector_id: item.connector?.id,
      status: item.status,
      last_sync_at: new Date().toISOString(),
    }, { onConflict: 'item_id' })
  }

  if (event === 'transactions/created') {
    const { data: connection } = await supabaseAdmin
      .from('bank_connections').select('user_id').eq('item_id', itemId).single()
    if (!connection) return NextResponse.json({ ok: true })

    const client = await getPluggyClient()
    const accountsResult = await client.fetchAccounts(itemId)

    for (const account of accountsResult.results) {
      const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      let page = 1, hasMore = true
      while (hasMore) {
        const txResult = await client.fetchTransactions(account.id, { from, page, pageSize: 500 })
        const toInsert = txResult.results
          .filter((tx: any) => tx.status === 'POSTED')
          .map((tx: any) => ({
            user_id: connection.user_id,
            amount: Math.abs(tx.amount),
            description: tx.description || tx.descriptionRaw || 'Transação bancária',
            date: tx.date.split('T')[0],
            payment_method: account.type === 'CREDIT' ? 'Cartão de Crédito' : 'Débito',
            paid: true,
            pluggy_transaction_id: tx.id,
          }))
        if (toInsert.length > 0) {
          await supabaseAdmin.from('transactions').upsert(toInsert, {
            onConflict: 'pluggy_transaction_id',
            ignoreDuplicates: true,
          })
        }
        hasMore = page < txResult.totalPages
        page++
      }
    }
  }

  return NextResponse.json({ ok: true })
}
