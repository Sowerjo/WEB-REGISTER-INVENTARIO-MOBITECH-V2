BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.sectors (
  sector_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS public.users (
  user_id text PRIMARY KEY,
  nome text NOT NULL,
  setor text NOT NULL,
  email text NOT NULL,
  senha text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email),
  FOREIGN KEY (setor) REFERENCES public.sectors (nome) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  admin_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz,
  UNIQUE (username),
  UNIQUE (email)
);

CREATE OR REPLACE TRIGGER sectors_set_timestamp
BEFORE UPDATE ON public.sectors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER users_set_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER admin_users_set_timestamp
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sectors_select_all ON public.sectors;
DROP POLICY IF EXISTS sectors_insert_all ON public.sectors;
DROP POLICY IF EXISTS sectors_update_all ON public.sectors;
DROP POLICY IF EXISTS sectors_delete_all ON public.sectors;

DROP POLICY IF EXISTS users_select_all ON public.users;
DROP POLICY IF EXISTS users_insert_all ON public.users;
DROP POLICY IF EXISTS users_update_all ON public.users;
DROP POLICY IF EXISTS users_delete_all ON public.users;

DROP POLICY IF EXISTS admin_users_select_all ON public.admin_users;
DROP POLICY IF EXISTS admin_users_insert_all ON public.admin_users;
DROP POLICY IF EXISTS admin_users_update_all ON public.admin_users;
DROP POLICY IF EXISTS admin_users_delete_all ON public.admin_users;

CREATE POLICY sectors_select_all ON public.sectors FOR SELECT USING (true);
CREATE POLICY sectors_insert_all ON public.sectors FOR INSERT WITH CHECK (true);
CREATE POLICY sectors_update_all ON public.sectors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY sectors_delete_all ON public.sectors FOR DELETE USING (true);

CREATE POLICY users_select_all ON public.users FOR SELECT USING (true);
CREATE POLICY users_insert_all ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update_all ON public.users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY users_delete_all ON public.users FOR DELETE USING (true);

CREATE POLICY admin_users_select_all ON public.admin_users FOR SELECT USING (true);
CREATE POLICY admin_users_insert_all ON public.admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY admin_users_update_all ON public.admin_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY admin_users_delete_all ON public.admin_users FOR DELETE USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sectors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

INSERT INTO public.admin_users (username, email, full_name, is_active)
VALUES ('admin', 'admin@example.com', 'Administrador', true)
ON CONFLICT (username) DO NOTHING;

COMMIT;