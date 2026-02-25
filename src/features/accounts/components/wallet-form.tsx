"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { walletSchema, type WalletInput } from '../validation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function WalletForm() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [error, setError] = useState('')

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.getAll.useQuery()

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      utils.accounts.getAll.invalidate()
      router.push('/accounts')
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
  } = useForm<WalletInput>({
    resolver: zodResolver(walletSchema),
  })

  const onSubmit = async (data: WalletInput) => {
    setError('')
    try {
      await createMutation.mutateAsync(data)
    } catch {
      // Error handled in onError
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Wallet</CardTitle>
        <CardDescription>Add a new wallet to track your money</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input
              id="name"
              placeholder="e.g., Bank BCA, Cash, GoPay"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            {categoriesLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : (
              <select
                id="categoryId"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-disabled disabled:opacity-50"
                {...register('categoryId')}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this wallet"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/accounts">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
