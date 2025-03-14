import type { SanityImage } from '$lib/sanity/image';

export interface Badge {
  id: string;
  supabaseId?: string;
  name: string;
  orderRank?: number;
  description?: string;
  icon?: SanityImage;
  conditions?: {
    minDjGigs?: number;
    minRating?: number;
    requiredBadges?: string[];
    [key: string]: any;
  };
}
export interface UserBadge {
  user_id: string;
  badge_id: string;
  assigned_at: string;
  badge?: Badge;
}
