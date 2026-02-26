import { z } from 'zod'

export const recordSchema = z.object({
  walletId: z.string().min(1, 'Wallet is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
})

export const recordUpdateSchema = recordSchema.omit({ walletId: true }).partial()

export type RecordInput = z.infer<typeof recordSchema>
export type RecordUpdateInput = z.infer<typeof recordUpdateSchema>
