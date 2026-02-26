"use client"

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { recordSchema, type RecordInput } from '../validation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

interface RecordFormProps {
  walletId?: string
  onSuccess?: () => void
}

export function RecordForm({ walletId, onSuccess }: RecordFormProps) {
  const utils = trpc.useUtils()

  const { data: wallets } = trpc.accounts.getAll.useQuery()

  const createMutation = trpc.records.create.useMutation({
    onSuccess: (_, variables) => {
      toast.success('Record added successfully')
      if (variables.walletId) {
        utils.records.getByWalletId.invalidate({ walletId: variables.walletId })
        utils.accounts.getById.invalidate({ id: variables.walletId })
      }
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
  } = useForm<RecordInput>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      walletId: walletId ?? '',
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  })

  const onSubmit = async (data: RecordInput) => {
    await createMutation.mutateAsync({
      ...data,
      walletId: walletId ?? data.walletId,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!walletId && (
        <Controller
          name="walletId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Wallet</FieldLabel>
              <select
                {...field}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-invalid={fieldState.invalid}
              >
                <option value="">Select a wallet</option>
                {wallets?.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="amount">Amount (IDR)</FieldLabel>
            <Input
              {...field}
              id="amount"
              type="number"
              step="1"
              placeholder="e.g., 5000000"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <Input
              {...field}
              id="date"
              type="date"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
            <Textarea
              {...field}
              id="notes"
              aria-invalid={fieldState.invalid}
              placeholder="Add any notes about this record"
              value={field.value ?? ''}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add Record'}
        </Button>
      </div>
    </form>
  )
}
