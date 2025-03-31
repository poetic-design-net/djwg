import { writable } from 'svelte/store';
import type { Profile } from '$lib/types/profile';
import { toasts } from '$lib/stores/toast';

// Browser-Check Hilfsfunktion
const isBrowser = () => {
  return typeof window !== 'undefined';
};

interface ProfileProgressState {
  percentage: number;
  nextRequiredField: string | null;
  fieldsCompleted: number;
  totalFields: number;
  lastPercentage: number;
}

interface RequiredField {
  key: keyof Pick<Profile, 
    'first_name' | 
    'last_name' | 
    'username' | 
    'bio' | 
    'avatar_url' | 
    'address_street' | 
    'address_number' | 
    'address_city' | 
    'address_zip' | 
    'address_country' | 
    'website' | 
    'phone'
  >;
  label: string;
}

// Helper function to calculate which fields are required
const requiredFields: RequiredField[] = [
  { key: 'first_name', label: 'Basis-Informationen: Vorname' },
  { key: 'last_name', label: 'Basis-Informationen: Nachname' },
  { key: 'username', label: 'Basis-Informationen: Username' },
  { key: 'bio', label: 'Über mich: Bio' },
  { key: 'avatar_url', label: 'Basis-Informationen: Profilbild' },
  { key: 'address_street', label: 'Adresse: Straße' },
  { key: 'address_number', label: 'Adresse: Hausnummer' },
  { key: 'address_city', label: 'Adresse: Stadt' },
  { key: 'address_zip', label: 'Adresse: PLZ' },
  { key: 'address_country', label: 'Adresse: Land' },
  { key: 'website', label: 'Kontakt: Website' },
  { key: 'phone', label: 'Kontakt: Telefon' }
];

type SocialLinks = NonNullable<Profile['social_links']>;

// Create a function to calculate profile completion
export function calculateProfileCompletion(
  profile: Partial<Profile> = {},
  socialLinks: Partial<SocialLinks> = {}
): number {
  if (!profile) return 0;

  let fieldsCompleted = 0;
  let totalFields = requiredFields.length;

  // Check required fields
  for (const field of requiredFields) {
    if (profile[field.key]) {
      fieldsCompleted++;
    }
  }

  // Add social media fields
  totalFields += 3; // Add Instagram, Facebook, SoundCloud
  if (socialLinks.instagram) fieldsCompleted++;
  if (socialLinks.facebook) fieldsCompleted++;
  if (socialLinks.soundcloud) fieldsCompleted++;

  return Math.round((fieldsCompleted / totalFields) * 100);
}

// Find the next missing field
function findNextMissingField(
  profile: Partial<Profile>,
  socialLinks: Partial<SocialLinks>
): string | null {
  // Check required fields first
  for (const field of requiredFields) {
    if (!profile[field.key]) {
      return field.label;
    }
  }

  // Check social links
  if (!socialLinks.instagram) return 'Kontakt: Instagram';
  if (!socialLinks.facebook) return 'Kontakt: Facebook';
  if (!socialLinks.soundcloud) return 'Kontakt: SoundCloud';

  return null;
}

// Create the writable store
const createProfileProgressStore = () => {
  const initialState: ProfileProgressState = {
    percentage: 0,
    nextRequiredField: null,
    fieldsCompleted: 0,
    totalFields: requiredFields.length + 3, // +3 for social media
    lastPercentage: 0
  };

  const { subscribe, set, update } = writable<ProfileProgressState>(initialState);

  return {
    subscribe,
    update: (
      profile: Partial<Profile> = {},
      socialLinks: Partial<SocialLinks> = {}
    ) => {
      const percentage = calculateProfileCompletion(profile, socialLinks);
      const nextRequiredField = findNextMissingField(profile, socialLinks);
      
      // Count completed fields
      let fieldsCompleted = 0;
      for (const field of requiredFields) {
        if (profile[field.key]) fieldsCompleted++;
      }
      if (socialLinks.instagram) fieldsCompleted++;
      if (socialLinks.facebook) fieldsCompleted++;
      if (socialLinks.soundcloud) fieldsCompleted++;
      
      const newPercentage = calculateProfileCompletion(profile, socialLinks);
      const lastPercentage = initialState.lastPercentage;
      
      let toastShown = false;
      if (isBrowser()) {
        toastShown = !!localStorage.getItem('profile100ToastShown');
      }
      
      // Zeige Toast nur wenn der Fortschritt von unter 100% auf 100% steigt
      if (newPercentage === 100 && lastPercentage < 100 && !toastShown) {
        setTimeout(() => {
          if (!isBrowser()) return;
          toasts.success('🎉 Glückwunsch! Dein Profil ist zu 100% ausgefüllt!');
          localStorage.setItem('profile100ToastShown', 'true');
        }, 500);
      }
      
      set({
        percentage: newPercentage,
        nextRequiredField,
        fieldsCompleted,
        totalFields: requiredFields.length + 3,
        lastPercentage: newPercentage
      });
    },
    reset: () => set(initialState)
  };
};

export const profileProgress = createProfileProgressStore();