import groq from 'groq';

export interface NextLevelDjsPage {
  showComingSoon: boolean;
  comingSoon?: {
    backgroundImage: any;
    title: string;
    subtitle: string;
    description: string;
    footerText: string;
    comingSoonText: string;
  };
  requiredBadges: {
    _id: string;
    name: string;
    slug: {
      current: string;
    };
    supabaseId: string;
    permissions: Array<{
      resource: string;
      action: string;
    }>;
  }[];
}

export const nextLevelDjsQuery = groq`*[_type == "nextLevelDjs"][0] {
  showComingSoon,
  comingSoon {
    backgroundImage,
    title,
    subtitle,
    description,
    footerText,
    comingSoonText
  },
  requiredBadges[]-> {
    _id,
    name,
    slug {
      current
    },
    supabaseId,
    permissions
  }
}`;