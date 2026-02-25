"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryInput } from '../validation'
import { CATEGORY_TYPE_LABELS, type CategoryType } from '../types'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function CategoryForm() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [error, setError] = useState('')

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate()
      router.push('/categories')
      router.refresh()
    },
    onError: (err) => {
      setError(err.message || 'An error occurred')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: CategoryInput) => {
    setError('')
    try {
      await createMutation.mutateAsync(data)
    } catch {
      // Error handled in onError
    }
  }

  const categoryTypes: CategoryType[] = ['IDLE_CASH', 'HOT_CASH', 'EMERGENCY_FUND']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Category</CardTitle>
        <CardDescription>Add a new category to organize your wallets</CardDescription>
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
              <option value="">Select a type</option>
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
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
