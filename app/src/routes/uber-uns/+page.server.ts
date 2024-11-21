import { client } from '$lib/sanity/client';
import { teamMembersQuery, aboutUsQuery, founderQuery } from '$lib/sanity/queries';
import type { TeamMember, AboutUs, Founder } from '$lib/sanity/queries';

export async function load() {
  const [teamMembers, aboutUs, founder] = await Promise.all([
    client.fetch<TeamMember[]>(teamMembersQuery),
    client.fetch<AboutUs>(aboutUsQuery),
    client.fetch<Founder>(founderQuery)
  ]);

  return {
    teamMembers,
    aboutUs,
    founder
  };
}
