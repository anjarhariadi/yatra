"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryCard } from './category-card'
import { deleteCategory } from '../api/categories-client'
import type { Category } from '../types'

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteCategory(id)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = []
    }
    acc[category.type].push(category)
    return acc
  }, {} as Record<string, Category[]>)

  const typeLabels: Record<string, string> = {
    IDLE_CASH: 'Idle Cash',
    HOT_CASH: 'Hot Cash',
    EMERGENCY_FUND: 'Emergency Fund',
  }

  return (
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
                isDeleting={deletingId === category.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
