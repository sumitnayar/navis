
-- ==========================================
-- 6. PHASE 3: RAG RETRIEVAL FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION match_policy_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  org_id uuid
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  section_title text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    chunk_text,
    section_title,
    1 - (embedding <=> query_embedding) AS similarity
  FROM policy_document_chunks
  WHERE organization_id = org_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
