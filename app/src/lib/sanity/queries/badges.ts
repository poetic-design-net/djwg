export const badgesQuery = `*[_type == "badge"] {
  _id,
  supabaseId,
  name,
  description,
  slug,
  "icon": icon.asset->{
    url
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
  _id,
  supabaseId,
  name,
  description,
  slug,
  "icon": icon.asset->{
    url
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