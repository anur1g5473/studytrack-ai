import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Sidebar } from "@/components/shared/Sidebar";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}