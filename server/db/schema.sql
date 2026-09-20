-- GAMBIT'S GLITCH 2026 - Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor or Migration Runner.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Status Enums
DO $$ BEGIN
    CREATE TYPE team_status_enum AS ENUM ('REGISTERED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'PPT_SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_id VARCHAR(20) UNIQUE NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    theme_id VARCHAR(50) NOT NULL,
    college VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    leader_email VARCHAR(150) NOT NULL,
    leader_phone VARCHAR(20) NOT NULL,
    member_count INT NOT NULL DEFAULT 1,
    status team_status_enum NOT NULL DEFAULT 'PAYMENT_PENDING',
    rules_agreed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    utr_number VARCHAR(50) NOT NULL,
    payer_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 499.00,
    payment_date DATE NOT NULL,
    screenshot_url TEXT NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PPT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS ppt_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    project_title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    file_url TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    repo_link TEXT,
    demo_link TEXT,
    version INT DEFAULT 1,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- 'NORMAL', 'URGENT', 'CRITICAL'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ADMIN ACTION LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_reg_id VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for Performance & Security Queries
CREATE INDEX IF NOT EXISTS idx_teams_reg_id ON teams(reg_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_email ON teams(leader_email);
CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr_number);
CREATE INDEX IF NOT EXISTS idx_payments_team_id ON payments(team_id);
CREATE INDEX IF NOT EXISTS idx_ppt_team_id ON ppt_submissions(team_id);

-- ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for status checks via Registration ID
CREATE POLICY "Public status check on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public team insertion" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public member insertion" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public payment insertion" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public ppt insertion" ON ppt_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public status check on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Public status check on ppt" ON ppt_submissions FOR SELECT USING (true);
