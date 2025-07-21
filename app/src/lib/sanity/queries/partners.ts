export const partnersQuery = `
  *[_type == "partner" && isActive == true] | order(orderRank asc, name asc) {
    _id,
    name,
    slug,
    description,
    logo {
      asset-> {
        _id,
        url
      }
    },
    video {
      asset-> {
        _id,
        url
      }
    },
    website,
    showWebsiteWithoutBadge,
    discountCode,
    discountDescription,
    email,
    emailSubject,
    emailBody,
    isActive,
    orderRank
  }
`;

export const partnerBySlugQuery = `
  *[_type == "partner" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    logo {
      asset-> {
        _id,
        url
      }
    },
    video {
      asset-> {
        _id,
        url
      }
    },
    website,
    showWebsiteWithoutBadge,
    discountCode,
    discountDescription,
    email,
    emailSubject,
    emailBody,
    isActive,
    orderRank
  }
`;