-- Database Schema Export for Journal Application
-- Generated: 2025-09-16
-- Purpose: Schema-only export for rollback and disaster recovery
-- Usage: psql -f deploy/db/export.sql

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

-- Vector extension for embeddings (must be enabled first)
CREATE EXTENSION IF NOT EXISTS vector;

-- Full-text search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Additional extensions (enable as needed)
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- =============================================================================
-- CUSTOM TYPES
-- =============================================================================

-- User role enumeration
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Entry status enumeration
DO $$ BEGIN
    CREATE TYPE entry_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Authentication provider enumeration
DO $$ BEGIN
    CREATE TYPE auth_provider AS ENUM ('local', 'google', 'github', 'webauthn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role user_role DEFAULT 'user',
    phone VARCHAR(20),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User authentication credentials
CREATE TABLE IF NOT EXISTS user_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_id VARCHAR(255),
    password_hash TEXT,
    salt TEXT,
    webauthn_credentials JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Authentication sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    content_html TEXT,
    status entry_status DEFAULT 'draft',
    tags TEXT[] DEFAULT '{}',
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_key_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Entry embeddings for semantic search
CREATE TABLE IF NOT EXISTS entry_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL,
    embedding vector(384), -- Adjust dimension based on model
    model_name VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, content_hash)
);

-- Entry attachments
CREATE TABLE IF NOT EXISTS entry_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local',
    is_processed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(10) DEFAULT '24h',
    default_entry_status entry_status DEFAULT 'draft',
    auto_save_enabled BOOLEAN DEFAULT TRUE,
    auto_save_interval_seconds INTEGER DEFAULT 30,
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    editor_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_user_auth_user_id ON user_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_provider ON user_auth(provider);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_published_at ON journal_entries(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_entries_user_status ON journal_entries(user_id, status);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_entries_title_fts ON journal_entries USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_entries_content_fts ON journal_entries USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_entries_combined_fts ON journal_entries USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Vector similarity indexes (create after data is loaded)
-- CREATE INDEX IF NOT EXISTS idx_entry_embeddings_vector ON entry_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Note: Vector indexes should be created after substantial data is present

-- Attachment indexes
CREATE INDEX IF NOT EXISTS idx_attachments_entry_id ON entry_attachments(entry_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON entry_attachments(created_at);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_resource ON activity_logs(resource_type, resource_id);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_auth_updated_at ON user_auth;
CREATE TRIGGER update_user_auth_updated_at BEFORE UPDATE ON user_auth FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auth_sessions_updated_at ON auth_sessions;
CREATE TRIGGER update_auth_sessions_updated_at BEFORE UPDATE ON auth_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update word count and reading time
CREATE OR REPLACE FUNCTION update_entry_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count (rough estimate)
    NEW.word_count = array_length(string_to_array(trim(regexp_replace(COALESCE(NEW.content, ''), '\s+', ' ', 'g')), ' '), 1);

    -- Calculate reading time (average 200 words per minute)
    NEW.reading_time_minutes = GREATEST(1, CEIL(NEW.word_count / 200.0));

    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_entry_stats_trigger ON journal_entries;
CREATE TRIGGER update_entry_stats_trigger BEFORE INSERT OR UPDATE OF content ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_entry_stats();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users FOR ALL USING (id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY user_auth_own_data ON user_auth FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY auth_sessions_own_data ON auth_sessions FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY journal_entries_own_data ON journal_entries FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY entry_embeddings_own_data ON entry_embeddings FOR ALL USING (
    entry_id IN (SELECT id FROM journal_entries WHERE user_id = current_setting('app.current_user_id', true)::UUID)
);
CREATE POLICY entry_attachments_own_data ON entry_attachments FOR ALL USING (
    entry_id IN (SELECT id FROM journal_entries WHERE user_id = current_setting('app.current_user_id', true)::UUID)
);
CREATE POLICY user_preferences_own_data ON user_preferences FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert default admin user (for development only)
-- Password: 'admin123' (should be changed immediately)
INSERT INTO users (id, email, name, role, email_verified)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@example.com',
    'System Administrator',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- =============================================================================

-- Analyze tables for query planner
ANALYZE users;
ANALYZE journal_entries;
ANALYZE entry_embeddings;

-- Set up connection pooling recommendations
-- For Supabase: Use conservative pool sizes
-- For local development: Can be more generous

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users IS 'Application users with basic profile information';
COMMENT ON TABLE user_auth IS 'User authentication credentials for multiple providers';
COMMENT ON TABLE auth_sessions IS 'Active user sessions with JWT tokens';
COMMENT ON TABLE journal_entries IS 'User journal entries with full-text search support';
COMMENT ON TABLE entry_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON TABLE entry_attachments IS 'File attachments linked to journal entries';
COMMENT ON TABLE user_preferences IS 'User-specific application settings';
COMMENT ON TABLE activity_logs IS 'Audit trail for user actions';

COMMENT ON COLUMN entry_embeddings.embedding IS 'Vector embedding for semantic similarity search';
COMMENT ON COLUMN journal_entries.is_encrypted IS 'Whether entry content is client-side encrypted';
COMMENT ON COLUMN journal_entries.content_html IS 'Rendered HTML content for display';

-- =============================================================================
-- COMPLETION
-- =============================================================================

SELECT 'Schema export completed successfully. Extensions enabled:' as status;
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_trgm', 'btree_gin', 'uuid-ossp') ORDER BY extname;