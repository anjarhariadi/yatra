export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'

export interface Category {
  id: string
  name: string
  type: CategoryType
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
  _count?: {
    wallets: number
  }
}

export interface CreateCategoryInput {
  name: string
  type: CategoryType
}

export interface UpdateCategoryInput {
  name?: string
  type?: CategoryType
}

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  IDLE_CASH: 'Idle Cash',
  HOT_CASH: 'Hot Cash',
  EMERGENCY_FUND: 'Emergency Fund',
}
