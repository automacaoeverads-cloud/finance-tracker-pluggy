'use client'

import { useState, useEffect, useCallback } from 'react'
import { PluggyConnect } from 'react-pluggy-connect'

interface BankConnection {
  id: string
  item_id: string
  connector_name: string
  status: string
  last_sync_at: string
}

export default function BankConnect() {
  const [showWidget, setShowWidget] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [loading, setLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    const res = await fetch('/api/bank-connections')
    const data = await res.json()
    if (Array.isArray(data)) setConnections(data)
  }, [])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/connect-token', { method: 'POST' })
      const { accessToken } = await res.json()
      setAccessToken(accessToken)
      setShowWidget(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = async (itemData: any) => {
    setShowWidget(false)
    await fetch('/api/bank-connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: itemData.item.id,
        connectorName: itemData.item.connector?.name,
        connectorId: itemData.item.connector?.id,
      }),
    })
    await fetchConnections()
  }

  const handleDisconnect = async (itemId: string) => {
    await fetch('/api/bank-connections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    await fetchConnections()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Contas Bancárias</h3>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : '+ Conectar banco'}
        </button>
      </div>

      {connections.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma conta conectada. Conecte seu banco para sincronizar transações automaticamente.
        </p>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{conn.connector_name || 'Banco'}</p>
                <p className="text-xs text-slate-400">
                  Último sync: {conn.last_sync_at ? new Date(conn.last_sync_at).toLocaleString('pt-BR') : '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  conn.status === 'UPDATED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : conn.status === 'UPDATING' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                  {conn.status === 'UPDATED' ? 'Ativo' : conn.status === 'UPDATING' ? 'Sincronizando' : 'Erro'}
                </span>
                <button onClick={() => handleDisconnect(conn.item_id)} className="text-xs text-red-500 hover:text-red-700">
                  Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWidget && accessToken && (
        <PluggyConnect
          connectToken={accessToken}
          onSuccess={handleSuccess}
          onClose={() => setShowWidget(false)}
          onError={(err: any) => { console.error('[PluggyConnect]', err); setShowWidget(false) }}
        />
      )}
    </div>
  )
}
