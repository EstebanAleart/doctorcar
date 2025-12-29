-- Postgres schema for doctorcar

-- Roles (dictionary)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO roles (id, name) VALUES
  ('admin','Administrator'),
  ('client','Client'),
  ('employee','Employee')
ON CONFLICT (id) DO NOTHING;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK(role IN ('admin','client','employee')),
  role_id TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

-- Ensure users.role_id references roles and is populated
ALTER TABLE users
  ALTER COLUMN role_id SET DEFAULT 'client';

UPDATE users SET role_id = COALESCE(role_id, role, 'client');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='users' AND constraint_name='fk_users_role_id'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id);
  END IF;
END $$;

ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  employee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK(type IN ('particular','insurance')),
  company_name TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','in_progress','completed','cancelled')),
  estimated_cost DECIMAL(10,2),
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE claims ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

-- Budget Items
CREATE TABLE IF NOT EXISTS budget_items (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

-- Workshop Config (singleton)
CREATE TABLE IF NOT EXISTS workshop_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'DOCTORCAR',
  address TEXT NOT NULL DEFAULT 'Rosario - Chapa y Pintura',
  phone TEXT NOT NULL DEFAULT '+54 9 341 123-4567',
  email TEXT NOT NULL DEFAULT 'info@doctorcar.com',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defaults
INSERT INTO workshop_config (id, name, address, phone, email)
VALUES (1, 'DOCTORCAR', 'Rosario - Chapa y Pintura', '+54 9 341 123-4567', 'info@doctorcar.com')
ON CONFLICT (id) DO NOTHING;

-- Add FKs to workshop_config for existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='users' AND constraint_name='fk_users_workshop_id'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='vehicles' AND constraint_name='fk_vehicles_workshop_id'
  ) THEN
    ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='claims' AND constraint_name='fk_claims_workshop_id'
  ) THEN
    ALTER TABLE claims ADD CONSTRAINT fk_claims_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='budget_items' AND constraint_name='fk_budget_items_workshop_id'
  ) THEN
    ALTER TABLE budget_items ADD CONSTRAINT fk_budget_items_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_claims_client_id ON claims(client_id);
CREATE INDEX IF NOT EXISTS idx_claims_employee_id ON claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_budget_items_claim_id ON budget_items(claim_id);
