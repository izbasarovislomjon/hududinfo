-- Create news table for regional updates
CREATE TABLE public.news (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    region TEXT,
    district TEXT,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_published BOOLEAN NOT NULL DEFAULT true,
    author_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Anyone can view published news
CREATE POLICY "Anyone can view published news" 
ON public.news 
FOR SELECT 
USING (is_published = true);

-- Admins can manage all news
CREATE POLICY "Admins can manage news" 
ON public.news 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create budget_projects table for infrastructure funding data
CREATE TABLE public.budget_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    region TEXT NOT NULL,
    district TEXT,
    sector TEXT NOT NULL, -- Ta'lim, Sog'liq, Yo'l, Suv
    allocated_amount NUMERIC NOT NULL DEFAULT 0,
    spent_amount NUMERIC NOT NULL DEFAULT 0,
    source_type TEXT NOT NULL, -- BYUDJET, HOMIY, IFI (Xalqaro moliya institutlari)
    donor TEXT, -- ADB, AIIB, EBRD, IsDB, Jahon banki, O'zR Davlat byudjeti, UNDP, UNICEF
    status TEXT NOT NULL DEFAULT 'planned', -- planned, tender, construction, completed
    start_year INTEGER,
    end_year INTEGER,
    lat NUMERIC,
    lng NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view budget projects (transparency)
CREATE POLICY "Anyone can view budget projects" 
ON public.budget_projects 
FOR SELECT 
USING (true);

-- Admins can manage budget projects
CREATE POLICY "Admins can manage budget projects" 
ON public.budget_projects 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create game_scores table for gamification
CREATE TABLE public.game_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL, -- memory, puzzle, quiz
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Users can view all scores (leaderboard)
CREATE POLICY "Anyone can view game scores" 
ON public.game_scores 
FOR SELECT 
USING (true);

-- Users can create their own scores
CREATE POLICY "Users can create their own scores" 
ON public.game_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_news_region ON public.news(region);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_budget_region ON public.budget_projects(region);
CREATE INDEX idx_budget_sector ON public.budget_projects(sector);
CREATE INDEX idx_budget_source ON public.budget_projects(source_type);
CREATE INDEX idx_budget_donor ON public.budget_projects(donor);
CREATE INDEX idx_game_scores_user ON public.game_scores(user_id);
CREATE INDEX idx_game_scores_type ON public.game_scores(game_type);