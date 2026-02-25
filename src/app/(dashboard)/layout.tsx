import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Tags, 
  Download, 
  LogOut,
  User
} from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/accounts", icon: Wallet, label: "Wallets" },
    { href: "/records", icon: Receipt, label: "Records" },
    { href: "/categories", icon: Tags, label: "Categories" },
    { href: "/export", icon: Download, label: "Export" },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Yatra</h1>
          <p className="text-sm text-muted-foreground">Finance Tracker</p>
        </div>
        {user && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
              <User className="h-4 w-4" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
          </div>
        )}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <form action={handleSignOut}>
            <Button variant="ghost" className="w-full justify-start" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
