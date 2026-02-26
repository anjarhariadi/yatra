import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WalletCardProps {
  wallet: {
    id: string
    name: string
    notes: string | null
    category: { name: string }
    currentBalance?: number
  }
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  isDeleting?: boolean
}

export function WalletCard({ wallet, onDelete, onEdit, isDeleting }: WalletCardProps) {
  const balance = wallet.currentBalance ?? 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {wallet.name}
          </CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {wallet.category.name}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
        <p className="text-sm text-muted-foreground">Current balance</p>
        {wallet.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {wallet.notes}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onEdit(wallet.id)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(wallet.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
