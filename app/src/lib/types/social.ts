export interface PostLike {
  user_id: string;
}

export interface PostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export interface PostMedia {
  id: string;
  media_url: string;
  media_type: 'image' | 'gif' | 'video';
  thumbnail_url?: string | null;
}

export interface RawDatabasePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  post_likes: PostLike[];
  post_comments: PostComment[];
  post_media: PostMedia[];
}

export interface NormalizedPost extends RawDatabasePost {
  post_likes: PostLike[];
  post_comments: PostComment[];
  post_media: PostMedia[];
}

export function normalizePost(post: RawDatabasePost): NormalizedPost {
  return {
    ...post,
    post_likes: post.post_likes || [],
    post_comments: post.post_comments || [],
    post_media: post.post_media || []
  };
}