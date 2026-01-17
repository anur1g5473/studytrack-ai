"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Clock, BarChart3, Settings, Menu, X, Brain, Zap, CalendarIcon, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Syllabus",
    href: "/syllabus",
    icon: BookOpen,
  },
  {
    name: "Focus",
    href: "/focus",
    icon: Clock,
    disabled: false,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    disabled: false,
  },
  {
  name: "AI Advisor",
  href: "/ai-advisor",
  icon: Brain,
},
{
  name: "Flashcards",
  href: "/flashcards",
  icon: Zap, // Import Zap from lucide-react
},

// ... inside navItems array:
{
  name: "Planner",
  href: "/planner",
  icon: CalendarIcon,
},
{
  name: "Leaderboard",
  href: "/leaderboard",
  icon: Trophy,
},
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static left-0 top-0 h-screen w-64 bg-gray-900/50 border-r border-gray-800 transition-transform duration-300 z-30 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.disabled && (
                  <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded text-gray-500">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">XP Level Progress</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: "45%" }}
              />
            </div>
            <p className="text-xs text-gray-400">550 / 1000 XP</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}