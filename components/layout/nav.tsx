"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Lightbulb, Wrench, Plus, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "My Ideas", icon: Lightbulb },
  { href: "/fix-it", label: "Fix-It Centre", icon: Wrench },
  { href: "/resources", label: "Resources", icon: BookOpen },
]

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/fix-it", label: "Fix-It", icon: Wrench },
  { href: "/resources", label: "Resources", icon: BookOpen },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[#F2D9C0] bg-[#FBF7F0] fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-[#F2D9C0]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1C0F07] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">V</span>
            </div>
            <span className="font-bold text-[#1C0F07]">Viability First</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#1C0F07] text-white"
                    : "text-[#1C0F07]/65 hover:bg-[#F2D9C0]/60 hover:text-[#1C0F07]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#F2D9C0] space-y-3">
          <Link href="/assessment/new">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-sm text-[#1C0F07]/65">Account</span>
            </div>
            <Link
              href="/settings"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                pathname.startsWith("/settings")
                  ? "bg-[#F2D9C0] text-[#1C0F07]"
                  : "text-[#1C0F07]/40 hover:text-[#1C0F07] hover:bg-[#F2D9C0]/60"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FBF7F0] border-t border-[#F2D9C0] z-40 flex">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-[#1C0F07]" : "text-[#1C0F07]/50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-[#1C0F07]" : "text-[#1C0F07]/40")} />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/assessment/new"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-[#D4622A]"
        >
          <Plus className="h-5 w-5" />
          New
        </Link>
      </nav>
    </>
  )
}
