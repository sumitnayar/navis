-- Migration Version: 007_policy_intelligence
-- Description: Provision tables for policy documents storage, text chunking, and AI Q&A tracking with RLS.

-- Enable pgvector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. DOCUMENT VAULT TABLE (missing from previous sprint)
CREATE TABLE IF NOT EXISTS public.document_vault (
    id VARCHAR(100) PRIMARY KEY,
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    document_summary TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    extracted_counts JSONB DEFAULT '{}'::JSONB,
    status VARCHAR(50) DEFAULT 'pending_review',
    changes_accepted INT DEFAULT 0,
    changes_dismissed INT DEFAULT 0,
    raw_extraction JSONB DEFAULT NULL
);

-- 2. POLICY DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.policy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    framework_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_name TEXT,
    file_url TEXT,
    mime_type TEXT,
    uploaded_by UUID,
    status TEXT NOT NULL CHECK (status IN ('Uploaded', 'Processing', 'Ready', 'Failed')),
    extracted_text TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. POLICY DOCUMENT CHUNKS TABLE
CREATE TABLE IF NOT EXISTS public.policy_document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    section_title TEXT,
    page_number INT,
    token_count INT,
    embedding vector(1536), -- Nullable, if pgvector is available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. POLICY QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.policy_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    cited_chunks JSONB DEFAULT '[]'::JSONB,
    confidence TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_questions ENABLE ROW LEVEL SECURITY;

-- Select RLS Policies
DROP POLICY IF EXISTS "Tenant read document_vault" ON public.document_vault;
CREATE POLICY "Tenant read document_vault" ON public.document_vault FOR SELECT TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant read policy_documents" ON public.policy_documents;
CREATE POLICY "Tenant read policy_documents" ON public.policy_documents FOR SELECT TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant read policy_document_chunks" ON public.policy_document_chunks;
CREATE POLICY "Tenant read policy_document_chunks" ON public.policy_document_chunks FOR SELECT TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant read policy_questions" ON public.policy_questions;
CREATE POLICY "Tenant read policy_questions" ON public.policy_questions FOR SELECT TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Write RLS Policies (Allow all authenticated users to manage their tenant data)
DROP POLICY IF EXISTS "Tenant write document_vault" ON public.document_vault;
CREATE POLICY "Tenant write document_vault" ON public.document_vault FOR ALL TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
) WITH CHECK (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant write policy_documents" ON public.policy_documents;
CREATE POLICY "Tenant write policy_documents" ON public.policy_documents FOR ALL TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
) WITH CHECK (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant write policy_document_chunks" ON public.policy_document_chunks;
CREATE POLICY "Tenant write policy_document_chunks" ON public.policy_document_chunks FOR ALL TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
) WITH CHECK (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);

DROP POLICY IF EXISTS "Tenant write policy_questions" ON public.policy_questions;
CREATE POLICY "Tenant write policy_questions" ON public.policy_questions FOR ALL TO authenticated USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
) WITH CHECK (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid 
    OR organization_id = '00000000-0000-0000-0000-000000000000'::uuid
);
