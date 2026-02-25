import { WalletList } from '@/features/accounts'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallets</h1>
        <p className="text-muted-foreground">Manage your wallets and accounts</p>
      </div>

      <WalletList />
    </div>
  )
}
