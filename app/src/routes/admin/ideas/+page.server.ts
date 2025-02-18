import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Idea } from '$lib/types/project-management';

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.supabase.auth.getSession();
    console.log('Session:', session);
    
    if (!session.data.session?.user) {
        throw redirect(303, '/');
    }

    // Hole das Profil des aktuellen Benutzers
    const { data: profile, error: profileError } = await locals.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.data.session.user.id)
        .single();

    console.log('Profile:', profile, 'Profile Error:', profileError);

    if (!profile?.role || profile.role !== 'admin') {
        throw redirect(303, '/');
    }

    try {
        // Ideen abrufen
        const { data: ideas, error: ideasError } = await locals.supabase
            .from('ideas')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Ideas:', ideas, 'Ideas Error:', ideasError);

        if (ideasError) {
            console.error('Error fetching ideas:', ideasError);
            return {
                ideas: [],
                userVotes: new Set<string>()
            };
        }

        // User Votes abrufen
        const { data: votes, error: votesError } = await locals.supabase
            .from('idea_votes')
            .select('idea_id')
            .eq('user_id', session.data.session.user.id);

        console.log('Votes:', votes, 'Votes Error:', votesError);

        return {
            ideas: ideas || [],
            userVotes: new Set((votes || []).map(v => v.idea_id)),
            _debug: {
                userId: session.data.session.user.id,
                ideasCount: ideas?.length ?? 0,
                votesCount: votes?.length ?? 0
            }
        };
    } catch (e) {
        console.error('Server error:', e);
        return {
            ideas: [],
            userVotes: new Set<string>(),
            _debug: {
                error: e instanceof Error ? e.message : String(e)
            }
        };
    }
};

export const actions: Actions = {
    createIdea: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;

        if (!title || !category) {
            return fail(400, { error: 'Titel und Kategorie sind erforderlich' });
        }

        try {
            const { data: idea, error: insertError } = await locals.supabase
                .from('ideas')
                .insert({
                    title,
                    description,
                    category,
                    status: 'new',
                    votes: 0,
                    created_by: session.data.session.user.id
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating idea:', insertError);
                return fail(500, { error: 'Fehler beim Erstellen der Idee' });
            }

            return { success: true };
        } catch (e) {
            console.error('Error in createIdea:', e);
            return fail(500, { error: 'Fehler beim Erstellen der Idee' });
        }
    },

    vote: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const ideaId = formData.get('id') as string;

        if (!ideaId) {
            return fail(400, { error: 'Keine Idee ausgewählt' });
        }

        try {
            // Prüfen ob der User bereits abgestimmt hat
            const { data: existingVote, error: checkError } = await locals.supabase
                .from('idea_votes')
                .select('*')
                .eq('idea_id', ideaId)
                .eq('user_id', session.data.session.user.id)
                .single();

            if (existingVote) {
                return fail(400, { error: 'Sie haben bereits für diese Idee gestimmt' });
            }

            // Vote erstellen
            const { error: voteError } = await locals.supabase
                .from('idea_votes')
                .insert({
                    idea_id: ideaId,
                    user_id: session.data.session.user.id
                });

            if (voteError) {
                throw voteError;
            }

            // Votes in der Idee aktualisieren
            const { error: updateError } = await locals.supabase
                .from('ideas')
                .update({ 
                    votes: locals.supabase.rpc('increment', { x: 1 }) 
                })
                .eq('id', ideaId);

            if (updateError) {
                throw updateError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error in vote:', e);
            return fail(500, { error: 'Fehler beim Abstimmen' });
        }
    },

    updateStatus: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const id = formData.get('id') as string;
        const status = formData.get('status') as string;

        if (!id || !status) {
            return fail(400, { error: 'ID und Status sind erforderlich' });
        }

        try {
            const { error: updateError } = await locals.supabase
                .from('ideas')
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
    }
};