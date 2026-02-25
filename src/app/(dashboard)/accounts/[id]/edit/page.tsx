import { notFound } from 'next/navigation'
import { getWallet, getCategories } from '@/features/accounts'
import { WalletEditForm } from '@/features/accounts'

interface EditWalletPageProps {
  params: Promise<{ id: string }>
}

export default async function EditWalletPage({ params }: EditWalletPageProps) {
  const { id } = await params

  try {
    const wallet = await getWallet(id)
    const categories = await getCategories()

    return (
      <div className="max-w-md mx-auto">
        <WalletEditForm wallet={wallet} categories={categories} />
      </div>
    )
  } catch {
    notFound()
  }
}
