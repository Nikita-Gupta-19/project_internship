-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add category and priority to tasks table
-- Priorities: 'low', 'medium', 'high'
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category VARCHAR(100);
