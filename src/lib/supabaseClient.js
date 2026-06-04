import { createClient } from '@supabase/supabase-js';

// env 변수는 Cloudflare 등에서 잘못 설정되면 한글이 헤더에 들어가 앱 전체가 멈출 수 있음
// → 공개 anon 키는 코드에 직접 고정
const SUPABASE_URL = 'https://uzzsfpnpqywstyumvigh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CtEf-6qhdSYAnBiXJDixXA_Rp1FCHcx';

function clearCorruptedSupabaseStorage() {
  if (typeof window === 'undefined') return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

clearCorruptedSupabaseStorage();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
