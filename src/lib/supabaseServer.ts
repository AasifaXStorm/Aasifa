import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'temp-secret-key-placeholder';

// Server-side only administrative client
export const supabaseServer = createClient(supabaseUrl, supabaseSecretKey);
