import { supabaseClient } from '$lib/supabase';
import type {
  RoadmapItem,
  CreateRoadmapItem,
  UpdateRoadmapItem,
  Idea,
  CreateIdea,
  UpdateIdea,
  ForumTopic,
  CreateForumTopic,
  UpdateForumTopic,
  ForumPost,
  CreateForumPost,
  UpdateForumPost,
  Task,
  CreateTask,
  UpdateTask,
  Tag,
  CreateTag,
  UpdateTag
} from '$lib/types/project-management';

const handleError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Ein Fehler ist aufgetreten');
};

// Roadmap Functions
export async function getRoadmapItems() {
  const { data, error } = await supabaseClient
    .from('roadmap_items')
    .select(`
      *,
      tags:roadmap_tags(
        tag:tags(*)
      )
    `)
    .order('priority', { ascending: false });

  if (error) throw handleError(error);
  return data as RoadmapItem[];
}

export async function createRoadmapItem(item: CreateRoadmapItem) {
  const { data, error } = await supabaseClient
    .from('roadmap_items')
    .insert(item)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function updateRoadmapItem(id: string, updates: UpdateRoadmapItem) {
  const { data, error } = await supabaseClient
    .from('roadmap_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

// Ideas Functions
export async function getIdeas() {
  const { data, error } = await supabaseClient
    .from('ideas')
    .select(`
      *,
      tags:idea_tags(
        tag:tags(*)
      )
    `)
    .order('votes', { ascending: false });

  if (error) throw handleError(error);
  return data as Idea[];
}

export async function createIdea(idea: CreateIdea) {
  const { data, error } = await supabaseClient
    .from('ideas')
    .insert(idea)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function updateIdea(id: string, updates: UpdateIdea) {
  const { data, error } = await supabaseClient
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function voteIdea(id: string) {
  const { error } = await supabaseClient.rpc('vote_for_idea', { idea_id: id });
  if (error) throw handleError(error);
  return getIdeas(); // Refresh ideas to get updated vote count
}

// Forum Functions
export async function getForumTopics() {
  const { data, error } = await supabaseClient
    .from('forum_topics')
    .select(`
      *,
      posts:forum_posts(*)
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw handleError(error);
  return data as ForumTopic[];
}

export async function createForumTopic(topic: CreateForumTopic) {
  const { data, error } = await supabaseClient
    .from('forum_topics')
    .insert(topic)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function getForumPosts(topicId: string) {
  const { data, error } = await supabaseClient
    .from('forum_posts')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });

  if (error) throw handleError(error);
  return data as ForumPost[];
}

export async function createForumPost(post: CreateForumPost) {
  const { data, error } = await supabaseClient
    .from('forum_posts')
    .insert(post)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

// Tasks Functions
export async function getTasks() {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select(`
      *,
      tags:task_tags(
        tag:tags(*)
      )
    `)
    .order('priority', { ascending: false });

  if (error) throw handleError(error);
  return data as Task[];
}

export async function createTask(task: CreateTask) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function updateTask(id: string, updates: UpdateTask) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw handleError(error);
}

// Tags Functions
export async function getTags() {
  const { data, error } = await supabaseClient
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw handleError(error);
  return data as Tag[];
}

export async function createTag(tag: CreateTag) {
  const { data, error } = await supabaseClient
    .from('tags')
    .insert(tag)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}

export async function updateTag(id: string, updates: UpdateTag) {
  const { data, error } = await supabaseClient
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw handleError(error);
  return data;
}