export interface PostProfile {
  username?: string;
  avatar_url?: string;
}

export interface PostLike {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: PostProfile | null;
}

// Basis-Post-Interface
export interface BasePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Interface für Posts wie sie in der Datenbank sind
export interface DatabasePost extends BasePost {
  profiles?: PostProfile | null;
  post_likes?: PostLike[] | null;
  post_comments?: PostComment[] | null;
}

// Interface für normalisierte Posts in der Anwendung
export interface NormalizedPost extends BasePost {
  profiles: PostProfile;  // Immer ein Objekt, auch wenn leer
  post_likes: PostLike[];  // Immer ein Array, auch wenn leer
  post_comments: PostComment[];  // Immer ein Array, auch wenn leer
}

// Typ-Guard um zu prüfen ob ein Post normalisiert ist
export function isNormalizedPost(post: DatabasePost | NormalizedPost): post is NormalizedPost {
  return post.profiles !== null && 
         post.profiles !== undefined && 
         Array.isArray(post.post_likes) &&
         Array.isArray(post.post_comments);
}

// Hilfsfunktion zum Normalisieren eines Posts
export function normalizePost(post: DatabasePost): NormalizedPost {
  return {
    ...post,
    profiles: post.profiles || { username: 'Anonym' },
    post_likes: post.post_likes || [],
    post_comments: (post.post_comments || []).map(comment => ({
      ...comment,
      profiles: comment.profiles || { username: 'Anonym' }
    }))
  };
}