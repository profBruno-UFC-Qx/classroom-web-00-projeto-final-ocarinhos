// @ts-ignore
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const VITE_SUPABASE_URL = "https://rtowwxvptqgljsiitalj.supabase.co";
const VITE_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_k-sbqrJ3Rqhhp28fb1XUew_GsBcpl_f";

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

export { supabase };
