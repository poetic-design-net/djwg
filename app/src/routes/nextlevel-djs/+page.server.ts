import { client } from '$lib/sanity/client';
import { djCourseQuery } from '$lib/sanity/queries/djCourses';
import { nextLevelDjsQuery } from '$lib/sanity/queries/nextLevelDjs';
import type { DJCourse } from '$lib/sanity/queries/djCourses';
import type { NextLevelDjsPage } from '$lib/sanity/queries/nextLevelDjs';
import type { PageServerLoad } from './$types';
import { hasRequiredBadges } from '$lib/utils/badge-utils';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // Debug: Log queries
  console.log('DJ Course Query:', djCourseQuery);
  console.log('NextLevel DJs Query:', nextLevelDjsQuery);

  const [courses, pageData] = await Promise.all([
    client.fetch<DJCourse[]>(djCourseQuery),
    client.fetch<NextLevelDjsPage>(nextLevelDjsQuery)
  ]);

  // Debug: Log results
  console.log('Courses:', courses);
  console.log('Page Data:', pageData);

  // Wenn Coming Soon aktiviert ist, zeigen wir die Coming Soon Seite
  if (pageData.showComingSoon) {
    return {
      courses,
      pageData
    };
  }

  // Debug: Log user information
  console.log('User:', locals.user);
  console.log('User Badges:', locals.user?.badges);
  console.log('Required Badges:', pageData.requiredBadges);

  // Wenn keine Badges erforderlich sind, gewähre Zugriff
  if (!pageData.requiredBadges || pageData.requiredBadges.length === 0) {
    return {
      courses,
      pageData
    };
  }

  // Wenn der User keine Badges hat, verweigere Zugriff
  if (!locals.user?.badges || locals.user.badges.length === 0) {
    throw error(403, {
      message: 'Du hast keine Berechtigung, diese Seite zu sehen.'
    });
  }

  // Konvertiere die Badge IDs in ein Set für schnelleren Zugriff
  const userBadgeIds = new Set(locals.user.badges.map(ub => ub.badge_id));
  
  // Prüfe ob der User mindestens eines der erforderlichen Badges hat
  const hasRequiredBadge = pageData.requiredBadges.some(badge =>
    userBadgeIds.has(badge.supabaseId)
  );

  if (!hasRequiredBadge) {
    throw error(403, {
      message: 'Du hast keine Berechtigung, diese Seite zu sehen.'
    });
  }

  return {
    courses,
    pageData
  };
};