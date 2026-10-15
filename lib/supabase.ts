import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Permite visualizar o protótipo sem credenciais. Recursos de banco/login
// só funcionarão depois de configurar as variáveis do Supabase.
export const supabase = url && anonKey
  ? createClient(url, anonKey)
  : null;
