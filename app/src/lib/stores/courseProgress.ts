import { writable } from 'svelte/store';

interface CourseProgress {
  [courseId: string]: {
    [lessonId: string]: boolean;
  };
}

function createCourseProgressStore() {
  const { subscribe, set, update } = writable<CourseProgress>({});

  return {
    subscribe,
    markLessonComplete: (courseId: string, lessonId: string) => {
      update(progress => ({
        ...progress,
        [courseId]: {
          ...progress[courseId],
          [lessonId]: true
        }
      }));
    },
    markLessonIncomplete: (courseId: string, lessonId: string) => {
      update(progress => ({
        ...progress,
        [courseId]: {
          ...progress[courseId],
          [lessonId]: false
        }
      }));
    },
    reset: () => set({})
  };
}

export const courseProgress = createCourseProgressStore();