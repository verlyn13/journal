-- Enable pgvector extension using the extensions schema (Supabase 2025 best practice)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Verify it's enabled
SELECT
    extname,
    extversion,
    extnamespace::regnamespace AS schema
FROM pg_extension
WHERE extname = 'vector';

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Example: Creating a table with vector column
-- CREATE TABLE IF NOT EXISTS journal_embeddings (
--     id SERIAL PRIMARY KEY,
--     content TEXT,
--     embedding extensions.vector(1536) -- OpenAI ada-002 dimension
-- );

-- Note: Enable this extension via Supabase Dashboard:
-- Dashboard → Database → Extensions → search "vector" → Enable