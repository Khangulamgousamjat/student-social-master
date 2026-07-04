import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ktpgwfgrpuigxzjghnht.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Ap9Cm5kb1ay0sv5t6kDwQg_gxgO-MM6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
