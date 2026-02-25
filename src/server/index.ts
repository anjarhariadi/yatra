import { router } from './trpc'
import { accountsRouter } from './routers/accounts'
import { categoriesRouter } from './routers/categories'

export const appRouter = router({
  accounts: accountsRouter,
  categories: categoriesRouter,
})

export type AppRouter = typeof appRouter
