import { createClient } from '@supabase/supabase-js';

// Hardcoded for demo purposes since .env.local write was blocked
// Fallback to hardcoded values for local dev
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrykofagjtlkdwtdkksu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeWtvZmFnanRsa2R3dGRra3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDY2MDIsImV4cCI6MjA4MTU4MjYwMn0.5U6PUQSdhal1SnozPgYroBp83ki3fyg_dPDSobSFOJQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
