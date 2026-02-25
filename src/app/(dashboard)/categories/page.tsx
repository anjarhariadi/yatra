import { CategoryList } from '@/features/categories'

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage your wallet categories</p>
      </div>

      <CategoryList />
    </div>
  )
}
