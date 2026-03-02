"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const routeTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Welcome back!",
  },
  "/dashboard/accounts": {
    title: "Wallets",
    description: "Manage your wallets",
  },
  "/dashboard/categories": {
    title: "Categories",
    description: "Organize your categories",
  },
  "/dashboard/export": {
    title: "Export",
    description: "Download your data",
  },
}

export function DashboardTopbar() {
  const pathname = usePathname()
  
  const routeInfo = routeTitles[pathname] || {
    title: "Dashboard",
    description: "Welcome back!",
  }

  if (pathname.startsWith("/dashboard/accounts/") && pathname !== "/dashboard/accounts") {
    routeInfo.title = "Wallet Detail"
    routeInfo.description = "View wallet history"
  }

  return (
    <header
      className={cn(
        "flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6"
      )}
    >
      <SidebarTrigger />
      <div className="flex flex-1 flex-col">
        <h1 className="text-lg font-semibold">{routeInfo.title}</h1>
        <p className="text-sm text-muted-foreground">{routeInfo.description}</p>
      </div>
    </header>
  )
}
