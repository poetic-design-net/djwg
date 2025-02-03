export interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  website?: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  address_zip?: string;
  address_country?: string;
  phone?: string;
  bio?: string;
  company_name?: string;
  position?: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    soundcloud?: string;
  };
  is_public: boolean;
  created_at?: string;
  last_seen?: string;
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
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description?: string;
}