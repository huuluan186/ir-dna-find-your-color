import "server-only";
import { createClient } from "@supabase/supabase-js";

// Supabase client dùng service role key, chỉ chạy ở server. Client không bao giờ gọi CSDL trực tiếp.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
	throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
}

export const db = createClient(url, key, { auth: { persistSession: false } });
