import { supabaseClient } from '$lib/supabase';
import { courseProgress } from '$lib/stores/courseProgress';
import type { User } from '@supabase/supabase-js';

interface CourseProgressRecord {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed_at: string;
  created_at: string;
}

export async function loadUserProgress(user: User) {
  const { data, error } = await supabaseClient
    .from('course_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Fehler beim Laden des Fortschritts:', error);
    return;
  }

  const progress = (data as CourseProgressRecord[]).reduce(
    (acc: Record<string, Record<string, boolean>>, record) => {
      if (!acc[record.course_id]) {
        acc[record.course_id] = {};
      }
      acc[record.course_id][record.lesson_id] = true;
      return acc;
    },
    {}
  );

  // Update store mit dem neuen Fortschritt
  courseProgress.reset();
  Object.entries(progress).forEach(([courseId, lessons]) => {
    Object.entries(lessons).forEach(([lessonId, completed]) => {
      if (completed) {
        courseProgress.markLessonComplete(courseId, lessonId);
      }
    });
  });
}

export async function saveLessonProgress(
  user: User,
  courseId: string,
  lessonId: string,
  completed: boolean
) {
  if (completed) {
    const { error } = await supabaseClient.from('course_progress').upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString()
    });

    if (error) {
      console.error('Fehler beim Speichern des Fortschritts:', error);
      return;
    }

    courseProgress.markLessonComplete(courseId, lessonId);
  } else {
    const { error } = await supabaseClient
      .from('course_progress')
      .delete()
      .match({ user_id: user.id, course_id: courseId, lesson_id: lessonId });

    if (error) {
      console.error('Fehler beim Löschen des Fortschritts:', error);
      return;
    }

    courseProgress.markLessonIncomplete(courseId, lessonId);
  }
}