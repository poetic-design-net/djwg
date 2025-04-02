import { client } from '../client';

export const awardQuery = `*[_type == "award"][0] {
    evaluationCriteriaTitle,
    evaluationCriteriaSubtitle,
    liveBattleTitle,
    hero {
      heading,
      subheading,
      eyebrow,
      backgroundImages[] {
        ...,
        asset->
      },
      primaryButton {
        text,
        link
      },
      secondaryButton {
        text,
        link
      }
    },
    introText,
    preselectionCriteria {
      title,
      mixSetTitle,
      mixSetDescription,
      mixSetPercentage,
      onlinePresenceTitle,
      onlinePresenceDescription,
      onlinePresencePercentage
    },
    totalProgressBar {
      title
    },
    evaluationCriteria[] {
      title,
      description,
      icon
    },
    artistsSection {
      title,
      subtitle,
      isLineupRevealed,
      artists[]-> {
        _id,
        name,
        role,
        image {
          ...,
          asset->
        },
        socials,
        slug
      }
    },
    ticket-> {
      _id,
      phase,
      title,
      description,
      features,
      status,
      price,
      currency,
      url
    },
    dashboard {
      processInfo[] {
        ...,
        _type == "block" => {...}
      },
      surveyUrl,
      submissionStart,
      submissionEnd,
      isActive
    }
}`;

export async function getAward() {
  const data = await client.fetch(awardQuery);
  return { data };
}