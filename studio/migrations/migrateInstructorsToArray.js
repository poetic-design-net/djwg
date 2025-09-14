// Migration script to convert single instructor to instructors array
// Run this script using: sanity exec migrations/migrateInstructorsToArray.js --with-user-token

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function migrateInstructors() {
  console.log('Starting migration: Converting instructor to instructors array...');

  try {
    // Fetch all eventSchedule documents
    const schedules = await client.fetch(`
      *[_type == "eventSchedule"] {
        _id,
        _rev,
        days[] {
          date,
          stages[] {
            name,
            schedule[] {
              time,
              title,
              instructor,
              instructors
            }
          }
        }
      }
    `);

    console.log(`Found ${schedules.length} event schedules to check`);

    let migratedCount = 0;

    for (const schedule of schedules) {
      let needsUpdate = false;
      const updatedDays = schedule.days?.map(day => ({
        ...day,
        stages: day.stages?.map(stage => ({
          ...stage,
          schedule: stage.schedule?.map(item => {
            // Check if item has old instructor but no instructors array
            if (item.instructor && (!item.instructors || item.instructors.length === 0)) {
              needsUpdate = true;
              console.log(`  - Migrating: ${item.title} (${item.time})`);
              return {
                ...item,
                instructors: [item.instructor], // Convert to array
                instructorDisplayMode: 'all' // Set default display mode
              };
            }
            return item;
          })
        }))
      }));

      if (needsUpdate) {
        console.log(`Updating schedule: ${schedule._id}`);

        await client
          .patch(schedule._id)
          .set({ days: updatedDays })
          .commit();

        migratedCount++;
        console.log(`✓ Updated schedule ${schedule._id}`);
      }
    }

    console.log(`\nMigration complete! Updated ${migratedCount} schedules.`);

    // Optional: Clean up deprecated instructor field
    const cleanupDeprecated = false; // Set to true to remove old instructor fields
    if (cleanupDeprecated) {
      console.log('\nCleaning up deprecated instructor fields...');

      for (const schedule of schedules) {
        const cleanedDays = schedule.days?.map(day => ({
          ...day,
          stages: day.stages?.map(stage => ({
            ...stage,
            schedule: stage.schedule?.map(item => {
              const { instructor, ...rest } = item;
              return rest;
            })
          }))
        }));

        await client
          .patch(schedule._id)
          .set({ days: cleanedDays })
          .commit();
      }

      console.log('✓ Deprecated fields removed');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateInstructors();