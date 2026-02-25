import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getCategories } from '@/features/categories'
import { CategoryList } from '@/features/categories'
import { Button } from '@/components/ui/button'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your wallet categories</p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">No categories yet. Create one to get started.</p>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  )
}
