import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        {/* Logo/Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-white">Study</span>
          <span className="text-indigo-500">Track</span>
          <span className="text-cyan-400">.AI</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-400 mb-8">
          Your AI-Powered Study Mission Control
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full mb-12">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-300">System Operational</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/test"
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            Test Supabase Connection
          </Link>
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-16 text-sm text-gray-500">
          Built with Next.js • Supabase • Tailwind CSS
        </div>
      </div>
    </main>
  );
}