import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar userEmail={user.email || ""} />
      <SidebarInset>
        <DashboardTopbar />
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
