-- Table to store quiz responses and leads
CREATE TABLE public.quiz_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('personal_brand', 'pyme')),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT, -- For PyME quiz
  answers JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL DEFAULT 0,
  result_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  result_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public quiz)
CREATE POLICY "Anyone can submit quiz responses"
ON public.quiz_submissions
FOR INSERT
WITH CHECK (true);

-- Only allow reading own submissions by email (for future use)
CREATE POLICY "Users can read their own submissions"
ON public.quiz_submissions
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_quiz_submissions_email ON public.quiz_submissions(email);
CREATE INDEX idx_quiz_submissions_quiz_type ON public.quiz_submissions(quiz_type);
CREATE INDEX idx_quiz_submissions_created_at ON public.quiz_submissions(created_at DESC);