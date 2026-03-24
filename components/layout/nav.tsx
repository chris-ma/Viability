"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { LayoutDashboard, Lightbulb, Wrench, BookOpen, Plus, Settings, LogOut } from "lucide-react"
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
  { href: "/assessment/new", label: "New",        icon: Plus },
  { href: "/fix-it",         label: "Fix-It",     icon: Wrench },
  { href: "/settings",       label: "Account",    icon: Settings },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Mobile top header ──────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] h-13 flex items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1D1D1F] rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">V</span>
          </div>
          <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">Viability First</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/assessment/new"
            className="flex items-center gap-1.5 bg-[#1D1D1F] text-white text-xs font-medium rounded-full px-3 py-1.5">
            <Plus className="h-3 w-3" />
            New
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

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
        <div className="px-4 py-5 border-t border-black/[0.06] space-y-2">
          <Link
            href="/assessment/new"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#1D1D1F] text-white text-sm font-medium hover:bg-black/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Link>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <UserButton afterSignOutUrl="/" />
              <Link href="/settings" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Account</Link>
            </div>
            <SignOutButton redirectUrl="/">
              <button className="flex items-center gap-1.5 text-xs text-[#AEAEB2] hover:text-[#1D1D1F] transition-colors px-2 py-1.5 rounded-lg hover:bg-black/[0.04]">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] z-40 flex pb-safe">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isNew = href === "/assessment/new"
          const active = isNew ? false : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2.5 text-[10px] font-medium transition-colors min-h-[52px]",
                isNew ? "text-[#1D1D1F]" : active ? "text-[#1D1D1F]" : "text-[#AEAEB2]"
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
