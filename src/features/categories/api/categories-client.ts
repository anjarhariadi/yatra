import { createBrowserClient } from '@supabase/ssr'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, _count(wallets)')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Category[]
}

export async function getCategory(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*, _count(wallets)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Category
}

export async function createCategory(input: CreateCategoryInput) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name,
      type: input.type,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Category
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.type !== undefined) updateData.type = input.type

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
