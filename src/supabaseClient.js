import { createClient } from '@supabase/supabase-js';

// These two values are both meant to be public (safe to ship in browser code).
// All access control is enforced by the Row Level Security policies you set
// up in the Supabase SQL editor, not by keeping these secret.
const SUPABASE_URL = 'https://mfobmckklrieofdwfmfr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HigVmMzX5CoQzhGiO_nk_w_EP7Z27pa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
