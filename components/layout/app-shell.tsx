import { AppNav } from "./nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppNav />
      {/* pb-24 gives clearance for the mobile bottom tab bar + iOS home indicator */}
      <main className="lg:ml-60 pb-24 lg:pb-10">
        {children}
      </main>
    </div>
  )
}
