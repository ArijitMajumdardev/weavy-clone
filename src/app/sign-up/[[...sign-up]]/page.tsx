import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen w-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-sm text-[#a3a3a3]">
            Start building visual AI workflows today
          </p>
        </div>

        {/* Sign Up Component */}
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-primary shadow-2xl border border-[#3a3a3a]",
                headerTitle: "text-white",
                headerSubtitle: "text-[#a3a3a3]",
                socialButtonsBlockButton: "bg-[#2a2a2a] border-[#3a3a3a] text-white hover:bg-[#353438]",
                formButtonPrimary: "bg-accent text-black hover:opacity-90",
                formFieldInput: "bg-[#2a2a2a] border-[#3a3a3a] text-white",
                footerActionLink: "text-accent hover:text-accent/80",
                identityPreviewText: "text-white",
                formFieldLabel: "text-[#e5e5e5]",
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#6b7280]">
            Build visual AI workflows with ease
          </p>
        </div>
      </div>
    </div>
  )
}