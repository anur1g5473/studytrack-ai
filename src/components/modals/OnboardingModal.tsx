"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Zap, Target, Brain, X } from "lucide-react";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const steps = [
  {
    title: "Welcome to Mission Control",
    desc: "Your central hub for academic excellence. Let's get you briefed.",
    icon: <Zap className="w-12 h-12 text-yellow-400" />,
  },
  {
    title: "Step 1: Set Your Syllabus",
    desc: "Go to the 'Syllabus' tab to add your subjects and topics. This is your mission map.",
    icon: <Target className="w-12 h-12 text-red-400" />,
  },
  {
    title: "Step 2: Use AI Advisor",
    desc: "Stuck? Ask your AI Advisor for study plans, explanations, or motivation.",
    icon: <Brain className="w-12 h-12 text-indigo-400" />,
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

          {/* Close */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center py-6">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-800 rounded-full border border-gray-700">
                  {steps[currentStep].icon}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {steps[currentStep].desc}
              </p>
            </motion.div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? "bg-indigo-500 w-6" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>

            {/* Button */}
            <Button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onClose();
                }
              }}
              className="w-full"
              size="lg"
            >
              {currentStep < steps.length - 1 ? "Next Briefing" : "Start Mission"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}