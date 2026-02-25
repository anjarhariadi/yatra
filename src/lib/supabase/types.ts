export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: CategoryType
          is_default: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: CategoryType
          is_default?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: CategoryType
          is_default?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          name: string
          notes: string | null
          user_id: string
          category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          user_id: string
          category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
          category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          amount: number
          date: string
          notes: string | null
          wallet_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          date: string
          notes?: string | null
          wallet_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          date?: string
          notes?: string | null
          wallet_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
