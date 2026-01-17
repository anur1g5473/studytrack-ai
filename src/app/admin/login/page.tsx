import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      
      <AdminLoginForm />
      
      <div className="mt-8 text-center text-gray-600 text-xs">
        <p>System v1.0.4 • Secure Connection</p>
        <p className="mt-1">Unauthorized access attempts will be logged.</p>
      </div>
    </div>
  );
}