import type { SupabaseClient } from '@supabase/supabase-js';
import type { RawDatabasePost, NormalizedPost } from '$lib/types/social';
import { normalizePost } from '$lib/types/social';

export class SocialFeedService {
  constructor(private supabase: SupabaseClient) {}

  async getPosts(): Promise<NormalizedPost[]> {
    try {
      console.log('🔍 Fetching posts...');
      
      // Teste zuerst nur die Basis-Tabelle
      const { data: testData, error: testError } = await this.supabase
        .from('posts')
        .select('*');

      if (testError) {
        console.error('🔥 Error in test query:', testError);
        throw testError;
      }

      console.log('✅ Found posts:', testData?.length || 0);
      
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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔥 Error fetching posts:', error);
        throw error;
      }

      console.log('✅ Full query successful, processing data...');
      console.log('📦 Raw data example:', JSON.stringify(data?.[0], null, 2));

      // Normalisiere die Daten
      const normalizedPosts = (data || []).map(post => normalizePost(post as RawDatabasePost));
      console.log('✅ Normalized first post:', JSON.stringify(normalizedPosts[0], null, 2));

      return normalizedPosts;
    } catch (error) {
      console.error('🔥 Unexpected error in getPosts:', error);
      throw error;
    }
  }

  async createPost(userId: string, content: string): Promise<void> {
    try {
      console.log('📝 Creating post...', { userId });
      
      const { data, error } = await this.supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Post created:', { postId: data?.id });
    } catch (error) {
      console.error('🔥 Error creating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting post...', { postId, userId });

      const { error } = await this.supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      console.log('✅ Post deleted successfully');
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
      .subscribe();
  }
}