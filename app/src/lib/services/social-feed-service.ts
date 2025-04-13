import type { SupabaseClient } from '@supabase/supabase-js';
import type { RawDatabasePost, NormalizedPost } from '$lib/types/social';
import { normalizePost } from '$lib/types/social';

type SupabaseProfile = {
  username: string | null;
  avatar_url: string | null;
};

type SupabasePostResponse = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: SupabaseProfile | null;
  post_likes: {
    user_id: string;
  }[];
  post_comments: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: SupabaseProfile | null;
  }[];
  post_media: {
    id: string;
    media_url: string;
    media_type: 'image' | 'gif' | 'video';
    thumbnail_url: string | null;
  }[];
};

export class SocialFeedService {
  constructor(private supabase: SupabaseClient) {}

  private async uploadMediaToStorage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  private transformSupabaseResponse(data: any[]): SupabasePostResponse[] {
    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
      profiles: item.profiles ? {
        username: item.profiles.username,
        avatar_url: item.profiles.avatar_url
      } : null,
      post_likes: (item.post_likes || []).map((like: any) => ({
        user_id: like.user_id
      })),
      post_comments: (item.post_comments || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        profiles: comment.profiles ? {
          username: comment.profiles.username,
          avatar_url: comment.profiles.avatar_url
        } : null
      })),
      post_media: (item.post_media || []).map((media: any) => ({
        id: media.id,
        media_url: media.media_url,
        media_type: media.media_type,
        thumbnail_url: media.thumbnail_url
      }))
    }));
  }

  async getPosts(): Promise<NormalizedPost[]> {
    try {
      console.log('🔍 Fetching posts...');
      
      // Hauptabfrage mit allen benötigten Feldern
      const { data, error } = await this.supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          profiles (
            username,
            avatar_url
          ),
          post_likes (
            user_id
          ),
          post_comments (
            id,
            content,
            created_at,
            user_id,
            profiles (
              username,
              avatar_url
            )
          ),
          post_media (
            id,
            media_url,
            media_type,
            thumbnail_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔥 Error fetching posts:', error);
        throw error;
      }

      // Konvertiere die Rohdaten in den erwarteten Typ
      const transformedData = this.transformSupabaseResponse(data || []);
      const normalizedPosts = transformedData.map(dbPost => {
        const rawPost: RawDatabasePost = {
          id: dbPost.id,
          user_id: dbPost.user_id,
          content: dbPost.content,
          created_at: dbPost.created_at,
          updated_at: dbPost.updated_at,
          profiles: dbPost.profiles,
          post_likes: dbPost.post_likes,
          post_comments: dbPost.post_comments,
          post_media: dbPost.post_media
        };
        return normalizePost(rawPost);
      });

      return normalizedPosts;
    } catch (error) {
      console.error('🔥 Unexpected error in getPosts:', error);
      throw error;
    }
  }

  async createPost(userId: string, content: string, media?: File[]): Promise<void> {
    try {
      console.log('📝 Creating post...', { userId });
      
      // Create the post first
      const { data: post, error: postError } = await this.supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: content
        })
        .select()
        .single();

      if (postError) throw postError;
      console.log('✅ Post created:', { postId: post?.id });

      // Upload media if provided
      if (media && media.length > 0 && post) {
        console.log('📤 Uploading media...');
        
        for (const file of media) {
          const mediaUrl = await this.uploadMediaToStorage(file, userId);
          
          const mediaType = file.type.startsWith('image/gif') ? 'gif' :
                          file.type.startsWith('image/') ? 'image' :
                          file.type.startsWith('video/') ? 'video' : 'image';

          const { error: mediaError } = await this.supabase
            .from('post_media')
            .insert({
              post_id: post.id,
              user_id: userId,
              media_url: mediaUrl,
              media_type: mediaType
            });

          if (mediaError) throw mediaError;
        }
        console.log('✅ Media uploaded');
      }
    } catch (error) {
      console.error('🔥 Error creating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting post...', { postId, userId });

      // Get media files to delete from storage
      const { data: mediaFiles } = await this.supabase
        .from('post_media')
        .select('media_url')
        .eq('post_id', postId);

      // Delete the post (cascade will handle post_media records)
      const { error } = await this.supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      // Delete media files from storage
      if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const filePath = file.media_url.split('/').pop();
          if (filePath) {
            await this.supabase.storage
              .from('post-media')
              .remove([`${userId}/${filePath}`]);
          }
        }
      }

      console.log('✅ Post and associated media deleted successfully');
    } catch (error) {
      console.error('🔥 Error deleting post:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting comment...', { commentId, userId });

      const { error } = await this.supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
      console.log('✅ Comment deleted');
    } catch (error) {
      console.error('🔥 Error deleting comment:', error);
      throw error;
    }
  }

  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      console.log('❤️ Toggling like...', { postId, userId });

      const { data: existingLike, error: fetchError } = await this.supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingLike) {
        const { error } = await this.supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
        console.log('✅ Like removed');
      } else {
        const { error } = await this.supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;
        console.log('✅ Like added');
      }
    } catch (error) {
      console.error('🔥 Error in toggleLike:', error);
      throw error;
    }
  }

  async addComment(postId: string, userId: string, content: string): Promise<void> {
    try {
      console.log('💬 Adding comment...', { postId, userId });

      const { error } = await this.supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content
        });

      if (error) throw error;
      console.log('✅ Comment added successfully');
    } catch (error) {
      console.error('🔥 Error in addComment:', error);
      throw error;
    }
  }

  subscribeToUpdates(callback: () => void) {
    console.log('🔄 Setting up realtime subscription');
    
    return this.supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📢 Posts change detected:', payload.eventType);
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('📢 Likes change detected:', payload.eventType);
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments'
        },
        (payload) => {
          console.log('📢 Comments change detected:', payload.eventType);
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_media'
        },
        (payload) => {
          console.log('📢 Media change detected:', payload.eventType);
          callback();
        }
      )
      .subscribe();
  }
}