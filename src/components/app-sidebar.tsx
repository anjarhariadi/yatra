"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Tags,
  Download,
  LogOut,
  User,
  Wallet2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts", icon: Wallet, label: "Wallets" },
  { href: "/categories", icon: Tags, label: "Categories" },
  { href: "/export", icon: Download, label: "Export" },
];

interface AppSidebarProps {
  userEmail: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Wallet2 />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Yatra
          </span>
        </div>
      </SidebarHeader>
      {/* Add space */}
      <div className=" my-4"></div>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href} prefetch>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <User className="size-4 shrink-0" />
          <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
            {userEmail}
          </span>
        </div>
        <form action={"/api/auth/signout"} method="post">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2 group-data-[collapsible=icon]:justify-center"
            type="submit"
          >
            <LogOut className="size-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              Sign Out
            </span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
