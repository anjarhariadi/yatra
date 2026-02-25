"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WalletCard } from './wallet-card'
import { deleteWallet } from '../api/accounts-client'
import type { Wallet } from '../types'

interface WalletListProps {
  wallets: Wallet[]
}

export function WalletList({ wallets }: WalletListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet? All records will be deleted too.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteWallet(id)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete wallet')
    } finally {
      setDeletingId(null)
    }
  }

  if (wallets.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No wallets yet. Create one to get started.
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.id}
          wallet={wallet}
          onDelete={handleDelete}
          isDeleting={deletingId === wallet.id}
        />
      ))}
    </div>
  )
}
