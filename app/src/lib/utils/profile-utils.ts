import type { Profile, StandardUserMetadata } from '$lib/types/profile';
import type { SupabaseClient } from '@supabase/supabase-js';

interface ProfileField {
  name: string;
  value: any;
  category: string;
  required: boolean;
}

export const REQUIRED_PROFILE_FIELDS: (keyof Profile)[] = [
  'first_name',
  'last_name',
  'username', // Username ist implizit required durch Generierung/Eingabe
  'avatar_url',
  'email',
  'phone',
  'address_city' // Wohnort wieder hinzugefügt
];

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
      { name: 'Profilbild', value: profile?.avatar_url, category: 'basis', required: true },
      { name: 'Biografie', value: profile?.bio, category: 'basis', required: false } // Optional
    ],
    'Kontaktdaten': [
      { name: 'Telefon', value: profile?.phone, category: 'kontakt', required: true },
      { name: 'Wohnort', value: profile?.address_city, category: 'kontakt', required: true } // Wieder erforderlich
    ],
    'Social Media': [
      { name: 'Instagram', value: socialLinks?.instagram, category: 'social', required: true },
      { name: 'Facebook', value: socialLinks?.facebook, category: 'social', required: false },
      { name: 'Soundcloud', value: socialLinks?.soundcloud, category: 'social', required: false }
    ]
  };
}

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  
  // Prüfe die Basis-Felder
  const hasRequiredFields = REQUIRED_PROFILE_FIELDS.every(field => !!profile[field]);
  
  return hasRequiredFields;
}

export function calculateProfileCompletion(profile: Partial<Profile>, socialLinks: {
  instagram?: string;
  facebook?: string;
  soundcloud?: string;
}): number {
  const fields = [
    { value: profile?.first_name, required: true },
    { value: profile?.last_name, required: true },
    { value: profile?.username, required: true },
    { value: profile?.avatar_url, required: true },
    { value: profile?.bio, required: true },
    { value: profile?.phone, required: true },
    { value: profile?.address_city, required: true } // Wieder erforderlich
  ];

  const requiredFields = fields.filter(field => field.required);
  const filledRequiredFields = requiredFields.filter(field => !!field.value);
  return Math.round((filledRequiredFields.length / requiredFields.length) * 100);
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
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function checkAndAssignDJBadge(
  supabase: SupabaseClient,
  userId: string,
  profile: Profile
): Promise<void> {
  if (!isProfileComplete(profile)) return;

  const djBadgeId = '4d2e1bf7-37e7-4226-9239-f8a60f608900'; // DJ Stufe 1 Badge ID

  try {
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', djBadgeId)
      .single();

    if (!existingBadge) {
      await supabase
        .from('user_badges')
        .upsert({
          user_id: userId,
          badge_id: djBadgeId,
          assigned_reason: 'Profil vollständig ausgefüllt'
        });
    }
  } catch (error) {
    console.error('Error checking/assigning DJ badge:', error);
  }
}