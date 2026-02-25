"use client"

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { categorySchema, type CategoryInput } from '../validation'
import { CATEGORY_TYPE_LABELS, type CategoryType } from '../types'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface CategoryFormProps {
  onSuccess?: () => void
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const utils = trpc.useUtils()

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success('Category created successfully')
      utils.categories.getAll.invalidate()
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
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: CategoryInput) => {
    await createMutation.mutateAsync(data)
  }

  const categoryTypes: CategoryType[] = ['IDLE_CASH', 'HOT_CASH', 'EMERGENCY_FUND']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Category Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g., Bank BCA, GoPay, Cash"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Category Type</FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="type" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CATEGORY_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
