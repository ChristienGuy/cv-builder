import { createClient } from "@supabase/supabase-js";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabaseUrl = "https://kupdyualcpvnybjjuydv.supabase.co";
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
