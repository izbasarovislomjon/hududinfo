-- Add video_url column to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create news-media storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-media', 'news-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for news-media bucket
CREATE POLICY "Anyone can view news media"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-media');

CREATE POLICY "Admins can upload news media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news media"
ON storage.objects FOR DELETE
USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Make feedbacks publicly viewable for transparency (everyone sees same stats)
-- First drop the restrictive policies
DROP POLICY IF EXISTS "Users can view their own feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins can view all feedbacks for stats" ON public.feedbacks;

-- Create new policy for public viewing (transparency principle)
CREATE POLICY "Anyone can view feedbacks for transparency"
ON public.feedbacks
FOR SELECT
USING (true);