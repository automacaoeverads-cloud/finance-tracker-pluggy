import { PluggyClient } from 'pluggy-sdk'

let cachedClient: PluggyClient | null = null

export async function getPluggyClient(): Promise<PluggyClient> {
  if (cachedClient) return cachedClient
  cachedClient = new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID!,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
  })
  return cachedClient
}
