-- ==============================================================================
-- PHASE 2: OAUTH2 & DEVELOPER ECOSYSTEM
-- Requirements: 3rd-party App Registration, OAuth Scopes, API Monetization
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS oauth;

-- Stores 3rd-party applications registered by external developers
CREATE TABLE oauth.developer_apps (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL, -- Reference to the base users table
    app_name VARCHAR(255) NOT NULL,
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] NOT NULL,
    allowed_scopes TEXT[] NOT NULL, -- Master list of scopes this app is allowed to request
    billing_tier VARCHAR(50) DEFAULT 'FREE' CHECK (billing_tier IN ('FREE', 'PAID')),
    stripe_subscription_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores authorization codes generated during the OAuth2 Code Flow
CREATE TABLE oauth.auth_codes (
    code VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) REFERENCES oauth.developer_apps(client_id),
    user_id UUID NOT NULL, -- The KLMCE user (student/faculty) who authorized the app
    granted_scopes TEXT[] NOT NULL,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Note: RLS is configured for developer isolation
ALTER TABLE oauth.developer_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY isolate_developer_apps ON oauth.developer_apps 
    USING (developer_id = current_setting('app.current_user_id')::UUID);
