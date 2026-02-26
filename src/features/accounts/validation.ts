import { z } from 'zod'

export const walletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().max(500, 'Notes too long').optional(),
  image: z.string().optional(),
})

export type WalletInput = z.infer<typeof walletSchema>
