-- 000_init_roles.sql
-- Create least-privilege roles for the payment gateway

-- Revoke default public schema access
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE gateway FROM PUBLIC;

-- Create the main application role (used by platform-java, edge-node, etc)
CREATE ROLE gateway_app WITH LOGIN PASSWORD 'secure_app_password_here';

-- Grant connection to the database
GRANT CONNECT ON DATABASE gateway TO gateway_app;

-- Grant usage on the public schema
GRANT USAGE, CREATE ON SCHEMA public TO gateway_app;

-- Note: In a real environment, you run this before migrations, 
-- and then the migrations are run by an admin or CI tool.
-- Then, grant permissions to the tables created by migrations:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gateway_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO gateway_app;

-- Create a read-only role for reporting/reconciliation
CREATE ROLE readonly_reporter WITH LOGIN PASSWORD 'readonly_password_here';
GRANT CONNECT ON DATABASE gateway TO readonly_reporter;
GRANT USAGE ON SCHEMA public TO readonly_reporter;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_reporter;
