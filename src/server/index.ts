import { accountsRouter } from './routers/accounts'
import { categoriesRouter } from './routers/categories'
import { chartsRouter } from './routers/charts'
import { recordsRouter } from './routers/records'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  categories: categoriesRouter,
  charts: chartsRouter,
  records: recordsRouter,
})

export type AppRouter = typeof appRouter
