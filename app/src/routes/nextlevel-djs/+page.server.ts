import { client } from '$lib/sanity/client';
import { djCourseQuery } from '$lib/sanity/queries/djCourses';
import { nextLevelDjsQuery } from '$lib/sanity/queries/nextLevelDjs';
import type { DJCourse } from '$lib/sanity/queries/djCourses';
import type { NextLevelDjsPage } from '$lib/sanity/queries/nextLevelDjs';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Lade alle Kurse
    const courses = await client.fetch<DJCourse[]>(djCourseQuery);

    // Lade die allgemeinen Seiteneinstellungen
    const pageData = await client.fetch<NextLevelDjsPage>(nextLevelDjsQuery);

    return {
      courses,
      pageData
    };
  } catch (err) {
    console.error('Error loading courses:', err);
    throw error(500, {
      message: 'Fehler beim Laden der Kurse'
    });
  }
};