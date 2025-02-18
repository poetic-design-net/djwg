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
        // Aufgaben mit Tags und zugewiesenem Benutzer laden
        const { data: tasks, error: tasksError } = await locals.supabase
            .from('tasks')
            .select(`
                *,
                tags:task_tags(
                    tag:tags(*)
                ),
                assigned_user:profiles!tasks_assigned_to_fkey(
                    id,
                    email
                )
            `)
            .order('priority', { ascending: false });

        if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
            return {
                tasks: [],
                tags: [],
                users: []
            };
        }

        // Verfügbare Tags laden
        const { data: tags, error: tagsError } = await locals.supabase
            .from('tags')
            .select('*')
            .order('name');

        if (tagsError) {
            console.error('Error fetching tags:', tagsError);
            return {
                tasks: tasks || [],
                tags: [],
                users: []
            };
        }

        // Verfügbare Benutzer für Zuweisungen laden
        const { data: users, error: usersError } = await locals.supabase
            .from('profiles')
            .select('id, email, full_name')
            .order('email');

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return {
                tasks: tasks || [],
                tags: tags || [],
                users: []
            };
        }

        return {
            tasks: tasks || [],
            tags: tags || [],
            users: users || []
        };
    } catch (e) {
        console.error('Server error:', e);
        return {
            tasks: [],
            tags: [],
            users: []
        };
    }
};

export const actions: Actions = {
    createTask: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const due_date = formData.get('due_date');
        const priority = parseInt(formData.get('priority')?.toString() || '0', 10);
        const status = formData.get('status') as TaskStatus;
        const assigned_to = formData.get('assigned_to') || null;
        const tagIds = formData.getAll('tags');

        if (!title || !status) {
            return fail(400, { error: 'Titel und Status sind erforderlich' });
        }

        try {
            const { data: task, error: insertError } = await locals.supabase
                .from('tasks')
                .insert({
                    title,
                    description,
                    due_date,
                    priority,
                    status,
                    assigned_to,
                    created_by: session.data.session.user.id
                })
                .select()
                .single();

            if (insertError || !task) {
                throw insertError;
            }

            if (tagIds.length > 0) {
                const tagConnections = tagIds.map(tagId => ({
                    task_id: task.id,
                    tag_id: tagId
                }));

                const { error: tagError } = await locals.supabase
                    .from('task_tags')
                    .insert(tagConnections);

                if (tagError) {
                    console.error('Error adding tags:', tagError);
                }
            }

            return { success: true };
        } catch (e) {
            console.error('Error creating task:', e);
            return fail(500, { error: 'Fehler beim Erstellen der Aufgabe' });
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
                .from('tasks')
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

    updateAssignment: async ({ request, locals }) => {
        const session = await locals.supabase.auth.getSession();
        if (!session.data.session?.user) {
            return fail(401, { error: 'Nicht authentifiziert' });
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const assigned_to = formData.get('assigned_to') || null;

        if (!id) {
            return fail(400, { error: 'ID ist erforderlich' });
        }

        try {
            const { error: updateError } = await locals.supabase
                .from('tasks')
                .update({ assigned_to })
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            return { success: true };
        } catch (e) {
            console.error('Error updating assignment:', e);
            return fail(500, { error: 'Fehler beim Aktualisieren der Zuweisung' });
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
                .from('tasks')
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