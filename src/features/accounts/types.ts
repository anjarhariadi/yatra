export interface Category {
  id: string
  name: string
  type: CategoryType
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'

export interface Wallet {
  id: string
  name: string
  notes: string | null
  userId: string
  categoryId: string
  category: Category
  createdAt: string
  updatedAt: string
  _count?: {
    records: number
  }
  records?: WalletRecord[]
}

export interface WalletRecord {
  id: string
  amount: number
  date: string
  notes: string | null
  walletId: string
  userId: string
  createdAt: string
}

export interface CreateWalletInput {
  name: string
  categoryId: string
  notes?: string
}

export interface UpdateWalletInput {
  name?: string
  categoryId?: string
  notes?: string
}
