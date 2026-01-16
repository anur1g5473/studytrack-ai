"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Timer,
  BarChart3,
  Sparkles,
  Layers,
} from "lucide-react";
import { GlowText } from "@/components/ui/GlowText";

const features = [
  {
    icon: Brain,
    title: "AI Syllabus Builder",
    description:
      "Upload your syllabus and let AI structure it into subjects, chapters, and topics automatically.",
    color: "indigo",
  },
  {
    icon: Target,
    title: "Dynamic Planner",
    description:
      "AI creates your optimal study schedule based on exam dates, difficulty, and your pace.",
    color: "cyan",
  },
  {
    icon: Timer,
    title: "Immersive Focus Mode",
    description:
      "Distraction-free study sessions with Pomodoro timer, ambient sounds, and XP rewards.",
    color: "indigo",
  },
  {
    icon: Sparkles,
    title: "Smart Flashcards",
    description:
      "AI-generated flashcards with spaced repetition to boost long-term memory retention.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Intelligent Analytics",
    description:
      "Track your progress with forgetting curves, focus heatmaps, and personalized insights.",
    color: "indigo",
  },
  {
    icon: Layers,
    title: "Mission Gamification",
    description:
      "Earn XP, unlock achievements, maintain streaks, and level up as you conquer your syllabus.",
    color: "cyan",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-white">Powerful </span>
            <GlowText variant="primary">Features</GlowText>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to transform your study experience into an
            efficient, engaging mission.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === "indigo"
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "bg-cyan-600/20 text-cyan-400"
                }`}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>

              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                  feature.color === "indigo"
                    ? "bg-gradient-to-br from-indigo-600/5 to-transparent"
                    : "bg-gradient-to-br from-cyan-600/5 to-transparent"
                }`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}