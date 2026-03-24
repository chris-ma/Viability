import { AppNav } from "./nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppNav />
      {/* lg:ml-60 offsets desktop sidebar; pb-24 clears mobile bottom tab bar */}
      <main className="lg:ml-60 pb-24 lg:pb-10">
        {children}
      </main>
    </div>
  )
}
