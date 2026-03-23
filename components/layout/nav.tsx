"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Lightbulb, Wrench, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "My Ideas", icon: Lightbulb },
  { href: "/fix-it", label: "Fix-It Centre", icon: Wrench },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-gray-200 bg-white fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">V</span>
            </div>
            <span className="font-bold text-gray-900">Viability First</span>
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
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <Link href="/assessment/new">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
          <div className="flex items-center gap-3 px-1">
            <UserButton />
            <span className="text-sm text-gray-600">Account</span>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-gray-900" : "text-gray-500"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-gray-900" : "text-gray-400")} />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/assessment/new"
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-blue-600"
        >
          <Plus className="h-5 w-5" />
          New
        </Link>
      </nav>
    </>
  )
}
