// Basis-Typen für die Datenbank-Antworten
export interface PostProfile {
  username?: string;
  avatar_url?: string;
}

export interface RawPostLike {
  user_id: string;
}

export interface RawPostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: PostProfile;  // Einzelnes Objekt, kein Array
}

// Rohdaten aus der Datenbank
export interface RawDatabasePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: PostProfile;  // Einzelnes Objekt, kein Array
  post_likes: RawPostLike[];
  post_comments: RawPostComment[];
}

// Normalisierte Typen für die Anwendung
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
  profiles: PostProfile;  // Immer verfügbar nach Normalisierung
}

export interface NormalizedPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: PostProfile;  // Immer verfügbar nach Normalisierung
  post_likes: PostLike[];
  post_comments: PostComment[];
}

// Hilfsfunktion zum Normalisieren eines Posts
export function normalizePost(post: RawDatabasePost): NormalizedPost {
  return {
    ...post,
    post_likes: (post.post_likes || []).map(like => ({
      post_id: post.id,
      user_id: like.user_id,
      created_at: post.created_at // Verwende Post-Datum als Fallback
    })),
    post_comments: (post.post_comments || []).map(comment => ({
      ...comment,
      post_id: post.id,
      updated_at: comment.created_at,
      profiles: comment.profiles || { username: 'Anonym' }
    }))
  };
}