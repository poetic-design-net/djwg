import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
        const { data: topics, error: topicsError } = await locals.supabase
        .from('forum_topics')
        .select(`
            *,
            posts:forum_posts(
                *,
                created_by_user:profiles!forum_posts_created_by_fkey(
                    id,
                    email,
                    full_name,
                    username
                )
            ),
            created_by_user:profiles(
                id,
                email,
                full_name,
                username
            )
        `)
        .eq('profiles.id', 'forum_topics.created_by')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

        if (topicsError) {
            console.error('Error fetching topics:', topicsError);
            return {
                topics: [],
                _debug: {
                    error: topicsError
                }
            };
        }

        return {
            topics: topics || [],
            _debug: {
                topicsLoaded: topics?.length ?? 0
            }
        };
    } catch (e) {
        console.error('Server error:', e);
        return {
            topics: [],
            _debug: {
                error: e instanceof Error ? e.message : String(e)
            }
        };
    }
};

export const actions: Actions = {
    createTopic: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');
        const category = formData.get('category');
        const is_pinned = formData.get('is_pinned') === 'true';

        if (!title || !content || !category) {
            return fail(400, { error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
        }

        try {
            const { data: topic, error: insertError } = await locals.supabase
                .from('forum_topics')
                .insert({
                    title,
                    content,
                    category,
                    is_pinned,
                    created_by: session.data.session.user.id
                })
                .select()
                .single();

            if (insertError || !topic) {
                throw insertError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error creating topic:', e);
            return fail(500, { error: 'Fehler beim Erstellen des Themas' });
        }
    },

    createPost: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const content = formData.get('content');
        const topic_id = formData.get('topic_id');

        if (!content || !topic_id) {
            return fail(400, { error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
        }

        try {
            const { data: post, error: insertError } = await locals.supabase
                .from('forum_posts')
                .insert({
                    content,
                    topic_id,
                    created_by: session.data.session.user.id
                })
                .select()
                .single();

            if (insertError || !post) {
                throw insertError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error creating post:', e);
            return fail(500, { error: 'Fehler beim Erstellen der Antwort' });
        }
    },

    updateTopic: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const is_pinned = formData.get('is_pinned') === 'true';

        if (!id) {
            return fail(400, { error: 'ID ist erforderlich' });
        }

        try {
            const { error: updateError } = await locals.supabase
                .from('forum_topics')
                .update({ is_pinned })
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error updating topic:', e);
            return fail(500, { error: 'Fehler beim Aktualisieren des Themas' });
        }
    }
};