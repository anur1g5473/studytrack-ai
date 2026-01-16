export type SessionMode = "pomodoro" | "deep-work" | "custom";

export type MoodEnvironment = {
  id: string;
  name: string;
  bgColor: string;
  ambientAudio?: string; // URL to audio
  description: string;
  icon: string;
};

export type FocusSession = {
  id: string;
  user_id: string;
  subject_id?: string;
  topic_id?: string;
  duration_minutes: number;
  mood_environment: string;
  xp_earned: number;
  completed: boolean;
  distraction_count: number;
  distractions: Distraction[];
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Distraction = {
  type: "phone" | "alert" | "mind-wandering" | "confusion" | "tiredness" | "other";
  timestamp: string;
  note?: string;
};

export const MOOD_ENVIRONMENTS: MoodEnvironment[] = [
  {
    id: "focus",
    name: "Focus",
    bgColor: "from-indigo-600 to-blue-600",
    description: "Clean, minimalist environment",
    icon: "🎯",
  },
  {
    id: "cafe",
    name: "Cafe Chill",
    bgColor: "from-amber-600 to-orange-600",
    description: "Ambient cafe sounds",
    icon: "☕",
  },
  {
    id: "rain",
    name: "Rainy Day",
    bgColor: "from-slate-600 to-blue-700",
    description: "Relaxing rain sounds",
    icon: "🌧️",
  },
  {
    id: "lofi",
    name: "Lo-Fi Hip Hop",
    bgColor: "from-purple-600 to-pink-600",
    description: "Chill lo-fi beats",
    icon: "🎵",
  },
  {
    id: "forest",
    name: "Forest Ambience",
    bgColor: "from-green-600 to-emerald-600",
    description: "Nature sounds",
    icon: "🌲",
  },
  {
    id: "whitenoise",
    name: "White Noise",
    bgColor: "from-gray-600 to-slate-600",
    description: "Pure white noise",
    icon: "⚪",
  },
];