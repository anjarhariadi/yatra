"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCategory } from '../api/categories-client'
import { categorySchema, type CategoryInput } from '../validation'
import { CATEGORY_TYPE_LABELS, type CategoryType, type Category } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryEditFormProps {
  category: Category
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      type: category.type,
    },
  })

  const onSubmit = async (data: CategoryInput) => {
    setError('')
    setLoading(true)

    try {
      await updateCategory(category.id, data)
      router.push('/categories')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const categoryTypes: CategoryType[] = ['IDLE_CASH', 'HOT_CASH', 'EMERGENCY_FUND']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
        <CardDescription>Update your category details</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g., Bank BCA, GoPay, Cash"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Category Type</Label>
            <select
              id="type"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-disabled disabled:opacity-50"
              {...register('type')}
            >
              {categoryTypes.map((type) => (
                <option key={type} value={type}>
                  {CATEGORY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/categories">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
