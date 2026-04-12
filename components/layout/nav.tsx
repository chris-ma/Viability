"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { LayoutDashboard, Lightbulb, Wrench, BookOpen, Plus, Settings, LogOut, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/ideas",      label: "My Ideas",       icon: Lightbulb },
  { href: "/bizad",      label: "BizAd Analyzer", icon: Briefcase },
  { href: "/fix-it",     label: "Fix-It Centre",  icon: Wrench },
  { href: "/resources",  label: "Resources",      icon: BookOpen },
]

const mobileItems = [
  { href: "/dashboard",      label: "Dashboard",  icon: LayoutDashboard },
  { href: "/ideas",          label: "Ideas",      icon: Lightbulb },
  { href: "/assessment/new", label: "New",        icon: Plus },
  { href: "/bizad",          label: "BizAd",      icon: Briefcase },
  { href: "/fix-it",         label: "Fix-It",     icon: Wrench },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Mobile top header ──────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-black/[0.05] h-13 flex items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1D1D1F] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-bold">V</span>
          </div>
          <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">Viability First</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/assessment/new"
            className="flex items-center gap-1.5 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full px-3 py-1.5 shadow-sm hover:bg-black/80 transition-colors active:scale-[0.97]">
            <Plus className="h-3 w-3" />
            New
          </Link>
          <UserButton />
        </div>
      </header>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-black/[0.05] fixed left-0 top-0 z-40">

        {/* Wordmark */}
        <div className="px-5 pt-7 pb-5 border-b border-black/[0.04]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1D1D1F] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold tracking-tight">V</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
              Viability First
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  active
                    ? "bg-[#1D1D1F] text-white font-semibold shadow-sm"
                    : "text-[#6E6E73] font-medium hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                )}
              >
                <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "opacity-90" : "opacity-60")} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom row */}
        <div className="px-4 py-4 border-t border-black/[0.05] space-y-2.5">
          <Link
            href="/assessment/new"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-[#1D1D1F] text-white text-sm font-semibold hover:bg-black/80 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserButton />
              <Link href="/settings" className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">Account</Link>
            </div>
            <SignOutButton redirectUrl="/">
              <button className="flex items-center gap-1.5 text-xs text-[#AEAEB2] hover:text-[#6E6E73] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#F5F5F7]">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-black/[0.05] z-40 flex pb-safe">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isNew = href === "/assessment/new"
          const active = isNew ? false : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2.5 text-[10px] font-semibold transition-colors min-h-[52px]",
                isNew ? "text-[#1D1D1F]" : active ? "text-[#1D1D1F]" : "text-[#AEAEB2]"
              )}
            >
              {isNew ? (
                <div className="w-8 h-8 bg-[#1D1D1F] rounded-xl flex items-center justify-center mb-0.5 shadow-sm">
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
