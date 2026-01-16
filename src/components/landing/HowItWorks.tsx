"use client";

import { motion } from "framer-motion";
import { Upload, Calendar, Rocket } from "lucide-react";
import { GlowText } from "@/components/ui/GlowText";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Mission Briefing",
    description:
      "Import your syllabus via PDF, text, or manual entry. AI automatically structures everything.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "AI Generates Your Schedule",
    description:
      "Based on your exam date and available hours, AI creates the optimal study plan.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Execute & Level Up",
    description:
      "Use Focus Mode, earn XP, track progress, and let AI guide you to success.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gray-900/30">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-white">How It </span>
            <GlowText variant="accent">Works</GlowText>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get started in three simple steps. Your mission begins now.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative z-10 bg-[#0a0a0f] p-6 rounded-2xl border border-gray-800 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    STEP {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mt-4 mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}