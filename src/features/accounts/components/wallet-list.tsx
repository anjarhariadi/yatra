"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WalletCard } from './wallet-card'
import { trpc } from '@/lib/trpc/client'

export function WalletList() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: wallets, isLoading } = trpc.accounts.getAll.useQuery()

  const deleteMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      utils.accounts.getAll.invalidate()
      router.refresh()
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete wallet')
    },
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet? All records will be deleted too.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteMutation.mutateAsync({ id })
    } catch {
      // Error handled in onError
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!wallets || wallets.length === 0) {
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
