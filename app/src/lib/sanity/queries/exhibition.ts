import groq from 'groq'

export const exhibitionHallsQuery = groq`
  *[_type == "exhibitionHall"] | order(order asc, name asc) {
    _id,
    name,
    hallId,
    dimensions,
    floorPlan,
    isSecret,
    order
  }
`

export const exhibitorsQuery = groq`
  *[_type == "exhibitor"] | order(company asc) {
    _id,
    company,
    slug,
    logo,
    category,
    description,
    contact,
    isPremium,
    products,
    isSecret
  }
`

export const exhibitionStandsQuery = groq`
  *[_type == "exhibitionStand"] {
    _id,
    standNumber,
    "hall": hall->{
      _id,
      name,
      hallId,
      dimensions,
      floorPlan,
      isSecret
    },
    "exhibitor": exhibitor->{
      _id,
      company,
      slug,
      logo,
      category,
      description,
      contact,
      isPremium,
      products,
      isSecret
    },
    position,
    size,
    status,
    standType,
    price,
    features,
    notes,
    isSecret
  }
`

export const exhibitionDataQuery = groq`
  {
    "halls": *[_type == "exhibitionHall"] | order(order asc, name asc) {
      _id,
      name,
      hallId,
      dimensions,
      floorPlan,
      isSecret,
      order
    },
    "exhibitors": *[_type == "exhibitor"] | order(company asc) {
      _id,
      company,
      slug,
      logo,
      category,
      description,
      contact,
      isPremium,
      products,
      isSecret
    },
    "stands": *[_type == "exhibitionStand"] {
      _id,
      standNumber,
      "hall": hall->{
        _id,
        name,
        hallId,
        dimensions,
        floorPlan,
        isSecret
      },
      "exhibitor": exhibitor->{
        _id,
        company,
        slug,
        logo,
        category,
        description,
        contact,
        isPremium,
        products,
        isSecret
      },
      position,
      size,
      status,
      standType,
      price,
      features,
      notes,
      isSecret
    }
  }
`