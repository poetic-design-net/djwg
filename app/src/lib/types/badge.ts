export interface Badge {
  id: string;
  name: string;
  description: string;
  slug: string;
  unlockCondition?: string;
  unlockReward?: string;
  style?: {
    customColor?: {
      hex: string;
    };
    variant?: 'gold' | 'silver' | 'bronze' | 'premium' | 'custom';
  };
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  assigned_at: string;
  badge?: Badge;
}