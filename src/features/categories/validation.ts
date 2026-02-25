import { z } from 'zod'

const categoryTypes = ['IDLE_CASH', 'HOT_CASH', 'EMERGENCY_FUND'] as const

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(categoryTypes, {
    errorMap: () => ({ message: 'Please select a category type' }),
  }),
})

export type CategoryInput = z.infer<typeof categorySchema>
