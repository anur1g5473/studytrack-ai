export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  condition_type: "xp" | "streak" | "sessions" | "level";
  condition_value: number;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
};