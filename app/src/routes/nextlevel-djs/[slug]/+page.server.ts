import { client } from '$lib/sanity/client';
import { djCourseQuery } from '$lib/sanity/queries/djCourses';
import { nextLevelDjsQuery } from '$lib/sanity/queries/nextLevelDjs';
import type { DJCourse } from '$lib/sanity/queries/djCourses';
import type { NextLevelDjsPage } from '$lib/sanity/queries/nextLevelDjs';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
  try {
    // Lade den spezifischen Kurs basierend auf dem Slug
    const course = await client.fetch<DJCourse>(
      `*[_type == "djCourse" && slug.current == $slug][0]`,
      { slug: params.slug }
    );

    if (!course) {
      throw error(404, {
        message: 'Kurs nicht gefunden'
      });
    }

    // Lade die allgemeinen Seiteneinstellungen
    const pageData = await client.fetch<NextLevelDjsPage>(nextLevelDjsQuery);

    return {
      course,
      pageData
    };
  } catch (err) {
    console.error('Error loading course:', err);
    throw error(500, {
      message: 'Fehler beim Laden des Kurses'
    });
  }
};