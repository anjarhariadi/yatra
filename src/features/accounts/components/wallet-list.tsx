"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WalletCard } from './wallet-card'
import { WalletForm } from './wallet-form'
import { WalletEditForm } from './wallet-edit-form'
import { trpc } from '@/lib/trpc/client'

export function WalletList() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data: wallets, isLoading } = trpc.accounts.getAll.useQuery()

  const deleteMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      toast.success('Wallet deleted successfully')
      utils.accounts.getAll.invalidate()
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete wallet')
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

  const handleEdit = (id: string) => {
    setEditId(id)
  }

  const handleEditSuccess = () => {
    setEditId(null)
    router.refresh()
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
      <div className="space-y-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wallet</DialogTitle>
            </DialogHeader>
            <WalletForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
        <p className="text-muted-foreground text-center py-8">
          No wallets yet. Create one to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wallet</DialogTitle>
            </DialogHeader>
            <WalletForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isDeleting={deletingId === wallet.id}
          />
        ))}
      </div>

      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
          </DialogHeader>
          {editId && <WalletEditForm id={editId} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
