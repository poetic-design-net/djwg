export const navigationSection = (S: any) =>
  S.listItem()
    .title('Navigation')
    .child(
      S.documentList()
        .title('Navigation Menu')
        .filter('_type == "navigation"')
        .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
    )