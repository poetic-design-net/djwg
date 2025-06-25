export default {
  name: 'pricingPlan',
  title: 'Pricing Plan',
  type: 'document',
  fields: [
    { name: 'key', type: 'string', title: 'Key (z.B. monthly)' },
    { name: 'id', type: 'string', title: 'Stripe Product ID' },
    { name: 'name', type: 'string', title: 'Name' },
    { name: 'description', type: 'string', title: 'Beschreibung' },
    { name: 'price', type: 'number', title: 'Preis (in Cent)' },
    { name: 'originalPrice', type: 'number', title: 'Originalpreis (in Cent)' },
    { name: 'interval', type: 'string', title: 'Intervall (month/year)' },
    { name: 'intervalCount', type: 'number', title: 'Intervall-Anzahl' },
    {
      name: 'features',
      type: 'array',
      title: 'Features',
      of: [{ type: 'string' }]
    }
  ]
} 