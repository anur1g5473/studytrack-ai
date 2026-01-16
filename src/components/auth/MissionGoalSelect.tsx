"use client";

import { cn } from "@/lib/utils";
import { Target, GraduationCap, Building, Briefcase, Globe } from "lucide-react";

const missionGoals = [
  {
    id: "NEET",
    label: "NEET",
    description: "Medical entrance examination",
    icon: Target,
    color: "bg-red-500/20 text-red-400",
  },
  {
    id: "JEE",
    label: "JEE",
    description: "Engineering entrance examination",
    icon: GraduationCap,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "College",
    label: "College",
    description: "University or college courses",
    icon: Building,
    color: "bg-green-500/20 text-green-400",
  },
  {
    id: "Skill-Learning",
    label: "Skill Learning",
    description: "Professional skills development",
    icon: Briefcase,
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "Other",
    label: "Other",
    description: "Custom learning goal",
    icon: Globe,
    color: "bg-gray-500/20 text-gray-400",
  },
];

type MissionGoalSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MissionGoalSelect({ value, onChange }: MissionGoalSelectProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-300">Select Your Mission Goal</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {missionGoals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = value === goal.id;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onChange(goal.id)}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 text-left",
                isSelected
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-gray-800 hover:border-gray-700 bg-gray-900/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${goal.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-white">{goal.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {goal.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}