-- Create enum types
CREATE TYPE public.object_type AS ENUM ('school', 'kindergarten', 'clinic', 'water', 'road');
CREATE TYPE public.issue_type AS ENUM ('water_supply', 'road_condition', 'heating', 'medical_quality', 'staff_shortage', 'infrastructure', 'other');
CREATE TYPE public.feedback_status AS ENUM ('submitted', 'reviewing', 'in_progress', 'completed', 'rejected');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for citizens
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create infrastructure_objects table
CREATE TABLE public.infrastructure_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type object_type NOT NULL,
  address TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_feedbacks INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT FALSE,
  is_reconstructed BOOLEAN DEFAULT FALSE,
  capacity INTEGER,
  built_year INTEGER,
  last_renovation INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  object_id UUID REFERENCES public.infrastructure_objects(id) ON DELETE CASCADE NOT NULL,
  issue_type issue_type NOT NULL,
  description TEXT NOT NULL,
  status feedback_status DEFAULT 'submitted',
  is_anonymous BOOLEAN DEFAULT FALSE,
  author_name TEXT,
  author_phone TEXT,
  votes INTEGER DEFAULT 0,
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_images table
CREATE TABLE public.feedback_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_status_history table
CREATE TABLE public.feedback_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE NOT NULL,
  status feedback_status NOT NULL,
  comment TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  object_id UUID REFERENCES public.infrastructure_objects(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for infrastructure_objects (public read)
CREATE POLICY "Anyone can view objects" ON public.infrastructure_objects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage objects" ON public.infrastructure_objects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feedbacks
CREATE POLICY "Users can view their own feedbacks" ON public.feedbacks
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create feedbacks" ON public.feedbacks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own feedbacks" ON public.feedbacks
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedbacks" ON public.feedbacks
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feedback_images
CREATE POLICY "Anyone can view feedback images" ON public.feedback_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload images" ON public.feedback_images
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for feedback_status_history
CREATE POLICY "Users can view status history of their feedbacks" ON public.feedback_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f 
      WHERE f.id = feedback_id 
      AND (f.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can add status history" ON public.feedback_status_history
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for feedback images
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-images', 'feedback-images', true);

-- Storage policies
CREATE POLICY "Anyone can view feedback images" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'feedback-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample infrastructure objects
INSERT INTO public.infrastructure_objects (name, type, address, region, district, lat, lng, rating, total_reviews, total_feedbacks, is_new, is_reconstructed, capacity, built_year, last_renovation) VALUES
('56-sonli umumta''lim maktabi', 'school', 'Chilonzor tumani, Bunyodkor ko''chasi 15', 'Toshkent shahri', 'Chilonzor tumani', 41.2856, 69.2044, 4.2, 48, 12, false, true, 1200, 1985, 2022),
('23-sonli bolalar bog''chasi', 'kindergarten', 'Yakkasaroy tumani, Shota Rustaveli ko''chasi 45', 'Toshkent shahri', 'Yakkasaroy tumani', 41.2992, 69.2678, 3.8, 32, 8, true, false, 180, 2023, null),
('Mirzo Ulug''bek tumani oilaviy poliklinikasi', 'clinic', 'Mirzo Ulug''bek tumani, Universitet ko''chasi 7', 'Toshkent shahri', 'Mirzo Ulug''bek tumani', 41.3383, 69.2855, 3.5, 156, 45, false, false, null, 1978, null),
('Sergeli suv tarmog''i №12', 'water', 'Sergeli tumani, Yangi Sergeli mavzesi', 'Toshkent shahri', 'Sergeli tumani', 41.2234, 69.2189, 2.9, 23, 67, false, false, null, 1992, null),
('Olmazor-Chilonzor ichki yo''li', 'road', 'Olmazor tumani - Chilonzor tumani oralig''i', 'Toshkent shahri', 'Olmazor tumani', 41.3123, 69.2345, 3.2, 89, 34, false, true, null, null, 2021),
('112-sonli umumta''lim maktabi', 'school', 'Yunusobod tumani, Amir Temur ko''chasi 88', 'Toshkent shahri', 'Yunusobod tumani', 41.3567, 69.2901, 4.5, 72, 5, true, false, 1500, 2024, null),
('Bektemir tumani markaziy poliklinikasi', 'clinic', 'Bektemir tumani, Mustaqillik ko''chasi 23', 'Toshkent shahri', 'Bektemir tumani', 41.2089, 69.3345, 4.0, 98, 18, false, true, null, 1990, 2023),
('45-sonli bolalar bog''chasi', 'kindergarten', 'Shayxontohur tumani, Zarqaynar ko''chasi 12', 'Toshkent shahri', 'Shayxontohur tumani', 41.3234, 69.2456, 3.6, 41, 14, false, false, 200, 1995, null),
('Uchtepa suv tarmog''i №8', 'water', 'Uchtepa tumani, Qoratosh mahallasi', 'Toshkent shahri', 'Uchtepa tumani', 41.2789, 69.1923, 2.5, 15, 89, false, false, null, 1988, null),
('Yunusobod-Shayhontohur ichki yo''li', 'road', 'Yunusobod - Shayxontohur tumanlari oralig''i', 'Toshkent shahri', 'Yunusobod tumani', 41.3456, 69.2678, 4.1, 56, 11, false, true, null, null, 2024);