-- Migration Version: 006_demo_requests_table
-- Description: Create demo_requests table for landing page demo requests and configure RLS.

CREATE TABLE IF NOT EXISTS public.demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors (and authenticated users) to submit demo requests
CREATE POLICY "Enable insert access for anonymous users" 
ON public.demo_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated organization users/admins to view backup demo requests
CREATE POLICY "Enable read access for authenticated users" 
ON public.demo_requests 
FOR SELECT 
TO authenticated
USING (true);
