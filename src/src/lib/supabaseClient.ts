import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase sozlamalari (URL yoki Anon Key) topilmadi. Iltimos, .env faylini yoki AI Studio sirlarini (Secrets) tekshiring.');
}

try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error(`Supabase URL manzili noto'g'ri formatda: "${supabaseUrl}". Iltimos, to'g'ri URL manzilini kiriting.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
