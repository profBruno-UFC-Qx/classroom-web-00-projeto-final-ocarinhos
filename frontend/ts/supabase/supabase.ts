// @ts-ignore
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import type { SupabaseClient } from "@supabase/supabase-js";

import ENV from "../config.js";


const supabase: SupabaseClient = createClient(
  ENV.VITE_SUPABASE_URL,
  ENV.VITE_SUPABASE_PUBLISHABLE_KEY
);

export { supabase };
