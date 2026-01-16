import { Navbar } from "@/components/landing/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Access Mission Control
            </h1>
            <p className="text-gray-400">
              Enter your credentials to continue your mission.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <AuthForm type="login" />
          </div>

          {/* Demo Mode (Coming Soon) */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-400">
                Demo Mode: Coming Soon
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}