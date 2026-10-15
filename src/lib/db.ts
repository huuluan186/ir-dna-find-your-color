import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase client dùng service role key, chỉ chạy ở server. Client không bao giờ gọi CSDL trực tiếp.
// Tạo khi gọi lần đầu (không tạo lúc import) để `next build` không cần biến môi trường Supabase.
let client: SupabaseClient | undefined;

export function getDb() {
	if (client) return client;

	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
	}

	client = createClient(url, key, { auth: { persistSession: false } });
	return client;
}
