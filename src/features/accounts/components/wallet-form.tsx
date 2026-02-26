"use client"

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { walletSchema, type WalletInput } from '../validation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WalletFormProps {
  onSuccess?: () => void
}

export function WalletForm({ onSuccess }: WalletFormProps) {
  const utils = trpc.useUtils()

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.getAll.useQuery()

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      toast.success('Wallet created successfully')
      utils.accounts.getAll.invalidate()
      onSuccess?.()
    },
    onError: (err) => {
      toast.error(err.message || 'An error occurred')
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<WalletInput>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      notes: '',
    }
  })

  const onSubmit = async (data: WalletInput) => {
    await createMutation.mutateAsync(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Wallet Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g., Bank BCA, Cash, GoPay"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Category</FieldLabel>
            {categoriesLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="categoryId" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Notes (optional)</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Add any notes about this wallet"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
        </Button>
      </div>
    </form>
  )
}
