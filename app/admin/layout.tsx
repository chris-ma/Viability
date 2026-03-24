import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react"

function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
  return admins.includes(email.toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ""
  if (!isAdmin(email)) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-black/[0.06] fixed left-0 top-0 h-full flex flex-col z-40">
        <div className="px-5 pt-6 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1D1D1F] rounded-md flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">V</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1D1D1F]">Viability First</p>
              <p className="text-[10px] text-[#AEAEB2]">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {[
            { href: "/admin", label: "Overview", icon: LayoutDashboard },
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/submissions", label: "Submissions", icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#6E6E73] font-medium hover:bg-black/[0.04] hover:text-[#1D1D1F] transition-all">
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-black/[0.06] space-y-2">
          <Link href="/dashboard"
            className="flex items-center gap-2 text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-colors px-2 py-1.5">
            ← Back to app
          </Link>
          <SignOutButton redirectUrl="/">
            <button className="flex items-center gap-2 text-xs text-[#AEAEB2] hover:text-[#1D1D1F] transition-colors px-2 py-1.5 w-full">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
