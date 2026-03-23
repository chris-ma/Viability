"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Lightbulb, Wrench, BookOpen, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/ideas",      label: "My Ideas",       icon: Lightbulb },
  { href: "/fix-it",     label: "Fix-It Centre",  icon: Wrench },
  { href: "/resources",  label: "Resources",      icon: BookOpen },
]

const mobileItems = [
  { href: "/dashboard",      label: "Dashboard",  icon: LayoutDashboard },
  { href: "/ideas",          label: "Ideas",      icon: Lightbulb },
  { href: "/fix-it",         label: "Fix-It",     icon: Wrench },
  { href: "/resources",      label: "Resources",  icon: BookOpen },
  { href: "/assessment/new", label: "New",        icon: Plus },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-black/[0.06] fixed left-0 top-0 z-40">

        {/* Wordmark */}
        <div className="px-5 pt-7 pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1D1D1F] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">V</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
              Viability First
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-[#1D1D1F] text-white font-medium"
                    : "text-[#6E6E73] font-medium hover:bg-black/[0.04] hover:text-[#1D1D1F]"
                )}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom row */}
        <div className="px-5 py-5 border-t border-black/[0.06] space-y-3">
          <Link
            href="/assessment/new"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#1D1D1F] text-white text-sm font-medium hover:bg-black/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserButton />
              <span className="text-sm text-[#6E6E73]">Account</span>
            </div>
            <Link
              href="/settings"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                pathname.startsWith("/settings")
                  ? "text-[#1D1D1F] bg-black/[0.06]"
                  : "text-[#AEAEB2] hover:text-[#6E6E73] hover:bg-black/[0.04]"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] z-40 flex pb-safe">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/assessment/new"
            ? false
            : pathname.startsWith(href)
          const isNew = href === "/assessment/new"
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 pt-3 pb-3 text-[10px] font-medium transition-colors min-h-[56px]",
                isNew
                  ? "text-[#1D1D1F]"
                  : active
                  ? "text-[#1D1D1F]"
                  : "text-[#AEAEB2]"
              )}
            >
              {isNew ? (
                <div className="w-7 h-7 bg-[#1D1D1F] rounded-xl flex items-center justify-center mb-0.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Icon className={cn("h-5 w-5", active ? "text-[#1D1D1F]" : "text-[#AEAEB2]")} />
              )}
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
