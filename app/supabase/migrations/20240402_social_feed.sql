-- Create tables for social feed functionality
-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post likes table (for many-to-many relationship between users and posts)
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Posts policies - Allow all authenticated users to view posts
CREATE POLICY "Posts are viewable by everyone authenticated"
    ON public.posts FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users with Level 1 badge or admins to create posts
CREATE POLICY "Users can insert posts if they have badge level 1 or are admin"
    ON public.posts FOR INSERT
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

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- Post likes policies - Allow all authenticated users to view likes
CREATE POLICY "Likes are viewable by everyone authenticated"
    ON public.post_likes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users with Level 1 badge or admins to add likes
CREATE POLICY "Users can insert likes if they have badge level 1 or are admin"
    ON public.post_likes FOR INSERT
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

-- Allow users to remove their own likes
CREATE POLICY "Users can delete their own likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Post comments policies - Allow all authenticated users to view comments
CREATE POLICY "Comments are viewable by everyone authenticated"
    ON public.post_comments FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users with Level 1 badge or admins to add comments
CREATE POLICY "Users can insert comments if they have badge level 1 or are admin"
    ON public.post_comments FOR INSERT
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

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
    ON public.post_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON public.post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON public.post_comments(user_id);

-- Add functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();