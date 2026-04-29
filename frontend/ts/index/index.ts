import { supabase } from "../supabase/supabase.js";

const { data, error } = await supabase.from("usuarios")
  .select("*");

if (error) {
  console.error(error);
} else {
  console.log(data);
}
