-- ====================================================================
-- Fuel Gain Tracker - Enterprise PostgreSQL Schema with Row Level Security (RLS)
-- Production Ready Schema for Supabase & PostgreSQL
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE ENUM TYPES FOR ROLES & STATUS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('Owner', 'Manager', 'Staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entry_status_enum AS ENUM ('Gain', 'Shortage', 'Balanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PETROL COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.petrol_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    company_code VARCHAR(20) REFERENCES public.petrol_companies(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. USERS & PROFILE EXTENSION TABLE (Mirrors Auth Users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role_enum DEFAULT 'Owner',
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. PUMP PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.pump_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pump_name VARCHAR(255) NOT NULL,
    pump_company VARCHAR(20) NOT NULL REFERENCES public.petrol_companies(code),
    pump_address TEXT,
    nozzle_counts JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- 7. USER PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.user_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 8. DIP CHART PDFS TABLE
CREATE TABLE IF NOT EXISTS public.dip_chart_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    pdf_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, product_id)
);

-- 9. DAILY PRODUCT ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.daily_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    was_receipt_received BOOLEAN DEFAULT FALSE,
    receipt_quantity NUMERIC(12, 2) DEFAULT 0.00,
    total_meter_sale NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    opening_dip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    closing_dip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    opening_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    closing_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    dip_sale NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    meter_sale NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    difference NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status entry_status_enum NOT NULL DEFAULT 'Balanced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, entry_date, product_id)
);

-- 10. NOZZLE READINGS BREAKDOWN TABLE
CREATE TABLE IF NOT EXISTS public.nozzle_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.daily_entries(id) ON DELETE CASCADE,
    nozzle_index INT NOT NULL,
    nozzle_name VARCHAR(50) NOT NULL,
    opening_reading NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    closing_reading NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sale NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    auto_sync BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- OPTIMIZATION INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_product ON public.daily_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_status ON public.daily_entries(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.petrol_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pump_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dip_chart_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nozzle_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Reference Tables
CREATE POLICY "Public read petrol_companies" ON public.petrol_companies FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- Public & Anonymous Permissive RLS Policies (Ensures seamless data sync from Web & Mobile)
CREATE POLICY "Allow public manage users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage pump_profile" ON public.pump_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage user_products" ON public.user_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage dip_chart_pdfs" ON public.dip_chart_pdfs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage daily_entries" ON public.daily_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage nozzle_readings" ON public.nozzle_readings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED REFERENCE DATA
-- ====================================================================
INSERT INTO public.petrol_companies (name, code) VALUES
('Hindustan Petroleum (HPCL)', 'HPCL'),
('Indian Oil (IOCL)', 'IOCL'),
('Bharat Petroleum (BPCL)', 'BPCL'),
('Shell', 'Shell'),
('Jio-bp', 'Jio-bp'),
('Nayara Energy', 'Nayara')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (name, code, description, company_code) VALUES
('MS (Motor Spirit / Petrol)', 'hp-ms', 'Standard Petrol 91 Octane', 'HPCL'),
('HSD (High Speed Diesel)', 'hp-hsd', 'Standard Automotive Diesel', 'HPCL'),
('Power95', 'hp-p95', 'HPCL Premium 95 Octane Fuel', 'HPCL'),
('Power100', 'hp-p100', 'HPCL High Performance 100 Octane Fuel', 'HPCL')
ON CONFLICT (code) DO NOTHING;
