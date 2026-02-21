import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton — safe to call from any client component
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface InterestSignupRow {
  id?: number;
  instagram_handle: string;
  email: string;
  name: string;
  reason_for_interest: string;
  primary_profession: string;
  target_annual_income_usd: number;
  preferred_platforms: string[];
  has_existing_audience: boolean;
  estimated_follower_count: number;
  status?: 'pending' | 'contacted' | 'converted_user' | 'rejected';
  admin_notes?: string | null;
  contacted_at?: string | null;
  converted_user_id?: number | null;
  created_at?: string;
}
