export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  mission_goal: string;
  exam_date: string | null;
  daily_study_hours: number;
  xp_points: number;
  current_level: number;
  streak_days: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  id: string;
  subject_id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  chapter_id: string;
  user_id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  estimated_minutes: number;
  status: "not_started" | "in_progress" | "completed";
  notes: string | null;
  order_index: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "id" | "created_at" | "updated_at">;
        Update: Partial<Subject>;
      };
      chapters: {
        Row: Chapter;
        Insert: Omit<Chapter, "id" | "created_at" | "updated_at">;
        Update: Partial<Chapter>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, "id" | "created_at" | "updated_at">;
        Update: Partial<Topic>;
      };
    };
  };
};