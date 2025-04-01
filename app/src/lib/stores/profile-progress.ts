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
     'phone' |
     'address_city' // Hinzufügen von address_city zum Typ
   >;
  label: string;
}

const requiredFields: RequiredField[] = [
  { key: 'first_name', label: 'Basis-Informationen: Vorname' },
  { key: 'last_name', label: 'Basis-Informationen: Nachname' },
  { key: 'username', label: 'Basis-Informationen: Username' },
  { key: 'bio', label: 'Über mich: Bio' },
  { key: 'avatar_url', label: 'Basis-Informationen: Profilbild' },
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
  const actualRequiredFields: RequiredField[] = [
    { key: 'first_name', label: 'Basis-Informationen: Vorname' },
    { key: 'last_name', label: 'Basis-Informationen: Nachname' },
    { key: 'username', label: 'Basis-Informationen: Username' },
    { key: 'avatar_url', label: 'Basis-Informationen: Profilbild' },
    { key: 'phone', label: 'Kontakt: Telefon' },
    { key: 'address_city', label: 'Adresse: Stadt' } // Wieder hinzugefügt
  ];

  fieldsCompleted = actualRequiredFields.filter(field => !!profile[field.key]).length;
  return Math.round((fieldsCompleted / actualRequiredFields.length) * 100);
}

// Find the next missing field
function findNextMissingField(
  profile: Partial<Profile>,
  socialLinks: Partial<SocialLinks>
): string | null {
  const actualRequiredFields: RequiredField[] = [
    { key: 'first_name', label: 'Basis-Informationen: Vorname' },
    { key: 'last_name', label: 'Basis-Informationen: Nachname' },
    { key: 'username', label: 'Basis-Informationen: Username' },
    { key: 'avatar_url', label: 'Basis-Informationen: Profilbild' },
    { key: 'phone', label: 'Kontakt: Telefon' },
    { key: 'address_city', label: 'Adresse: Stadt' } // Wieder hinzugefügt
  ];

  for (const field of actualRequiredFields) {
    if (!profile[field.key]) {
      return field.label;
    }
  }
  return null;
}

// Create the writable store
const createProfileProgressStore = () => {
  const initialState: ProfileProgressState = {
    percentage: 0,
    nextRequiredField: null,
    fieldsCompleted: 0,
    totalFields: 6, // Jetzt 6 Pflichtfelder
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
      
      const actualRequiredFields: RequiredField[] = [
        { key: 'first_name', label: 'Basis-Informationen: Vorname' },
        { key: 'last_name', label: 'Basis-Informationen: Nachname' },
        { key: 'username', label: 'Basis-Informationen: Username' },
        { key: 'avatar_url', label: 'Basis-Informationen: Profilbild' },
        { key: 'phone', label: 'Kontakt: Telefon' },
        { key: 'address_city', label: 'Adresse: Stadt' } // Wieder hinzugefügt
      ];
      const fieldsCompleted = actualRequiredFields.filter(field => !!profile[field.key]).length;
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
        totalFields: actualRequiredFields.length,
        lastPercentage: newPercentage
      });
    },
    reset: () => set(initialState)
  };
};

export const profileProgress = createProfileProgressStore();