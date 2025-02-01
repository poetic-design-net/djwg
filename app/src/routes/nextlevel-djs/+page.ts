import type { DJCourse } from '$lib/sanity/queries/djCourses';
import type { NextLevelDjsPage } from '$lib/sanity/queries/nextLevelDjs';
import type { PageLoad } from './$types';

export interface PageData {
  courses: DJCourse[];
  pageData: NextLevelDjsPage;
}

export const load: PageLoad<PageData> = async ({ data }) => {
  return {
    courses: data.courses,
    pageData: data.pageData
  };
};