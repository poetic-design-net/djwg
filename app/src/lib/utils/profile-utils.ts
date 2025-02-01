import type { Profile, StandardUserMetadata } from '$lib/types/profile';

interface ProfileField {
  name: string;
  value: any;
  category: string;
  required: boolean;
}

export function normalizeUserMetadata(user: any): StandardUserMetadata {
  // Google Auth
  if (user.raw_user_meta_data?.provider === 'google') {
    const fullName = user.raw_user_meta_data.name || '';
    const [firstName = '', ...lastNameParts] = fullName.split(' ');
    return {
      first_name: firstName,
      last_name: lastNameParts.join(' '),
      email: user.email,
      avatar_url: user.raw_user_meta_data.picture,
      provider: 'google',
      provider_id: user.raw_user_meta_data.provider_id
    };
  }
  
  // Email Auth
  return {
    first_name: user.raw_user_meta_data?.first_name || '',
    last_name: user.raw_user_meta_data?.last_name || '',
    email: user.email,
    provider: 'email'
  };
}

export function getProfileFields(profile: Partial<Profile>, socialLinks: {
  instagram?: string;
  facebook?: string;
  soundcloud?: string;
}): { [key: string]: ProfileField[] } {
  return {
    'Basis-Informationen': [
      { name: 'Vorname', value: profile?.first_name, category: 'basis', required: true },
      { name: 'Nachname', value: profile?.last_name, category: 'basis', required: true },
      { name: 'Username', value: profile?.username, category: 'basis', required: true },
      { name: 'Profilbild', value: profile?.avatar_url, category: 'basis', required: false },
      { name: 'Biografie', value: profile?.bio, category: 'basis', required: false }
    ],
    'Kontaktdaten': [
      { name: 'Telefon', value: profile?.phone, category: 'kontakt', required: false },
      { name: 'Straße', value: profile?.address_street, category: 'kontakt', required: false },
      { name: 'Stadt', value: profile?.address_city, category: 'kontakt', required: false },
      { name: 'PLZ', value: profile?.address_zip, category: 'kontakt', required: false },
      { name: 'Land', value: profile?.address_country, category: 'kontakt', required: false }
    ],
    'Social Media': [
      { name: 'Instagram', value: socialLinks?.instagram, category: 'social', required: false },
      { name: 'Facebook', value: socialLinks?.facebook, category: 'social', required: false },
      { name: 'Soundcloud', value: socialLinks?.soundcloud, category: 'social', required: false }
    ]
  };
}

export function calculateProfileCompletion(profile: Partial<Profile>, socialLinks: {
  instagram?: string;
  facebook?: string;
  soundcloud?: string;
}) {
  const fields = [
    profile?.first_name,
    profile?.last_name,
    profile?.username,
    profile?.avatar_url,
    profile?.bio,
    profile?.phone,
    profile?.address_street,
    profile?.address_city,
    profile?.address_zip,
    profile?.address_country
  ];

  const socialFields = [
    socialLinks?.instagram,
    socialLinks?.facebook,
    socialLinks?.soundcloud
  ];

  // Basis-Felder (80% des Gesamtprozentsatzes)
  const filledFields = fields.filter(field => !!field).length;
  const basePercentage = (filledFields / fields.length) * 80;

  // Social Media als Bonus (20% des Gesamtprozentsatzes)
  const filledSocialFields = socialFields.filter(field => !!field).length;
  const socialPercentage = (filledSocialFields / socialFields.length) * 20;

  return Math.min(100, Math.round(basePercentage + socialPercentage));
}

export function calculateCategoryCompletion(fields: ProfileField[]): number {
  const requiredFields = fields.filter(field => field.required);
  if (requiredFields.length === 0) {
    const filledFields = fields.filter(field => !!field.value).length;
    return Math.round((filledFields / fields.length) * 100);
  }
  
  const filledRequiredFields = requiredFields.filter(field => !!field.value).length;
  return Math.round((filledRequiredFields / requiredFields.length) * 100);
}

export function getNextRequiredField(profileFields: { [key: string]: ProfileField[] }): string | null {
  for (const [category, fields] of Object.entries(profileFields)) {
    for (const field of fields) {
      if (field.required && !field.value) {
        return `${category}: ${field.name}`;
      }
    }
  }
  return null;
}

export function generateUsername(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    .replace(/[^a-z0-9-]/g, '') // Entferne alle nicht-alphanumerischen Zeichen außer Bindestriche
    .replace(/-+/g, '-') // Ersetze mehrere aufeinanderfolgende Bindestriche durch einen
    .replace(/^-|-$/g, ''); // Entferne Bindestriche am Anfang und Ende
}