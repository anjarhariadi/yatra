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
import { CategoryCard } from './category-card'
import { CategoryForm } from './category-form'
import { CategoryEditForm } from './category-edit-form'
import { trpc } from '@/lib/trpc/client'

export function CategoryList() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data: categories, isLoading } = trpc.categories.getAll.useQuery()

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully')
      utils.categories.getAll.invalidate()
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
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
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 w-32 bg-muted animate-pulse mb-4 rounded" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="space-y-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
        <p className="text-muted-foreground text-center py-8">
          No categories yet. Create one to get started.
        </p>
      </div>
    )
  }

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = []
    }
    acc[category.type].push(category)
    return acc
  }, {} as Record<string, typeof categories>)

  const typeLabels: Record<string, string> = {
    IDLE_CASH: 'Idle Cash',
    HOT_CASH: 'Hot Cash',
    EMERGENCY_FUND: 'Emergency Fund',
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedCategories).map(([type, typeCategories]) => (
          <div key={type}>
            <h2 className="text-lg font-semibold mb-4">{typeLabels[type]}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {typeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  isDeleting={deletingId === category.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editId && <CategoryEditForm id={editId} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
