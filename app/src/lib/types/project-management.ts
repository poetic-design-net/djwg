export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  priority: number;
  tags?: Tag[];
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  votes: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: Tag[];
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  posts?: ForumPost[];
  created_by_user?: DatabaseUser;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_user?: DatabaseUser;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: Tag[];
}

export interface DatabaseUser {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

// Helper Types für Forms und API Requests
export type CreateRoadmapItem = Omit<RoadmapItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateRoadmapItem = Partial<CreateRoadmapItem>;

export type CreateIdea = Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'votes'>;
export type UpdateIdea = Partial<CreateIdea>;

export type CreateForumTopic = Omit<ForumTopic, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'posts' | 'created_by_user'>;
export type UpdateForumTopic = Partial<CreateForumTopic>;

export type CreateForumPost = Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_user'>;
export type UpdateForumPost = Partial<CreateForumPost>;

export type CreateTask = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type UpdateTask = Partial<CreateTask>;

export type CreateTag = Omit<Tag, 'id' | 'created_at'>;
export type UpdateTag = Partial<CreateTag>;