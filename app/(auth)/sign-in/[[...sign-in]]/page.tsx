import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-black">V</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-1">Sign in to your Viability First account</p>
      </div>
      <SignIn />
    </div>
  )
}
