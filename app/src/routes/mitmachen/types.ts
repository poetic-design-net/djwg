// FormData-Helfer
export function getFormValue(form: FormData, key: string): string {
  return (form.get(key) as string) || '';
}

export function getFormArrayValue(form: FormData, key: string): string[] {
  return form.getAll(key).map(val => val.toString());
}

// Gemeinsame Felder für alle Anfragetypen
export interface BaseFormFields {
  type: 'artist' | 'aussteller' | 'hersteller';
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Artist-spezifische Felder
export interface ArtistFormFields extends BaseFormFields {
  type: 'artist';
  experience: string;
  instagram?: string;
  soundcloud?: string;
}

// Aussteller-spezifische Felder
export interface ExhibitorFormFields extends BaseFormFields {
  type: 'aussteller';
  website?: string;
  company: string;
  industry: string;
  products: string;
}

// Server-Antwort
export type FormResult = {
  success: true;
  message: string;
} | {
  error: string;
  values: Record<string, any>;
};