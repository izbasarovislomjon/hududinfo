-- Create solution_ratings table for citizens to rate government solutions
CREATE TABLE public.solution_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create solution_rating_images table for before/after photos
CREATE TABLE public.solution_rating_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_rating_id UUID NOT NULL REFERENCES public.solution_ratings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solution_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_rating_images ENABLE ROW LEVEL SECURITY;

-- RLS for solution_ratings
CREATE POLICY "Anyone can view solution ratings"
ON public.solution_ratings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create solution ratings"
ON public.solution_ratings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own ratings"
ON public.solution_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS for solution_rating_images
CREATE POLICY "Anyone can view solution rating images"
ON public.solution_rating_images
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload solution images"
ON public.solution_rating_images
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for solution images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('solution-images', 'solution-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for solution images
CREATE POLICY "Anyone can view solution images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'solution-images');

CREATE POLICY "Authenticated users can upload solution images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'solution-images' AND auth.uid() IS NOT NULL);

-- Enable realtime for solution_ratings
ALTER PUBLICATION supabase_realtime ADD TABLE public.solution_ratings;