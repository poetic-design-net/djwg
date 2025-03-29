export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  auth_created_at?: string;
  auth_last_sign_in_at?: string;
  last_seen?: string | null;
  role?: string;
}

export interface EnrichedProfile extends Profile {
  auth_created_at?: string;
  auth_last_sign_in_at?: string;
}

export interface StandardUserMetadata {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  provider?: string;
  provider_id?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: StandardUserMetadata;
  raw_user_meta_data?: {
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
  };
  badges?: Array<{
    badge_id: string;
    [key: string]: any;
  }>;
}
