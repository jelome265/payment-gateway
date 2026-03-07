-- Least-Privilege Database User Configuration
-- This script should be run by a DB superuser during environment setup.

-- 1. Create the application user
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
      CREATE USER app_user WITH PASSWORD 'change_in_production';
   END IF;
END
$do$;

-- 2. Revoke all default permissions
REVOKE ALL ON DATABASE gateway FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 3. Grant basic connectivity
GRANT CONNECT ON DATABASE gateway TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- 4. Grant specific table permissions
-- Business tables: allow standard CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE wallets TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE fx_offers TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE settlement_jobs TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cards TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE kyc_verifications TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE aml_alerts TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reconciliation_events TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE regulatory_reports TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE outbox_events TO app_user;

-- 5. Harden Append-Only tables (Ledger & Audit)
-- Requirement: ledger_entries: INSERT-only for the application user (no UPDATE, no DELETE)
-- Requirement: audit_logs: INSERT-only for the application user
GRANT SELECT, INSERT ON TABLE ledger_entries TO app_user;
GRANT SELECT, INSERT ON TABLE audit_logs TO app_user;
GRANT SELECT, INSERT ON TABLE audit_hash_chain TO app_user;

-- 6. Grant sequence usage (required for SERIAL and some PK defaults)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 7. Ensure future tables have limited permissions (optional but recommended)
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;
