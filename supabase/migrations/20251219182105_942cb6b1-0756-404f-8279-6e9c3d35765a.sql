-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all feedbacks for statistics
CREATE POLICY "Admins can view all feedbacks for stats"
ON public.feedbacks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));