import { accountsRouter } from './routers/accounts'
import { categoriesRouter } from './routers/categories'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  categories: categoriesRouter,
})

export type AppRouter = typeof appRouter
