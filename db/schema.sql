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

-- Appointments (citas) - Definir antes de claims para la FK
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  claim_id TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','confirmed','in_progress','completed','cancelled','rescheduled')),
  appointment_type TEXT NOT NULL DEFAULT 'inspection' CHECK(appointment_type IN ('inspection','repair','delivery','follow_up')),
  notes TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  photos TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending','accepted','rejected')),
  payment_method TEXT,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  pdf_url TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE claims ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS photos TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending','accepted','rejected'));
ALTER TABLE claims ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS appointment_id TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Drop old appointment_date column if exists and add appointment_id FK
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='claims' AND column_name='appointment_date'
  ) THEN
    ALTER TABLE claims DROP COLUMN appointment_date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='claims' AND constraint_name='fk_claims_appointment_id'
  ) THEN
    ALTER TABLE claims ADD CONSTRAINT fk_claims_appointment_id FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
  END IF;
END $$;

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

-- Add FK from appointments to claims (now that both tables exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='appointments' AND constraint_name='fk_appointments_claim_id'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT fk_appointments_claim_id FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Insurance Companies
CREATE TABLE IF NOT EXISTS insurance_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing (facturación)
CREATE TABLE IF NOT EXISTS billing (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  billing_number TEXT UNIQUE NOT NULL,
  billing_date DATE NOT NULL,
  due_date DATE,
  customer_type TEXT NOT NULL CHECK(customer_type IN ('individual','insurance_company')),
  insurance_company_id TEXT REFERENCES insurance_companies(id),
  insurance_policy_number TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  development_fee DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','partial','paid','overdue','cancelled')),
  notes TEXT,
  internal_notes TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add development_fee column if not exists
ALTER TABLE billing ADD COLUMN IF NOT EXISTS development_fee DECIMAL(10,2);

-- Develop (10% fee calculation)
CREATE TABLE IF NOT EXISTS develop (
  id TEXT PRIMARY KEY,
  billing_id TEXT NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  amount DECIMAL(10,2),
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_develop_billing_id ON develop(billing_id);

ALTER TABLE develop ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

-- Billing Items
CREATE TABLE IF NOT EXISTS billing_items (
  id TEXT PRIMARY KEY,
  billing_id TEXT NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
  budget_item_id TEXT REFERENCES budget_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('labor','parts','materials','other')),
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  billing_id TEXT NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash','debit_card','credit_card','bank_transfer','check','insurance_direct','other')),
  card_installments INTEGER DEFAULT 1,
  card_interest_rate DECIMAL(5,2) DEFAULT 0,
  card_last_digits TEXT,
  card_authorization_code TEXT,
  transaction_reference TEXT,
  bank_name TEXT,
  receipt_url TEXT,
  receipt_filename TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('pending','completed','failed','refunded')),
  notes TEXT,
  workshop_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS idx_appointments_claim_id ON appointments(claim_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_billing_claim_id ON billing(claim_id);
CREATE INDEX IF NOT EXISTS idx_billing_number ON billing(billing_number);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_customer_type ON billing(customer_type);
CREATE INDEX IF NOT EXISTS idx_billing_insurance_company ON billing(insurance_company_id);

CREATE INDEX IF NOT EXISTS idx_billing_items_billing_id ON billing_items(billing_id);
CREATE INDEX IF NOT EXISTS idx_billing_items_budget_item ON billing_items(budget_item_id);

CREATE INDEX IF NOT EXISTS idx_payments_billing_id ON payments(billing_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- FKs workshop_id para nuevas tablas
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;
ALTER TABLE insurance_companies ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;
ALTER TABLE billing_items ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS workshop_id INTEGER DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='appointments' AND constraint_name='fk_appointments_workshop_id'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT fk_appointments_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='insurance_companies' AND constraint_name='fk_insurance_companies_workshop_id'
  ) THEN
    ALTER TABLE insurance_companies ADD CONSTRAINT fk_insurance_companies_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='billing' AND constraint_name='fk_billing_workshop_id'
  ) THEN
    ALTER TABLE billing ADD CONSTRAINT fk_billing_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='develop' AND constraint_name='fk_develop_workshop_id'
  ) THEN
    ALTER TABLE develop ADD CONSTRAINT fk_develop_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='billing_items' AND constraint_name='fk_billing_items_workshop_id'
  ) THEN
    ALTER TABLE billing_items ADD CONSTRAINT fk_billing_items_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='payments' AND constraint_name='fk_payments_workshop_id'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT fk_payments_workshop_id FOREIGN KEY (workshop_id) REFERENCES workshop_config(id);
  END IF;
END $$;
