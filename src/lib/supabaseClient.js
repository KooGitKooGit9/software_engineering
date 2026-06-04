import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL =
  'https://uzzsfpnpqywstyumvigh.supabase.co';

const DEFAULT_SUPABASE_ANON_KEY =
  '여기에 Cursor가 넣어준 전체 키';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);