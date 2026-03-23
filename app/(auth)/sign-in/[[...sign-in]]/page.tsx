import { SignIn } from "@clerk/nextjs"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#1D1D1F] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Welcome back</h1>
        <p className="text-[#6E6E73] mt-1.5 text-sm">Sign in to your Viability First account</p>
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
