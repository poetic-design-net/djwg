export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
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
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  raw_user_meta_data?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description?: string;
}