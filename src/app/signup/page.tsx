import { Navbar } from "@/components/landing/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full mb-4">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-indigo-300 font-medium">
                Mission Initialization
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Initiate Your Study Mission
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Configure your mission parameters. AI will create a personalized
              plan based on your goals.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <AuthForm type="signup" />
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your mission data is encrypted and secure. We never share your
              personal information.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}