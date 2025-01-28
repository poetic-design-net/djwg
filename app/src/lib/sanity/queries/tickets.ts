const ticketsQuery = `
  *[_type == "ticket" && references($eventId)] | order(phase asc) {
    _id,
    phase,
    title,
    description,
    features,
    status,
    price,
    currency,
    url
  }
`

export default ticketsQuery
