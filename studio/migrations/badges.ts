import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'kijh3dc6',
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false
  });
const badges = [
    {
        _type: 'badge',
        supabaseId: '3003110f-3664-4a05-b183-955f5f3f7785',
        name: 'Premium',
        description: 'Premium-Mitglied der Community',
        slug: {
            _type: 'slug',
            current: 'premium'
        },
        style: {
            customColor: '#50C878',
            borderStyle: 'solid',
            variant: 'gold'
        },
        permissions: [
            {
                resource: 'premium_content',
                action: 'read'
            },
            {
                resource: 'special_events',
                action: 'read'
            }
        ]
    },
    {
        _type: 'badge',
        supabaseId: '4d2e1bf7-37e7-4226-9239-f8a60f608900',
        name: 'DJ Stufe 1',
        description: 'Erste DJ-Qualifikation erreicht',
        slug: {
            _type: 'slug',
            current: 'dj-level-1'
        },
        style: {
            customColor: '#4CAF50',
            borderStyle: 'solid',
            variant: 'bronze'
        },
        permissions: [
            {
                resource: 'member_area',
                action: 'read'
            }
        ]
    }
];

const createBadges = async (projectId: string, token: string) => {
    // Aktualisiere Client-Konfiguration mit den übergebenen Werten
    client.config({
        projectId,
        token
    });

    try {
        console.log('🚀 Starting badge migration...');

        for (const badge of badges) {
            // Prüfe, ob der Badge bereits existiert
            const existingBadge = await client.fetch(
                `*[_type == "badge" && supabaseId == $supabaseId][0]`,
                { supabaseId: badge.supabaseId }
            );

            if (existingBadge) {
                console.log(`Updating existing badge: ${badge.name}`);
                await client
                    .patch(existingBadge._id)
                    .set(badge)
                    .commit();
            } else {
                console.log(`Creating new badge: ${badge.name}`);
                await client.create(badge);
            }
        }

        console.log('✅ Badge migration completed successfully!');
    } catch (error) {
        console.error('❌ Error during badge migration:', error);
        process.exit(1);
    }
};

// Hole Projekteinstellungen aus Kommandozeilenargumenten
const [,, projectId, token] = process.argv;

if (!projectId || !token) {
    console.error('Usage: node badges.js <projectId> <token>');
    process.exit(1);
}

createBadges(projectId, token);