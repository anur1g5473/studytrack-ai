import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  colorClass: string; // e.g., "text-blue-400 bg-blue-500/20"
};

export function StatCard({ title, value, icon: Icon, subtext, colorClass }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-gray-400 text-sm flex justify-between">
        {title}
        {subtext && <span className="text-gray-500">{subtext}</span>}
      </p>
    </div>
  );
}