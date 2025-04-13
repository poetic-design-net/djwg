-- Create post_media table for handling media attachments
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'gif', 'video')),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Post media is viewable by everyone authenticated"
    ON public.post_media FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users with Level 1 badge or admins to add media
CREATE POLICY "Users can insert media if they have badge level 1 or are admin"
    ON public.post_media FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND (
            -- Entweder Admin...
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND raw_user_meta_data->>'isAdmin' = 'true'
            )
            -- ...oder Level 1 Badge
            OR EXISTS (
                SELECT 1 
                FROM user_badges ub 
                WHERE ub.user_id = auth.uid() 
                AND ub.badge_id = '4d2e1bf7-37e7-4226-9239-f8a60f608900' -- DJ_LEVEL_1_ID
            )
        )
    );

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
    ON public.post_media FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS post_media_post_id_idx ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS post_media_user_id_idx ON public.post_media(user_id);

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for authenticated uploads
CREATE POLICY "Authenticated users can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'post-media' 
        AND auth.role() = 'authenticated'
    );

-- Storage policy for public downloads
CREATE POLICY "Anyone can download media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-media');

-- Storage policy for deletion
CREATE POLICY "Users can delete their own media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'post-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );