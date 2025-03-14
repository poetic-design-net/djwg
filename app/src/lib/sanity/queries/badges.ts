export const badgesQuery = `*[_type == "badge"] | order(orderRank asc, name asc) {
  orderRank,
  _id,
  supabaseId,
  name,
  description,
  slug,
 icon {
    _type,
    asset->,
    hotspot,
    alt 
    },
  style {
    customColor,
    borderStyle,
    variant
  },
  permissions[] {
    resource,
    action
  }
}`;

export const badgeBySupabaseIdQuery = `*[_type == "badge" && supabaseId == $supabaseId][0] {
  orderRank,
  _id,
  supabaseId,
  name,
  description,
  slug,
  icon {
    _type,
    asset->,
    hotspot,
    alt 
    },  
  style {
    customColor,
    borderStyle,
    variant
  },
  permissions[] {
    resource,
    action
  }
}`;
