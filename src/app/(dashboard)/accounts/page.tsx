import { Plus } from 'lucide-react'
import Link from 'next/link'
import { WalletList } from '@/features/accounts'
import { Button } from '@/components/ui/button'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">Manage your wallets and accounts</p>
        </div>
        <Button asChild>
          <Link href="/accounts/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </Link>
        </Button>
      </div>

      <WalletList />
    </div>
  )
}
