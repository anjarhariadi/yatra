import { notFound } from 'next/navigation'
import { getCategory } from '@/features/categories'
import { CategoryEditForm } from '@/features/categories'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params

  try {
    const category = await getCategory(id)
    return (
      <div className="max-w-md mx-auto">
        <CategoryEditForm category={category} />
      </div>
    )
  } catch {
    notFound()
  }
}
