import { createBrowserClient } from '@supabase/ssr'
import type { Wallet, CreateWalletInput, UpdateWalletInput, WalletRecord } from '../types'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*, category:categories(*)')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as Wallet[]
}

export async function getWallet(id: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*, category:categories(*), records(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as Wallet
}

export async function getWalletRecords(walletId: string) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('walletId', walletId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as WalletRecord[]
}

export async function getLatestRecord(walletId: string) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('walletId', walletId)
    .order('date', { ascending: false })
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message)
  }

  return data as unknown as WalletRecord | null
}

export async function createWallet(input: CreateWalletInput) {
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      name: input.name,
      category_id: input.categoryId,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as Wallet
}

export async function updateWallet(id: string, input: UpdateWalletInput) {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await supabase
    .from('wallets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as Wallet
}

export async function deleteWallet(id: string) {
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
