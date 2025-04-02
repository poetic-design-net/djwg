export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  picture?: string;
  avatar_url?: string;
  provider?: string;
  provider_id?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  isAdmin?: string;
}

// Erweitere die Basis-User-Schnittstelle
export interface User {
  id: string;
  email: string;
  badges?: Array<{ badge_id: string }>;
  raw_user_meta_data?: UserMetadata;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    isAdmin?: string;
  };
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    soundcloud?: string;
  };
  last_badge_check?: string;
  first_name?: string;
  last_name?: string;
  badges?: Array<{ badge_id: string }>;
  created_at?: string;
  updated_at?: string;
}

// Typ für die erweiterte Benutzerrolle
export interface ExtendedUser extends User {
  isAdmin?: boolean;
}

// Helper-Funktion zum Überprüfen des Admin-Status
export function isAdmin(user: User): boolean {
  return user.raw_user_meta_data?.isAdmin === 'true' || user.user_metadata?.isAdmin === 'true';
}
