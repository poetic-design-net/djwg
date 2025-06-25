import sanityClient from '@sanity/client';
import pricingPlans from './pricingPlans.json' assert { type: 'json' };

const client = sanityClient({
  projectId: 'kijh3dc6',
  dataset: 'production',
  token: 'sknX31ss7yPiItBP35ZzpffltVrVHjAjC5Qa1bLc3XzR6o2HxZsNejujEaukXJ1mKg0NeXup6vUgBVB2U1TXlQUfqkiPvc1KtydqNYktW4jjySyHkd4yrg6KyAbIoUDTiesTWzECBpVttUP4BuY9bxDEHrK1BE5F3vtdA3MOddmFOpNqzjFj',
  useCdn: false
});

function getId(plan) {
  // Nutze den Key als _id, damit es eindeutig ist
  return `pricingPlan.${plan.key}`;
}

async function importPlans() {
  for (const plan of pricingPlans) {
    const doc = { ...plan, _id: getId(plan) };
    await client.createOrReplace(doc);
    console.log(`Importiert: ${plan.name}`);
  }
}

importPlans().then(() => {
  console.log('Alle Pläne importiert!');
  process.exit(0);
}).catch((err) => {
  console.error('Fehler beim Import:', err);
  process.exit(1);
}); 