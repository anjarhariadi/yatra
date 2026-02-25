import { getCategories } from '@/features/accounts'
import { WalletForm } from '@/features/accounts'

export default async function NewWalletPage() {
  const categories = await getCategories()

  if (categories.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <p className="text-muted-foreground mb-4">
          You need to create categories first before adding wallets.
        </p>
        <a href="/categories/new" className="text-primary hover:underline">
          Create a category
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <WalletForm categories={categories} />
    </div>
  )
}
