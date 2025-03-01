// Form Types
export type UserType = 'artist' | 'aussteller' | 'hersteller';

// Benefit Types
export interface Benefit {
  title: string;
  description: string;
}

// Package Types
export interface Package {
  id: string;
  title: string;
  price: string;
  features: string[];
}

export interface AddOn {
  id: string;
  title: string;
  price: string;
  availableFor: string[];
}

// Form Field Props
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
  value?: string;
  placeholder?: string;
  options?: ExperienceLevel[];
}

// Form Data Types
export interface ExperienceLevel {
  value: string;
  label: string;
}

export interface WizardFormData {
  // Gemeinsame Felder
  type: UserType;
  name: string;
  email: string;
  phone: string;
  message: string;
  
  // Artist-spezifische Felder
  experience: string;
  instagram: string;
  soundcloud: string;
  
  // Aussteller/Hersteller-spezifische Felder
  website: string;
  company: string;
  industry: string;
  products: string;
  
  // Hersteller-spezifische Felder
  package: string;
  addOns: string[];
  accommodation: {
    needed: boolean;
    persons: number;
    roomType: string;
  };
}

// Section Data Types
export interface SectionData {
  title: string;
  description: string;
  benefits?: Benefit[];
  experienceLevels?: ExperienceLevel[];
  packages?: Package[];
  addOns?: AddOn[];
}

// Event Types
export interface TypeSelectEvent {
  type: UserType;
}

export interface BasicInfoUpdateEvent extends Partial<WizardFormData> {
  [key: string]: any;
}

export interface PackageSelectEvent {
  package: string;
}

export interface AddOnsUpdateEvent {
  addOns: string[];
  accommodation: {
    needed: boolean;
    persons: number;
    roomType: string;
  };
}

export interface AddOnsSelectEvent extends AddOnsUpdateEvent {
  selectedPackage: string;
  selectedAddOns: string[];
}

// Component Props Types
export interface FormSelectProps {
  label: string;
  name: string;
  value?: string;
  options: ExperienceLevel[];
  required?: boolean;
  error?: string;
}

// Form Response Types
export interface FormResponse {
  success?: boolean;
  error?: string;
  message?: string;
  values?: Record<string, any>;
}