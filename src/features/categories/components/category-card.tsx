import { Pencil, Trash2 } from 'lucide-react'
import { CATEGORY_TYPE_LABELS, type CategoryType } from '../validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    type: CategoryType
    isDefault: boolean
    _count?: { wallets: number }
  }
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  isDeleting?: boolean
}

export function CategoryCard({ category, onDelete, onEdit, isDeleting }: CategoryCardProps) {
  const walletCount = category._count?.wallets ?? 0
  const canDelete = !category.isDefault && walletCount === 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {CATEGORY_TYPE_LABELS[category.type]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {walletCount} wallet{walletCount !== 1 ? 's' : ''}
        </p>
        {category.isDefault && (
          <p className="text-xs text-muted-foreground mt-2">Default category</p>
        )}
        <div className="flex gap-2 mt-4">
          {!category.isDefault && (
            <Button variant="outline" size="sm" onClick={() => onEdit(category.id)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
