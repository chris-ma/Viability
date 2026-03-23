import { AppNav } from "./nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
