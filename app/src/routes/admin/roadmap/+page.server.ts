import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { TaskStatus } from '$lib/types/project-management';

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.supabase.auth.getSession();
    
    if (!session.data.session?.user) {
        throw redirect(303, '/');
    }

    // Hole das Profil des aktuellen Benutzers
    const { data: profile, error: profileError } = await locals.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.data.session.user.id)
        .single();

    if (!profile?.role || profile.role !== 'admin') {
        throw redirect(303, '/');
    }

    try {
        const { data: items, error: itemsError } = await locals.supabase
            .from('roadmap_items')
            .select(`
                *,
                tags:roadmap_tags(
                    tag:tags(*)
                )
            `)
            .order('priority', { ascending: false });

        if (itemsError) {
            console.error('Error fetching roadmap items:', itemsError);
            return {
                items: [],
                tags: []
            };
        }

        const { data: tags, error: tagsError } = await locals.supabase
            .from('tags')
            .select('*')
            .order('name');

        if (tagsError) {
            console.error('Error fetching tags:', tagsError);
            return {
                items: items || [],
                tags: []
            };
        }

        return {
            items: items || [],
            tags: tags || []
        };
    } catch (e) {
        console.error('Server error:', e);
        return {
            items: [],
            tags: []
        };
    }
};

export const actions: Actions = {
    createItem: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const target_date = formData.get('target_date');
        const priority = parseInt(formData.get('priority')?.toString() || '0', 10);
        const status = formData.get('status') as TaskStatus;
        const tagIds = formData.getAll('tags');

        if (!title || !status) {
            return fail(400, { error: 'Titel und Status sind erforderlich' });
        }

        try {
            const { data: item, error: insertError } = await locals.supabase
                .from('roadmap_items')
                .insert({
                    title,
                    description,
                    target_date,
                    priority,
                    status,
                    created_by: session.data.session.user.id
                })
                .select()
                .single();

            if (insertError || !item) {
                throw insertError;
            }

            if (tagIds.length > 0) {
                const tagConnections = tagIds.map(tagId => ({
                    roadmap_id: item.id,
                    tag_id: tagId
                }));

                const { error: tagError } = await locals.supabase
                    .from('roadmap_tags')
                    .insert(tagConnections);

                if (tagError) {
                    console.error('Error adding tags:', tagError);
                }
            }

            return { success: true };
        } catch (e) {
            console.error('Error creating roadmap item:', e);
            return fail(500, { error: 'Fehler beim Erstellen des Eintrags' });
        }
    },

    updateStatus: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const status = formData.get('status') as TaskStatus;

        if (!id || !status) {
            return fail(400, { error: 'ID und Status sind erforderlich' });
        }

        try {
            const { error: updateError } = await locals.supabase
                .from('roadmap_items')
                .update({ status })
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error updating status:', e);
            return fail(500, { error: 'Fehler beim Aktualisieren des Status' });
        }
    },

    updatePriority: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const priority = parseInt(formData.get('priority')?.toString() || '0', 10);

        if (!id) {
            return fail(400, { error: 'ID ist erforderlich' });
        }

        try {
            const { error: updateError } = await locals.supabase
                .from('roadmap_items')
                .update({ priority })
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error updating priority:', e);
            return fail(500, { error: 'Fehler beim Aktualisieren der Priorität' });
        }
    }
};