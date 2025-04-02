import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { DJCourse } from '$lib/sanity/queries/djCourses';
import type { NextLevelDjsPage } from '$lib/sanity/queries/nextLevelDjs';

export interface PageData {
  supabase: SupabaseClient;
  session: Session | null;
  user: any;
  preview: boolean;
  navigation: any[];
  pages: Record<string, any>;
  footerSettings: any;
  course: DJCourse;
  pageData: NextLevelDjsPage;
}

// Type für die Kapitel und Lektionen
export interface Chapter {
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  resources?: Resource[];
}

export interface Resource {
  title: string;
  fileUrl: string;
}